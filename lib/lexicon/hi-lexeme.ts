// lib/lexicon/hi-lexeme.ts
//
// The `HiLexeme` shape from Appendix D, plus the compact authoring format the
// domain banks are written in.
//
// Authoring 1,500 entries as object literals would be 15,000 lines nobody would
// ever review. So each entry is written as a tuple and expanded here, and
// `syllableCount` is *derived* from the authored IPA rather than typed by hand —
// a count that can disagree with its own phonemes is a bug waiting to happen.

import { parseIpa } from '@/lib/engine/ipa';

export type HiPos =
  | 'noun' | 'verb' | 'adj' | 'adv' | 'pron' | 'postp' | 'conj' | 'interj';

export interface HiAlternate {
  ipa: string;
  gloss: string;
  devanagari: string;
}

export interface HiLexeme {
  id: string;
  /** The spelling you are most likely to type. */
  canonical: string;             // 'dil'
  /** Every other spelling that should resolve here. */
  variants: string[];            // ['dill', 'dhil']
  /** Reference only — never an input path. Present so authors can verify phonemes. */
  devanagari: string;            // 'दिल'
  ipa: string;                   // 'd̪ɪl'
  syllableCount: number;
  gloss: string;                 // 'heart'
  pos: HiPos;
  tags: string[];                // 'ncr', 'filmi', 'slang', 'corporate', 'tech'
  /** Frequency rank; drives index trimming and language-ID priors. */
  rank: number;
  /** Set when a spelling is genuinely ambiguous and both readings are live. */
  alternates?: HiAlternate[];
}

/**
 * Compact authoring row:
 *   [canonical, variants, devanagari, ipa, gloss, pos, tags, rank, alternates?]
 *
 * `variants` and `tags` are pipe-delimited so a row stays on one line. An empty
 * string means none. Example:
 *   ['dil', 'dill', 'दिल', 'd̪ɪl', 'heart', 'noun', 'filmi', 84]
 */
export type HiRow =
  | [string, string, string, string, string, HiPos, string, number]
  | [string, string, string, string, string, HiPos, string, number, HiAlternate[]];

const splitList = (s: string): string[] =>
  s.length === 0 ? [] : s.split('|').map((x) => x.trim()).filter(Boolean);

/** Vowel nuclei are syllables, by definition — so this is the count. */
export const countSyllablesInIpa = (ipa: string): number =>
  parseIpa(ipa).filter((p) => p.kind === 'vowel').length;

export function expandRow(row: HiRow): HiLexeme {
  const [canonical, variants, devanagari, ipa, gloss, pos, tags, rank] = row;
  const alternates = row.length === 9 ? row[8] : undefined;
  return {
    id: canonical,
    canonical,
    variants: splitList(variants),
    devanagari,
    ipa,
    syllableCount: Math.max(1, countSyllablesInIpa(ipa)),
    gloss,
    pos,
    tags: splitList(tags),
    rank,
    ...(alternates && alternates.length > 0 ? { alternates } : {}),
  };
}

/**
 * Expands a bank, disambiguating ids where two entries share a spelling
 * (`main` the pronoun vs `main` the noun) by suffixing the part of speech.
 */
export function expandBank(rows: HiRow[]): HiLexeme[] {
  const seen = new Map<string, number>();
  return rows.map((row) => {
    const lexeme = expandRow(row);
    const count = seen.get(lexeme.canonical) ?? 0;
    seen.set(lexeme.canonical, count + 1);
    if (count > 0) lexeme.id = `${lexeme.canonical}-${lexeme.pos}`;
    return lexeme;
  });
}
