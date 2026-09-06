// lib/engine/phrase-search.ts
//
// Mosaic and holorime search against the n-gram phrase bank. These two types
// need combinatorial phrase construction rather than an index lookup, which is
// why they run server-side at /api/rhyme and the worker never attempts them
// (Section 3.8).

import type { Lang, Pronunciation, Syllable, Phoneme } from '@/lib/types/phonetics';
import type { RhymeCandidate } from '@/lib/types/rhyme';
import { PHRASE_BANK, type PhraseEntry } from '@/lib/lexicon/phrase-bank';
import { hiHas } from '@/lib/lexicon/hi-roman';
import { g2pEn } from './g2p-en';
import { g2pHi } from './g2p-hi';
import { classifyPair } from './rhyme';
import { assonanceKeyOf, rhymeTailOf } from './syllabify';
import { countedWords, tokenize } from './tokenizer';

/** Concatenate per-word pronunciations into one phrase-level Pronunciation. */
function pronouncePhrase(phrase: string, lang: PhraseEntry['lang']): Pronunciation | null {
  const words = countedWords(tokenize(phrase)).map((t) => t.text);
  if (words.length === 0) return null;

  const phonemes: Phoneme[] = [];
  const syllables: Syllable[] = [];

  for (const word of words) {
    // 'mixed' phrases resolve per word: lexicon membership decides the phonology.
    const wordLang: Lang = lang === 'mixed' ? (hiHas(word) ? 'hi' : 'en') : lang;
    const candidates = wordLang === 'hi' ? g2pHi(word) : g2pEn(word);
    const best = candidates[0];
    if (!best || best.syllables.length === 0) return null;
    phonemes.push(...best.phonemes);
    syllables.push(...best.syllables);
  }

  return {
    phonemes,
    syllables,
    assonanceKey: assonanceKeyOf(syllables),
    rhymeTail: rhymeTailOf(syllables),
    score: 0.8,
    origin: 'rules',
  };
}

export interface PhraseSearchQuery {
  /** The word being rhymed against, for mosaic search. */
  token: string;
  lang: Lang;
  /** Full line, enabling holorime search across the whole bar. */
  line?: string;
  limit?: number;
  minScore?: number;
}

/**
 * Mosaic: a multi-word phrase rhyming a single word ('bottle of' / 'hospital').
 * Holorime: a phrase homophonic with the entire line.
 */
export function searchPhrases(query: PhraseSearchQuery): RhymeCandidate[] {
  const limit = query.limit ?? 24;
  const minScore = query.minScore ?? 0.55;

  const tokenPron = (query.lang === 'hi' ? g2pHi(query.token) : g2pEn(query.token))[0];
  const linePron = query.line ? pronouncePhrase(query.line, 'mixed') : null;

  if (!tokenPron && !linePron) return [];

  const results: RhymeCandidate[] = [];
  const seen = new Set<string>();

  for (const phrase of PHRASE_BANK) {
    if (phrase.wordCount < 2) continue;
    const phrasePron = pronouncePhrase(phrase.text, phrase.lang);
    if (!phrasePron) continue;

    const phraseLang: Lang = phrase.lang === 'hi' ? 'hi' : 'en';
    const syllableCount = phrasePron.syllables.length;

    // --- mosaic: phrase against the single query word ---------------------
    if (tokenPron) {
      const classified = classifyPair(tokenPron, phrasePron, {
        aText: query.token,
        bText: phrase.text,
        aLang: query.lang,
        bLang: phraseLang,
        mosaic: true,
      });
      if (classified.score >= minScore) {
        const key = `mosaic:${phrase.text}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            text: phrase.text,
            lang: phraseLang,
            type: 'mosaic',
            score: classified.score,
            phonemes: phrasePron.phonemes,
            syllableCount,
            isCrossLanguage: classified.isCrossLanguage,
            tags: phrase.tags,
          });
        }
      }
    }

    // --- holorime: phrase against the whole line --------------------------
    if (linePron) {
      const classified = classifyPair(linePron, phrasePron, {
        aText: query.line ?? '',
        bText: phrase.text,
        aLang: query.lang,
        bLang: phraseLang,
        holorime: true,
      });
      // Holorime is a high bar by definition — a whole line has to land.
      if (classified.score >= Math.max(minScore, 0.7)) {
        const key = `holorime:${phrase.text}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            text: phrase.text,
            lang: phraseLang,
            type: 'holorime',
            score: classified.score,
            phonemes: phrasePron.phonemes,
            syllableCount,
            isCrossLanguage: classified.isCrossLanguage,
            tags: phrase.tags,
          });
        }
      }
    }
  }

  results.sort((a, b) => b.score - a.score || a.text.localeCompare(b.text));
  return results.slice(0, limit);
}
