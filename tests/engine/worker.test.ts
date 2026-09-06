import { describe, expect, it, beforeAll } from 'vitest';
import {
  createWorkerState,
  handleWorkerRequest,
  type WorkerRequest,
} from '@/lib/engine/worker';
import { buildRhymeIndex } from '@/lib/engine/index-builder';
import type { RhymeIndex } from '@/lib/types/rhyme';
import { seedEnglishPriors } from '@/lib/lexicon/en-priors';

let index: RhymeIndex;

beforeAll(() => {
  seedEnglishPriors();
  index = buildRhymeIndex({ maxEnglish: 1500, maxHindi: 1500 });
});

const load = async () => index;

describe('worker protocol — Section 3.10', () => {
  it('INIT → READY with indexVersion', async () => {
    const state = createWorkerState();
    const res = await handleWorkerRequest(
      state,
      { id: '1', kind: 'INIT', payload: { indexUrl: 'memory://x' } },
      load,
    );
    expect(res).toMatchObject({ id: '1', kind: 'READY' });
    if (res.kind === 'READY') expect(res.payload.indexVersion).toBe(index.version);
    expect(state.ready).toBe(true);
  });

  it('ANALYZE_LINES → ANALYSIS keyed by line id', async () => {
    const state = createWorkerState();
    await handleWorkerRequest(state, { id: '0', kind: 'INIT', payload: { indexUrl: 'x' } }, load);
    const req: WorkerRequest = {
      id: '2',
      kind: 'ANALYZE_LINES',
      payload: {
        lines: [{ id: 'a', text: 'mera dil toot gaya' }],
        overrides: { lang: {}, pronunciation: {} },
      },
    };
    const res = await handleWorkerRequest(state, req, load);
    expect(res.kind).toBe('ANALYSIS');
    if (res.kind === 'ANALYSIS') {
      expect(res.payload.a.length).toBeGreaterThan(0);
      expect(res.payload.a[0].candidates.length).toBeGreaterThan(0);
    }
  });

  it('GET_RHYMES → RHYMES after INIT', async () => {
    const state = createWorkerState();
    await handleWorkerRequest(state, { id: '0', kind: 'INIT', payload: { indexUrl: 'x' } }, load);
    const res = await handleWorkerRequest(
      state,
      {
        id: '3',
        kind: 'GET_RHYMES',
        payload: {
          token: 'grind',
          lang: 'en',
          filter: {
            langs: [],
            tags: [],
            minScore: 0.3,
            syllableCount: null,
            crossLanguageOnly: false,
          },
        },
      },
      load,
    );
    expect(res.kind).toBe('RHYMES');
    if (res.kind === 'RHYMES') expect(Array.isArray(res.payload)).toBe(true);
  });

  it('GET_RHYMES before INIT → ERROR', async () => {
    const state = createWorkerState();
    const res = await handleWorkerRequest(
      state,
      {
        id: '4',
        kind: 'GET_RHYMES',
        payload: {
          token: 'grind',
          lang: 'en',
          filter: {
            langs: [],
            tags: [],
            minScore: 0,
            syllableCount: null,
            crossLanguageOnly: false,
          },
        },
      },
      load,
    );
    expect(res.kind).toBe('ERROR');
  });

  it('DETECT_DEVICES → DEVICES', async () => {
    const state = createWorkerState();
    const res = await handleWorkerRequest(
      state,
      {
        id: '5',
        kind: 'DETECT_DEVICES',
        payload: {
          lines: [
            { id: '1', text: 'the grind on my mind' },
            { id: '2', text: 'I left it all behind' },
          ],
        },
      },
      load,
    );
    expect(res.kind).toBe('DEVICES');
    if (res.kind === 'DEVICES') expect(res.payload.length).toBeGreaterThan(0);
  });

  it('TIER_ONE → TIER_ONE_RESULT', async () => {
    const state = createWorkerState();
    const res = await handleWorkerRequest(
      state,
      {
        id: '6',
        kind: 'TIER_ONE',
        payload: {
          text: 'mera dil toot gaya\nis shehar mein koi nahi',
          bpm: 88,
        },
      },
      load,
    );
    expect(res.kind).toBe('TIER_ONE_RESULT');
    if (res.kind === 'TIER_ONE_RESULT') {
      expect(res.payload.syllableCount).toBeGreaterThan(0);
      expect(res.payload.tokens.length).toBeGreaterThan(0);
    }
  });
});
