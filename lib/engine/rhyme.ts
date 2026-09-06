// lib/engine/rhyme.ts
//
// Classification + scoring + indexed lookup. All eleven RhymeType values are
// first-class, each with a precise definition so the classifier is testable
// rather than vibes-based (Section 3.8).
//
// Mosaic and holorime require combinatorial phrase search and run server-side
// at /api/rhyme — the worker never attempts them. The classifier still *labels*
// them when a caller hands it a multi-word candidate, so the type is real.

import type { Lang, Phoneme, Pronunciation, Syllable } from '@/lib/types/phonetics';
import type {
  Lexeme,
  RhymeCandidate,
  RhymeIndex,
  RhymeType,
} from '@/lib/types/rhyme';
import type { MatrixFilter } from '@/lib/types/matrix';
import { parseIpa, baseSymbol } from './ipa';
import { phonemeDistance, sequenceDistance } from './feature-matrix';
import {
  assonanceKeyOf,
  rhymeTailOf,
  rhymeTailStart,
  tailOnset,
  tailPhonemes,
  tailSyllables,
} from './syllabify';

export interface ScoreComponents {
  nucleusSequenceMatch: number;
  codaDistance: number;
  stressAlignment: number;
  syllableParity: number;
  /** Composite 0-1 score from the 3.8 formula. */
  score: number;
}

export interface ClassifiedRhyme {
  type: RhymeType;
  score: number;
  components: ScoreComponents;
  isCrossLanguage: boolean;
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Nuclei of the rhyme tail, in order. */
function tailNuclei(syllables: Syllable[]): Phoneme[] {
  return tailSyllables(syllables).map((s) => s.nucleus);
}

/** Coda phonemes of the rhyme tail, concatenated. */
function tailCodas(syllables: Syllable[]): Phoneme[] {
  const out: Phoneme[] = [];
  for (const s of tailSyllables(syllables)) out.push(...s.coda);
  // Inter-syllable onsets after the first tail syllable also sit in the "coda
  // skeleton" for pararhyme / consonance purposes.
  const tail = tailSyllables(syllables);
  for (let i = 1; i < tail.length; i += 1) out.push(...tail[i].onset);
  return out;
}

/** All consonants in the tail, vowels stripped — the consonance skeleton. */
function consonantSkeleton(syllables: Syllable[]): Phoneme[] {
  return tailPhonemes(syllables).filter((p) => p.kind === 'consonant');
}

function onsetKey(onset: Phoneme[]): string {
  return onset.map((p) => p.ipa).join('');
}

/**
 * Scoring over the rhyme tail, not the whole word (Section 3.8):
 *   score = 0.50 * nucleusSequenceMatch
 *         + 0.25 * (1 - codaDistance)
 *         + 0.15 * stressAlignment
 *         + 0.10 * syllableParity
 */
export function scoreRhyme(a: Syllable[], b: Syllable[]): ScoreComponents {
  const aNuc = tailNuclei(a);
  const bNuc = tailNuclei(b);
  const aCoda = tailCodas(a);
  const bCoda = tailCodas(b);
  const aTail = tailSyllables(a);
  const bTail = tailSyllables(b);

  // Nucleus sequence: positional, tolerant of length mismatch via sequenceDistance.
  // Invert so 1 = identical.
  const nucleusSequenceMatch =
    aNuc.length === 0 && bNuc.length === 0
      ? 1
      : 1 - sequenceDistance(aNuc, bNuc);

  const codaDistance =
    aCoda.length === 0 && bCoda.length === 0
      ? 0
      : sequenceDistance(aCoda, bCoda);

  // Stress alignment: do the stressed syllables in the tail line up?
  const maxLen = Math.max(aTail.length, bTail.length);
  let stressHits = 0;
  let stressSlots = 0;
  for (let i = 0; i < maxLen; i += 1) {
    const sa = aTail[i]?.stress ?? 0;
    const sb = bTail[i]?.stress ?? 0;
    if (sa === 1 || sb === 1) {
      stressSlots += 1;
      if (sa === sb) stressHits += 1;
    }
  }
  const stressAlignment = stressSlots === 0 ? 1 : stressHits / stressSlots;

  const syllableParity = aTail.length === bTail.length ? 1 : 0;

  const score = clamp01(
    0.5 * nucleusSequenceMatch +
      0.25 * (1 - codaDistance) +
      0.15 * stressAlignment +
      0.1 * syllableParity,
  );

  return { nucleusSequenceMatch, codaDistance, stressAlignment, syllableParity, score };
}

function nucleiWithinOneFeature(a: Phoneme[], b: Phoneme[]): boolean {
  if (a.length === 0 || b.length === 0) return false;
  // Compare the final nuclei — that is what "forced" reaches for.
  return phonemeDistance(a[a.length - 1], b[b.length - 1]) <= 0.35;
}

function sameLemmaOrHomophone(
  aText: string,
  bText: string,
  aPh: Phoneme[],
  bPh: Phoneme[],
): boolean {
  if (aText.toLowerCase() === bText.toLowerCase()) return true;
  // Homophone: identical phoneme strings, different spelling.
  if (aPh.length !== bPh.length) return false;
  return aPh.every((p, i) => p.ipa === bPh[i].ipa);
}

export interface ClassifyInput {
  aSyllables: Syllable[];
  bSyllables: Syllable[];
  aPhonemes: Phoneme[];
  bPhonemes: Phoneme[];
  aText: string;
  bText: string;
  aLang: Lang;
  bLang: Lang;
  /** Candidate is 2+ tokens matching a single-word query. */
  mosaic?: boolean;
  /** Full-line comparison rather than word-level. */
  holorime?: boolean;
  /** Match is away from line-final position. */
  internal?: boolean;
}

/**
 * Classification runs thresholds against the score components, in priority
 * order, so a candidate gets the most specific label it qualifies for.
 */
export function classifyRhyme(input: ClassifyInput): ClassifiedRhyme {
  const components = scoreRhyme(input.aSyllables, input.bSyllables);
  const isCrossLanguage = input.aLang !== input.bLang;
  const base = { components, isCrossLanguage, score: components.score };

  if (input.holorime) {
    return { ...base, type: 'holorime' };
  }
  if (input.mosaic) {
    return { ...base, type: 'mosaic' };
  }

  const { nucleusSequenceMatch, codaDistance } = components;
  const aTail = tailSyllables(input.aSyllables);
  const bTail = tailSyllables(input.bSyllables);
  const aOnset = onsetKey(tailOnset(input.aSyllables));
  const bOnset = onsetKey(tailOnset(input.bSyllables));
  const aNuc = tailNuclei(input.aSyllables);
  const bNuc = tailNuclei(input.bSyllables);

  // "Exact" nucleus match tolerates cross-language equivalence (ɑ ≈ aː), which
  // lands at distance 0 via the feature matrix, but floating-point alignment of
  // longer sequences can sit just under 1.0.
  const nucleusExact = nucleusSequenceMatch >= 0.98;
  const codaExact = codaDistance <= 0.02;

  // identical
  if (
    sameLemmaOrHomophone(input.aText, input.bText, input.aPhonemes, input.bPhonemes) &&
    nucleusExact &&
    codaExact
  ) {
    return {
      ...base,
      type: input.internal ? 'internal' : 'identical',
      score: 1,
    };
  }

  // perfect
  if (nucleusExact && codaExact && aOnset !== bOnset) {
    return {
      ...base,
      type: input.internal ? 'internal' : 'perfect',
      score: Math.max(components.score, 0.95),
    };
  }

  // multisyllabic — 2+ syllable tail with high nucleus match AND a coda that
  // still roughly agrees. Pure vowel chains (codaDistance high) fall through
  // to assonance-chain, which is the literary distinction between "the
  // syllables rhyme" and "only the vowels match".
  if (
    aTail.length >= 2 &&
    bTail.length >= 2 &&
    nucleusSequenceMatch >= 0.8 &&
    codaDistance <= 0.25 &&
    components.score >= 0.7
  ) {
    return {
      ...base,
      type: input.internal ? 'internal' : 'multisyllabic',
    };
  }

  // slant
  if (nucleusExact && codaDistance > 0.02 && codaDistance <= 0.4) {
    return {
      ...base,
      type: input.internal ? 'internal' : 'slant',
    };
  }

  // para
  if (codaExact && !nucleusExact && aNuc.length > 0 && bNuc.length > 0) {
    return {
      ...base,
      type: input.internal ? 'internal' : 'para',
    };
  }

  // assonance-chain — matching nuclei across 2+ syllables, coda unconstrained
  // (and typically mismatched; otherwise multisyllabic would have fired).
  if (
    aTail.length >= 2 &&
    bTail.length >= 2 &&
    nucleusSequenceMatch >= 0.85
  ) {
    return {
      ...base,
      type: input.internal ? 'internal' : 'assonance-chain',
    };
  }

  // consonance
  const aSkel = consonantSkeleton(input.aSyllables);
  const bSkel = consonantSkeleton(input.bSyllables);
  if (
    aSkel.length >= 2 &&
    bSkel.length >= 2 &&
    sequenceDistance(aSkel, bSkel) <= 0.15
  ) {
    return {
      ...base,
      type: input.internal ? 'internal' : 'consonance',
    };
  }

  // forced
  if (nucleiWithinOneFeature(aNuc, bNuc)) {
    return {
      ...base,
      type: input.internal ? 'internal' : 'forced',
      score: Math.min(components.score, 0.45),
    };
  }

  // Fallback: still return forced at a floor so the caller can filter by score.
  return {
    ...base,
    type: input.internal ? 'internal' : 'forced',
    score: Math.min(components.score, 0.3),
  };
}

/** Classify two pronunciations directly. */
export function classifyPair(
  a: Pronunciation,
  b: Pronunciation,
  meta: {
    aText: string;
    bText: string;
    aLang: Lang;
    bLang: Lang;
    mosaic?: boolean;
    holorime?: boolean;
    internal?: boolean;
  },
): ClassifiedRhyme {
  return classifyRhyme({
    aSyllables: a.syllables,
    bSyllables: b.syllables,
    aPhonemes: a.phonemes,
    bPhonemes: b.phonemes,
    ...meta,
  });
}

// ---------------------------------------------------------------------------
// Indexed lookup
// ---------------------------------------------------------------------------

/**
 * Neighbouring nucleus keys for the `forced` widening pass. A nucleus is a
 * neighbour if its feature distance is ≤ 0.35 — one feature step.
 */
function neighbouringKeys(
  key: string,
  index: RhymeIndex,
): string[] {
  const parts = key.split('_');
  if (parts.length === 0) return [];
  const last = parts[parts.length - 1];
  const lastPh = parseIpa(last)[0];
  if (!lastPh) return [];

  const out: string[] = [];
  for (const candidate of Object.keys(index.byNucleusSeq)) {
    if (candidate === key) continue;
    const cParts = candidate.split('_');
    if (cParts.length !== parts.length) continue;
    // Only the final nucleus may drift; the prefix must match exactly.
    const prefixMatch = parts.slice(0, -1).every((p, i) => p === cParts[i]);
    if (!prefixMatch) continue;
    const cPh = parseIpa(cParts[cParts.length - 1])[0];
    if (!cPh) continue;
    if (phonemeDistance(lastPh, cPh) <= 0.35) out.push(candidate);
  }
  return out;
}

function lexemeToPronunciation(lex: Lexeme): Pronunciation {
  const phonemes = parseIpa(lex.ipa, lex.stress);
  // Trust the precomputed syllables count and keys; rebuild syllables lightly.
  const syllables = syllabifyCached(phonemes, lex.lang, lex);
  return {
    phonemes,
    syllables,
    assonanceKey: lex.assonanceKey,
    rhymeTail: lex.rhymeTail,
    score: 1,
    origin: 'lexicon',
  };
}

// Local import deferred to avoid a circular init with syllabify during module load
// in some test runners. The function is identical to syllabify().
import { syllabify as syllabifyFn } from './syllabify';

function syllabifyCached(
  phonemes: Phoneme[],
  lang: Lang,
  lex: Lexeme,
): Syllable[] {
  const syllables = syllabifyFn(phonemes, lang, { token: lex.text });
  // Overlay the stored stress so index-time and query-time agree.
  syllables.forEach((s, i) => {
    if (lex.stress[i] !== undefined) {
      s.stress = lex.stress[i];
      s.nucleus.stress = lex.stress[i];
    }
  });
  return syllables;
}

function passesFilter(lex: Lexeme, filter: MatrixFilter, queryLang: Lang): boolean {
  if (filter.langs.length > 0 && !filter.langs.includes(lex.lang)) return false;
  if (filter.syllableCount !== null && lex.syllableCount !== filter.syllableCount) {
    return false;
  }
  if (filter.crossLanguageOnly && lex.lang === queryLang) return false;
  if (filter.tags.length > 0 && !filter.tags.some((t) => lex.tags.includes(t))) {
    return false;
  }
  return true;
}

export interface RhymeQuery {
  text: string;
  lang: Lang;
  pronunciation: Pronunciation;
  filter: MatrixFilter;
  /** Hard cap on returned candidates. */
  limit?: number;
}

/**
 * Indexed rhyme lookup. Resolves candidate pools by exact tail (perfect /
 * identical), then by nucleus sequence (slant, assonance, multisyllabic), then
 * widens through the feature matrix to neighbouring nucleus keys for `forced`.
 * Both languages live in the same index, so cross-language candidates fall out
 * naturally.
 */
export function queryRhymes(index: RhymeIndex, query: RhymeQuery): RhymeCandidate[] {
  const { pronunciation, filter, text, lang } = query;
  const limit = query.limit ?? 40;
  const tail = pronunciation.rhymeTail || rhymeTailOf(pronunciation.syllables);
  const key = pronunciation.assonanceKey || assonanceKeyOf(pronunciation.syllables);

  const poolIds = new Set<number>();
  for (const id of index.byRhymeTail[tail] ?? []) poolIds.add(id);
  for (const id of index.byNucleusSeq[key] ?? []) poolIds.add(id);
  for (const neighbour of neighbouringKeys(key, index)) {
    for (const id of index.byNucleusSeq[neighbour] ?? []) poolIds.add(id);
  }

  const results: RhymeCandidate[] = [];
  for (const id of poolIds) {
    const lex = index.lexemes[id];
    if (!lex) continue;
    if (lex.text.toLowerCase() === text.toLowerCase() && lex.lang === lang) continue;
    if (!passesFilter(lex, filter, lang)) continue;

    const candidate = lexemeToPronunciation(lex);
    const classified = classifyPair(pronunciation, candidate, {
      aText: text,
      bText: lex.text,
      aLang: lang,
      bLang: lex.lang,
    });
    if (classified.score < filter.minScore) continue;

    results.push({
      text: lex.text,
      lang: lex.lang,
      type: classified.type,
      score: classified.score,
      phonemes: candidate.phonemes,
      syllableCount: lex.syllableCount,
      gloss: lex.gloss,
      isCrossLanguage: classified.isCrossLanguage,
      tags: lex.tags,
    });
  }

  results.sort((a, b) => b.score - a.score || a.text.localeCompare(b.text));
  return results.slice(0, limit);
}

/** Helper used by tests and the index builder to derive keys from a pronunciation. */
export function keysOf(pronunciation: Pronunciation): {
  assonanceKey: string;
  rhymeTail: string;
  tailStart: number;
} {
  return {
    assonanceKey: pronunciation.assonanceKey || assonanceKeyOf(pronunciation.syllables),
    rhymeTail: pronunciation.rhymeTail || rhymeTailOf(pronunciation.syllables),
    tailStart: rhymeTailStart(pronunciation.syllables),
  };
}

/** Base (denasalized) assonance key — useful for chaining across nasalization. */
export const denasalizeKey = (key: string): string =>
  key
    .split('_')
    .map((n) => baseSymbol({ ipa: n, kind: 'vowel', length: 'short', stress: 0 }))
    .join('_');
