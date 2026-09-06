// lib/engine/ipa.ts
//
// The unified phoneme inventory from Appendix E. Both languages resolve into
// this one space — without it there is no such thing as a cross-language rhyme,
// because you would have two dictionaries and no way to compare them.
//
// Symbols are written the way Appendix E and the lexicon write them, which
// means multi-codepoint sequences: dental /t̪/ is t + U+032A, aspirated /t̪ʰ/
// adds U+02B0, nasalized /ɛ̃ː/ is ɛ + U+0303 + U+02D0. Everything downstream
// compares whole phonemes, never characters, so `parseIpa` is the only place
// that has to know this.

import type { Lang, Phoneme, Stress } from '@/lib/types/phonetics';

/** Combining dental below (U+032A) — the diacritic that makes /t/ into /t̪/. */
export const DENTAL_MARK = '\u032A';
/** Combining tilde (U+0303) — Hindi nasalization on the vowel it follows. */
export const NASAL_MARK = '\u0303';
/** Modifier letter small h (U+02B0) — aspiration. */
export const ASPIRATION_MARK = '\u02B0';
/** Triangular colon (U+02D0) — phonemic length. */
export const LENGTH_MARK = '\u02D0';

export interface VowelEntry {
  length: 'short' | 'long';
  /** Which phonology natively contains this vowel. Reachable from the other at a cost. */
  langs: Lang[];
  /** True for the English diphthongs, which are a single nucleus and never split. */
  diphthong?: boolean;
  example: string;
}

/**
 * Appendix E vowel table. `ɛː` and `ɔː` are Hindi *monophthongs* despite the
 * length mark and must never be split by the syllabifier.
 */
export const VOWELS: Record<string, VowelEntry> = {
  i: { length: 'long', langs: ['en'], example: 'beat' },
  ɪ: { length: 'short', langs: ['en', 'hi'], example: 'bit, din' },
  iː: { length: 'long', langs: ['hi'], example: 'siikh' },
  e: { length: 'short', langs: ['hi'], example: '—' },
  eː: { length: 'long', langs: ['hi'], example: 'mel' },
  ɛ: { length: 'short', langs: ['en'], example: 'bet' },
  ɛː: { length: 'long', langs: ['hi'], example: 'hai' },
  æ: { length: 'short', langs: ['en'], example: 'bat' },
  ə: { length: 'short', langs: ['en', 'hi'], example: 'about, kal' },
  ʌ: { length: 'short', langs: ['en'], example: 'strut (ARPABET AH stressed)' },
  ɜː: { length: 'long', langs: ['en'], example: 'bird' },
  ɑ: { length: 'long', langs: ['en'], example: 'father' },
  aː: { length: 'long', langs: ['hi'], example: 'naam' },
  ɔ: { length: 'long', langs: ['en'], example: 'bought' },
  ɔː: { length: 'long', langs: ['hi'], example: 'aur' },
  o: { length: 'short', langs: ['hi'], example: '—' },
  oː: { length: 'long', langs: ['hi'], example: 'mor' },
  ʊ: { length: 'short', langs: ['en', 'hi'], example: 'book, dukh' },
  u: { length: 'long', langs: ['en'], example: 'boot' },
  uː: { length: 'long', langs: ['hi'], example: 'duur' },
  aɪ: { length: 'long', langs: ['en'], diphthong: true, example: 'bite' },
  aʊ: { length: 'long', langs: ['en'], diphthong: true, example: 'bout' },
  oʊ: { length: 'long', langs: ['en'], diphthong: true, example: 'boat' },
  ɔɪ: { length: 'long', langs: ['en'], diphthong: true, example: 'boy' },
  eɪ: { length: 'long', langs: ['en'], diphthong: true, example: 'bait' },
};

/** Consonants shared by both phonologies. */
export const SHARED_CONSONANTS = [
  'p', 'b', 't', 'd', 'k', 'g', 'm', 'n', 'ŋ', 'f', 'v', 's', 'z', 'ʃ', 'h',
  'l', 'r', 'w', 'j', 'tʃ', 'dʒ',
] as const;

/** English-only consonants. Hindi has no /θ ð/ but Hinglish borrows them constantly. */
export const EN_ONLY_CONSONANTS = ['θ', 'ð', 'ʒ', 'ɹ'] as const;

/** Hindi-specific consonants: dental, retroflex, aspirated, and the Perso-Arabic set. */
export const HI_ONLY_CONSONANTS = [
  't̪', 'd̪',
  'ʈ', 'ɖ', 'ɳ', 'ɽ', 'ʂ',
  'pʰ', 'bʰ', 't̪ʰ', 'd̪ʰ', 'ʈʰ', 'ɖʰ', 'kʰ', 'gʰ', 'tʃʰ', 'dʒʰ',
  'ʋ', 'q', 'x', 'ɣ', 'ɦ',
] as const;

export const CONSONANTS: ReadonlySet<string> = new Set<string>([
  ...SHARED_CONSONANTS,
  ...EN_ONLY_CONSONANTS,
  ...HI_ONLY_CONSONANTS,
]);

/** Appendix E, ARPABET to IPA. AH is split by stress: stressed /ʌ/, unstressed /ə/. */
export const ARPABET_TO_IPA: Record<string, string> = {
  AA: 'ɑ', AE: 'æ', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ',
  B: 'b', CH: 'tʃ', D: 'd', DH: 'ð', EH: 'ɛ', ER: 'ɜː', EY: 'eɪ',
  F: 'f', G: 'g', HH: 'h', IH: 'ɪ', IY: 'i', JH: 'dʒ', K: 'k', L: 'l',
  M: 'm', N: 'n', NG: 'ŋ', OW: 'oʊ', OY: 'ɔɪ', P: 'p', R: 'ɹ', S: 's',
  SH: 'ʃ', T: 't', TH: 'θ', UH: 'ʊ', UW: 'u', V: 'v', W: 'w', Y: 'j',
  Z: 'z', ZH: 'ʒ',
};

/** True for a bare inventory symbol, ignoring nasalization. */
export const isVowelSymbol = (symbol: string): boolean =>
  Object.prototype.hasOwnProperty.call(VOWELS, stripNasal(symbol));

export const isConsonantSymbol = (symbol: string): boolean => CONSONANTS.has(symbol);

export const stripNasal = (symbol: string): string => symbol.split(NASAL_MARK).join('');

/** Nasalization is a feature of the vowel, so the bare symbol is what the tables key on. */
export const baseSymbol = (p: Phoneme): string => stripNasal(p.ipa);

export const isDiphthong = (symbol: string): boolean =>
  VOWELS[stripNasal(symbol)]?.diphthong === true;

export function makePhoneme(
  ipa: string,
  stress: Stress = 0,
  opts: { nasalized?: boolean } = {},
): Phoneme {
  const bare = stripNasal(ipa);
  const vowel = VOWELS[bare];
  const nasalized = opts.nasalized || ipa.includes(NASAL_MARK);
  if (vowel) {
    // Keep the tilde in the symbol so `ipa` round-trips through `parseIpa`.
    const symbol = nasalized && !ipa.includes(NASAL_MARK) ? withNasal(bare) : ipa;
    return {
      ipa: symbol,
      kind: 'vowel',
      length: vowel.length,
      stress,
      ...(nasalized ? { nasalized: true } : {}),
    };
  }
  return { ipa, kind: 'consonant', length: 'short', stress: 0 };
}

/** Inserts the combining tilde after the base vowel character, before any length mark. */
export function withNasal(symbol: string): string {
  const bare = stripNasal(symbol);
  if (bare.endsWith(LENGTH_MARK)) {
    return `${bare.slice(0, -1)}${NASAL_MARK}${LENGTH_MARK}`;
  }
  return `${bare}${NASAL_MARK}`;
}

const VOWEL_BASES = new Set(
  Object.keys(VOWELS).map((v) => v.replace(LENGTH_MARK, '')[0]),
);

/**
 * Precomposed nasal vowels that show up in hand-authored IPA (ẽ, ã, …).
 * Normalized to base + combining tilde so the rest of the pipeline only ever
 * sees one representation.
 */
const PRECOMPOSED_NASAL: Record<string, string> = {
  ã: 'a', Ã: 'a',
  ẽ: 'e', Ẽ: 'e',
  ĩ: 'i', Ĩ: 'i',
  õ: 'o', Õ: 'o',
  ũ: 'u', Ũ: 'u',
};

/**
 * Longest-match parse of an IPA string into phonemes. This is how the
 * hand-authored `ipa` field on every lexicon entry becomes comparable data.
 *
 * Unknown characters are skipped rather than thrown on, so one bad lexicon
 * entry degrades to a slightly wrong pronunciation instead of a broken worker.
 * `validateLexicon` in the test suite is what keeps them out.
 */
export function parseIpa(input: string, stressPattern?: Stress[]): Phoneme[] {
  const out: Phoneme[] = [];
  let i = 0;
  let vowelSeen = 0;

  while (i < input.length) {
    const ch = input[i];

    // Stress marks and separators are not phonemes.
    if (ch === 'ˈ' || ch === 'ˌ' || ch === '.' || ch === ' ' || ch === '-') {
      i += 1;
      continue;
    }

    // Precomposed nasal vowel (ẽ, ã, …) → base + nasal flag.
    const precomposedBase = PRECOMPOSED_NASAL[ch];
    const baseCh = precomposedBase ?? ch;
    const precomposedNasal = precomposedBase !== undefined;

    if (VOWEL_BASES.has(baseCh) || precomposedNasal) {
      // Diphthongs are two vowel characters and one nucleus.
      const two = input.slice(i, i + 2);
      if (!precomposedNasal && VOWELS[two]?.diphthong) {
        const stress = stressPattern?.[vowelSeen] ?? 0;
        out.push(makePhoneme(two, stress));
        vowelSeen += 1;
        i += 2;
        continue;
      }

      let j = i + 1;
      let nasalized = precomposedNasal;
      if (input[j] === NASAL_MARK) {
        nasalized = true;
        j += 1;
      }
      let symbol = baseCh;
      if (input[j] === LENGTH_MARK) {
        symbol += LENGTH_MARK;
        j += 1;
      }
      if (input[j] === NASAL_MARK) {
        nasalized = true;
        j += 1;
      }
      // Bare `e`/`o` from a precomposed nasal with length become the long
      // Hindi monophthongs; without length they stay short.
      if (VOWELS[symbol]) {
        const stress = stressPattern?.[vowelSeen] ?? 0;
        out.push(makePhoneme(nasalized ? withNasal(symbol) : symbol, stress));
        vowelSeen += 1;
        i = j;
        continue;
      }
      i += 1;
      continue;
    }

    // Consonant: affricate base first, then dental mark, then aspiration.
    let symbol = '';
    const two = input.slice(i, i + 2);
    if (two === 'tʃ' || two === 'dʒ') {
      symbol = two;
      i += 2;
    } else {
      symbol = ch;
      i += 1;
    }
    if (input[i] === DENTAL_MARK) {
      symbol += DENTAL_MARK;
      i += 1;
    }
    if (input[i] === ASPIRATION_MARK) {
      symbol += ASPIRATION_MARK;
      i += 1;
    }
    if (CONSONANTS.has(symbol)) {
      out.push(makePhoneme(symbol));
    }
  }

  return out;
}

/** Serializes phonemes back to a comparable string. The join key for the index. */
export const phonemesToIpa = (phonemes: Phoneme[]): string =>
  phonemes.map((p) => p.ipa).join('');

/**
 * CMUdict gives ARPABET with stress digits glued to the vowel: 'AH0 B AW1 T'.
 * ARPABET 1 is primary and 2 is secondary, which maps straight onto `Stress`.
 */
export function arpabetToPhonemes(arpabet: string): Phoneme[] {
  const out: Phoneme[] = [];
  for (const raw of arpabet.trim().split(/\s+/)) {
    if (!raw) continue;
    const match = /^([A-Z]+)([0-2])?$/.exec(raw);
    if (!match) continue;
    const [, symbol, digit] = match;
    const stress = (digit ? Number(digit) : 0) as Stress;

    // AH is the one ARPABET symbol whose IPA depends on stress.
    const ipa =
      symbol === 'AH' ? (stress === 0 ? 'ə' : 'ʌ') : ARPABET_TO_IPA[symbol];
    if (!ipa) continue;
    out.push(makePhoneme(ipa, isVowelSymbol(ipa) ? stress : 0));
  }
  return out;
}

/**
 * Appendix E cross-language equivalence set. Pairs treated as near-zero
 * distance so cross-language rhyme works without special-casing at the rhyme
 * layer. Values are the distance to use instead of the computed feature
 * distance, when it would be larger.
 */
/**
 * Near-identity pairs from Appendix E. Distance 0 means the rhyme layer treats
 * them as the same nucleus/consonant — required for cross-language perfect
 * rhyme (`naam`/`calm`, `din`/`been`). Small non-zero distances are for pairs
 * that still rhyme but are audibly distinct (dental vs alveolar, etc.).
 */
export const EQUIVALENCE_OVERRIDES: ReadonlyArray<readonly [string, string, number]> = [
  ['ɑ', 'aː', 0],
  ['u', 'uː', 0],
  ['i', 'iː', 0],
  ['ɔ', 'ɔː', 0],
  ['ʌ', 'ə', 0.05],
  ['oʊ', 'oː', 0.05],
  ['eɪ', 'eː', 0.05],
  ['v', 'ʋ', 0],
  ['ɹ', 'r', 0],
  ['t', 't̪', 0.05],
  ['d', 'd̪', 0.05],
  ['t', 'ʈ', 0.18],
  ['d', 'ɖ', 0.18],
  ['ʃ', 'ʂ', 0.05],
  ['h', 'ɦ', 0.03],
  ['n', 'ɳ', 0.1],
];

const equivalenceKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

const EQUIVALENCE_MAP: ReadonlyMap<string, number> = new Map(
  EQUIVALENCE_OVERRIDES.map(([a, b, d]) => [equivalenceKey(a, b), d]),
);

export const equivalenceDistance = (a: string, b: string): number | undefined =>
  EQUIVALENCE_MAP.get(equivalenceKey(a, b));
