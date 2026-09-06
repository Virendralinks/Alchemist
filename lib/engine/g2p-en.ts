// lib/engine/g2p-en.ts
//
// English grapheme-to-phoneme. CMUdict first, then a rule cascade for the
// out-of-vocabulary tail — slang, names, neologisms, and deliberate
// misspellings, all of which are constant in rap and none of which are in a
// 1998 pronunciation dictionary.

import type { Phoneme, Pronunciation, Stress } from '@/lib/types/phonetics';
import { lookupCmudict } from '@/lib/lexicon/cmudict-loader';
import { arpabetToPhonemes, makePhoneme } from './ipa';
import {
  assonanceKeyOf,
  rhymeTailOf,
  syllabify,
} from './syllabify';

/** A dictionary hit outranks a rules hit, which is what orders the candidates. */
const SCORE_LEXICON = 0.97;
const SCORE_LEXICON_VARIANT_STEP = 0.04;
const SCORE_RULES = 0.6;

interface RuleOutput {
  phonemes: Phoneme[];
  /** Letters consumed per phoneme, so syllables keep exact grapheme spans. */
  graphemes: string[];
}

/**
 * Longest-match-first grapheme rules. Order matters: every multi-letter pattern
 * must be tried before its first letter, or "ph" becomes /p/ + /h/ and "sh"
 * becomes /s/ + /h/.
 *
 * `$` anchors the pattern to the end of the word, which is how silent-e and the
 * common suffixes are handled.
 */
const EN_RULES: ReadonlyArray<readonly [string, string[]]> = [
  // Suffixes, anchored word-finally.
  ['tion$', ['ʃ', 'ə', 'n']],
  ['sion$', ['ʒ', 'ə', 'n']],
  ['ing$', ['ɪ', 'ŋ']],
  ['ight$', ['aɪ', 't']],
  ['ough$', ['ʌ', 'f']],
  ['augh$', ['ɑ', 'f']],
  ['ement$', ['m', 'ə', 'n', 't']],
  ['ment$', ['m', 'ə', 'n', 't']],
  ['ness$', ['n', 'ə', 's']],
  ['able$', ['ə', 'b', 'ə', 'l']],
  ['ible$', ['ə', 'b', 'ə', 'l']],
  ['tle$', ['t', 'ə', 'l']],
  ['dle$', ['d', 'ə', 'l']],
  ['ple$', ['p', 'ə', 'l']],
  ['gle$', ['g', 'ə', 'l']],
  ['cle$', ['k', 'ə', 'l']],
  ['ckle$', ['k', 'ə', 'l']],
  ['er$', ['ɜː']],
  ['or$', ['ɜː']],
  ['ar$', ['ɜː']],
  ['ly$', ['l', 'i']],
  ['ey$', ['i']],
  ['ie$', ['i']],
  ['y$', ['i']],
  ['e$', []], // silent e
  ['es$', ['z']],

  // Vowel digraphs and trigraphs.
  ['eau', ['oʊ']],
  ['ai', ['eɪ']],
  ['ay', ['eɪ']],
  ['ea', ['i']],
  ['ee', ['i']],
  ['ei', ['eɪ']],
  ['ey', ['eɪ']],
  ['ie', ['i']],
  ['oa', ['oʊ']],
  ['oe', ['oʊ']],
  ['oo', ['u']],
  ['ou', ['aʊ']],
  ['ow', ['oʊ']],
  ['oi', ['ɔɪ']],
  ['oy', ['ɔɪ']],
  ['ue', ['u']],
  ['ui', ['u']],
  ['au', ['ɔ']],
  ['aw', ['ɔ']],
  ['ew', ['u']],

  // Consonant digraphs.
  ['tch', ['tʃ']],
  ['dge', ['dʒ']],
  ['sch', ['s', 'k']],
  ['ch', ['tʃ']],
  ['ck', ['k']],
  ['gh', ['g']],
  ['ng', ['ŋ']],
  ['ph', ['f']],
  ['qu', ['k', 'w']],
  ['sh', ['ʃ']],
  ['th', ['θ']],
  ['wh', ['w']],
  ['wr', ['ɹ']],
  ['kn', ['n']],
  ['ll', ['l']],
  ['ss', ['s']],
  ['tt', ['t']],
  ['pp', ['p']],
  ['dd', ['d']],
  ['gg', ['g']],
  ['bb', ['b']],
  ['mm', ['m']],
  ['nn', ['n']],
  ['rr', ['ɹ']],
  ['ff', ['f']],
  ['zz', ['z']],

  // Single letters.
  ['a', ['æ']],
  ['b', ['b']],
  ['c', ['k']],
  ['d', ['d']],
  ['e', ['ɛ']],
  ['f', ['f']],
  ['g', ['g']],
  ['h', ['h']],
  ['i', ['ɪ']],
  ['j', ['dʒ']],
  ['k', ['k']],
  ['l', ['l']],
  ['m', ['m']],
  ['n', ['n']],
  ['o', ['ɑ']],
  ['p', ['p']],
  ['q', ['k']],
  ['r', ['ɹ']],
  ['s', ['s']],
  ['t', ['t']],
  ['u', ['ʌ']],
  ['v', ['v']],
  ['w', ['w']],
  ['x', ['k', 's']],
  ['y', ['j']],
  ['z', ['z']],
];

/** Soft c and g before a front vowel: 'city', 'gem'. Applied before the table. */
const isFrontVowel = (ch: string | undefined): boolean =>
  ch === 'e' || ch === 'i' || ch === 'y';

function applyRules(word: string): RuleOutput {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  const phonemes: Phoneme[] = [];
  const graphemes: string[] = [];
  let i = 0;

  while (i < lower.length) {
    // Soft c / soft g, which no fixed table can express.
    if (lower[i] === 'c' && isFrontVowel(lower[i + 1])) {
      phonemes.push(makePhoneme('s'));
      graphemes.push('c');
      i += 1;
      continue;
    }
    if (lower[i] === 'g' && isFrontVowel(lower[i + 1]) && lower.length > i + 1) {
      phonemes.push(makePhoneme('dʒ'));
      graphemes.push('g');
      i += 1;
      continue;
    }

    let matched = false;
    for (const [pattern, output] of EN_RULES) {
      const anchored = pattern.endsWith('$');
      const literal = anchored ? pattern.slice(0, -1) : pattern;
      if (anchored && i + literal.length !== lower.length) continue;
      if (!lower.startsWith(literal, i)) continue;

      // A silent-e rule must not swallow the only vowel: 'the' keeps its vowel.
      if (output.length === 0 && !phonemes.some((p) => p.kind === 'vowel')) continue;

      output.forEach((ipa, k) => {
        phonemes.push(makePhoneme(ipa));
        graphemes.push(k === 0 ? literal : '');
      });
      if (output.length === 0) {
        // Attach the silent letters to the previous phoneme's grapheme span so
        // no source character is lost from the highlight.
        if (graphemes.length > 0) graphemes[graphemes.length - 1] += literal;
      }
      i += literal.length;
      matched = true;
      break;
    }

    if (!matched) i += 1;
  }

  return { phonemes, graphemes };
}

/**
 * Stress for out-of-vocabulary words: initial for disyllables, penultimate for
 * longer words (Section 3.3). Monosyllables take primary by definition.
 */
function applyRuleStress(phonemes: Phoneme[]): void {
  const vowels = phonemes.filter((p) => p.kind === 'vowel');
  if (vowels.length === 0) return;
  let primary: number;
  if (vowels.length === 1) primary = 0;
  else if (vowels.length === 2) primary = 0;
  else primary = vowels.length - 2;
  vowels.forEach((v, i) => {
    v.stress = (i === primary ? 1 : 0) as Stress;
  });
}

function buildPronunciation(
  phonemes: Phoneme[],
  token: string,
  origin: Pronunciation['origin'],
  score: number,
  graphemes?: string[],
): Pronunciation {
  const syllables = syllabify(phonemes, 'en', { graphemes, token });
  return {
    phonemes,
    syllables,
    assonanceKey: assonanceKeyOf(syllables),
    rhymeTail: rhymeTailOf(syllables),
    score,
    origin,
  };
}

/**
 * Ranked pronunciations for an English token. Multiple dictionary entries become
 * multiple candidates, which is what drives `PronunciationSwitcher` for words
 * like 'read' and 'live'.
 */
export function g2pEn(token: string): Pronunciation[] {
  const entries = lookupCmudict(token);
  if (entries.length > 0) {
    return entries.map((entry, i) =>
      buildPronunciation(
        arpabetToPhonemes(entry.arpabet),
        token,
        'lexicon',
        Math.max(0.7, SCORE_LEXICON - i * SCORE_LEXICON_VARIANT_STEP),
      ),
    );
  }

  const { phonemes, graphemes } = applyRules(token);
  if (phonemes.length === 0) return [];
  applyRuleStress(phonemes);
  return [buildPronunciation(phonemes, token, 'rules', SCORE_RULES, graphemes)];
}

/** Exposed for tests: the rules path, bypassing the dictionary. */
export function g2pEnRulesOnly(token: string): Pronunciation | null {
  const { phonemes, graphemes } = applyRules(token);
  if (phonemes.length === 0) return null;
  applyRuleStress(phonemes);
  return buildPronunciation(phonemes, token, 'rules', SCORE_RULES, graphemes);
}
