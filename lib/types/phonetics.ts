// lib/types/phonetics.ts

/** Both languages are typed in Latin script; this is the *phonology* being invoked. */
export type Lang = 'en' | 'hi';

export type Stress = 0 | 1 | 2; // 0 unstressed, 1 primary, 2 secondary

export interface Phoneme {
  /** Unified IPA inventory — the bridge that makes cross-language rhyme possible. See Appendix E. */
  ipa: string;
  kind: 'vowel' | 'consonant';
  /** Contrastive in Hindi (kal /kəl/ vs kaal /kaːl/) and load-bearing for rhyme scoring. */
  length: 'short' | 'long';
  stress: Stress;
  /** Hindi nasalization (maiṁ, hooṁ) — affects rhyme tail matching. */
  nasalized?: boolean;
}

export interface Syllable {
  onset: Phoneme[];
  nucleus: Phoneme;      // exactly one vowel per syllable, by definition
  coda: Phoneme[];
  stress: Stress;
  /** Substring of the source token this syllable covers, for span highlighting. */
  graphemes: string;
}

/**
 * A single pronunciation hypothesis. Romanized Hindi is lossy, so the G2P
 * returns a ranked list of these rather than one answer.
 */
export interface Pronunciation {
  phonemes: Phoneme[];
  syllables: Syllable[];
  /** Vowel-nucleus sequence, e.g. 'aː_iː'. The join key for assonance and the rhyme index. */
  assonanceKey: string;
  /** From the last primary-stressed nucleus to the end. What "rhyme" actually compares. */
  rhymeTail: string;
  score: number;                             // lexicon hit > rules hit
  origin: 'lexicon' | 'rules' | 'user';
}

/**
 * Sticky user corrections, keyed by token *text* rather than node id, so the
 * app converges on this writer's spelling habits over time (Section 3.2).
 * Sent into the worker with every analysis request.
 */
export interface Overrides {
  /** Token text -> language. */
  lang: Record<string, Lang>;
  /** Token text -> chosen candidate index. */
  pronunciation: Record<string, number>;
}

export interface TokenAnalysis {
  token: string;
  /** Character offsets into the source line, so every readout can highlight exact text. */
  charStart: number;
  charEnd: number;
  lang: Lang;
  langConfidence: number;                    // 0-1
  langLocked: boolean;                       // true once the user overrides
  /** Ranked; candidates[0] is used unless the user picks another. */
  candidates: Pronunciation[];
  selectedCandidate: number;
}
