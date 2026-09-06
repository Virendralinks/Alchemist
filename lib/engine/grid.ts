// lib/engine/grid.ts
//
// Pure positional math for the 64-slot sequencer grid. Not the bilingual
// engine — no phonetics, no tokenizing, no network. `slotIndex` is the single
// source of truth; `bar`, `beat`, and `tick` are always derived (Section 1.1).

export const SLOT_COUNT = 64;

export const toSlotIndex = (bar: number, beat: number, tick: number): number =>
  bar * 16 + beat * 4 + tick;

export const fromSlotIndex = (i: number): { bar: number; beat: number; tick: number } => ({
  bar: (i / 16) | 0,
  beat: ((i % 16) / 4) | 0,
  tick: i % 4,
});

/** Accent is derived, never stored — storing it would let it drift out of sync with position. */
export type SlotAccent = 'downbeat' | 'eighth' | 'syncopated';

export const accentFor = (slotIndex: number): SlotAccent => {
  const tick = slotIndex % 4;
  if (tick === 0) return 'downbeat'; // bright glow
  if (tick === 2) return 'eighth'; // neutral
  return 'syncopated'; // amber
};
