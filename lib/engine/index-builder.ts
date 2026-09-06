// lib/engine/index-builder.ts
//
// BUILD TIME ONLY. Walks the Hindi lexicon + a frequency-trimmed slice of
// CMUdict, emits a RhymeIndex JSON the worker loads at INIT. Not imported by
// any runtime module except the build script and the budget tests.

import type { Stress } from '@/lib/types/phonetics';
import type { Lexeme, RhymeIndex } from '@/lib/types/rhyme';
import { HI_LEXICON } from '@/lib/lexicon/hi-roman';
import { expandEnBank } from '@/lib/lexicon/tagged';
import { EN_COMMON_ROWS } from '@/lib/lexicon/en-common';
import { NCR_EN_ROWS } from '@/lib/lexicon/ncr-slang';
import { loadCmudict } from '@/lib/lexicon/cmudict-loader';
import { arpabetToPhonemes, parseIpa } from './ipa';
import { syllabify, assonanceKeyOf, rhymeTailOf } from './syllabify';

export const INDEX_VERSION = 1;

/** Soft cap. If we exceed this, trim by frequency rank, never by dropping a language. */
export const MAX_LEXEMES = 12_000;

export interface BuildIndexOptions {
  /** Max English lexemes from CMUdict after the tagged banks. */
  maxEnglish?: number;
  /** Max Hindi lexemes. */
  maxHindi?: number;
}

function stressOf(syllables: { stress: Stress }[]): Stress[] {
  return syllables.map((s) => s.stress);
}

function fromHi(): Lexeme[] {
  const out: Lexeme[] = [];
  for (const lex of HI_LEXICON) {
    const phonemes = parseIpa(lex.ipa);
    const syllables = syllabify(phonemes, 'hi', { token: lex.canonical });
    if (syllables.length === 0) continue;
    out.push({
      text: lex.canonical,
      lang: 'hi',
      ipa: lex.ipa,
      assonanceKey: assonanceKeyOf(syllables),
      rhymeTail: rhymeTailOf(syllables),
      syllableCount: syllables.length,
      stress: stressOf(syllables),
      gloss: lex.gloss,
      tags: lex.tags,
      rank: lex.rank,
    });
    // Alternates become their own searchable lexemes so both readings rhyme.
    for (const alt of lex.alternates ?? []) {
      const altPh = parseIpa(alt.ipa);
      const altSyl = syllabify(altPh, 'hi', { token: lex.canonical });
      if (altSyl.length === 0) continue;
      out.push({
        text: lex.canonical,
        lang: 'hi',
        ipa: alt.ipa,
        assonanceKey: assonanceKeyOf(altSyl),
        rhymeTail: rhymeTailOf(altSyl),
        syllableCount: altSyl.length,
        stress: stressOf(altSyl),
        gloss: alt.gloss,
        tags: lex.tags,
        rank: lex.rank + 1,
      });
    }
  }
  return out;
}

function fromEnglish(maxEnglish: number): Lexeme[] {
  const tagged = [
    ...expandEnBank(EN_COMMON_ROWS),
    ...expandEnBank(NCR_EN_ROWS),
  ];
  // Dedup by text, keeping the best (lowest) rank and merging tags.
  const byText = new Map<string, { rank: number; tags: Set<string>; gloss?: string }>();
  for (const entry of tagged) {
    const key = entry.text.toLowerCase();
    const existing = byText.get(key);
    if (!existing) {
      byText.set(key, {
        rank: entry.rank,
        tags: new Set(entry.tags),
        gloss: entry.gloss,
      });
    } else {
      existing.rank = Math.min(existing.rank, entry.rank);
      for (const t of entry.tags) existing.tags.add(t);
      if (!existing.gloss && entry.gloss) existing.gloss = entry.gloss;
    }
  }

  const dict = loadCmudict();
  const out: Lexeme[] = [];

  // Prefer tagged words first (they carry the Desi/tech filters), then fill
  // from CMUdict by the common-list ranking until the budget is hit.
  const ordered = Array.from(byText.entries()).sort((a, b) => a[1].rank - b[1].rank);

  for (const [text, meta] of ordered) {
    if (out.length >= maxEnglish) break;
    const entries = dict.get(text);
    if (!entries || entries.length === 0) continue;
    // Primary pronunciation only — variants would balloon the index.
    const phonemes = arpabetToPhonemes(entries[0].arpabet);
    const syllables = syllabify(phonemes, 'en', { token: text });
    if (syllables.length === 0) continue;
    out.push({
      text,
      lang: 'en',
      ipa: phonemes.map((p) => p.ipa).join(''),
      assonanceKey: assonanceKeyOf(syllables),
      rhymeTail: rhymeTailOf(syllables),
      syllableCount: syllables.length,
      stress: stressOf(syllables),
      gloss: meta.gloss,
      tags: Array.from(meta.tags),
      rank: meta.rank,
    });
  }

  return out;
}

function buildMaps(lexemes: Lexeme[]): Pick<RhymeIndex, 'byNucleusSeq' | 'byRhymeTail' | 'byTag'> {
  const byNucleusSeq: Record<string, number[]> = {};
  const byRhymeTail: Record<string, number[]> = {};
  const byTag: Record<string, number[]> = {};

  lexemes.forEach((lex, id) => {
    (byNucleusSeq[lex.assonanceKey] ??= []).push(id);
    (byRhymeTail[lex.rhymeTail] ??= []).push(id);
    for (const tag of lex.tags) {
      (byTag[tag] ??= []).push(id);
    }
  });

  return { byNucleusSeq, byRhymeTail, byTag };
}

/**
 * Build the RhymeIndex. Trims by frequency rank when over budget, keeping both
 * languages — a smaller bilingual index beats a large monolingual one.
 */
export function buildRhymeIndex(options: BuildIndexOptions = {}): RhymeIndex {
  const maxEnglish = options.maxEnglish ?? 8_000;
  const maxHindi = options.maxHindi ?? 4_000;

  let hindi = fromHi().sort((a, b) => a.rank - b.rank);
  const english = fromEnglish(maxEnglish).sort((a, b) => a.rank - b.rank);

  if (hindi.length > maxHindi) hindi = hindi.slice(0, maxHindi);

  let lexemes = [...hindi, ...english];
  if (lexemes.length > MAX_LEXEMES) {
    lexemes = lexemes.sort((a, b) => a.rank - b.rank).slice(0, MAX_LEXEMES);
  }

  const maps = buildMaps(lexemes);
  return {
    lexemes,
    ...maps,
    version: INDEX_VERSION,
  };
}

export function indexStats(index: RhymeIndex): {
  total: number;
  en: number;
  hi: number;
  nucleusKeys: number;
  tailKeys: number;
} {
  let en = 0;
  let hi = 0;
  for (const lex of index.lexemes) {
    if (lex.lang === 'en') en += 1;
    else hi += 1;
  }
  return {
    total: index.lexemes.length,
    en,
    hi,
    nucleusKeys: Object.keys(index.byNucleusSeq).length,
    tailKeys: Object.keys(index.byRhymeTail).length,
  };
}
