// tests/store/dissect-slice.test.ts
//
// Tier 1 runs through the engine bridge with no network and no API key, and the
// degraded path must leave that Tier 1 output completely intact (Section 4.4).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkbenchStore } from '@/lib/store';
import { createEmptyGrid, DEFAULT_GRID_ID } from '@/lib/store/sequencer-slice';
import { resetEngineBridgeForTests } from '@/lib/store/engine-bridge';

vi.spyOn(console, 'warn').mockImplementation(() => {});

const BARS = 'deployed the fix, phir bhi client naaraaz\nmeri migration ka yahi andaaz';

beforeEach(() => {
  resetEngineBridgeForTests();
  // No route handlers in a Node test: every fetch is the no-key degraded path.
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/api/dissect') && init?.method !== 'GET') {
        return new Response(
          JSON.stringify({ error: 'no key', degraded: true }),
          { status: 503, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (url.includes('/api/dissect')) {
        return new Response(JSON.stringify({ interpretiveAvailable: false }), {
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
    langOverrides: {},
    pronunciationOverrides: {},
    draft: '',
    userDissections: {},
    currentKey: null,
    status: 'idle',
    interpretiveAvailable: false,
    errorMessage: null,
    servedFromCache: false,
    currentLineTokens: [],
    currentLines: [],
  });
});

describe('dissect slice — Tier 1', () => {
  it('produces a computed dissection with no network and no API key', async () => {
    const store = useWorkbenchStore.getState();
    store.setDraft(BARS);
    await useWorkbenchStore.getState().runTierOne();

    const state = useWorkbenchStore.getState();
    expect(state.status).toBe('done');
    expect(state.currentKey).toBeTruthy();

    const dissection = state.userDissections[state.currentKey!];
    expect(dissection).toBeDefined();
    expect(dissection.provenance).toBe('engine');
    expect(dissection.rhythm.syllableCount).toBeGreaterThan(0);
    expect(dissection.rhythm.tokens.length).toBeGreaterThan(0);
    // Interpretive fields stay empty until Tier 2 runs.
    expect(dissection.meaning).toBeNull();
    expect(dissection.entendres).toEqual([]);
  });

  it('calls both languages correctly across the Hinglish block', async () => {
    useWorkbenchStore.getState().setDraft(BARS);
    await useWorkbenchStore.getState().runTierOne();

    const { currentKey, userDissections } = useWorkbenchStore.getState();
    const tokens = userDissections[currentKey!].rhythm.tokens;
    const langFor = (word: string) =>
      tokens.find((t) => t.token.toLowerCase() === word)?.lang;

    expect(langFor('deployed')).toBe('en');
    expect(langFor('phir')).toBe('hi');
    expect(langFor('naaraaz')).toBe('hi');
  });

  it('exposes per-line tokens for the scheme rail', async () => {
    useWorkbenchStore.getState().setDraft(BARS);
    await useWorkbenchStore.getState().runTierOne();

    const { currentLines, currentLineTokens } = useWorkbenchStore.getState();
    expect(currentLines).toHaveLength(2);
    expect(currentLineTokens).toHaveLength(2);
    expect(currentLineTokens[0].length).toBeGreaterThan(0);
  });

  it('resets to idle on an empty draft', async () => {
    useWorkbenchStore.getState().setDraft('   ');
    await useWorkbenchStore.getState().runTierOne();
    expect(useWorkbenchStore.getState().status).toBe('idle');
    expect(useWorkbenchStore.getState().currentKey).toBeNull();
  });
});

describe('dissect slice — degrade', () => {
  it('reports interpretiveAvailable false from the capability probe', async () => {
    await useWorkbenchStore.getState().checkInterpretive();
    expect(useWorkbenchStore.getState().interpretiveAvailable).toBe(false);
  });

  it('marks status degraded without destroying Tier 1', async () => {
    useWorkbenchStore.getState().setDraft(BARS);
    await useWorkbenchStore.getState().runTierOne();

    const key = useWorkbenchStore.getState().currentKey!;
    const before = useWorkbenchStore.getState().userDissections[key].rhythm;

    await useWorkbenchStore.getState().runTierTwo();

    const state = useWorkbenchStore.getState();
    expect(state.status).toBe('degraded');
    expect(state.interpretiveAvailable).toBe(false);
    // The whole point of degrading: Tier 1 survives untouched.
    expect(state.userDissections[key].rhythm).toEqual(before);
    expect(state.userDissections[key].provenance).toBe('engine');
  });

  it('does nothing when Tier 2 is asked for with no Tier 1 present', async () => {
    await useWorkbenchStore.getState().runTierTwo();
    expect(useWorkbenchStore.getState().status).toBe('idle');
  });
});
