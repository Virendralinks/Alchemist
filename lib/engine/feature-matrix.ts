// lib/engine/feature-matrix.ts
//
// Feature vectors for every phoneme in the unified inventory, and the distance
// function that makes slant rhyme a score instead of a coin flip.
//
// The place scale is deliberately non-uniform. Appendix E requires English /t/
// to sit a *small* distance from Hindi dental /t̪/ and a *moderate* one from
// retroflex /ʈ/, which an evenly spaced ordinal scale cannot express — dental,
// alveolar, and retroflex would all be one step apart. So places carry
// fractional coordinates instead of indices.

import type { Phoneme } from '@/lib/types/phonetics';
import {
  baseSymbol,
  equivalenceDistance,
  isVowelSymbol,
  VOWELS,
} from './ipa';

export interface ConsonantFeatures {
  place: 'labial' | 'dental' | 'alveolar' | 'retroflex' | 'palatal' | 'velar' | 'uvular' | 'glottal';
  manner: 'stop' | 'nasal' | 'fricative' | 'affricate' | 'approximant' | 'lateral' | 'trill' | 'flap';
  voiced: boolean;
  aspirated: boolean;
}

export interface VowelFeatures {
  height: 'high' | 'mid-high' | 'mid' | 'mid-low' | 'low';
  backness: 'front' | 'central' | 'back';
  rounded: boolean;
  long: boolean;
  nasalized: boolean;
}

/** Articulator coordinates, front of the mouth to the back. */
const PLACE_COORD: Record<ConsonantFeatures['place'], number> = {
  labial: 0,
  dental: 1.0,
  alveolar: 1.3,
  retroflex: 2.2,
  palatal: 3.0,
  velar: 4.0,
  uvular: 4.6,
  glottal: 5.5,
};
const PLACE_SPAN = PLACE_COORD.glottal;

/**
 * Manner similarity. Not an ordinal scale — nasal is closer to stop than to
 * fricative, and the liquids cluster together — so it is an explicit matrix.
 */
const MANNER_GROUP: Record<ConsonantFeatures['manner'], number> = {
  stop: 0,
  affricate: 0.35,
  fricative: 0.7,
  nasal: 0.3,
  trill: 1.5,
  flap: 1.55,
  lateral: 1.7,
  approximant: 1.9,
};
const MANNER_SPAN = 1.9;

export const CONSONANT_FEATURES: Record<string, ConsonantFeatures> = {
  // Shared
  p: { place: 'labial', manner: 'stop', voiced: false, aspirated: false },
  b: { place: 'labial', manner: 'stop', voiced: true, aspirated: false },
  t: { place: 'alveolar', manner: 'stop', voiced: false, aspirated: false },
  d: { place: 'alveolar', manner: 'stop', voiced: true, aspirated: false },
  k: { place: 'velar', manner: 'stop', voiced: false, aspirated: false },
  g: { place: 'velar', manner: 'stop', voiced: true, aspirated: false },
  m: { place: 'labial', manner: 'nasal', voiced: true, aspirated: false },
  n: { place: 'alveolar', manner: 'nasal', voiced: true, aspirated: false },
  ŋ: { place: 'velar', manner: 'nasal', voiced: true, aspirated: false },
  f: { place: 'labial', manner: 'fricative', voiced: false, aspirated: false },
  v: { place: 'labial', manner: 'fricative', voiced: true, aspirated: false },
  s: { place: 'alveolar', manner: 'fricative', voiced: false, aspirated: false },
  z: { place: 'alveolar', manner: 'fricative', voiced: true, aspirated: false },
  ʃ: { place: 'palatal', manner: 'fricative', voiced: false, aspirated: false },
  h: { place: 'glottal', manner: 'fricative', voiced: false, aspirated: false },
  l: { place: 'alveolar', manner: 'lateral', voiced: true, aspirated: false },
  r: { place: 'alveolar', manner: 'trill', voiced: true, aspirated: false },
  w: { place: 'labial', manner: 'approximant', voiced: true, aspirated: false },
  j: { place: 'palatal', manner: 'approximant', voiced: true, aspirated: false },
  'tʃ': { place: 'palatal', manner: 'affricate', voiced: false, aspirated: false },
  'dʒ': { place: 'palatal', manner: 'affricate', voiced: true, aspirated: false },

  // English-only
  θ: { place: 'dental', manner: 'fricative', voiced: false, aspirated: false },
  ð: { place: 'dental', manner: 'fricative', voiced: true, aspirated: false },
  ʒ: { place: 'palatal', manner: 'fricative', voiced: true, aspirated: false },
  ɹ: { place: 'alveolar', manner: 'approximant', voiced: true, aspirated: false },

  // Hindi dental
  't̪': { place: 'dental', manner: 'stop', voiced: false, aspirated: false },
  'd̪': { place: 'dental', manner: 'stop', voiced: true, aspirated: false },

  // Hindi retroflex
  ʈ: { place: 'retroflex', manner: 'stop', voiced: false, aspirated: false },
  ɖ: { place: 'retroflex', manner: 'stop', voiced: true, aspirated: false },
  ɳ: { place: 'retroflex', manner: 'nasal', voiced: true, aspirated: false },
  ɽ: { place: 'retroflex', manner: 'flap', voiced: true, aspirated: false },
  ʂ: { place: 'retroflex', manner: 'fricative', voiced: false, aspirated: false },

  // Hindi aspirates
  'pʰ': { place: 'labial', manner: 'stop', voiced: false, aspirated: true },
  'bʰ': { place: 'labial', manner: 'stop', voiced: true, aspirated: true },
  't̪ʰ': { place: 'dental', manner: 'stop', voiced: false, aspirated: true },
  'd̪ʰ': { place: 'dental', manner: 'stop', voiced: true, aspirated: true },
  'ʈʰ': { place: 'retroflex', manner: 'stop', voiced: false, aspirated: true },
  'ɖʰ': { place: 'retroflex', manner: 'stop', voiced: true, aspirated: true },
  'kʰ': { place: 'velar', manner: 'stop', voiced: false, aspirated: true },
  'gʰ': { place: 'velar', manner: 'stop', voiced: true, aspirated: true },
  'tʃʰ': { place: 'palatal', manner: 'affricate', voiced: false, aspirated: true },
  'dʒʰ': { place: 'palatal', manner: 'affricate', voiced: true, aspirated: true },

  // Hindi other
  ʋ: { place: 'labial', manner: 'approximant', voiced: true, aspirated: false },
  q: { place: 'uvular', manner: 'stop', voiced: false, aspirated: false },
  x: { place: 'velar', manner: 'fricative', voiced: false, aspirated: false },
  ɣ: { place: 'velar', manner: 'fricative', voiced: true, aspirated: false },
  ɦ: { place: 'glottal', manner: 'fricative', voiced: true, aspirated: false },
};

const VOWEL_HEIGHT_COORD: Record<VowelFeatures['height'], number> = {
  high: 0,
  'mid-high': 1,
  mid: 2,
  'mid-low': 3,
  low: 4,
};
const HEIGHT_SPAN = 4;

const BACKNESS_COORD: Record<VowelFeatures['backness'], number> = {
  front: 0,
  central: 1,
  back: 2,
};
const BACKNESS_SPAN = 2;

/** Keyed by bare symbol; nasalization is read off the phoneme, not the table. */
export const VOWEL_FEATURES: Record<string, Omit<VowelFeatures, 'nasalized'>> = {
  i: { height: 'high', backness: 'front', rounded: false, long: true },
  'iː': { height: 'high', backness: 'front', rounded: false, long: true },
  ɪ: { height: 'mid-high', backness: 'front', rounded: false, long: false },
  e: { height: 'mid-high', backness: 'front', rounded: false, long: false },
  'eː': { height: 'mid-high', backness: 'front', rounded: false, long: true },
  ɛ: { height: 'mid-low', backness: 'front', rounded: false, long: false },
  'ɛː': { height: 'mid-low', backness: 'front', rounded: false, long: true },
  æ: { height: 'mid-low', backness: 'front', rounded: false, long: false },
  ə: { height: 'mid', backness: 'central', rounded: false, long: false },
  ʌ: { height: 'mid-low', backness: 'central', rounded: false, long: false },
  'ɜː': { height: 'mid', backness: 'central', rounded: false, long: true },
  ɑ: { height: 'low', backness: 'back', rounded: false, long: true },
  'aː': { height: 'low', backness: 'central', rounded: false, long: true },
  ɔ: { height: 'mid-low', backness: 'back', rounded: true, long: true },
  'ɔː': { height: 'mid-low', backness: 'back', rounded: true, long: true },
  o: { height: 'mid-high', backness: 'back', rounded: true, long: false },
  'oː': { height: 'mid-high', backness: 'back', rounded: true, long: true },
  ʊ: { height: 'mid-high', backness: 'back', rounded: true, long: false },
  u: { height: 'high', backness: 'back', rounded: true, long: true },
  'uː': { height: 'high', backness: 'back', rounded: true, long: true },
  // Diphthongs are scored on their *offset* target, which is what the ear
  // matches when a diphthong rhymes with a monophthong.
  'aɪ': { height: 'mid-high', backness: 'front', rounded: false, long: true },
  'aʊ': { height: 'mid-high', backness: 'back', rounded: true, long: true },
  'oʊ': { height: 'mid-high', backness: 'back', rounded: true, long: true },
  'ɔɪ': { height: 'mid-high', backness: 'front', rounded: false, long: true },
  'eɪ': { height: 'mid-high', backness: 'front', rounded: false, long: true },
};

export function consonantFeatures(p: Phoneme): ConsonantFeatures | undefined {
  return CONSONANT_FEATURES[p.ipa];
}

export function vowelFeatures(p: Phoneme): VowelFeatures | undefined {
  const base = VOWEL_FEATURES[baseSymbol(p)];
  if (!base) return undefined;
  return { ...base, nasalized: p.nasalized === true };
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Weights for consonant distance. Place and manner dominate, as Section 3.6
 * requires; voicing matters less; aspiration is nearly free because it is
 * contrastive in Hindi but allophonic in English and rarely breaks a rhyme for
 * the ear (Section 3.5).
 */
const W_PLACE = 0.42;
const W_MANNER = 0.42;
const W_VOICE = 0.12;
const W_ASPIRATION = 0.04;

/** Weights for vowel distance. */
const W_HEIGHT = 0.4;
const W_BACKNESS = 0.3;
const W_ROUND = 0.12;
const W_LENGTH = 0.12;
const W_NASAL = 0.06;

/**
 * 0 = identical, 1 = maximally different. Symmetric by construction: every term
 * is an absolute difference or an equality test, and the equivalence table is
 * keyed on a sorted pair.
 */
export function phonemeDistance(a: Phoneme, b: Phoneme): number {
  if (a.ipa === b.ipa && a.nasalized === b.nasalized) return 0;

  // A vowel and a consonant are maximally different; comparing them is a length
  // mismatch in the alignment, not a near miss.
  if (a.kind !== b.kind) return 1;

  // Bare-symbol equivalence (ɑ ≈ aː) ignores nasalization diacritics so
  // cross-language perfect rhyme does not die on a tilde.
  const override = equivalenceDistance(baseSymbol(a), baseSymbol(b))
    ?? equivalenceDistance(a.ipa, b.ipa);
  if (override === 0) return 0;

  if (a.kind === 'vowel') {
    const fa = vowelFeatures(a);
    const fb = vowelFeatures(b);
    if (!fa || !fb) return a.ipa === b.ipa ? 0 : 1;
    const height =
      Math.abs(VOWEL_HEIGHT_COORD[fa.height] - VOWEL_HEIGHT_COORD[fb.height]) / HEIGHT_SPAN;
    const backness =
      Math.abs(BACKNESS_COORD[fa.backness] - BACKNESS_COORD[fb.backness]) / BACKNESS_SPAN;
    const rounded = fa.rounded === fb.rounded ? 0 : 1;
    const long = fa.long === fb.long ? 0 : 1;
    const nasal = fa.nasalized === fb.nasalized ? 0 : 1;
    const computed =
      W_HEIGHT * height +
      W_BACKNESS * backness +
      W_ROUND * rounded +
      W_LENGTH * long +
      W_NASAL * nasal;
    // The equivalence table replaces the computed value only when it is kinder:
    // /ɑ/ and /aː/ must be the same nucleus even though their features differ.
    const withOverride = override === undefined ? computed : Math.min(computed, override);
    return clamp01(withOverride);
  }

  const fa = consonantFeatures(a);
  const fb = consonantFeatures(b);
  if (!fa || !fb) return a.ipa === b.ipa ? 0 : 1;
  const place = Math.abs(PLACE_COORD[fa.place] - PLACE_COORD[fb.place]) / PLACE_SPAN;
  const manner = Math.abs(MANNER_GROUP[fa.manner] - MANNER_GROUP[fb.manner]) / MANNER_SPAN;
  const voice = fa.voiced === fb.voiced ? 0 : 1;
  const aspiration = fa.aspirated === fb.aspirated ? 0 : 1;
  const computed =
    W_PLACE * place + W_MANNER * manner + W_VOICE * voice + W_ASPIRATION * aspiration;
  const withOverride = override === undefined ? computed : Math.min(computed, override);
  return clamp01(withOverride);
}

/** Cost of leaving a phoneme unaligned. Below 1 so length mismatch is a penalty, not a wall. */
const GAP_COST = 0.85;

/**
 * Positional alignment of two phoneme sequences, tolerant of length mismatch.
 * Needleman-Wunsch with `phonemeDistance` as substitution cost, normalized by
 * the longer sequence so the result stays in [0, 1] and stays symmetric.
 */
export function sequenceDistance(a: Phoneme[], b: Phoneme[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0 || b.length === 0) return 1;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = new Float64Array(rows * cols);

  for (let i = 1; i < rows; i += 1) dp[i * cols] = i * GAP_COST;
  for (let j = 1; j < cols; j += 1) dp[j] = j * GAP_COST;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const sub = dp[(i - 1) * cols + (j - 1)] + phonemeDistance(a[i - 1], b[j - 1]);
      const del = dp[(i - 1) * cols + j] + GAP_COST;
      const ins = dp[i * cols + (j - 1)] + GAP_COST;
      dp[i * cols + j] = Math.min(sub, del, ins);
    }
  }

  return clamp01(dp[rows * cols - 1] / Math.max(a.length, b.length));
}

/** Every symbol the matrix knows, for the property tests. */
export const ALL_INVENTORY_SYMBOLS: string[] = [
  ...Object.keys(VOWELS),
  ...Object.keys(CONSONANT_FEATURES),
];

export const isKnownSymbol = (symbol: string): boolean =>
  isVowelSymbol(symbol) || symbol in CONSONANT_FEATURES;
