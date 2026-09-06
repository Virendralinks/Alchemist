// lib/types/lineage.ts
import type { Node, Edge } from '@xyflow/react';

export interface SequencerTemplate {
  id: string;
  name: string;
  bpm: number;
  placements: {
    slotIndex: number;
    text: string;
    assonanceKey: string;
    emphasis: number;
  }[];
}

export interface TechniqueModule {
  id: string;
  name: string;                 // 'Mosaic Rhyme', 'Soul-Sample Cadence'
  description: string;
  /** What to listen for; shown in the drawer before the user loads it. */
  listenFor: string;
  template: SequencerTemplate;  // loaded straight into SequencerGrid
}

export interface LineageArtist {
  id: string;
  name: string;
  era: '80s' | '90s' | '2000s' | '2010s' | '2020s';
  yearsActive: [number, number | null];
  region: string;
  /** One line: what this artist structurally changed about rap. */
  thesis: string;
  influencedBy: string[];       // artist ids -> React Flow edges
  techniques: TechniqueModule[];
  archiveArtistId: string | null;
  accentColor: string;          // Tailwind token, drives node border + glow
}

/**
 * React Flow generics, so node.data is typed at every callsite. `Node`'s data
 * generic requires `Record<string, unknown>`; the intersection satisfies that
 * without changing `LineageArtist`'s own shape.
 */
export type LineageFlowNode = Node<LineageArtist & Record<string, unknown>, 'artistNode'>;
export type LineageFlowEdge = Edge<{ relation: 'direct' | 'sample' | 'regional' }>;
