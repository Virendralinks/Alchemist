import { describe, expect, it } from 'vitest';
import { tokenize, countedWords } from '@/lib/engine/tokenizer';

describe('tokenizer', () => {
  it('keeps character offsets that round-trip through slice', () => {
    const line = 'deployed the fix, phir bhi client naaraaz';
    for (const t of tokenize(line)) {
      expect(line.slice(t.charStart, t.charEnd)).toBe(t.text);
    }
  });

  it('excludes parenthetical ad-libs from counted words', () => {
    const tokens = tokenize('deployed the fix (yeah) phir bhi');
    const words = countedWords(tokens);
    expect(words.map((w) => w.text)).toEqual([
      'deployed', 'the', 'fix', 'phir', 'bhi',
    ]);
    const adlibs = tokens.filter((t) => t.isAdLib && t.kind === 'word');
    expect(adlibs.map((t) => t.text)).toEqual(['yeah']);
  });

  it('keeps apostrophes inside contractions', () => {
    const words = countedWords(tokenize("I don't sleep"));
    expect(words.map((w) => w.text)).toEqual(['I', "don't", 'sleep']);
  });

  it('treats square-bracket ad-libs the same as parentheses', () => {
    const words = countedWords(tokenize('grind [ha] hard'));
    expect(words.map((w) => w.text)).toEqual(['grind', 'hard']);
  });
});
