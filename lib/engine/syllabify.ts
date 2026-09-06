// lib/engine/syllabify.ts
//
// Operates on phonemes, not letters — which is the whole reason the G2P comes
// first. "though" is one syllable and "sio" in "vision" is one; no letter-based
// heuristic gets both right, and a wrong syllable count corrupts every rhythm
// readout downstream.

import type { Lang, Phoneme, Stress, Syllable } from '@/lib/types/phonetics';
import { baseSymbol, NASAL_MARK } from './ipa';

/**
 * English onset clusters that are legal word-initially. Onset maximization is
 * only correct if it is constrained by legality: /str/ can start a syllable,
 * /tl/ and /nd/ cannot, so "atlas" must split at.las and not a.tlas.
 */
const LEGAL_EN_ONSETS: ReadonlySet<string> = new Set([
  // Two consonants
  'pl', 'pɹ', 'pj', 'bl', 'bɹ', 'bj', 'tɹ', 'tw', 'tj', 'dɹ', 'dw', 'dj',
  'kl', 'kɹ', 'kw', 'kj', 'gl', 'gɹ', 'gw', 'gj', 'fl', 'fɹ', 'fj',
  'θɹ', 'θw', 'θj', 'ʃɹ', 'sl', 'sw', 'sp', 'st', 'sk', 'sm', 'sn', 'sf', 'sj',
  'hj', 'mj', 'nj', 'lj', 'vj', 'zl',
  // Three consonants
  'spl', 'spɹ', 'spj', 'stɹ', 'stj', 'skl', 'skɹ', 'skw', 'skj',
]);

/**
 * Hindi tolerates far fewer onset clusters than English, and CV-first splitting
 * handles almost everything. These are the ones that genuinely occur.
 */
const LEGAL_HI_ONSETS: ReadonlySet<string> = new Set([
  'kj', 'pj', 'bj', 'mj', 'd̪j', 't̪j', 'gj', 'ʃj', 'sj', 'nj', 'lj', 'rj',
  'pr', 'br', 'kr', 'gr', 'd̪r', 't̪r', 'ʃr', 'sr', 'ʋr', 'mr', 'ɦr', 'dʒr',
  'kl', 'gl', 'pl', 'bl', 'ʃl', 'sl', 'ml',
  'st̪', 'sp', 'sk', 'sm', 'sn', 'ʃʋ', 'sʋ', 'd̪ʋ', 't̪ʋ', 'kʋ', 'ʃm',
  'st̪r', 'spr', 'skr',
]);

const isLegalOnset = (cluster: Phoneme[], lang: Lang): boolean => {
  if (cluster.length <= 1) return true;
  const key = cluster.map((p) => p.ipa).join('');
  return (lang === 'hi' ? LEGAL_HI_ONSETS : LEGAL_EN_ONSETS).has(key);
};

export interface SyllabifyOptions {
  /**
   * Grapheme contributed by each phoneme, positionally aligned. The rules-based
   * G2P knows this exactly; the lexicon path does not, and falls back to a
   * proportional split of the token.
   */
  graphemes?: string[];
  /** The source token, used for the fallback grapheme split. */
  token?: string;
}

/**
 * Splits a phoneme sequence into syllables. Returns [] for a token with no
 * vowel ("hmm", "psst"), which is honest: it has no nucleus, so it has no
 * syllable, and callers treat it as contributing zero to the count.
 */
export function syllabify(
  phonemes: Phoneme[],
  lang: Lang,
  options: SyllabifyOptions = {},
): Syllable[] {
  const nucleusIdx: number[] = [];
  phonemes.forEach((p, i) => {
    if (p.kind === 'vowel') nucleusIdx.push(i);
  });
  if (nucleusIdx.length === 0) return [];

  /** Phoneme index ranges per syllable: [start, end) covering onset+nucleus+coda. */
  const bounds: { onset: Phoneme[]; nucleus: Phoneme; coda: Phoneme[]; from: number; to: number }[] = [];

  for (let s = 0; s < nucleusIdx.length; s += 1) {
    const nucIdx = nucleusIdx[s];
    const prevNucIdx = s === 0 ? -1 : nucleusIdx[s - 1];
    const runStart = prevNucIdx + 1;
    const run = phonemes.slice(runStart, nucIdx);

    let onsetLen: number;
    if (s === 0) {
      // Everything before the first vowel is the first onset, legal or not —
      // it is what the writer typed and there is nowhere else to put it.
      onsetLen = run.length;
    } else if (lang === 'hi') {
      // Hindi prefers open CV syllables: hand the following syllable exactly one
      // consonant and let the rest close the previous one. kismat -> kis.mat,
      // himmat -> him.mat, kaam.naa -> kaam.naa.
      onsetLen = run.length === 0 ? 0 : 1;
      // Except where two consonants genuinely form a legal Hindi onset and the
      // previous syllable can survive without them, e.g. ...kjaː.
      if (run.length >= 2 && isLegalOnset(run.slice(-2), 'hi')) {
        const remainder = run.length - 2;
        if (remainder >= 1) onsetLen = 2;
      }
    } else {
      // English onset maximization, capped by legality.
      onsetLen = 0;
      for (let len = Math.min(3, run.length); len >= 1; len -= 1) {
        if (isLegalOnset(run.slice(run.length - len), 'en')) {
          onsetLen = len;
          break;
        }
      }
    }

    const onset = run.slice(run.length - onsetLen);
    const codaOwner = run.slice(0, run.length - onsetLen);
    if (s > 0 && codaOwner.length > 0) {
      bounds[s - 1].coda.push(...codaOwner);
      bounds[s - 1].to += codaOwner.length;
    }

    bounds.push({
      onset,
      nucleus: phonemes[nucIdx],
      coda: [],
      from: nucIdx - onset.length,
      to: nucIdx + 1,
    });
  }

  // Everything after the last vowel closes the last syllable.
  const lastNuc = nucleusIdx[nucleusIdx.length - 1];
  const tailConsonants = phonemes.slice(lastNuc + 1);
  if (tailConsonants.length > 0) {
    const last = bounds[bounds.length - 1];
    last.coda.push(...tailConsonants);
    last.to += tailConsonants.length;
  }

  const graphemeSpans = splitGraphemes(bounds, phonemes.length, options);

  const syllables: Syllable[] = bounds.map((b, i) => ({
    onset: b.onset,
    nucleus: b.nucleus,
    coda: b.coda,
    stress: b.nucleus.stress,
    graphemes: graphemeSpans[i],
  }));

  if (lang === 'hi') assignHindiStress(syllables);
  return syllables;
}

/**
 * Hindi stress is weight-sensitive rather than lexical, so it is computed here
 * rather than stored per lexeme. Exactly one primary per word, on the leftmost
 * heaviest syllable: zindagi -> ZIN-da-gi, hamara -> ha-MAA-ra, aadmi -> AAD-mi.
 *
 * Exactly one primary matters beyond accuracy: `rhymeTail` runs from the last
 * primary-stressed nucleus, so two primaries in one word would make the tail
 * ambiguous.
 */
export function assignHindiStress(syllables: Syllable[]): void {
  if (syllables.length === 0) return;
  const weights = syllables.map(syllableWeight);
  let best = 0;
  for (let i = 1; i < weights.length; i += 1) {
    if (weights[i] > weights[best]) best = i;
  }
  syllables.forEach((syl, i) => {
    const stress: Stress = i === best ? 1 : 0;
    syl.stress = stress;
    syl.nucleus.stress = stress;
  });
}

/** 0 light (short vowel, open), 1 heavy (long vowel or closed), 2 superheavy (both). */
export function syllableWeight(syllable: Syllable): 0 | 1 | 2 {
  const long = syllable.nucleus.length === 'long';
  const closed = syllable.coda.length > 0;
  if (long && closed) return 2;
  if (long || closed) return 1;
  return 0;
}

/**
 * Assigns each syllable the letters that produced it, so the UI can highlight
 * the exact graphemes. With per-phoneme alignment this is exact; without it
 * (a dictionary hit, where no alignment exists) the token is split in
 * proportion to phoneme counts, which is approximate but never misleading about
 * *which* token a syllable came from.
 */
function splitGraphemes(
  bounds: { from: number; to: number }[],
  phonemeCount: number,
  options: SyllabifyOptions,
): string[] {
  const { graphemes, token } = options;

  if (graphemes && graphemes.length === phonemeCount) {
    return bounds.map((b) => graphemes.slice(b.from, b.to).join(''));
  }

  if (!token) return bounds.map(() => '');

  const out: string[] = [];
  let cursor = 0;
  bounds.forEach((b, i) => {
    const share = (b.to - b.from) / phonemeCount;
    const end =
      i === bounds.length - 1 ? token.length : Math.min(token.length, cursor + Math.max(1, Math.round(share * token.length)));
    out.push(token.slice(cursor, end));
    cursor = end;
  });
  return out;
}

/** The nucleus sequence joined by '_'. The join key for assonance and the index. */
export const assonanceKeyOf = (syllables: Syllable[]): string =>
  syllables.map((s) => s.nucleus.ipa).join('_');

/**
 * Assonance ignores nasalization: `nahi` and `kabhi` chain even though one
 * nucleus is nasalized, because the vowel colour is what the ear tracks.
 */
export const baseAssonanceKeyOf = (syllables: Syllable[]): string =>
  syllables.map((s) => baseSymbol(s.nucleus)).join('_');

/** Index of the last primary-stressed syllable; falls back to the last syllable. */
export function rhymeTailStart(syllables: Syllable[]): number {
  for (let i = syllables.length - 1; i >= 0; i -= 1) {
    if (syllables[i].stress === 1) return i;
  }
  return Math.max(0, syllables.length - 1);
}

/** The syllables a rhyme actually compares: last primary stress to the end. */
export const tailSyllables = (syllables: Syllable[]): Syllable[] =>
  syllables.slice(rhymeTailStart(syllables));

/**
 * The rhyme tail as a comparable string. The onset of the first tail syllable is
 * deliberately excluded: rhyme is everything from the stressed nucleus onward,
 * and including the onset would make 'grind' and 'mind' non-rhyming.
 */
export function rhymeTailOf(syllables: Syllable[]): string {
  const tail = tailSyllables(syllables);
  if (tail.length === 0) return '';
  const parts: string[] = [];
  tail.forEach((syl, i) => {
    if (i > 0) parts.push(...syl.onset.map((p) => p.ipa));
    parts.push(syl.nucleus.ipa);
    parts.push(...syl.coda.map((p) => p.ipa));
  });
  return parts.join('');
}

/** The tail's phonemes, in order, excluding the leading onset. */
export function tailPhonemes(syllables: Syllable[]): Phoneme[] {
  const tail = tailSyllables(syllables);
  const out: Phoneme[] = [];
  tail.forEach((syl, i) => {
    if (i > 0) out.push(...syl.onset);
    out.push(syl.nucleus);
    out.push(...syl.coda);
  });
  return out;
}

/** The onset before the rhyme tail — what `perfect` requires to differ. */
export function tailOnset(syllables: Syllable[]): Phoneme[] {
  const start = rhymeTailStart(syllables);
  return syllables[start]?.onset ?? [];
}

export const syllableToString = (s: Syllable): string =>
  [...s.onset, s.nucleus, ...s.coda].map((p) => p.ipa).join('').replace(NASAL_MARK, NASAL_MARK);
