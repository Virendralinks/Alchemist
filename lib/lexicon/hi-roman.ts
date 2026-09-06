// lib/lexicon/hi-roman.ts
//
// The romanized Hindi lexicon from Appendix D. Every bank is assembled here
// into one lookup table keyed by every spelling variant, so G2P and language
// ID share a single source of truth for "is this a Hindi word, and how is it
// pronounced?".
//
// Adding a bank is one import and one push into `BANKS` — nothing else.

import type { HiLexeme } from './hi-lexeme';
import { expandBank } from './hi-lexeme';
import { HI_CORE_ROWS } from './hi-core';
import { HI_NOUN_ROWS } from './hi-nouns';
import { HI_VERB_ROWS } from './hi-verbs';
import { HI_MODIFIER_ROWS } from './hi-modifiers';
import { NCR_HI_ROWS } from './ncr-slang';

const BANKS = [HI_CORE_ROWS, HI_NOUN_ROWS, HI_VERB_ROWS, HI_MODIFIER_ROWS, NCR_HI_ROWS];

/** Every HiLexeme, in bank order. Deduplication is by id, first bank wins. */
export const HI_LEXICON: HiLexeme[] = (() => {
  const seen = new Set<string>();
  const out: HiLexeme[] = [];
  for (const bank of BANKS) {
    for (const lexeme of expandBank(bank)) {
      if (seen.has(lexeme.id)) continue;
      seen.add(lexeme.id);
      out.push(lexeme);
    }
  }
  return out;
})();

/**
 * Spelling -> lexemes. A single spelling can hit more than one lexeme when two
 * real words share a romanization (`kal` कल vs `kal` काल). Ranked by frequency.
 */
export const HI_BY_SPELLING: Map<string, HiLexeme[]> = (() => {
  const map = new Map<string, HiLexeme[]>();
  const add = (spelling: string, lexeme: HiLexeme) => {
    const key = spelling.toLowerCase();
    const list = map.get(key);
    if (list) {
      if (!list.some((l) => l.id === lexeme.id)) list.push(lexeme);
    } else {
      map.set(key, [lexeme]);
    }
  };
  for (const lexeme of HI_LEXICON) {
    add(lexeme.canonical, lexeme);
    for (const v of lexeme.variants) add(v, lexeme);
  }
  for (const list of map.values()) list.sort((a, b) => a.rank - b.rank);
  return map;
})();

export function lookupHi(token: string): HiLexeme[] {
  return HI_BY_SPELLING.get(token.toLowerCase()) ?? [];
}

export const hiHas = (token: string): boolean => lookupHi(token).length > 0;

/** Frequency prior for language ID: near 1 for the most common word, approaching 0. */
export function hiPrior(token: string): number {
  const hits = lookupHi(token);
  if (hits.length === 0) return 0;
  const best = hits[0].rank;
  return Math.max(0.05, 1 - Math.log10(best + 1) / Math.log10(2001));
}
