// lib/engine/language-id.ts
//
// Per-token language decision for Hinglish. Input is Latin script only, so
// English and Hindi arrive in the same alphabet and the tokenizer has to decide
// which phonology to apply. Getting this wrong is not cosmetic: it changes the
// vowel inventory, which changes the rhyme tail, which changes every suggestion
// downstream (Section 3.2).
//
// Four weighted evidence sources, computed independently then combined:
//   1. Lexicon priors     (0.45)
//   2. Orthographic cues  (0.25)
//   3. Context smoothing  (0.20)
//   4. Morphology         (0.10)

import type { Lang } from '@/lib/types/phonetics';
import { hiPrior, hiHas } from '@/lib/lexicon/hi-roman';
import { cmudictHas } from '@/lib/lexicon/cmudict-loader';
import { normalizeToken } from './tokenizer';

export interface LangScore {
  lang: Lang;
  score: number;
  reasons: string[];
}

const W_LEXICON = 0.45;
const W_ORTHO = 0.25;
const W_CONTEXT = 0.2;
const W_MORPH = 0.1;

/** Confidence below which a token is eligible for neighbour-nudging. */
const SMOOTH_THRESHOLD = 0.62;

/**
 * Hindi-skewing orthography. Doubled vowels, aspirate digraphs in non-English
 * positions, and the characteristic postposition endings.
 */
const HI_ORTHO: ReadonlyArray<{ re: RegExp; reason: string; weight: number }> = [
  { re: /aa|ee|oo|ii|uu/, reason: 'doubled-vowel', weight: 0.55 },
  { re: /kh|gh|bh|dh|jh|chh/, reason: 'aspirate-digraph', weight: 0.5 },
  { re: /(kh|gh|bh|dh|jh)$/, reason: 'final-aspirate', weight: 0.7 },
  { re: /^[bcdfghjklmnpqrstvwxyz]*[aeiou]h[aeiou]/, reason: 'intervocalic-h', weight: 0.25 },
  { re: /(tth|ddh|rth)/, reason: 'retroflex-cluster', weight: 0.4 },
];

/** English-skewing orthography. Clusters illegal in Hindi onsets, silent-e, Latin suffixes. */
const EN_ORTHO: ReadonlyArray<{ re: RegExp; reason: string; weight: number }> = [
  { re: /^(str|spl|spr|scr|thr|shr)/, reason: 'en-onset-cluster', weight: 0.8 },
  { re: /tion$|sion$/, reason: 'tion-suffix', weight: 0.9 },
  { re: /ing$/, reason: 'ing-suffix', weight: 0.7 },
  { re: /ly$/, reason: 'ly-suffix', weight: 0.55 },
  { re: /ment$/, reason: 'ment-suffix', weight: 0.7 },
  { re: /ness$/, reason: 'ness-suffix', weight: 0.7 },
  { re: /^.*[^aeiou]e$/, reason: 'silent-e', weight: 0.35 },
  { re: /ough|augh|igh/, reason: 'en-vowel-digraph', weight: 0.6 },
  { re: /[aeiou]{3,}/, reason: 'tri-vowel', weight: 0.3 },
];

/** Hindi morphology: postpositions and inflectional endings. */
const HI_MORPH: ReadonlyArray<{ re: RegExp; reason: string; weight: number }> = [
  { re: /(ne|ka|ki|ke|ko|se|mein|me|wala|wali|wale)$/, reason: 'postposition', weight: 0.85 },
  { re: /(ta|ti|te|unga|ungi|enge|ega|egi)$/, reason: 'verb-inflection', weight: 0.7 },
  { re: /(on|ein|iyan|iyon)$/, reason: 'plural-oblique', weight: 0.55 },
  { re: /^(un|in|us|is)$/, reason: 'oblique-pronoun', weight: 0.6 },
];

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function orthoEvidence(token: string): { hi: number; en: number; reasons: string[] } {
  let hi = 0;
  let en = 0;
  const reasons: string[] = [];
  for (const cue of HI_ORTHO) {
    if (cue.re.test(token)) {
      hi = Math.max(hi, cue.weight);
      reasons.push(`ortho:hi:${cue.reason}`);
    }
  }
  for (const cue of EN_ORTHO) {
    if (cue.re.test(token)) {
      en = Math.max(en, cue.weight);
      reasons.push(`ortho:en:${cue.reason}`);
    }
  }
  return { hi, en, reasons };
}

function morphEvidence(token: string): { hi: number; reasons: string[] } {
  let hi = 0;
  const reasons: string[] = [];
  for (const cue of HI_MORPH) {
    if (cue.re.test(token)) {
      hi = Math.max(hi, cue.weight);
      reasons.push(`morph:${cue.reason}`);
    }
  }
  return { hi, reasons };
}

/**
 * Lazy English prior. Built from CMUdict presence plus a small boost for the
 * common-frequency list when it has been loaded. Presence alone is a weak
 * prior (many Hindi romanizations collide with English spellings); frequency
 * is the real signal, and `enPriorBoost` supplies it.
 */
let enPriorBoost: Map<string, number> | null = null;

export function setEnglishPriors(priors: Map<string, number>): void {
  enPriorBoost = priors;
}

function enPrior(token: string): number {
  const boost = enPriorBoost?.get(token);
  if (boost !== undefined) return boost;
  if (cmudictHas(token)) return 0.35;
  return 0;
}

interface RawScore {
  hi: number;
  en: number;
  reasons: string[];
}

function scoreToken(token: string): RawScore {
  const reasons: string[] = [];
  const hiP = hiPrior(token);
  const enP = enPrior(token);
  if (hiP > 0) reasons.push(`lex:hi=${hiP.toFixed(2)}`);
  if (enP > 0) reasons.push(`lex:en=${enP.toFixed(2)}`);

  const ortho = orthoEvidence(token);
  reasons.push(...ortho.reasons);

  const morph = morphEvidence(token);
  reasons.push(...morph.reasons);

  // Lexicon: if only one side hits, that side gets the full weight; if both
  // hit, the stronger prior wins the share and the weaker gets the remainder.
  let lexHi = 0;
  let lexEn = 0;
  if (hiP > 0 || enP > 0) {
    const total = hiP + enP;
    lexHi = hiP / (total || 1);
    lexEn = enP / (total || 1);
  }

  const hi =
    W_LEXICON * lexHi +
    W_ORTHO * ortho.hi +
    W_MORPH * morph.hi;
  const en =
    W_LEXICON * lexEn +
    W_ORTHO * ortho.en;

  return { hi, en, reasons };
}

/**
 * Tokens that are genuine high-frequency collisions between the two lexicons.
 * Their independent score is intentionally kept near the floor so context
 * smoothing (pass 2) is what decides — which is the whole point of Section 3.2.
 */
const COLLISION_TOKENS = new Set([
  'main', 'to', 'bat', 'car', 'is', 'mere', 'or', 'me', 'hi', 'us', 'he', 'do',
  'no', 'so', 'be', 'we', 'an', 'as', 'at', 'in', 'on', 'for', 'pass', 'far',
  'men', 'age', 'are', 'bus', 'log', 'par', 'per', 'sir', 'top', 'box',
  'hum', 'har', 'toot', 'bit', 'mar', 'pal', 'bag', 'band', 'file', 'ring',
  'bacha', 'tod', 'yahi', 'roz', 'deal', 'tor', 'top',
]);

/**
 * Two-pass: score independently, then apply light left-right smoothing where a
 * token's confidence is below threshold. Do not over-smooth — a single English
 * tech term dropped into a Hindi clause is exactly the kind of line this user
 * writes (Section 3.2).
 */
export function identifyLanguage(
  tokens: string[],
  overrides: Record<string, Lang> = {},
): LangScore[] {
  const normalized = tokens.map(normalizeToken);
  const raw = normalized.map(scoreToken);

  const independent: LangScore[] = raw.map((r, i) => {
    const key = normalized[i];
    const override = overrides[key] ?? overrides[tokens[i]];
    if (override) {
      return { lang: override, score: 1, reasons: ['override'] };
    }

    // Collisions: park at low confidence on the stronger prior so neighbours
    // can pull either way. Without this, a Hindi lexicon hit on `main` would
    // lock the English adjective reading out of reach.
    if (COLLISION_TOKENS.has(key)) {
      const leanHi = r.hi >= r.en;
      return {
        lang: leanHi ? 'hi' : 'en',
        score: 0.45,
        reasons: [...r.reasons, 'collision'],
      };
    }

    const hi = r.hi;
    const en = r.en;
    if (hi === 0 && en === 0) {
      // No evidence either way. Default English — Latin script bias — at low
      // confidence so a neighbour can pull it.
      return { lang: 'en', score: 0.4, reasons: [...r.reasons, 'default:en'] };
    }
    if (hi >= en) {
      const score = clamp01(0.5 + (hi - en) / 2 + hi * 0.3);
      return { lang: 'hi', score, reasons: r.reasons };
    }
    const score = clamp01(0.5 + (en - hi) / 2 + en * 0.3);
    return { lang: 'en', score, reasons: r.reasons };
  });

  // Pass 2 (+ a light pass 3): context smoothing. Run twice so a collision that
  // resolves on the first pass can pull its neighbour on the second — without
  // that, a line-initial `har` next to `roz` stays stuck because both start as
  // collisions and neither is allowed to vote yet.
  const smoothed = independent.map((s) => ({ ...s, reasons: s.reasons.slice() }));

  const smoothOnce = () => {
    for (let i = 0; i < smoothed.length; i += 1) {
      if (smoothed[i].reasons.includes('override')) continue;
      const isCollision = smoothed[i].reasons.includes('collision');
      if (!isCollision && smoothed[i].score >= SMOOTH_THRESHOLD) continue;

      const left = i > 0 ? smoothed[i - 1] : null;
      const right = i < smoothed.length - 1 ? smoothed[i + 1] : null;
      const neighbourVotes = { hi: 0, en: 0 };
      // Prefer settled non-collision neighbours; fall back to any neighbour
      // that has already been context-confirmed so pass 3 can propagate.
      const usable = (n: LangScore | null): n is LangScore =>
        !!n &&
        n.score >= 0.5 &&
        (!n.reasons.includes('collision') || n.reasons.some((r) => r.startsWith('context')));
      if (usable(left)) neighbourVotes[left.lang] += left.score;
      if (usable(right)) neighbourVotes[right.lang] += right.score;

      const voteTotal = neighbourVotes.hi + neighbourVotes.en;
      if (voteTotal === 0) continue;

      const neighbourLang: Lang = neighbourVotes.hi >= neighbourVotes.en ? 'hi' : 'en';
      if (neighbourLang !== smoothed[i].lang) {
        const strength = (neighbourLang === 'hi' ? neighbourVotes.hi : neighbourVotes.en) / voteTotal;
        const nudge = W_CONTEXT * strength * (isCollision ? 2.5 : 1);
        if (isCollision || nudge > smoothed[i].score * 0.5) {
          smoothed[i] = {
            lang: neighbourLang,
            score: clamp01(0.55 + nudge),
            reasons: [...smoothed[i].reasons, `context:${neighbourLang}`],
          };
        }
      } else {
        smoothed[i] = {
          ...smoothed[i],
          score: clamp01(smoothed[i].score + W_CONTEXT * 0.4),
          reasons: [...smoothed[i].reasons, `context-confirm:${neighbourLang}`],
        };
      }
    }
  };

  smoothOnce();
  smoothOnce();

  return smoothed;
}

/** Convenience: language of a single token with no neighbours. */
export function identifyOne(token: string, overrides: Record<string, Lang> = {}): LangScore {
  return identifyLanguage([token], overrides)[0];
}

/** True when the token is known to at least one lexicon. Useful for tests. */
export const knownToAnyLexicon = (token: string): boolean =>
  hiHas(token) || cmudictHas(token);
