// lib/engine/rhythm.ts
//
// Tier 1 RhythmAnalysis: everything objectively checkable about a block of
// bars — syllable counts, scheme letters, internal rhymes, assonance chains,
// density, pocket, articulation. No model involvement (Section 4.1).

import type { RhythmAnalysis } from '@/lib/types/archive';
import type { Overrides, TokenAnalysis } from '@/lib/types/phonetics';
import { SLOT_COUNT } from './grid';
import { analyzeLine, type AnalyzedLine } from './analyze';
import { classifyPair } from './rhyme';
import { tokenize, isCaesuraMark } from './tokenizer';
import { denasalizeKey } from './rhyme';

export interface TierOneInput {
  text: string;
  bpm: number;
  overrides?: Overrides;
}

export interface BarSpan {
  text: string;
  /** Index of `text` within the original block, after trimming. */
  start: number;
}

/**
 * Split a pasted block into lines, keeping each line's offset inside the block.
 * Callers that annotate a whole block need these offsets: token spans come out
 * of `analyzeLine` relative to the line, and rendering them against the full
 * text highlights the wrong characters without this shift.
 */
export function splitBarsWithOffsets(text: string): BarSpan[] {
  const out: BarSpan[] = [];
  // Matching runs of non-newline characters gives correct indices for both \n
  // and \r\n without having to guess how many characters the break consumed.
  const line = /[^\r\n]+/g;
  let match: RegExpExecArray | null;
  while ((match = line.exec(text)) !== null) {
    const raw = match[0];
    const trimmed = raw.trim();
    if (trimmed.length === 0) continue;
    out.push({ text: trimmed, start: match.index + (raw.length - raw.trimStart().length) });
  }
  return out;
}

/** Split a pasted block into lines, dropping empties. */
export function splitBars(text: string): string[] {
  return splitBarsWithOffsets(text).map((b) => b.text);
}

function selected(t: TokenAnalysis) {
  return t.candidates[t.selectedCandidate];
}

/**
 * Assign rhyme-scheme letters across a block. Two line ends share a letter
 * when their classified rhyme scores at or above 0.55 (slant and above).
 */
export function assignSchemeLetters(analyses: AnalyzedLine[]): string[] {
  const letters: string[] = [];
  const representatives: { letter: string; analysis: AnalyzedLine }[] = [];
  let next = 0;

  for (const analysis of analyses) {
    const end = analysis.tokens[analysis.tokens.length - 1];
    if (!end || !selected(end)) {
      letters.push('-');
      continue;
    }
    const endPron = selected(end)!;
    let matched: string | null = null;
    for (const rep of representatives) {
      const repEnd = rep.analysis.tokens[rep.analysis.tokens.length - 1];
      if (!repEnd || !selected(repEnd)) continue;
      const classified = classifyPair(selected(repEnd)!, endPron, {
        aText: repEnd.token,
        bText: end.token,
        aLang: repEnd.lang,
        bLang: end.lang,
      });
      if (
        classified.score >= 0.55 &&
        classified.type !== 'forced'
      ) {
        matched = rep.letter;
        break;
      }
    }
    if (matched) {
      letters.push(matched);
    } else {
      const letter = String.fromCharCode(65 + (next % 26));
      next += 1;
      representatives.push({ letter, analysis });
      letters.push(letter);
    }
  }
  return letters;
}

function findInternalRhymes(tokens: TokenAnalysis[]): RhythmAnalysis['internalRhymes'] {
  const out: RhythmAnalysis['internalRhymes'] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const a = tokens[i];
    const aPron = selected(a);
    if (!aPron) continue;
    for (let j = i + 1; j < tokens.length; j += 1) {
      const b = tokens[j];
      const bPron = selected(b);
      if (!bPron) continue;
      const classified = classifyPair(aPron, bPron, {
        aText: a.token,
        bText: b.token,
        aLang: a.lang,
        bLang: b.lang,
        internal: j < tokens.length - 1,
      });
      if (classified.score >= 0.7 && classified.type !== 'forced') {
        out.push({
          aSpan: [a.charStart, a.charEnd],
          bSpan: [b.charStart, b.charEnd],
          score: classified.score,
        });
      }
    }
  }
  return out;
}

function findAssonanceChains(tokens: TokenAnalysis[]): RhythmAnalysis['assonanceChains'] {
  const buckets = new Map<string, [number, number][]>();
  for (const t of tokens) {
    const pron = selected(t);
    if (!pron || pron.syllables.length === 0) continue;
    const key = denasalizeKey(pron.assonanceKey);
    if (!key) continue;
    const list = buckets.get(key) ?? [];
    list.push([t.charStart, t.charEnd]);
    buckets.set(key, list);
  }
  const out: RhythmAnalysis['assonanceChains'] = [];
  for (const [key, spans] of buckets) {
    if (spans.length >= 2) out.push({ key, spans });
  }
  return out;
}

/**
 * Place syllables onto the 64-slot grid, left to right, one syllable per slot.
 * A real pocket-aware placer arrives with the sequencer UI; for Tier 1 the
 * linear map is enough to compute density and to give the X-Ray something to show.
 */
function buildSlotMap(analyses: AnalyzedLine[]): (string | null)[] {
  const slots: (string | null)[] = Array.from({ length: SLOT_COUNT }, () => null);
  let cursor = 0;
  for (const analysis of analyses) {
    for (const t of analysis.tokens) {
      const pron = selected(t);
      if (!pron) continue;
      for (let s = 0; s < pron.syllables.length; s += 1) {
        if (cursor >= SLOT_COUNT) return slots;
        slots[cursor] = `${analysis.lineId}:${t.token}:${s}`;
        cursor += 1;
      }
    }
  }
  return slots;
}

/**
 * Pocket: where the syllables sit against the beat. With a linear slot map the
 * honest answer for most typed bars is 'in'; a writer who front-loads a bar
 * reads as 'ahead', one who leaves leading rests as 'behind'.
 */
function detectPocket(slotMap: (string | null)[]): RhythmAnalysis['pocket'] {
  const filled = slotMap
    .map((v, i) => (v === null ? -1 : i))
    .filter((i) => i >= 0);
  if (filled.length === 0) return 'in';
  const first = filled[0];
  const last = filled[filled.length - 1];
  const span = last - first + 1;
  const density = filled.length / span;
  if (first <= 1 && density > 0.85) return 'ahead';
  if (first >= 4) return 'behind';
  if (density < 0.5) return 'mixed';
  return 'in';
}

/**
 * Articulation from mid-line punctuation (caesura → staccato tendency) and
 * average syllable weight. A bar with multiple commas and short syllables is
 * staccato; a bar of open long vowels with no breaks is legato.
 */
function detectArticulation(text: string, analyses: AnalyzedLine[]): RhythmAnalysis['articulation'] {
  const caesuras = tokenize(text).filter(isCaesuraMark).length;
  let open = 0;
  let closed = 0;
  for (const analysis of analyses) {
    for (const t of analysis.tokens) {
      const pron = selected(t);
      if (!pron) continue;
      for (const s of pron.syllables) {
        if (s.coda.length === 0 && s.nucleus.length === 'long') open += 1;
        else closed += 1;
      }
    }
  }
  if (caesuras >= 2 || (closed > open * 2 && caesuras >= 1)) return 'staccato';
  if (open > closed && caesuras === 0) return 'legato';
  return 'mixed';
}

/**
 * Full Tier 1 dissection of a pasted block. Deterministic, offline, no network.
 */
export function tierOne(input: TierOneInput): RhythmAnalysis {
  const bars = splitBars(input.text);
  const overrides = input.overrides ?? { lang: {}, pronunciation: {} };
  const analyses = bars.map((text, i) =>
    analyzeLine(text, overrides, `bar-${i}`),
  );
  const allTokens = analyses.flatMap((a) => a.tokens);
  const syllableCount = analyses.reduce((s, a) => s + a.syllableCount, 0);
  const scheme = assignSchemeLetters(analyses);
  const slotMap = buildSlotMap(analyses);
  const barCount = Math.max(1, bars.length);

  return {
    syllableCount,
    tokens: allTokens,
    schemeLetter: scheme[scheme.length - 1] ?? 'A',
    internalRhymes: analyses.flatMap((a) => findInternalRhymes(a.tokens)),
    assonanceChains: findAssonanceChains(allTokens),
    density: syllableCount / barCount,
    slotMap,
    pocket: detectPocket(slotMap),
    articulation: detectArticulation(input.text, analyses),
  };
}

/** Per-line scheme letters — exposed for the rhyme-scheme rail. */
export function schemeLettersFor(
  lines: string[],
  overrides?: Overrides,
): string[] {
  const analyses = lines.map((text, i) =>
    analyzeLine(text, overrides ?? { lang: {}, pronunciation: {} }, `bar-${i}`),
  );
  return assignSchemeLetters(analyses);
}
