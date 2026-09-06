// lib/lexicon/cmudict-loader.ts
//
// Loads and parses the English dictionary. Imported ONLY by the worker and by
// the build-time index builder, never by anything the main bundle can reach —
// the JSON is ~4 MB and has no business in the page payload (Appendix B).
//
// The package keys alternate pronunciations as `word(2)`, `word(3)`, which is
// how a word gets more than one `Pronunciation` candidate (Section 3.3).

import { dictionary } from 'cmu-pronouncing-dictionary';

export interface CmudictEntry {
  /** ARPABET with stress digits, e.g. 'AH0 B AW1 T'. */
  arpabet: string;
  /** 0 for the primary entry, 1+ for `word(2)` and beyond. */
  variantIndex: number;
}

const VARIANT_KEY = /^(.+)\((\d+)\)$/;

let cache: Map<string, CmudictEntry[]> | null = null;

/**
 * Groups the flat dictionary into word -> ordered pronunciations. Built lazily
 * and once: it walks 135k keys, which is ~80 ms, and paying that per query
 * would blow the 8 ms rhyme budget by itself.
 */
export function loadCmudict(): Map<string, CmudictEntry[]> {
  if (cache) return cache;
  const map = new Map<string, CmudictEntry[]>();

  for (const key of Object.keys(dictionary)) {
    const arpabet = dictionary[key];
    if (!arpabet) continue;
    const match = VARIANT_KEY.exec(key);
    const word = match ? match[1] : key;
    const variantIndex = match ? Number(match[2]) - 1 : 0;
    const list = map.get(word);
    if (list) {
      list.push({ arpabet, variantIndex });
    } else {
      map.set(word, [{ arpabet, variantIndex }]);
    }
  }

  for (const list of map.values()) list.sort((x, y) => x.variantIndex - y.variantIndex);

  cache = map;
  return map;
}

/** Case-folded lookup. Returns an empty array for out-of-vocabulary tokens. */
export function lookupCmudict(token: string): CmudictEntry[] {
  const dict = loadCmudict();
  return dict.get(token.toLowerCase()) ?? [];
}

export const cmudictHas = (token: string): boolean => lookupCmudict(token).length > 0;

/** Every headword, for index building and language-ID priors. */
export function cmudictWords(): string[] {
  return Array.from(loadCmudict().keys());
}

/** Frees the parsed map. The worker calls this only if it is asked to shrink. */
export function resetCmudict(): void {
  cache = null;
}
