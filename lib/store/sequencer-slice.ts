// lib/store/sequencer-slice.ts
import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';
import type { WorkbenchStore } from './index';
import type { SequencerGrid } from '@/lib/types/sequencer';
import type { LyricNode } from '@/lib/types/lyric';
import type { SequencerTemplate } from '@/lib/types/lineage';
import type { TokenAnalysis } from '@/lib/types/phonetics';
import { SLOT_COUNT } from '@/lib/engine/grid';

/** Stable line id for the cipher pane — shared with the engine slice. */
export const CIPHER_LINE_ID = 'cipher';

export interface SequencerSlice {
  grids: Record<string, SequencerGrid>;
  activeGridId: string;
  selectedNodeIds: string[];

  /** Fire-and-forget: routes through the engine slice so CMUdict stays in the worker. */
  ingestText(text: string): void;
  /** Replace tray chips with syllabified nodes from a Phase-2 TokenAnalysis[]. */
  ingestAnalysis(tokens: TokenAnalysis[]): void;
  placeNode(nodeId: string, slotIndex: number): void;
  moveNode(nodeId: string, toSlotIndex: number): void;
  returnToTray(nodeId: string): void;
  clearSlot(slotIndex: number): void;
  setEmphasis(nodeId: string, emphasis: number): void;
  setRhymeGroup(nodeId: string, groupId: string | null): void;
  selectNodes(nodeIds: string[]): void;
  loadTemplate(template: SequencerTemplate, from: { artistId: string; techniqueId: string }): void;
  setBpm(bpm: number): void;
  transport: {
    play(): void;
    pause(): void;
    stop(): void;
    setPlayhead(slot: number | null): void;
  };
}

export const DEFAULT_GRID_ID = 'default';

export function createEmptyGrid(id: string, title: string): SequencerGrid {
  return {
    id,
    title,
    bpm: 90,
    bars: 4,
    beatsPerBar: 4,
    ticksPerBeat: 4,
    slots: Array.from({ length: SLOT_COUNT }, () => null),
    nodes: {},
    tray: [],
    activeTemplateId: null,
    playheadSlot: null,
    isPlaying: false,
    loadedFrom: null,
  };
}

function createLyricNode(text: string, overrides: Partial<LyricNode> = {}): LyricNode {
  return {
    id: nanoid(),
    text,
    wordId: nanoid(),
    indexInWord: 0,
    lang: 'en',
    langConfidence: 0,
    langLocked: false,
    phonemes: [],
    assonanceKey: '',
    stress: 0,
    slotIndex: null,
    rhymeGroupId: null,
    emphasis: 0.7,
    source: 'typed',
    ...overrides,
  };
}

export const createSequencerSlice: StateCreator<
  WorkbenchStore,
  [['zustand/immer', never]],
  [],
  SequencerSlice
> = (set, get) => ({
  grids: { [DEFAULT_GRID_ID]: createEmptyGrid(DEFAULT_GRID_ID, 'Untitled Bar') },
  activeGridId: DEFAULT_GRID_ID,
  selectedNodeIds: [],

  ingestText: (text) => {
    void get().analyzeLine(CIPHER_LINE_ID, text);
  },

  ingestAnalysis: (tokens) =>
    set((state) => {
      const grid = state.grids[state.activeGridId];
      if (!grid) return;

      // Drop unplaced typed chips from a previous analyze pass; keep anything
      // already on the grid and any non-typed material (templates).
      const retainedTray: string[] = [];
      let removedTyped = false;
      for (const id of grid.tray) {
        const node = grid.nodes[id];
        if (!node) continue;
        if (node.source === 'typed') {
          delete grid.nodes[id];
          removedTyped = true;
          continue;
        }
        retainedTray.push(id);
      }

      if (tokens.length === 0 && !removedTyped) {
        // Nothing to do — skip the rest so an empty cipher on first paint
        // does not publish a new grid identity.
        return;
      }

      grid.tray = retainedTray;

      for (const token of tokens) {
        const pron = token.candidates[token.selectedCandidate];
        if (!pron || pron.syllables.length === 0) continue;
        const wordId = nanoid();
        pron.syllables.forEach((syl, indexInWord) => {
          const text =
            syl.graphemes.trim().length > 0
              ? syl.graphemes
              : token.token.slice(
                  0,
                  Math.max(1, Math.ceil(token.token.length / pron.syllables.length)),
                );
          const node = createLyricNode(text, {
            wordId,
            indexInWord,
            lang: token.lang,
            langConfidence: token.langConfidence,
            langLocked: token.langLocked,
            phonemes: [...syl.onset, syl.nucleus, ...syl.coda],
            assonanceKey: pron.assonanceKey,
            stress: syl.stress,
            source: 'typed',
          });
          grid.nodes[node.id] = node;
          grid.tray.push(node.id);
        });
      }
    }),

  selectNodes: (nodeIds) =>
    set((state) => {
      state.selectedNodeIds = nodeIds;
    }),

  placeNode: (nodeId, slotIndex) =>
    set((state) => {
      const grid = state.grids[state.activeGridId];
      if (!grid) return;
      if (slotIndex < 0 || slotIndex >= SLOT_COUNT) return;
      const node = grid.nodes[nodeId];
      if (!node) return;

      // A slot holds at most one node — bump whatever is already there back to the tray.
      const occupantId = grid.slots[slotIndex];
      if (occupantId && occupantId !== nodeId) {
        grid.slots[slotIndex] = null;
        const occupant = grid.nodes[occupantId];
        if (occupant) {
          occupant.slotIndex = null;
          if (!grid.tray.includes(occupantId)) grid.tray.push(occupantId);
        }
      }

      // Detach the node from wherever it currently lives (tray or another slot).
      if (node.slotIndex !== null && node.slotIndex !== slotIndex) {
        grid.slots[node.slotIndex] = null;
      }
      grid.tray = grid.tray.filter((id) => id !== nodeId);

      grid.slots[slotIndex] = nodeId;
      node.slotIndex = slotIndex;
    }),

  moveNode: (nodeId, toSlotIndex) => {
    get().placeNode(nodeId, toSlotIndex);
  },

  returnToTray: (nodeId) =>
    set((state) => {
      const grid = state.grids[state.activeGridId];
      if (!grid) return;
      const node = grid.nodes[nodeId];
      if (!node) return;
      if (node.slotIndex !== null) {
        grid.slots[node.slotIndex] = null;
        node.slotIndex = null;
      }
      if (!grid.tray.includes(nodeId)) grid.tray.push(nodeId);
    }),

  clearSlot: (slotIndex) =>
    set((state) => {
      const grid = state.grids[state.activeGridId];
      if (!grid) return;
      if (slotIndex < 0 || slotIndex >= SLOT_COUNT) return;
      const occupantId = grid.slots[slotIndex];
      if (!occupantId) return;
      grid.slots[slotIndex] = null;
      const node = grid.nodes[occupantId];
      if (node) {
        node.slotIndex = null;
        if (!grid.tray.includes(occupantId)) grid.tray.push(occupantId);
      }
    }),

  setEmphasis: (nodeId, emphasis) =>
    set((state) => {
      const grid = state.grids[state.activeGridId];
      const node = grid?.nodes[nodeId];
      if (node) node.emphasis = Math.min(1, Math.max(0, emphasis));
    }),

  setRhymeGroup: (nodeId, groupId) =>
    set((state) => {
      const grid = state.grids[state.activeGridId];
      const node = grid?.nodes[nodeId];
      if (node) node.rhymeGroupId = groupId;
    }),

  loadTemplate: (template, from) =>
    set((state) => {
      const grid = state.grids[state.activeGridId];
      if (!grid) return;

      grid.slots = Array.from({ length: SLOT_COUNT }, () => null);
      grid.nodes = {};
      grid.tray = [];
      grid.bpm = template.bpm;
      grid.activeTemplateId = template.id;
      grid.loadedFrom = from;

      for (const placement of template.placements) {
        if (placement.slotIndex < 0 || placement.slotIndex >= SLOT_COUNT) continue;
        const node = createLyricNode(placement.text, {
          assonanceKey: placement.assonanceKey,
          emphasis: placement.emphasis,
          slotIndex: placement.slotIndex,
          langConfidence: 1,
          source: 'template',
        });
        grid.nodes[node.id] = node;
        grid.slots[placement.slotIndex] = node.id;
      }
    }),

  setBpm: (bpm) =>
    set((state) => {
      const grid = state.grids[state.activeGridId];
      if (grid) grid.bpm = bpm;
    }),

  transport: {
    play: () =>
      set((state) => {
        const grid = state.grids[state.activeGridId];
        if (grid) grid.isPlaying = true;
      }),
    pause: () =>
      set((state) => {
        const grid = state.grids[state.activeGridId];
        if (grid) grid.isPlaying = false;
      }),
    stop: () =>
      set((state) => {
        const grid = state.grids[state.activeGridId];
        if (grid) {
          grid.isPlaying = false;
          grid.playheadSlot = null;
        }
      }),
    setPlayhead: (slot) =>
      set((state) => {
        const grid = state.grids[state.activeGridId];
        if (grid) grid.playheadSlot = slot;
      }),
  },
});
