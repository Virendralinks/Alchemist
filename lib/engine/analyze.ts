// lib/engine/analyze.ts
//
// The pipeline from Section 3.1, as one callable function. Tokenizer → language
// ID → G2P → (IPA already unified) → syllabifier keys. Everything the worker's
// ANALYZE_LINES and TIER_ONE handlers need, and everything the fixtures assert.

import type { Lang, Overrides, TokenAnalysis } from '@/lib/types/phonetics';
import { seedEnglishPriors } from '@/lib/lexicon/en-priors';
import { tokenize, countedWords, normalizeToken } from './tokenizer';
import { identifyLanguage } from './language-id';
import { g2pEn } from './g2p-en';
import { g2pHi } from './g2p-hi';

// Ensure English frequency priors are available even when the worker has not
// yet loaded the rhyme index (Node tests, first keystroke, etc.).
seedEnglishPriors();

export interface AnalyzedLine {
  lineId: string;
  text: string;
  tokens: TokenAnalysis[];
  /** Total syllables, ad-libs excluded. */
  syllableCount: number;
}

export function analyzeLine(
  text: string,
  overrides: Overrides = { lang: {}, pronunciation: {} },
  lineId = 'line',
): AnalyzedLine {
  const raw = tokenize(text);
  const words = countedWords(raw);
  const langScores = identifyLanguage(
    words.map((w) => w.text),
    overrides.lang,
  );

  const tokens: TokenAnalysis[] = words.map((word, i) => {
    const key = normalizeToken(word.text);
    const langLocked = key in overrides.lang || word.text in overrides.lang;
    const lang: Lang = langScores[i].lang;
    const candidates = lang === 'hi' ? g2pHi(word.text) : g2pEn(word.text);
    const selected =
      overrides.pronunciation[key] ??
      overrides.pronunciation[word.text] ??
      0;
    return {
      token: word.text,
      charStart: word.charStart,
      charEnd: word.charEnd,
      lang,
      langConfidence: langScores[i].score,
      langLocked,
      candidates,
      selectedCandidate: Math.min(selected, Math.max(0, candidates.length - 1)),
    };
  });

  const syllableCount = tokens.reduce((sum, t) => {
    const pron = t.candidates[t.selectedCandidate];
    return sum + (pron?.syllables.length ?? 0);
  }, 0);

  return { lineId, text, tokens, syllableCount };
}

export function analyzeLines(
  lines: { id: string; text: string }[],
  overrides: Overrides = { lang: {}, pronunciation: {} },
): Record<string, TokenAnalysis[]> {
  const out: Record<string, TokenAnalysis[]> = {};
  for (const line of lines) {
    out[line.id] = analyzeLine(line.text, overrides, line.id).tokens;
  }
  return out;
}

/** Stress pattern of a line, flat across tokens, for fixture assertions. */
export function stressPatternOf(analysis: AnalyzedLine): number[] {
  const out: number[] = [];
  for (const t of analysis.tokens) {
    const pron = t.candidates[t.selectedCandidate];
    if (!pron) continue;
    for (const s of pron.syllables) out.push(s.stress);
  }
  return out;
}
