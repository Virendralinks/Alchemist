// lib/engine/g2p-hi.ts
//
// Romanized Hindi grapheme-to-phoneme. Lexicon first, then a rules cascade that
// returns *ranked candidates* rather than one answer — because romanization is
// lossy in ways that matter for rhyme (Section 3.4).
//
// After transliteration, schwa deletion runs. Get that wrong and syllable
// counts are wrong, which corrupts every rhythm readout. The rules:
//   1. Word-final schwa always deletes.
//   2. Medial schwa deletes in a VC_CV context, applied right to left.
//   3. Never delete a word-initial schwa.
//   4. Never create a consonant cluster Hindi phonotactics disallow.

import type { Phoneme, Pronunciation } from '@/lib/types/phonetics';
import type { HiLexeme } from '@/lib/lexicon/hi-lexeme';
import { lookupHi } from '@/lib/lexicon/hi-roman';
import {
  ASPIRATION_MARK,
  DENTAL_MARK,
  LENGTH_MARK,
  makePhoneme,
  parseIpa,
  withNasal,
} from './ipa';
import { assonanceKeyOf, rhymeTailOf, syllabify } from './syllabify';

const SCORE_LEXICON = 0.97;
const SCORE_LEXICON_ALT = 0.9;
const SCORE_RULES = 0.55;

/** Digraphs before single letters. Longest-match-first, same as English. */
const HI_DIGRAPHS: ReadonlyArray<readonly [string, string[]]> = [
  // Aspirates and digraphs.
  ['chh', [`tʃ${ASPIRATION_MARK}`]],
  ['jh', [`dʒ${ASPIRATION_MARK}`]],
  ['kh', [`k${ASPIRATION_MARK}`]],
  ['gh', [`g${ASPIRATION_MARK}`]],
  ['th', [`t${DENTAL_MARK}${ASPIRATION_MARK}`]],
  ['dh', [`d${DENTAL_MARK}${ASPIRATION_MARK}`]],
  ['ph', [`p${ASPIRATION_MARK}`]],
  ['bh', [`b${ASPIRATION_MARK}`]],
  ['ch', ['tʃ']],
  ['sh', ['ʃ']],
  ['ng', ['ŋ']],
  // Vowel digraphs — length and diphthong-like monophthongs.
  ['aa', ['aː']],
  ['ee', ['iː']],
  ['ii', ['iː']],
  ['oo', ['uː']],
  ['uu', ['uː']],
  ['ai', ['ɛː']],
  ['au', ['ɔː']],
  ['ei', ['eː']],
  ['ou', ['oː']],
  // Single consonants. Hindi t/d are dental by default.
  ['t', [`t${DENTAL_MARK}`]],
  ['d', [`d${DENTAL_MARK}`]],
  ['k', ['k']],
  ['g', ['g']],
  ['p', ['p']],
  ['b', ['b']],
  ['m', ['m']],
  ['n', ['n']],
  ['f', ['f']],
  ['s', ['s']],
  ['z', ['z']],
  ['h', ['ɦ']],
  ['l', ['l']],
  ['r', ['r']],
  ['v', ['ʋ']],
  ['w', ['ʋ']],
  ['y', ['j']],
  ['j', ['dʒ']],
  ['q', ['q']],
  ['x', ['x']],
  // Single vowels. Bare `a` is schwa; length comes from digraphs above.
  ['a', ['ə']],
  ['e', ['eː']],
  ['i', ['ɪ']],
  ['o', ['oː']],
  ['u', ['ʊ']],
];

/**
 * Clusters that Hindi phonotactics disallow as a result of schwa deletion.
 * If deletion would produce one of these as an adjacent pair, keep the schwa.
 */
const ILLEGAL_AFTER_DELETION: ReadonlySet<string> = new Set([
  // Two identical stops / fricatives side by side with no release.
  // (geminates like /tt/ are fine and common — these are the awkward ones)
  'ɦɦ', 'ʋʋ', 'jj',
  // Stop + stop of mismatched place that never occurs word-medially.
  `k${DENTAL_MARK}t`, `g${DENTAL_MARK}d`,
]);

interface Partial {
  phonemes: Phoneme[];
  /** Accumulated plausibility; lexicon hits start higher. */
  score: number;
  origin: Pronunciation['origin'];
}

function buildPronunciation(partial: Partial, token: string): Pronunciation {
  const syllables = syllabify(partial.phonemes, 'hi', { token });
  return {
    phonemes: partial.phonemes,
    syllables,
    assonanceKey: assonanceKeyOf(syllables),
    rhymeTail: rhymeTailOf(syllables),
    score: partial.score,
    origin: partial.origin,
  };
}

function fromLexeme(lexeme: HiLexeme, token: string, score: number): Pronunciation[] {
  const primary = buildPronunciation(
    { phonemes: parseIpa(lexeme.ipa), score, origin: 'lexicon' },
    token,
  );
  const alts = (lexeme.alternates ?? []).map((alt, i) =>
    buildPronunciation(
      {
        phonemes: parseIpa(alt.ipa),
        score: SCORE_LEXICON_ALT - i * 0.03,
        origin: 'lexicon',
      },
      token,
    ),
  );
  return [primary, ...alts];
}

/**
 * Longest-match transliteration into the unified inventory. Ambiguous graphemes
 * (`a` as /ə/ or /aː/, `t` as dental or retroflex) generate branches, capped
 * so the candidate list stays small.
 */
function transliterate(token: string): Partial[] {
  const lower = token.toLowerCase().replace(/[^a-z]/g, '');
  if (lower.length === 0) return [];

  type Frame = { i: number; phonemes: Phoneme[]; score: number };
  let frames: Frame[] = [{ i: 0, phonemes: [], score: SCORE_RULES }];
  const MAX_BRANCH = 6;

  while (frames.some((f) => f.i < lower.length)) {
    const next: Frame[] = [];
    for (const frame of frames) {
      if (frame.i >= lower.length) {
        next.push(frame);
        continue;
      }
      let matched = false;
      for (const [pattern, outputs] of HI_DIGRAPHS) {
        if (!lower.startsWith(pattern, frame.i)) continue;
        matched = true;
        // Branch on the rare ambiguities that matter for rhyme.
        const branches: string[][] = [outputs];
        if (pattern === 'a' && frame.i + 1 < lower.length) {
          // Medial bare `a` can be /aː/ in some spellings that omit the digraph.
          branches.push(['aː']);
        }
        if (pattern === 't') branches.push(['ʈ']);
        if (pattern === 'd') branches.push(['ɖ']);
        if (pattern === 'th') branches.push([`ʈ${ASPIRATION_MARK}`]);
        if (pattern === 'dh') branches.push([`ɖ${ASPIRATION_MARK}`]);
        if (pattern === 'ai') branches.push(['aɪ']); // English-style reading
        if (pattern === 'ph') branches.push(['f']); // borrowed /f/

        branches.forEach((out, bi) => {
          const phonemes = [
            ...frame.phonemes,
            ...out.map((ipa) => makePhoneme(ipa)),
          ];
          // Prefer the default reading; alternate branches pay a small tax.
          next.push({
            i: frame.i + pattern.length,
            phonemes,
            score: frame.score - bi * 0.04,
          });
        });
        break;
      }
      if (!matched) {
        // Skip the unknown character rather than stalling.
        next.push({ i: frame.i + 1, phonemes: frame.phonemes, score: frame.score - 0.1 });
      }
    }
    // Keep the best-scoring frames so the branch factor stays bounded.
    next.sort((a, b) => b.score - a.score);
    frames = next.slice(0, MAX_BRANCH);
  }

  return frames.map((f) => ({
    phonemes: f.phonemes,
    score: f.score,
    origin: 'rules' as const,
  }));
}

/**
 * Schwa deletion (Section 3.4). Operates on the phoneme list in place and
 * returns a new list. Word-final schwa always goes; medial schwa goes in a
 * VC_CV context, right to left; word-initial schwa is never touched; a
 * deletion that would produce an illegal cluster is refused.
 */
export function applySchwaDeletion(phonemes: Phoneme[]): Phoneme[] {
  if (phonemes.length === 0) return phonemes;
  let out = phonemes.slice();

  // 1. Word-final schwa always deletes.
  if (out[out.length - 1].ipa === 'ə') {
    out = out.slice(0, -1);
  }

  // 2. Medial schwa in a VC_CV context, right to left.
  //    V C ə C V  — the trailing vowel is load-bearing. Without it this is
  //    VC_C# (as in kamal /kə.məl/), and the schwa stays. With it (karna
  //    /kə.rə.naː/ → /kər.naː/) the schwa is the classic deletion target.
  for (let i = out.length - 2; i >= 1; i -= 1) {
    if (out[i].ipa !== 'ə') continue;
    const left = out[i - 1];
    const right = out[i + 1];
    const afterRight = out[i + 2];
    if (!left || !right || !afterRight) continue;
    if (left.kind !== 'consonant' || right.kind !== 'consonant') continue;
    if (afterRight.kind !== 'vowel') continue;

    const hasVowelBefore = out.slice(0, i).some((p) => p.kind === 'vowel');
    if (!hasVowelBefore) continue;

    const cluster = left.ipa + right.ipa;
    if (ILLEGAL_AFTER_DELETION.has(cluster)) continue;

    out.splice(i, 1);
  }

  return out;
}

/**
 * Word-final and pre-consonantal `n`/`m` in Hindi become nasalization on the
 * preceding vowel rather than a separate coda consonant, because that is how
 * they behave in rhyme (Section 3.4). Lexicon entries already encode this;
 * the rules path has to do it after transliteration.
 *
 * Only applied when the vowel is one Hindi nasalizes in practice (long vowels
 * and /ɛː/), and only word-finally or before a stop — a genuine coda /n/ in
 * `din` /d̪ɪn/ is kept, because short /ɪ/ + final /n/ is a real coda.
 */
export function applyNasalization(phonemes: Phoneme[]): Phoneme[] {
  if (phonemes.length < 2) return phonemes;
  const out = phonemes.slice();
  for (let i = 0; i < out.length; i += 1) {
    const p = out[i];
    if (p.ipa !== 'n' && p.ipa !== 'm') continue;
    const prev = out[i - 1];
    if (!prev || prev.kind !== 'vowel') continue;
    const next = out[i + 1];
    const wordFinal = i === out.length - 1;
    const beforeStop = next?.kind === 'consonant' && !['n', 'm', 'ŋ', 'ɳ'].includes(next.ipa);
    // Long vowels nasalize freely; short vowels only word-finally after a
    // digraph-like spelling (main, mein, hun) — detected as /ɛː/ /ẽː/ candidates
    // via the vowel being /ɛː/ or /ə/ with no coda beyond the nasal.
    const longEnough =
      prev.length === 'long' ||
      prev.ipa === 'ɛː' ||
      prev.ipa === 'ɔː' ||
      (wordFinal && (prev.ipa === 'ə' || prev.ipa === 'ʊ' || prev.ipa === 'ɪ'));
    if (!longEnough) continue;
    if (!wordFinal && !beforeStop) continue;
    // Prefer word-final. Pre-consonantal only for long vowels.
    if (!wordFinal && prev.length !== 'long' && prev.ipa !== 'ɛː') continue;

    out[i - 1] = makePhoneme(withNasal(prev.ipa.replace(/\u0303/g, '')), prev.stress, {
      nasalized: true,
    });
    // Keep the length mark semantics: /ɛː/ nasalized is /ɛ̃ː/.
    if (prev.ipa.includes(LENGTH_MARK) && !out[i - 1].ipa.includes(LENGTH_MARK)) {
      out[i - 1] = makePhoneme(withNasal(prev.ipa.replace(/\u0303/g, '')), prev.stress, {
        nasalized: true,
      });
    }
    out.splice(i, 1);
    i -= 1;
  }
  return out;
}

function finalizeRules(partial: Partial, token: string): Pronunciation {
  let phonemes = applySchwaDeletion(partial.phonemes);
  phonemes = applyNasalization(phonemes);
  return buildPronunciation({ ...partial, phonemes }, token);
}

/**
 * Ranked pronunciations for a romanized Hindi token. Lexicon hits outrank
 * rules hits; within rules, the default digraph reading outranks the
 * alternate branches.
 */
export function g2pHi(token: string): Pronunciation[] {
  const lexHits = lookupHi(token);
  if (lexHits.length > 0) {
    const out: Pronunciation[] = [];
    lexHits.forEach((lexeme, i) => {
      out.push(...fromLexeme(lexeme, token, SCORE_LEXICON - i * 0.02));
    });
    // Deduplicate by IPA string so `dil`/`dill` resolving to the same lexeme
    // twice (via two banks) does not produce two identical candidates.
    const seen = new Set<string>();
    return out.filter((p) => {
      const key = p.phonemes.map((x) => x.ipa).join('');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return transliterate(token)
    .map((partial) => finalizeRules(partial, token))
    .filter((p) => p.syllables.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

/** Exposed for the dedicated schwa-deletion tests. */
export function g2pHiRulesOnly(token: string): Pronunciation[] {
  return transliterate(token)
    .map((partial) => finalizeRules(partial, token))
    .filter((p) => p.syllables.length > 0)
    .sort((a, b) => b.score - a.score);
}
