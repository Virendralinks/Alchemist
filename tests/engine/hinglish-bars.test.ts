import { describe, expect, it, beforeAll } from 'vitest';
import { analyzeLine, stressPatternOf } from '@/lib/engine/analyze';
import { classifyPair } from '@/lib/engine/rhyme';
import { seedEnglishPriors } from '@/lib/lexicon/en-priors';
import { HINGLISH_BARS, HINGLISH_COUPLETS } from '../fixtures/hinglish-bars';

beforeAll(() => {
  seedEnglishPriors();
});

describe('hinglish fixture set', () => {
  it('has at least 40 bars', () => {
    expect(HINGLISH_BARS.length).toBeGreaterThanOrEqual(40);
  });

  for (const bar of HINGLISH_BARS) {
    describe(bar.id, () => {
      it(`syllable count is ${bar.syllables}`, () => {
        const analysis = analyzeLine(bar.text);
        expect(analysis.syllableCount).toBe(bar.syllables);
      });

      it('per-token language matches the annotation', () => {
        const analysis = analyzeLine(bar.text);
        expect(analysis.tokens.length).toBe(bar.tokens.length);
        analysis.tokens.forEach((t, i) => {
          expect(t.token.toLowerCase()).toBe(bar.tokens[i].text.toLowerCase());
          expect(t.lang).toBe(bar.tokens[i].lang);
        });
      });

      it('stress pattern matches the annotation', () => {
        const analysis = analyzeLine(bar.text);
        const stress = stressPatternOf(analysis);
        expect(stress).toEqual(bar.stress);
      });
    });
  }

  for (const couplet of HINGLISH_COUPLETS) {
    it(`${couplet.id} end-rhyme is ${couplet.endRhyme}`, () => {
      const a = analyzeLine(couplet.a.text);
      const b = analyzeLine(couplet.b.text);
      const aEnd = a.tokens[a.tokens.length - 1];
      const bEnd = b.tokens[b.tokens.length - 1];
      expect(aEnd.token.toLowerCase()).toBe(couplet.a.endWord.toLowerCase());
      expect(bEnd.token.toLowerCase()).toBe(couplet.b.endWord.toLowerCase());
      const aPron = aEnd.candidates[aEnd.selectedCandidate];
      const bPron = bEnd.candidates[bEnd.selectedCandidate];
      expect(aPron).toBeDefined();
      expect(bPron).toBeDefined();
      const classified = classifyPair(aPron!, bPron!, {
        aText: aEnd.token,
        bText: bEnd.token,
        aLang: aEnd.lang,
        bLang: bEnd.lang,
      });
      expect(classified.type).toBe(couplet.endRhyme);
      expect(classified.isCrossLanguage).toBe(couplet.crossLanguage);
    });
  }
});
