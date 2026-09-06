import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useWorkbenchStore } from '@/lib/store';
import { CIPHER_LINE_ID, createEmptyGrid, DEFAULT_GRID_ID } from '@/lib/store/sequencer-slice';
import { resetEngineBridgeForTests } from '@/lib/store/engine-bridge';
import type { RhymeIndex } from '@/lib/types/rhyme';

vi.spyOn(console, 'warn').mockImplementation(() => {});

const indexPath = join(process.cwd(), 'public', 'rhyme-index.json');
const indexJson = readFileSync(indexPath, 'utf8');
const index = JSON.parse(indexJson) as RhymeIndex;

beforeEach(() => {
  resetEngineBridgeForTests();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('rhyme-index')) {
        return new Response(indexJson, {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('not found', { status: 404 });
    }),
  );

  useWorkbenchStore.setState({
    grids: { [DEFAULT_GRID_ID]: createEmptyGrid(DEFAULT_GRID_ID, 'Untitled Bar') },
    activeGridId: DEFAULT_GRID_ID,
    selectedNodeIds: [],
    workerReady: false,
    indexLoaded: false,
    analysis: {},
    lineTexts: {},
    rhymes: {},
    langOverrides: {},
    pronunciationOverrides: {},
    activeQueryId: null,
    activeQueryToken: null,
    activeQueryLang: null,
    matrixFilter: {
      langs: [],
      tags: [],
      minScore: 0.3,
      syllableCount: null,
      crossLanguageOnly: false,
    },
    matrixColumns: [],
  });
});

describe('engine slice — Phase 3 wiring', () => {
  it('initWorker loads the index and exposes matrix columns', async () => {
    await useWorkbenchStore.getState().initWorker();
    const state = useWorkbenchStore.getState();
    expect(state.workerReady).toBe(true);
    expect(state.indexLoaded).toBe(true);
    expect(state.matrixColumns.length).toBeGreaterThan(0);
    expect(index.lexemes.length).toBeGreaterThan(1000);
  });

  it('analyzeLine fills the tray with syllabified chips carrying language', async () => {
    await useWorkbenchStore.getState().initWorker();
    await useWorkbenchStore
      .getState()
      .analyzeLine(CIPHER_LINE_ID, 'phir bhi client naaraaz');

    const state = useWorkbenchStore.getState();
    const grid = state.grids[state.activeGridId];
    expect(state.analysis[CIPHER_LINE_ID]?.length).toBe(4);
    expect(grid.tray.length).toBeGreaterThanOrEqual(4);

    const langs = new Set(
      grid.tray.map((id) => grid.nodes[id]?.lang).filter(Boolean),
    );
    expect(langs.has('hi')).toBe(true);
    expect(langs.has('en')).toBe(true);

    for (const id of grid.tray) {
      const node = grid.nodes[id];
      expect(node?.source).toBe('typed');
      expect(node?.text.length).toBeGreaterThan(0);
    }
  });

  it('overrideLang persists and re-analyzes', async () => {
    await useWorkbenchStore.getState().initWorker();
    await useWorkbenchStore
      .getState()
      .analyzeLine(CIPHER_LINE_ID, 'main pipeline');

    useWorkbenchStore.getState().overrideLang('main', 'hi');
    // allow re-analyze promises to settle
    await vi.waitFor(() => {
      const tokens = useWorkbenchStore.getState().analysis[CIPHER_LINE_ID];
      const main = tokens?.find((t) => t.token.toLowerCase() === 'main');
      expect(main?.lang).toBe('hi');
      expect(main?.langLocked).toBe(true);
    });

    expect(useWorkbenchStore.getState().langOverrides.main).toBe('hi');
  });

  it('requestRhymes returns scored candidates for a token', async () => {
    await useWorkbenchStore.getState().initWorker();
    await useWorkbenchStore.getState().analyzeLine(CIPHER_LINE_ID, 'grind mind');
    await useWorkbenchStore.getState().requestRhymes('grind', 'grind');

    const rhymes = useWorkbenchStore.getState().rhymes.grind;
    expect(rhymes?.length).toBeGreaterThan(0);
    expect(rhymes![0].score).toBeGreaterThan(0);
    expect(rhymes![0].type).toBeTruthy();
  });
});
