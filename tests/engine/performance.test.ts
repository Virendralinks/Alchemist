import { describe, expect, it, beforeAll } from 'vitest';
import { gzipSync } from 'node:zlib';
import { analyzeLines } from '@/lib/engine/analyze';
import { tierOne } from '@/lib/engine/rhythm';
import { queryRhymes } from '@/lib/engine/rhyme';
import { g2pEn } from '@/lib/engine/g2p-en';
import { buildRhymeIndex } from '@/lib/engine/index-builder';
import {
  createWorkerState,
  handleWorkerRequest,
} from '@/lib/engine/worker';
import { seedEnglishPriors } from '@/lib/lexicon/en-priors';
import type { RhymeIndex } from '@/lib/types/rhyme';

beforeAll(() => {
  seedEnglishPriors();
});

const FOUR_BARS = [
  { id: '1', text: 'deployed the fix, phir bhi client naaraaz' },
  { id: '2', text: 'meri migration ka yahi andaaz' },
  { id: '3', text: 'subah se raat tak wahi kaam' },
  { id: '4', text: 'I take the hit and I stay calm' },
];

function elapsed(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

describe('performance budgets — Section 3.10', () => {
  let index: RhymeIndex;

  beforeAll(() => {
    // Warm the dictionaries once so the budgets measure steady-state work,
    // not cold-start CMUdict parsing.
    g2pEn('warmup');
    analyzeLines(FOUR_BARS);
    index = buildRhymeIndex({ maxEnglish: 3000, maxHindi: 2000 });
  });

  it('analyzes 4 bars in under 16 ms', () => {
    // Best of 5 — Vitest and GC noise should not fail a real budget.
    const samples = Array.from({ length: 5 }, () =>
      elapsed(() => {
        analyzeLines(FOUR_BARS);
      }),
    );
    const best = Math.min(...samples);
    expect(best).toBeLessThan(16);
  });

  it('serves a rhyme query against the index in under 8 ms', () => {
    const pronunciation = g2pEn('grind')[0];
    const run = () =>
      queryRhymes(index, {
        text: 'grind',
        lang: 'en',
        pronunciation,
        filter: {
          langs: [],
          tags: [],
          minScore: 0.3,
          syllableCount: null,
          crossLanguageOnly: false,
        },
      });

    // The budget is about steady-state typing latency, not the first call. Warm
    // up so we measure the query rather than the JIT compiling it, which is
    // otherwise slow enough to fail whenever the suite runs under load.
    for (let i = 0; i < 20; i += 1) run();

    const samples = Array.from({ length: 5 }, () => elapsed(run));
    expect(Math.min(...samples)).toBeLessThan(8);
  });

  it('runs Tier 1 full dissection of 4 bars in under 50 ms', () => {
    const text = FOUR_BARS.map((b) => b.text).join('\n');
    const samples = Array.from({ length: 5 }, () =>
      elapsed(() => {
        tierOne({ text, bpm: 90 });
      }),
    );
    expect(Math.min(...samples)).toBeLessThan(50);
  });

  it('loads the index and reaches READY in under 400 ms', async () => {
    const state = createWorkerState();
    const payload = JSON.stringify(index);
    const start = performance.now();
    const response = await handleWorkerRequest(
      state,
      { id: 'init-1', kind: 'INIT', payload: { indexUrl: 'memory://index' } },
      async () => JSON.parse(payload) as RhymeIndex,
    );
    const ms = performance.now() - start;
    expect(response.kind).toBe('READY');
    expect(ms).toBeLessThan(400);
  });

  it('keeps the compressed index under 2.5 MB', () => {
    // Full-budget build for the size assertion.
    const full = buildRhymeIndex();
    const gzipBytes = gzipSync(Buffer.from(JSON.stringify(full))).length;
    expect(gzipBytes).toBeLessThan(2.5 * 1024 * 1024);
  });
});
