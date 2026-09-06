import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import {
  phonemeDistance,
  sequenceDistance,
  ALL_INVENTORY_SYMBOLS,
} from '@/lib/engine/feature-matrix';
import { makePhoneme } from '@/lib/engine/ipa';
import type { Phoneme } from '@/lib/types/phonetics';

const arbitraryPhoneme: fc.Arbitrary<Phoneme> = fc
  .constantFrom(...ALL_INVENTORY_SYMBOLS)
  .map((ipa) => makePhoneme(ipa));

describe('phonemeDistance properties', () => {
  it('is symmetric, zero on identity, and bounded in [0, 1]', () => {
    fc.assert(
      fc.property(arbitraryPhoneme, arbitraryPhoneme, (a, b) => {
        const dAB = phonemeDistance(a, b);
        const dBA = phonemeDistance(b, a);
        expect(dAB).toBeGreaterThanOrEqual(0);
        expect(dAB).toBeLessThanOrEqual(1);
        expect(dAB).toBeCloseTo(dBA, 10);
        expect(phonemeDistance(a, a)).toBe(0);
      }),
      { numRuns: 200 },
    );
  });

  it('treats cross-language equivalences as near-zero', () => {
    expect(phonemeDistance(makePhoneme('ɑ'), makePhoneme('aː'))).toBeLessThan(0.1);
    expect(phonemeDistance(makePhoneme('v'), makePhoneme('ʋ'))).toBeLessThan(0.1);
    expect(phonemeDistance(makePhoneme('ɹ'), makePhoneme('r'))).toBeLessThan(0.1);
    expect(phonemeDistance(makePhoneme('t'), makePhoneme('t̪'))).toBeLessThan(0.15);
    expect(phonemeDistance(makePhoneme('t'), makePhoneme('ʈ'))).toBeLessThan(0.25);
  });

  it('treats aspiration mismatch as a very small distance', () => {
    const d = phonemeDistance(makePhoneme('k'), makePhoneme('kʰ'));
    expect(d).toBeLessThan(0.1);
  });
});

describe('sequenceDistance', () => {
  it('is zero on identical sequences and symmetric', () => {
    const a = [makePhoneme('k'), makePhoneme('ə'), makePhoneme('l')];
    expect(sequenceDistance(a, a)).toBe(0);
    const b = [makePhoneme('k'), makePhoneme('aː'), makePhoneme('l')];
    expect(sequenceDistance(a, b)).toBeCloseTo(sequenceDistance(b, a), 10);
  });

  it('is bounded in [0, 1]', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPhoneme, { minLength: 0, maxLength: 6 }),
        fc.array(arbitraryPhoneme, { minLength: 0, maxLength: 6 }),
        (a, b) => {
          const d = sequenceDistance(a, b);
          expect(d).toBeGreaterThanOrEqual(0);
          expect(d).toBeLessThanOrEqual(1);
        },
      ),
      { numRuns: 100 },
    );
  });
});
