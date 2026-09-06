// lib/lexicon/tagged.ts
//
// English-side lexicon rows. Unlike Hindi, English needs no hand-authored
// pronunciation — CMUdict already has it — so an English row carries only the
// two things CMUdict cannot give us: a frequency rank (for language-ID priors
// and index trimming) and the tags the Desi/pop-culture toggle filters on.

export interface TaggedEnEntry {
  text: string;
  tags: string[];
  /** Frequency rank; lower is more common. */
  rank: number;
  /** Present only where the word is jargon a reader might not know. */
  gloss?: string;
}

/** Compact authoring row: [text, 'tag|tag', rank, gloss?]. */
export type EnRow =
  | [string, string, number]
  | [string, string, number, string];

export function expandEnRow(row: EnRow): TaggedEnEntry {
  const [text, tags, rank] = row;
  const gloss = row.length === 4 ? row[3] : undefined;
  return {
    text,
    tags: tags.length === 0 ? [] : tags.split('|').map((t) => t.trim()).filter(Boolean),
    rank,
    ...(gloss ? { gloss } : {}),
  };
}

export const expandEnBank = (rows: EnRow[]): TaggedEnEntry[] => rows.map(expandEnRow);
