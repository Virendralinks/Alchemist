// lib/engine/scheme.ts
//
// Rhyme-scheme letters from already-analyzed lines. Split out from rhythm.ts so
// the rail can import it in the browser: this file reaches only the phonology
// math (ipa, feature-matrix, syllabify) and never the 4 MB CMUdict, which lives
// behind the worker (Appendix B).

import type { TokenAnalysis } from '@/lib/types/phonetics';
import { classifyPair } from './rhyme';

/** Two line ends share a letter when their classified rhyme reaches this score. */
const SCHEME_THRESHOLD = 0.55;

const endToken = (tokens: TokenAnalysis[]): TokenAnalysis | null => {
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    if (tokens[i].candidates[tokens[i].selectedCandidate]) return tokens[i];
  }
  return null;
};

/**
 * Assign scheme letters across a block of analyzed lines. Mirrors
 * `assignSchemeLetters` in rhythm.ts, but consumes TokenAnalysis[] so it needs
 * no G2P of its own.
 */
export function schemeLettersFromAnalyses(lines: TokenAnalysis[][]): string[] {
  const letters: string[] = [];
  const representatives: { letter: string; token: TokenAnalysis }[] = [];
  let next = 0;

  for (const tokens of lines) {
    const end = endToken(tokens);
    if (!end) {
      letters.push('-');
      continue;
    }
    const endPron = end.candidates[end.selectedCandidate];

    let matched: string | null = null;
    for (const rep of representatives) {
      const repPron = rep.token.candidates[rep.token.selectedCandidate];
      if (!repPron) continue;
      const classified = classifyPair(repPron, endPron, {
        aText: rep.token.token,
        bText: end.token,
        aLang: rep.token.lang,
        bLang: end.lang,
      });
      if (classified.score >= SCHEME_THRESHOLD && classified.type !== 'forced') {
        matched = rep.letter;
        break;
      }
    }

    if (matched) {
      letters.push(matched);
    } else {
      const letter = String.fromCharCode(65 + (next % 26));
      next += 1;
      representatives.push({ letter, token: end });
      letters.push(letter);
    }
  }

  return letters;
}
