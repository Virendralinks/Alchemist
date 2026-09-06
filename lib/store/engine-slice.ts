// lib/store/engine-slice.ts
//
// Owns the worker handle and every analysis result. No component talks to the
// worker directly — every call goes through this slice (Section 1.6 / 3.10).

import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';
import type { WorkbenchStore } from './index';
import type { Lang, TokenAnalysis } from '@/lib/types/phonetics';
import type { RhymeCandidate } from '@/lib/types/rhyme';
import type { AssonanceColumn, MatrixFilter } from '@/lib/types/matrix';
import type { RhythmAnalysis } from '@/lib/types/archive';
import { getEngineBridge } from './engine-bridge';
import { postRhyme } from '@/lib/api/client';
import { normalizeToken } from '@/lib/engine/tokenizer';
import { CIPHER_LINE_ID } from './sequencer-slice';

export { CIPHER_LINE_ID };

export const DEFAULT_MATRIX_FILTER: MatrixFilter = {
  langs: [],
  tags: [],
  minScore: 0.3,
  syllableCount: null,
  crossLanguageOnly: false,
};

export interface EngineSlice {
  workerReady: boolean;
  indexLoaded: boolean;
  analysis: Record<string, TokenAnalysis[]>; // keyed by line id
  /** Original text per line id, so overrides can re-analyze. */
  lineTexts: Record<string, string>;
  rhymes: Record<string, RhymeCandidate[]>; // keyed by query token id
  /** Mosaic + holorime from /api/rhyme, merged into the panel when they arrive. */
  phraseRhymes: Record<string, RhymeCandidate[]>;
  /** Sticky user corrections, persisted. Token text -> language. */
  langOverrides: Record<string, Lang>;
  /** Token text -> chosen candidate index. */
  pronunciationOverrides: Record<string, number>;
  /** Active rhyme query identity (token text + lang). */
  activeQueryId: string | null;
  activeQueryToken: string | null;
  activeQueryLang: Lang | null;
  matrixFilter: MatrixFilter;
  matrixColumns: AssonanceColumn[];

  initWorker(): Promise<void>;
  analyzeLine(lineId: string, text: string): Promise<void>;
  requestRhymes(tokenId: string, token: string, filter?: MatrixFilter): Promise<void>;
  /** Combinatorial phrase search — too heavy for the worker, so it runs server-side. */
  requestPhraseRhymes(tokenId: string, token: string, line?: string): Promise<void>;
  overrideLang(token: string, lang: Lang): void;
  overridePronunciation(token: string, candidateIndex: number): void;
  setMatrixFilter(filter: Partial<MatrixFilter>): void;
  setActiveQuery(token: string | null, lang: Lang | null): void;
  /** Catalogue lines: compute Tier 1 without touching the cipher tray. */
  requestTierOne(text: string, bpm: number): Promise<RhythmAnalysis | null>;
}

export const createEngineSlice: StateCreator<
  WorkbenchStore,
  [['zustand/immer', never]],
  [],
  EngineSlice
> = (set, get) => ({
  workerReady: false,
  indexLoaded: false,
  analysis: {},
  lineTexts: {},
  rhymes: {},
  phraseRhymes: {},
  langOverrides: {},
  pronunciationOverrides: {},
  activeQueryId: null,
  activeQueryToken: null,
  activeQueryLang: null,
  matrixFilter: { ...DEFAULT_MATRIX_FILTER },
  matrixColumns: [],

  initWorker: async () => {
    if (get().workerReady) return;
    const bridge = getEngineBridge();
    const response = await bridge.init('/rhyme-index.json');
    if (response.kind === 'ERROR') {
      console.error('[engine] INIT failed:', response.payload.message);
      return;
    }
    set((state) => {
      state.workerReady = true;
      state.indexLoaded = true;
      state.matrixColumns = bridge.matrixColumns;
    });
  },

  analyzeLine: async (lineId, text) => {
    // An empty cipher is a no-op: analyzing it still set()s the grid, which
    // remounts every chip and (with Framer `layout`) overflows React's update
    // depth on first paint.
    if (text.trim().length === 0) {
      const alreadyEmpty =
        (get().analysis[lineId]?.length ?? 0) === 0 &&
        (get().lineTexts[lineId] ?? '') === text;
      if (alreadyEmpty) return;
      set((state) => {
        state.analysis[lineId] = [];
        state.lineTexts[lineId] = text;
      });
      if (lineId === CIPHER_LINE_ID) get().ingestAnalysis([]);
      return;
    }
    const bridge = getEngineBridge();
    if (!bridge.ready && !get().workerReady) {
      await get().initWorker();
    }

    const overrides = {
      lang: get().langOverrides,
      pronunciation: get().pronunciationOverrides,
    };

    const response = await bridge.request({
      id: nanoid(),
      kind: 'ANALYZE_LINES',
      payload: {
        lines: [{ id: lineId, text }],
        overrides,
      },
    });

    if (response.kind !== 'ANALYSIS') {
      if (response.kind === 'ERROR') {
        console.error('[engine] ANALYZE_LINES failed:', response.payload.message);
      }
      return;
    }

    const tokens = response.payload[lineId] ?? [];
    set((state) => {
      state.analysis[lineId] = tokens;
      state.lineTexts[lineId] = text;
    });

    // Cipher typing fills the tray with real Phase-2 syllables.
    if (lineId === CIPHER_LINE_ID) {
      get().ingestAnalysis(tokens);
    }

    // Refresh rhymes for the active query token if it still exists in this line.
    const { activeQueryToken, activeQueryLang, activeQueryId, matrixFilter } = get();
    if (activeQueryToken && activeQueryLang && activeQueryId) {
      const stillPresent = tokens.some(
        (t) => normalizeToken(t.token) === normalizeToken(activeQueryToken),
      );
      if (stillPresent) {
        void get().requestRhymes(activeQueryId, activeQueryToken, matrixFilter);
      }
    }
  },

  requestRhymes: async (tokenId, token, filter) => {
    const bridge = getEngineBridge();
    if (!bridge.ready && !get().workerReady) {
      await get().initWorker();
    }

    const matrixFilter = filter ?? get().matrixFilter;

    // Prefer the language from the latest analysis; fall back to active query.
    let lang: Lang = get().activeQueryLang ?? 'en';
    for (const tokens of Object.values(get().analysis)) {
      const hit = tokens.find((t) => normalizeToken(t.token) === normalizeToken(token));
      if (hit) {
        lang = hit.lang;
        break;
      }
    }

    const override = get().langOverrides[normalizeToken(token)];
    if (override) lang = override;

    set((state) => {
      state.activeQueryId = tokenId;
      state.activeQueryToken = token;
      state.activeQueryLang = lang;
      if (filter) {
        const next = { ...state.matrixFilter, ...filter };
        if (
          next.minScore !== state.matrixFilter.minScore ||
          next.syllableCount !== state.matrixFilter.syllableCount ||
          next.crossLanguageOnly !== state.matrixFilter.crossLanguageOnly ||
          next.langs.join() !== state.matrixFilter.langs.join() ||
          next.tags.join() !== state.matrixFilter.tags.join()
        ) {
          state.matrixFilter = next;
        }
      }
    });

    const response = await bridge.request({
      id: nanoid(),
      kind: 'GET_RHYMES',
      payload: { token, lang, filter: matrixFilter },
    });

    if (response.kind !== 'RHYMES') {
      if (response.kind === 'ERROR') {
        console.error('[engine] GET_RHYMES failed:', response.payload.message);
      }
      return;
    }

    set((state) => {
      state.rhymes[tokenId] = response.payload;
    });
  },

  requestPhraseRhymes: async (tokenId, token, line) => {
    const lang = get().activeQueryLang ?? 'en';
    try {
      const { candidates } = await postRhyme({ token, lang, line });
      set((state) => {
        state.phraseRhymes[tokenId] = candidates;
      });
    } catch {
      // Phrase search is additive: failing it must never blank the local panel.
      set((state) => {
        state.phraseRhymes[tokenId] = [];
      });
    }
  },

  overrideLang: (token, lang) => {
    const key = normalizeToken(token);
    set((state) => {
      state.langOverrides[key] = lang;
    });
    // Re-analyze every known line so tray + rhyme results converge immediately.
    const texts = { ...get().lineTexts };
    for (const [lineId, text] of Object.entries(texts)) {
      void get().analyzeLine(lineId, text);
    }
  },

  overridePronunciation: (token, candidateIndex) => {
    const key = normalizeToken(token);
    set((state) => {
      state.pronunciationOverrides[key] = candidateIndex;
    });
    const texts = { ...get().lineTexts };
    for (const [lineId, text] of Object.entries(texts)) {
      void get().analyzeLine(lineId, text);
    }
  },

  setMatrixFilter: (partial) => {
    set((state) => {
      state.matrixFilter = { ...state.matrixFilter, ...partial };
    });
    const { activeQueryId, activeQueryToken, matrixFilter } = get();
    if (activeQueryId && activeQueryToken) {
      void get().requestRhymes(activeQueryId, activeQueryToken, matrixFilter);
    }
  },

  setActiveQuery: (token, lang) => {
    set((state) => {
      state.activeQueryToken = token;
      state.activeQueryLang = lang;
      if (!token) {
        state.activeQueryId = null;
      }
    });
  },

  requestTierOne: async (text, bpm) => {
    if (text.trim().length === 0) return null;
    const bridge = getEngineBridge();
    if (!bridge.ready && !get().workerReady) {
      await get().initWorker();
    }
    const response = await bridge.request({
      id: nanoid(),
      kind: 'TIER_ONE',
      payload: { text, bpm },
    });
    if (response.kind !== 'TIER_ONE_RESULT') {
      if (response.kind === 'ERROR') {
        console.error('[engine] TIER_ONE failed:', response.payload.message);
      }
      return null;
    }
    return response.payload;
  },
});
