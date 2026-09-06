import { describe, expect, it, beforeAll } from 'vitest';
import { identifyLanguage } from '@/lib/engine/language-id';
import { seedEnglishPriors } from '@/lib/lexicon/en-priors';
import { AMBIGUOUS_TOKEN_CASES } from '../fixtures/hinglish-bars';
import { tokenize, countedWords } from '@/lib/engine/tokenizer';

beforeAll(() => {
  seedEnglishPriors();
});

describe('language ID — Section 3.2 ambiguous table', () => {
  for (const fixture of AMBIGUOUS_TOKEN_CASES) {
    it(`reads "${fixture.token}" as ${fixture.expected} in "${fixture.text}"`, () => {
      const words = countedWords(tokenize(fixture.text));
      const scores = identifyLanguage(words.map((w) => w.text));
      const idx = words.findIndex(
        (w) => w.text.toLowerCase() === fixture.token.toLowerCase(),
      );
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(scores[idx].lang).toBe(fixture.expected);
    });
  }

  it('honours an override at confidence 1', () => {
    const scores = identifyLanguage(['main'], { main: 'en' });
    expect(scores[0]).toEqual({ lang: 'en', score: 1, reasons: ['override'] });
  });

  it('does not over-smooth a single English tech term in a Hindi clause', () => {
    const words = countedWords(tokenize('meri migration fail ho gayi'));
    const scores = identifyLanguage(words.map((w) => w.text));
    const mig = words.findIndex((w) => w.text === 'migration');
    expect(scores[mig].lang).toBe('en');
  });
});
