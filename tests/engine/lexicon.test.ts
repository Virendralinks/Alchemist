import { describe, expect, it } from 'vitest';
import { HI_LEXICON, lookupHi } from '@/lib/lexicon/hi-roman';
import { EN_COMMON_ROWS } from '@/lib/lexicon/en-common';
import { PHRASE_BANK } from '@/lib/lexicon/phrase-bank';
import { NCR_HI_ROWS, NCR_EN_ROWS } from '@/lib/lexicon/ncr-slang';
import { parseIpa } from '@/lib/engine/ipa';

describe('lexicon banks — Appendix D', () => {
  it('ships at least 1,500 Hindi lexemes', () => {
    expect(HI_LEXICON.length).toBeGreaterThanOrEqual(1500);
  });

  it('resolves spelling variants dil/dill, kya/kyaa, mein/main/mai', () => {
    expect(lookupHi('dil')[0]?.ipa).toBe(lookupHi('dill')[0]?.ipa);
    expect(lookupHi('kya').length).toBeGreaterThan(0);
    expect(lookupHi('kyaa').length).toBeGreaterThan(0);
    for (const spelling of ['mein', 'main', 'mai']) {
      const hits = lookupHi(spelling);
      expect(hits.length).toBeGreaterThan(0);
      expect(parseIpa(hits[0].ipa).some((p) => p.kind === 'vowel')).toBe(true);
    }
  });

  it('includes the full NCR/tech/slang bank', () => {
    expect(NCR_HI_ROWS.length).toBeGreaterThanOrEqual(150);
    expect(NCR_EN_ROWS.length).toBeGreaterThanOrEqual(110);
    expect(NCR_HI_ROWS.every((r) => String(r[6]).length > 0)).toBe(true);
  });

  it('has at least 1,200 common English priors', () => {
    expect(new Set(EN_COMMON_ROWS.map((r) => r[0])).size).toBeGreaterThanOrEqual(1200);
  });

  it('has a phrase bank of at least 220 n-grams', () => {
    expect(PHRASE_BANK.length).toBeGreaterThanOrEqual(220);
    for (const p of PHRASE_BANK) {
      expect(p.wordCount).toBe(p.text.trim().split(/\s+/).length);
    }
  });
});
