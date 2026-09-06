// lib/types/sequencer.ts
import type { LyricNode } from './lyric';

export interface SequencerGrid {
  id: string;
  title: string;
  bpm: number;
  bars: 4;
  beatsPerBar: 4;
  ticksPerBeat: 4;              // literal types: the grid is always 64 slots
  /** Length 64. Index is slotIndex, value is a LyricNode id or null. */
  slots: (string | null)[];
  nodes: Record<string, LyricNode>;
  /** Ordered ids of syllables not yet placed. */
  tray: string[];
  activeTemplateId: string | null;
  playheadSlot: number | null;
  isPlaying: boolean;
  /** Set when a Lineage technique template was loaded, for the "clear template" affordance. */
  loadedFrom: { artistId: string; techniqueId: string } | null;
}

/**
 * Invariants the store must maintain, stated so the agent can assert them in tests (Section 1.4):
 *
 * 1. `slots.length === 64` always.
 * 2. A node id appears in `slots` at most once, and never in both `slots` and `tray`.
 * 3. Every id in `slots` and `tray` exists as a key in `nodes`.
 * 4. `nodes[id].slotIndex` agrees with the node's position in `slots`.
 */
