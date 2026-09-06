// lib/types/reality.ts
export interface RealityEntry {
  id: string;
  createdAt: string;
  /** Unstructured life input: commutes, failed migrations, burnout. */
  body: string;
  tags: string[];               // 'work', 'commute', 'family', 'money', 'ex'
  mood: 'flat' | 'wired' | 'bitter' | 'hollow' | 'defiant';
}

export interface ExtractionResult {
  id: string;
  sourceEntryId: string;
  sourceSpan: [number, number];
  kind: 'metaphor' | 'muhawara' | 'pocket-skeleton' | 'image';
  /** The suggestion itself. */
  output: string;
  /** For muhawara: the idiom, its literal gloss, and its figurative use. */
  gloss?: string;
  literal?: string;
  /** For pocket-skeleton: a template the sequencer can load directly. */
  templateId?: string;
  accepted: boolean;
}
