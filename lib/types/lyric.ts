// lib/types/lyric.ts
import type { Lang, Phoneme, Stress } from './phonetics';

export interface LyricNode {
  id: string;                   // nanoid; stable dnd-kit draggable id
  text: string;                 // 'Da'
  wordId: string;               // 'Data' -> its two nodes share this
  indexInWord: number;
  lang: Lang;
  langConfidence: number;
  langLocked: boolean;
  phonemes: Phoneme[];
  assonanceKey: string;
  stress: Stress;
  /** null = still in the tray, not yet placed on the grid. */
  slotIndex: number | null;
  /** Rhyme-scheme colour coding; assigned by the engine, overridable by hand. */
  rhymeGroupId: string | null;
  /** 0-1 velocity. Drives glow intensity — a placed syllable can be hit soft or hard. */
  emphasis: number;
  source: 'typed' | 'template' | 'llm';
}
