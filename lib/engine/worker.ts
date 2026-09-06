// lib/engine/worker.ts
//
// Message protocol from Section 3.10. The store owns the worker; no component
// imports this file directly. This module is the only place that touches
// `self.postMessage`.
//
// The handler is also exported as a plain function so Node tests can exercise
// the protocol without constructing a Worker.

import type { Lang, Overrides, TokenAnalysis } from '@/lib/types/phonetics';
import type { DeviceInstance } from '@/lib/types/devices';
import type { MatrixFilter } from '@/lib/types/matrix';
import type { RhymeCandidate, RhymeIndex } from '@/lib/types/rhyme';
import type { RhythmAnalysis } from '@/lib/types/archive';
import { analyzeLines } from './analyze';
import { queryRhymes } from './rhyme';
import { detectDevices } from './detect-devices';
import { tierOne } from './rhythm';
import { g2pEn } from './g2p-en';
import { g2pHi } from './g2p-hi';
import { setEnglishPriors } from './language-id';

export type WorkerRequest =
  | { id: string; kind: 'INIT'; payload: { indexUrl: string } }
  | { id: string; kind: 'ANALYZE_LINES'; payload: { lines: { id: string; text: string }[]; overrides: Overrides } }
  | { id: string; kind: 'GET_RHYMES'; payload: { token: string; lang: Lang; filter: MatrixFilter } }
  | { id: string; kind: 'DETECT_DEVICES'; payload: { lines: { id: string; text: string }[] } }
  | { id: string; kind: 'TIER_ONE'; payload: { text: string; bpm: number } };

export type WorkerResponse =
  | { id: string; kind: 'READY'; payload: { indexVersion: number } }
  | { id: string; kind: 'ANALYSIS'; payload: Record<string, TokenAnalysis[]> }
  | { id: string; kind: 'RHYMES'; payload: RhymeCandidate[] }
  | { id: string; kind: 'DEVICES'; payload: DeviceInstance[] }
  | { id: string; kind: 'TIER_ONE_RESULT'; payload: RhythmAnalysis }
  | { id: string; kind: 'ERROR'; payload: { message: string } };

export interface WorkerState {
  index: RhymeIndex | null;
  ready: boolean;
}

export function createWorkerState(): WorkerState {
  return { index: null, ready: false };
}

export type IndexLoader = (url: string) => Promise<RhymeIndex>;

const defaultLoader: IndexLoader = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load rhyme index: ${res.status}`);
  return (await res.json()) as RhymeIndex;
};

/**
 * Handle one request against a mutable worker state. Pure enough to unit-test:
 * inject an `IndexLoader` and never touch `self`.
 */
export async function handleWorkerRequest(
  state: WorkerState,
  request: WorkerRequest,
  loadIndex: IndexLoader = defaultLoader,
): Promise<WorkerResponse> {
  try {
    switch (request.kind) {
      case 'INIT': {
        const index = await loadIndex(request.payload.indexUrl);
        state.index = index;
        state.ready = true;
        // Seed English frequency priors from the index so language ID and the
        // rhyme index share one ranking.
        const priors = new Map<string, number>();
        for (const lex of index.lexemes) {
          if (lex.lang !== 'en') continue;
          const score = Math.max(0.05, 1 - Math.log10(lex.rank + 1) / Math.log10(2001));
          const prev = priors.get(lex.text) ?? 0;
          if (score > prev) priors.set(lex.text, score);
        }
        setEnglishPriors(priors);
        return { id: request.id, kind: 'READY', payload: { indexVersion: index.version } };
      }

      case 'ANALYZE_LINES': {
        const payload = analyzeLines(
          request.payload.lines,
          request.payload.overrides,
        );
        return { id: request.id, kind: 'ANALYSIS', payload };
      }

      case 'GET_RHYMES': {
        if (!state.index) {
          return {
            id: request.id,
            kind: 'ERROR',
            payload: { message: 'Index not loaded. Send INIT first.' },
          };
        }
        const { token, lang, filter } = request.payload;
        const candidates = lang === 'hi' ? g2pHi(token) : g2pEn(token);
        if (candidates.length === 0) {
          return { id: request.id, kind: 'RHYMES', payload: [] };
        }
        const payload = queryRhymes(state.index, {
          text: token,
          lang,
          pronunciation: candidates[0],
          filter,
        });
        return { id: request.id, kind: 'RHYMES', payload };
      }

      case 'DETECT_DEVICES': {
        const payload = detectDevices(request.payload.lines);
        return { id: request.id, kind: 'DEVICES', payload };
      }

      case 'TIER_ONE': {
        const payload = tierOne({
          text: request.payload.text,
          bpm: request.payload.bpm,
        });
        return { id: request.id, kind: 'TIER_ONE_RESULT', payload };
      }

      default: {
        const _exhaustive: never = request;
        return {
          id: (request as WorkerRequest).id,
          kind: 'ERROR',
          payload: { message: `Unknown request kind: ${(_exhaustive as WorkerRequest).kind}` },
        };
      }
    }
  } catch (err) {
    return {
      id: request.id,
      kind: 'ERROR',
      payload: { message: err instanceof Error ? err.message : String(err) },
    };
  }
}

/**
 * Browser entry. Bundlers that target web workers will tree-shake the Node
 * path; in Vitest this block is a no-op because `self` has no `onmessage`.
 */
export function attachToWorkerScope(
  scope: {
    onmessage: ((ev: MessageEvent<WorkerRequest>) => void) | null;
    postMessage: (msg: WorkerResponse) => void;
  },
  loadIndex: IndexLoader = defaultLoader,
): WorkerState {
  const state = createWorkerState();
  scope.onmessage = (ev: MessageEvent<WorkerRequest>) => {
    void handleWorkerRequest(state, ev.data, loadIndex).then((response) => {
      scope.postMessage(response);
    });
  };
  return state;
}

// Auto-attach when running inside a real Worker (classic or module).
const maybeSelf = typeof globalThis !== 'undefined'
  ? (globalThis as unknown as {
      importScripts?: unknown;
      onmessage?: unknown;
      postMessage?: unknown;
      WorkerGlobalScope?: unknown;
    })
  : null;

const WorkerScope =
  typeof globalThis !== 'undefined'
    ? (globalThis as { WorkerGlobalScope?: new () => unknown }).WorkerGlobalScope
    : undefined;
const isDedicatedWorker =
  typeof WorkerScope === 'function' &&
  typeof self !== 'undefined' &&
  self instanceof (WorkerScope as new () => object);

if (
  maybeSelf &&
  typeof maybeSelf.postMessage === 'function' &&
  (typeof maybeSelf.importScripts === 'function' || isDedicatedWorker)
) {
  attachToWorkerScope(
    maybeSelf as {
      onmessage: ((ev: MessageEvent<WorkerRequest>) => void) | null;
      postMessage: (msg: WorkerResponse) => void;
    },
  );
}
