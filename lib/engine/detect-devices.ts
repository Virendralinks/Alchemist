// lib/engine/detect-devices.ts
//
// Tier 1 device detection: every `detectable: true` sound and structural device
// with exact character spans and no model involvement (Section 3.9). Figurative,
// wordplay, and cultural devices are left for Tier 2.

import type { DeviceInstance } from '@/lib/types/devices';
import type { Overrides, TokenAnalysis } from '@/lib/types/phonetics';
import { analyzeLine, type AnalyzedLine } from './analyze';
import { classifyPair } from './rhyme';
import { tokenize, isCaesuraMark } from './tokenizer';
import { denasalizeKey } from './rhyme';
import { splitBars } from './rhythm';

function selected(t: TokenAnalysis) {
  return t.candidates[t.selectedCandidate];
}

function instance(
  deviceId: string,
  charStart: number,
  charEnd: number,
  explanation: string,
  confidence: 'certain' | 'arguable' = 'certain',
): DeviceInstance {
  return {
    deviceId,
    charStart,
    charEnd,
    explanation,
    detectedBy: 'engine',
    confidence,
  };
}

function detectSoundDevices(analyses: AnalyzedLine[]): DeviceInstance[] {
  const out: DeviceInstance[] = [];

  for (const analysis of analyses) {
    const tokens = analysis.tokens;
    // Line-final rhyme against previous line is handled at block level below.

    // Internal rhymes and their subtypes.
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
        if (classified.score < 0.7 || classified.type === 'forced') continue;

        const spanStart = a.charStart;
        const spanEnd = b.charEnd;
        const cross = classified.isCrossLanguage;

        if (classified.type === 'identical') {
          out.push(instance('identical-rhyme', spanStart, spanEnd,
            `"${a.token}" / "${b.token}" — same phonemes.`));
        } else if (classified.type === 'perfect') {
          out.push(instance('perfect-rhyme', spanStart, spanEnd,
            `"${a.token}" / "${b.token}" — identical rhyme tail, different onset.`));
        } else if (classified.type === 'slant') {
          out.push(instance(
            cross ? 'cross-language-slant' : 'slant-rhyme',
            spanStart, spanEnd,
            `"${a.token}" / "${b.token}" — shared nucleus, coda within tolerance.`,
          ));
        } else if (classified.type === 'para') {
          out.push(instance('para-rhyme', spanStart, spanEnd,
            `"${a.token}" / "${b.token}" — identical coda, different nucleus.`));
        } else if (classified.type === 'multisyllabic') {
          out.push(instance('multisyllabic-rhyme', spanStart, spanEnd,
            `"${a.token}" / "${b.token}" — multisyllabic rhyme tail.`));
        } else if (classified.type === 'assonance-chain') {
          out.push(instance('assonance-chain', spanStart, spanEnd,
            `"${a.token}" / "${b.token}" — matching nucleus sequence.`));
        } else if (classified.type === 'consonance') {
          out.push(instance('consonance', spanStart, spanEnd,
            `"${a.token}" / "${b.token}" — matching consonant skeleton.`));
        }

        if (j < tokens.length - 1) {
          out.push(instance('internal-rhyme', spanStart, spanEnd,
            `Internal rhyme between "${a.token}" and "${b.token}".`));
        }
        if (cross && classified.type === 'slant') {
          // Already emitted as cross-language-slant above.
        } else if (cross && classified.score >= 0.7) {
          out.push(instance('cross-language-slant', spanStart, spanEnd,
            `Cross-language rhyme: ${a.lang} "${a.token}" / ${b.lang} "${b.token}".`));
        }
      }
    }

    // Assonance runs: same nucleus key on 3+ tokens in the line.
    const buckets = new Map<string, TokenAnalysis[]>();
    for (const t of tokens) {
      const pron = selected(t);
      if (!pron) continue;
      const key = denasalizeKey(pron.assonanceKey);
      if (!key || !key.includes('_') && pron.syllables.length < 1) {
        // Single-nucleus tokens still count for assonance.
      }
      if (!key) continue;
      // Use the final nucleus only for assonance runs.
      const lastNucleus = key.split('_').pop()!;
      const list = buckets.get(lastNucleus) ?? [];
      list.push(t);
      buckets.set(lastNucleus, list);
    }
    for (const [nuc, group] of buckets) {
      if (group.length < 3) continue;
      out.push(instance(
        'assonance',
        group[0].charStart,
        group[group.length - 1].charEnd,
        `Assonance on /${nuc}/ across ${group.length} tokens.`,
      ));
    }

    // Alliteration: 3+ consecutive tokens sharing an onset consonant.
    for (let i = 0; i < tokens.length; ) {
      const start = tokens[i];
      const startPron = selected(start);
      const onset = startPron?.syllables[0]?.onset[0]?.ipa;
      if (!onset) {
        i += 1;
        continue;
      }
      let j = i + 1;
      while (j < tokens.length) {
        const p = selected(tokens[j]);
        const o = p?.syllables[0]?.onset[0]?.ipa;
        if (o !== onset) break;
        j += 1;
      }
      if (j - i >= 3) {
        out.push(instance(
          'alliteration',
          tokens[i].charStart,
          tokens[j - 1].charEnd,
          `Alliteration on /${onset}/.`,
        ));
      }
      i = Math.max(i + 1, j);
    }

    // Sibilance: density of sibilant consonants.
    let sibilants = 0;
    let consonants = 0;
    for (const t of tokens) {
      const pron = selected(t);
      if (!pron) continue;
      for (const p of pron.phonemes) {
        if (p.kind !== 'consonant') continue;
        consonants += 1;
        if (['s', 'z', 'ʃ', 'ʒ', 'ʂ'].includes(p.ipa)) sibilants += 1;
      }
    }
    if (consonants >= 6 && sibilants / consonants >= 0.35) {
      out.push(instance(
        'sibilance',
        tokens[0]?.charStart ?? 0,
        tokens[tokens.length - 1]?.charEnd ?? 0,
        `Sibilant density ${(sibilants / consonants).toFixed(2)}.`,
      ));
    }
  }

  // End-rhyme pairs across consecutive lines.
  for (let i = 1; i < analyses.length; i += 1) {
    const prev = analyses[i - 1];
    const curr = analyses[i];
    const a = prev.tokens[prev.tokens.length - 1];
    const b = curr.tokens[curr.tokens.length - 1];
    if (!a || !b) continue;
    const aPron = selected(a);
    const bPron = selected(b);
    if (!aPron || !bPron) continue;
    const classified = classifyPair(aPron, bPron, {
      aText: a.token,
      bText: b.token,
      aLang: a.lang,
      bLang: b.lang,
    });
    if (classified.score < 0.55 || classified.type === 'forced') continue;
    // Spans are local to each line; for block-level we still record them.
    const deviceId =
      classified.type === 'identical' ? 'identical-rhyme'
        : classified.type === 'perfect' ? 'perfect-rhyme'
          : classified.type === 'slant'
            ? (classified.isCrossLanguage ? 'cross-language-slant' : 'slant-rhyme')
            : classified.type === 'para' ? 'para-rhyme'
              : classified.type === 'multisyllabic' ? 'multisyllabic-rhyme'
                : classified.type === 'assonance-chain' ? 'assonance-chain'
                  : 'slant-rhyme';
    out.push(instance(
      deviceId,
      b.charStart,
      b.charEnd,
      `End rhyme with previous line: "${a.token}" / "${b.token}" (${classified.type}).`,
    ));
  }

  return out;
}

function detectStructuralDevices(
  lines: { id: string; text: string }[],
  analyses: AnalyzedLine[],
): DeviceInstance[] {
  const out: DeviceInstance[] = [];
  if (analyses.length === 0) return out;

  // Anaphora: repeated line-initial token sequence across 2+ lines.
  if (analyses.length >= 2) {
    const firstTokens = analyses.map((a) => a.tokens[0]?.token.toLowerCase() ?? '');
    const counts = new Map<string, number[]>();
    firstTokens.forEach((t, i) => {
      if (!t) return;
      const list = counts.get(t) ?? [];
      list.push(i);
      counts.set(t, list);
    });
    for (const [word, idxs] of counts) {
      if (idxs.length < 2) continue;
      for (const i of idxs) {
        const tok = analyses[i].tokens[0];
        if (!tok) continue;
        out.push(instance(
          'anaphora',
          tok.charStart,
          tok.charEnd,
          `Line-initial repetition of "${word}".`,
        ));
      }
    }

    // Epistrophe: repeated line-final token.
    const lastTokens = analyses.map(
      (a) => a.tokens[a.tokens.length - 1]?.token.toLowerCase() ?? '',
    );
    const lastCounts = new Map<string, number[]>();
    lastTokens.forEach((t, i) => {
      if (!t) return;
      const list = lastCounts.get(t) ?? [];
      list.push(i);
      lastCounts.set(t, list);
    });
    for (const [word, idxs] of lastCounts) {
      if (idxs.length < 2) continue;
      for (const i of idxs) {
        const toks = analyses[i].tokens;
        const tok = toks[toks.length - 1];
        if (!tok) continue;
        out.push(instance(
          'epistrophe',
          tok.charStart,
          tok.charEnd,
          `Line-final repetition of "${word}".`,
        ));
      }
    }
  }

  // Symploce: both anaphora and epistrophe on the same pair of lines.
  // Detected implicitly when both fire; we add an explicit tag when a line
  // participates in both.
  const anaphoraLines = new Set(
    out.filter((d) => d.deviceId === 'anaphora').map((d) => d.charStart),
  );
  for (const d of out.filter((x) => x.deviceId === 'epistrophe')) {
    // Cheap approximation: if the line also has anaphora, mark symploce.
    const line = analyses.find(
      (a) => a.tokens.some((t) => t.charStart === d.charStart || t.charEnd === d.charEnd),
    );
    if (!line) continue;
    const first = line.tokens[0];
    if (first && anaphoraLines.has(first.charStart)) {
      out.push(instance(
        'symploce',
        first.charStart,
        d.charEnd,
        'Anaphora and epistrophe on the same line.',
      ));
    }
  }

  // Caesura: mid-line punctuation.
  for (let i = 0; i < lines.length; i += 1) {
    const marks = tokenize(lines[i].text).filter(isCaesuraMark);
    for (const m of marks) {
      // Only count caesuras that are not at the very start or end.
      if (m.charStart === 0 || m.charEnd >= lines[i].text.length) continue;
      out.push(instance(
        'caesura',
        m.charStart,
        m.charEnd,
        'Mid-line break.',
      ));
    }
  }

  // Enjambment heuristic: a line ending on a function word / incomplete phrase.
  const ENJAMB_ENDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'at', 'for',
    'ka', 'ki', 'ke', 'se', 'mein', 'me', 'ko', 'ne', 'aur', 'ya', 'to',
  ]);
  for (let i = 0; i < analyses.length - 1; i += 1) {
    const last = analyses[i].tokens[analyses[i].tokens.length - 1];
    if (!last) continue;
    if (ENJAMB_ENDS.has(last.token.toLowerCase())) {
      out.push(instance(
        'enjambment',
        last.charStart,
        last.charEnd,
        `Line ends on "${last.token}", continuing into the next bar.`,
      ));
    }
  }

  // Code-switching: a line containing both languages.
  for (const analysis of analyses) {
    const langs = new Set(analysis.tokens.map((t) => t.lang));
    if (langs.has('en') && langs.has('hi')) {
      const first = analysis.tokens[0];
      const last = analysis.tokens[analysis.tokens.length - 1];
      if (first && last) {
        out.push(instance(
          'code-switching',
          first.charStart,
          last.charEnd,
          'Line mixes English and Hindi tokens.',
        ));
      }
    }
  }

  return out;
}

/**
 * Detect every Tier 1 device in a block of lines. Spans are relative to each
 * line's own text — the same contract `DeviceInstance` uses in the archive.
 */
export function detectDevices(
  lines: { id: string; text: string }[],
  overrides: Overrides = { lang: {}, pronunciation: {} },
): DeviceInstance[] {
  const analyses = lines.map((l) => analyzeLine(l.text, overrides, l.id));
  return [
    ...detectSoundDevices(analyses),
    ...detectStructuralDevices(lines, analyses),
  ];
}

/** Convenience for a single pasted block. */
export function detectDevicesInText(
  text: string,
  overrides?: Overrides,
): DeviceInstance[] {
  const bars = splitBars(text);
  return detectDevices(
    bars.map((t, i) => ({ id: `bar-${i}`, text: t })),
    overrides,
  );
}
