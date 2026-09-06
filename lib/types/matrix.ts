// lib/types/matrix.ts
import type { Lang } from './phonetics';

export interface MatrixFilter {
  langs: Lang[];
  /** The Desi/pop-culture toggle from the PRD, generalized to tag filters. */
  tags: string[];               // 'ncr', 'tech', 'filmi', 'slang'
  minScore: number;
  syllableCount: number | null;
  crossLanguageOnly: boolean;
}

export interface AssonanceColumn {
  /** The vowel structure this column represents, e.g. 'aː_iː'. */
  key: string;
  /** Human-readable, e.g. 'AA - EE'. */
  label: string;
  entries: { text: string; lang: Lang; tags: string[]; score: number }[];
}
