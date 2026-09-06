// lib/store/dissect-slice.ts
//
// Tier 1 runs in the worker with no network and no API key. Tier 2 streams from
// /api/dissect and can never overwrite a Tier 1 field, because the merge takes
// `rhythm` from the engine result only (Section 4.3, lib/api/validate.ts).

import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';
import type { WorkbenchStore } from './index';
import type { Dissection } from '@/lib/types/archive';
import type { DeviceInstance } from '@/lib/types/devices';
import type { TokenAnalysis } from '@/lib/types/phonetics';
import { getEngineBridge } from './engine-bridge';
import { mergeDissection } from '@/lib/api/validate';
import { ApiCallError, streamDissect } from '@/lib/api/client';
import {
  cacheKey,
  readCachedDissection,
  writeCachedDissection,
} from '@/lib/cache/dissection-cache';

export type DissectStatus =
  | 'idle'
  | 'tier1'
  | 'streaming'
  | 'done'
  | 'degraded'
  | 'error';

export interface DissectSlice {
  draft: string; // the bars in the dissector box
  userDissections: Record<string, Dissection>; // keyed by content hash
  /** Cache key of the dissection currently on screen. */
  currentKey: string | null;
  status: DissectStatus;
  interpretiveAvailable: boolean; // false when no API key
  errorMessage: string | null;
  /** True when the last Tier 1 result came straight from IndexedDB. */
  servedFromCache: boolean;
  /** Per-line tokens for the scheme rail. Derived, never persisted. */
  currentLineTokens: TokenAnalysis[][];
  /** The bar text each entry in currentLineTokens came from. */
  currentLines: string[];

  setDraft(text: string): void;
  checkInterpretive(): Promise<void>;
  runTierOne(): Promise<void>; // worker, instant, offline
  runTierTwo(): Promise<void>; // /api/dissect, streamed
  cancel(): void;
}

/** Module-scoped so the abort handle never lands in persisted state. */
let inFlight: AbortController | null = null;

export const createDissectSlice: StateCreator<
  WorkbenchStore,
  [['zustand/immer', never]],
  [],
  DissectSlice
> = (set, get) => ({
  draft: '',
  userDissections: {},
  currentKey: null,
  status: 'idle',
  interpretiveAvailable: false,
  errorMessage: null,
  servedFromCache: false,
  currentLineTokens: [],
  currentLines: [],

  setDraft: (text) =>
    set((state) => {
      state.draft = text;
    }),

  checkInterpretive: async () => {
    try {
      const res = await fetch('/api/dissect', { method: 'GET' });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { interpretiveAvailable?: boolean };
      set((state) => {
        state.interpretiveAvailable = body.interpretiveAvailable === true;
      });
    } catch {
      set((state) => {
        state.interpretiveAvailable = false;
      });
    }
  },

  runTierOne: async () => {
    const text = get().draft.trim();
    if (text.length === 0) {
      if (get().status === 'idle' && get().currentKey === null && !get().errorMessage) {
        return;
      }
      set((state) => {
        state.status = 'idle';
        state.currentKey = null;
        state.errorMessage = null;
      });
      return;
    }

    set((state) => {
      state.status = 'tier1';
      state.errorMessage = null;
      state.servedFromCache = false;
    });

    const key = await cacheKey(text);
    const bridge = getEngineBridge();
    const bpm = get().grids[get().activeGridId]?.bpm ?? 90;
    const barTexts = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const lines = barTexts.map((l, i) => ({ id: `bar-${i}`, text: l }));

    try {
      // The rail needs per-line tokens whether or not the dissection is cached,
      // and this is a worker call with no network cost.
      const analysisRes = await bridge.request({
        id: nanoid(),
        kind: 'ANALYZE_LINES',
        payload: {
          lines,
          overrides: {
            lang: get().langOverrides,
            pronunciation: get().pronunciationOverrides,
          },
        },
      });
      const lineTokens: TokenAnalysis[][] =
        analysisRes.kind === 'ANALYSIS'
          ? lines.map((l) => analysisRes.payload[l.id] ?? [])
          : [];

      set((state) => {
        state.currentLineTokens = lineTokens;
        state.currentLines = barTexts;
      });

      // A cache hit carries its own Tier 1, so there is no recompute and no
      // network call (Section 4.4).
      const cached = await readCachedDissection(text);
      if (cached) {
        set((state) => {
          state.userDissections[key] = cached;
          state.currentKey = key;
          state.status = 'done';
          state.servedFromCache = true;
        });
        return;
      }

      const [rhythmRes, devicesRes] = await Promise.all([
        bridge.request({
          id: nanoid(),
          kind: 'TIER_ONE',
          payload: { text, bpm },
        }),
        bridge.request({
          id: nanoid(),
          kind: 'DETECT_DEVICES',
          payload: { lines },
        }),
      ]);

      if (rhythmRes.kind !== 'TIER_ONE_RESULT') {
        throw new Error(
          rhythmRes.kind === 'ERROR' ? rhythmRes.payload.message : 'Tier 1 failed',
        );
      }

      const engineDevices: DeviceInstance[] =
        devicesRes.kind === 'DEVICES' ? devicesRes.payload : [];

      const dissection = mergeDissection({
        lineId: key,
        rhythm: rhythmRes.payload,
        engineDevices,
      });

      set((state) => {
        state.userDissections[key] = dissection;
        state.currentKey = key;
        state.status = 'done';
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set((state) => {
        state.status = 'error';
        state.errorMessage = message;
      });
    }
  },

  runTierTwo: async () => {
    const text = get().draft.trim();
    const key = get().currentKey;
    if (!key || text.length === 0) return;
    const base = get().userDissections[key];
    if (!base) return;

    // Already interpreted — re-running would spend a request for nothing.
    if (base.provenance === 'engine+llm') {
      set((state) => {
        state.status = 'done';
      });
      return;
    }

    inFlight?.abort();
    inFlight = new AbortController();
    const controller = inFlight;

    set((state) => {
      state.status = 'streaming';
      state.errorMessage = null;
    });

    const engineDevices = base.devices.filter((d) => d.detectedBy === 'engine');

    try {
      for await (const patch of streamDissect(
        {
          text,
          tier1: base.rhythm,
          context: { bpm: get().grids[get().activeGridId]?.bpm ?? 90 },
        },
        controller.signal,
      )) {
        if (controller.signal.aborted) return;

        set((state) => {
          const target = state.userDissections[key];
          if (!target) return;

          switch (patch.field) {
            case 'meaning':
              target.meaning = patch.value;
              break;
            case 'flowMechanics':
              target.flowMechanics = patch.value;
              break;
            case 'rhymeScience':
              target.rhymeScience = patch.value;
              break;
            case 'why':
              target.why = patch.value;
              break;
            case 'entendre':
              target.entendres.push(patch.value);
              break;
            case 'device': {
              // Engine devices stay first and are never replaced.
              const llm = target.devices.filter(
                (d: DeviceInstance) => d.detectedBy === 'llm',
              );
              target.devices = [
                ...engineDevices,
                ...llm,
                { ...patch.value, detectedBy: 'llm', confidence: 'arguable' },
              ];
              break;
            }
            case 'done':
              target.provenance = 'engine+llm';
              target.generatedAt = new Date().toISOString();
              state.status = 'done';
              break;
            case 'error':
              state.status = 'error';
              state.errorMessage = patch.value.message;
              break;
          }
        });
      }

      const finished = get().userDissections[key];
      if (finished && !controller.signal.aborted) {
        set((state) => {
          if (state.status === 'streaming') state.status = 'done';
        });
        void writeCachedDissection(text, get().userDissections[key]);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const degraded = err instanceof ApiCallError && err.degraded;
      const message = err instanceof Error ? err.message : String(err);
      set((state) => {
        state.status = degraded ? 'degraded' : 'error';
        state.errorMessage = message;
        if (degraded) state.interpretiveAvailable = false;
      });
    } finally {
      if (inFlight === controller) inFlight = null;
    }
  },

  cancel: () => {
    inFlight?.abort();
    inFlight = null;
    set((state) => {
      if (state.status === 'streaming') state.status = 'done';
    });
  },
});
