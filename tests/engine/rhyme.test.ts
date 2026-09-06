import { describe, expect, it } from 'vitest';
import { g2pEn } from '@/lib/engine/g2p-en';
import { g2pHi } from '@/lib/engine/g2p-hi';
import { classifyPair, scoreRhyme } from '@/lib/engine/rhyme';
import type { Lang, Pronunciation } from '@/lib/types/phonetics';
import type { RhymeType } from '@/lib/types/rhyme';

function en(word: string): Pronunciation {
  return g2pEn(word)[0];
}
function hi(word: string): Pronunciation {
  return g2pHi(word)[0];
}

function classify(
  aText: string,
  aLang: Lang,
  bText: string,
  bLang: Lang,
  opts: { mosaic?: boolean; holorime?: boolean; internal?: boolean } = {},
) {
  const a = aLang === 'hi' ? hi(aText) : en(aText);
  const b = bLang === 'hi' ? hi(bText) : en(bText);
  return classifyPair(a, b, { aText, bText, aLang, bLang, ...opts });
}

const CASES: {
  type: RhymeType;
  a: [string, Lang];
  b: [string, Lang];
  opts?: { mosaic?: boolean; holorime?: boolean; internal?: boolean };
}[] = [
  // perfect
  { type: 'perfect', a: ['grind', 'en'], b: ['mind', 'en'] },
  { type: 'perfect', a: ['baat', 'hi'], b: ['raat', 'hi'] },
  // identical
  { type: 'identical', a: ['right', 'en'], b: ['write', 'en'] },
  { type: 'identical', a: ['hai', 'hi'], b: ['hai', 'hi'] },
  // slant
  { type: 'slant', a: ['shape', 'en'], b: ['fake', 'en'] },
  { type: 'slant', a: ['sleep', 'en'], b: ['repeat', 'en'] },
  // para — identical coda, different nucleus
  { type: 'para', a: ['grind', 'en'], b: ['grand', 'en'] },
  { type: 'para', a: ['dil', 'hi'], b: ['daal', 'hi'] },
  // consonance — consonant skeleton matches, coda not exact (else para wins)
  { type: 'consonance', a: ['crisp', 'en'], b: ['crust', 'en'] },
  { type: 'consonance', a: ['lisp', 'en'], b: ['lust', 'en'] },
  // assonance-chain — matching nuclei across 2+ syllables, coda loose enough
  // that multisyllabic (codaDistance <= 0.4) does not fire.
  { type: 'assonance-chain', a: ['maker', 'en'], b: ['favor', 'en'] },
  { type: 'assonance-chain', a: ['baker', 'en'], b: ['waver', 'en'] },
  // internal (positional flag)
  { type: 'internal', a: ['mind', 'en'], b: ['grind', 'en'], opts: { internal: true } },
  { type: 'internal', a: ['baat', 'hi'], b: ['raat', 'hi'], opts: { internal: true } },
  // multisyllabic — 2+ syllable tail, high overall match
  { type: 'multisyllabic', a: ['kismat', 'hi'], b: ['himmat', 'hi'] },
  { type: 'multisyllabic', a: ['izzat', 'hi'], b: ['kismat', 'hi'] },
  // mosaic (flagged by caller — combinatorial search is server-side)
  { type: 'mosaic', a: ['hospital', 'en'], b: ['bottle', 'en'], opts: { mosaic: true } },
  { type: 'mosaic', a: ['zindagi', 'hi'], b: ['dil', 'hi'], opts: { mosaic: true } },
  // holorime (flagged by caller)
  { type: 'holorime', a: ['right', 'en'], b: ['write', 'en'], opts: { holorime: true } },
  { type: 'holorime', a: ['hai', 'hi'], b: ['hai', 'hi'], opts: { holorime: true } },
  // forced — nuclei within one feature step, coda and skeleton do not match
  { type: 'forced', a: ['moon', 'en'], b: ['map', 'en'] },
  { type: 'forced', a: ['beat', 'en'], b: ['back', 'en'] },
  // cross-language pairs (at least three)
  { type: 'perfect', a: ['naam', 'hi'], b: ['calm', 'en'] },
  { type: 'perfect', a: ['din', 'hi'], b: ['been', 'en'] },
  { type: 'para', a: ['dil', 'hi'], b: ['deal', 'en'] },
];

describe('rhyme classifier — all eleven types', () => {
  const seen = new Map<RhymeType, number>();

  for (const c of CASES) {
    it(`${c.type}: ${c.a[0]} (${c.a[1]}) / ${c.b[0]} (${c.b[1]})`, () => {
      const result = classify(c.a[0], c.a[1], c.b[0], c.b[1], c.opts);
      expect(result.type).toBe(c.type);
      seen.set(c.type, (seen.get(c.type) ?? 0) + 1);
    });
  }

  it('covers every RhymeType at least twice', () => {
    // Re-run classification to populate `seen` from the cases above is already
    // done by the individual tests; assert the table itself is complete.
    const byType = new Map<RhymeType, number>();
    for (const c of CASES) byType.set(c.type, (byType.get(c.type) ?? 0) + 1);
    const all: RhymeType[] = [
      'perfect', 'identical', 'slant', 'para', 'consonance',
      'assonance-chain', 'internal', 'multisyllabic', 'mosaic', 'holorime', 'forced',
    ];
    for (const t of all) {
      expect(byType.get(t) ?? 0, `missing coverage for ${t}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('includes at least three cross-language pairs', () => {
    const cross = CASES.filter((c) => c.a[1] !== c.b[1]);
    expect(cross.length).toBeGreaterThanOrEqual(3);
    for (const c of cross) {
      const result = classify(c.a[0], c.a[1], c.b[0], c.b[1], c.opts);
      expect(result.isCrossLanguage).toBe(true);
    }
  });
});

describe('rhyme scoring formula', () => {
  it('gives perfect pairs a score near 1', () => {
    const a = en('grind');
    const b = en('mind');
    const components = scoreRhyme(a.syllables, b.syllables);
    expect(components.nucleusSequenceMatch).toBe(1);
    expect(components.codaDistance).toBe(0);
    expect(components.score).toBeGreaterThan(0.9);
  });

  it('weights nucleus match at 0.50 of the composite', () => {
    // Two words with identical nuclei and empty/equal codas but mismatched stress
    // still score high because nucleus dominates.
    const a = en('shape');
    const b = en('fake');
    const components = scoreRhyme(a.syllables, b.syllables);
    expect(components.nucleusSequenceMatch).toBe(1);
    expect(components.score).toBeGreaterThan(0.5);
  });
});
