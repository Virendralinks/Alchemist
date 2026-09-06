// lib/lexicon/en-priors.ts
//
// Builds the English unigram prior map language ID consumes as evidence source
// 1. Separated from cmudict-loader so the prior is available in Node tests
// without waiting on the rhyme-index INIT path.

import { expandEnBank } from './tagged';
import { EN_COMMON_ROWS } from './en-common';
import { NCR_EN_ROWS } from './ncr-slang';
import { setEnglishPriors } from '@/lib/engine/language-id';

let seeded = false;

/** Idempotent. Safe to call from test setup and from the worker INIT handler. */
export function seedEnglishPriors(): void {
  if (seeded) return;
  const priors = new Map<string, number>();
  for (const entry of [...expandEnBank(EN_COMMON_ROWS), ...expandEnBank(NCR_EN_ROWS)]) {
    const score = Math.max(0.05, 1 - Math.log10(entry.rank + 1) / Math.log10(2001));
    const prev = priors.get(entry.text) ?? 0;
    if (score > prev) priors.set(entry.text, score);
  }
  setEnglishPriors(priors);
  seeded = true;
}
