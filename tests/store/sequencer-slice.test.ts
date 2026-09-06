// tests/store/sequencer-slice.test.ts
//
// Asserts the four SequencerGrid invariants (Section 1.4) hold across
// placeNode, moveNode, returnToTray, and loadTemplate:
//
//   1. slots.length === 64 always.
//   2. A node id appears in slots at most once, and never in both slots and tray.
//   3. Every id in slots and tray exists as a key in nodes.
//   4. nodes[id].slotIndex agrees with the node's position in slots.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkbenchStore } from '@/lib/store';
import { DEFAULT_GRID_ID, createEmptyGrid } from '@/lib/store/sequencer-slice';
import { SLOT_COUNT } from '@/lib/engine/grid';
import type { SequencerGrid } from '@/lib/types/sequencer';
import type { LyricNode } from '@/lib/types/lyric';
import type { SequencerTemplate } from '@/lib/types/lineage';

// persist's default storage (window.localStorage) is unavailable under Node;
// zustand degrades gracefully but logs a warning on every set — silence it.
vi.spyOn(console, 'warn').mockImplementation(() => {});

function getActiveGrid(): SequencerGrid {
  const state = useWorkbenchStore.getState();
  const grid = state.grids[state.activeGridId];
  if (!grid) throw new Error('active grid missing');
  return grid;
}

function seedNode(overrides: Partial<LyricNode> = {}): LyricNode {
  return {
    id: overrides.id ?? `node-${Math.random().toString(36).slice(2)}`,
    text: 'la',
    wordId: 'word-1',
    indexInWord: 0,
    lang: 'en',
    langConfidence: 1,
    langLocked: false,
    phonemes: [],
    assonanceKey: '',
    stress: 0,
    slotIndex: null,
    rhymeGroupId: null,
    emphasis: 0.5,
    source: 'typed',
    ...overrides,
  };
}

/** Seeds `count` nodes directly into the active grid's tray, bypassing ingestText. */
function seedTray(count: number): string[] {
  const ids: string[] = [];
  useWorkbenchStore.setState((state) => {
    const grid = state.grids[state.activeGridId];
    for (let i = 0; i < count; i++) {
      const node = seedNode({ id: `n${i}-${Math.random().toString(36).slice(2)}`, text: `s${i}` });
      grid.nodes[node.id] = node;
      grid.tray.push(node.id);
      ids.push(node.id);
    }
  });
  return ids;
}

function assertInvariants(grid: SequencerGrid) {
  // 1. slots.length === 64 always.
  expect(grid.slots).toHaveLength(SLOT_COUNT);

  const idsInSlots = grid.slots.filter((id): id is string => id !== null);

  // 2. A node id appears in slots at most once, and never in both slots and tray.
  const slotIdCounts = new Map<string, number>();
  for (const id of idsInSlots) {
    slotIdCounts.set(id, (slotIdCounts.get(id) ?? 0) + 1);
  }
  for (const [id, count] of slotIdCounts) {
    expect(count, `node ${id} appears in slots more than once`).toBe(1);
  }
  const traySet = new Set(grid.tray);
  for (const id of idsInSlots) {
    expect(traySet.has(id), `node ${id} is in both slots and tray`).toBe(false);
  }

  // 3. Every id in slots and tray exists as a key in nodes.
  for (const id of idsInSlots) {
    expect(grid.nodes[id], `slot-referenced node ${id} missing from nodes`).toBeDefined();
  }
  for (const id of grid.tray) {
    expect(grid.nodes[id], `tray-referenced node ${id} missing from nodes`).toBeDefined();
  }

  // 4. nodes[id].slotIndex agrees with the node's position in slots.
  grid.slots.forEach((id, slotIndex) => {
    if (id === null) return;
    expect(grid.nodes[id].slotIndex).toBe(slotIndex);
  });
  for (const id of grid.tray) {
    expect(grid.nodes[id].slotIndex).toBeNull();
  }
}

beforeEach(() => {
  useWorkbenchStore.setState({
    grids: { [DEFAULT_GRID_ID]: createEmptyGrid(DEFAULT_GRID_ID, 'Test Grid') },
    activeGridId: DEFAULT_GRID_ID,
    selectedNodeIds: [],
  });
});

describe('SequencerGrid invariants — placeNode', () => {
  it('holds after placing a single node from the tray into a slot', () => {
    const [nodeId] = seedTray(1);
    useWorkbenchStore.getState().placeNode(nodeId, 5);

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.slots[5]).toBe(nodeId);
    expect(grid.tray).not.toContain(nodeId);
  });

  it('holds when placing a second node into an already-occupied slot (bumps the occupant to the tray)', () => {
    const [nodeA, nodeB] = seedTray(2);
    useWorkbenchStore.getState().placeNode(nodeA, 10);
    useWorkbenchStore.getState().placeNode(nodeB, 10);

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.slots[10]).toBe(nodeB);
    expect(grid.tray).toContain(nodeA);
    expect(grid.nodes[nodeA].slotIndex).toBeNull();
  });

  it('holds across every slot index in the 64-slot grid', () => {
    const ids = seedTray(SLOT_COUNT);
    ids.forEach((id, i) => useWorkbenchStore.getState().placeNode(id, i));

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.tray).toHaveLength(0);
    expect(grid.slots.every((id) => id !== null)).toBe(true);
  });

  it('ignores an out-of-range slotIndex without corrupting state', () => {
    const [nodeId] = seedTray(1);
    useWorkbenchStore.getState().placeNode(nodeId, 999);

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.tray).toContain(nodeId);
  });

  it('is idempotent when re-placing a node into the slot it already occupies', () => {
    const [nodeId] = seedTray(1);
    useWorkbenchStore.getState().placeNode(nodeId, 3);
    useWorkbenchStore.getState().placeNode(nodeId, 3);

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.slots[3]).toBe(nodeId);
    expect(grid.slots.filter((id) => id === nodeId)).toHaveLength(1);
  });
});

describe('SequencerGrid invariants — moveNode', () => {
  it('holds when moving a placed node to an empty slot', () => {
    const [nodeId] = seedTray(1);
    useWorkbenchStore.getState().placeNode(nodeId, 0);
    useWorkbenchStore.getState().moveNode(nodeId, 20);

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.slots[0]).toBeNull();
    expect(grid.slots[20]).toBe(nodeId);
  });

  it('holds when moving a node directly into a slot occupied by another node', () => {
    const [nodeA, nodeB] = seedTray(2);
    useWorkbenchStore.getState().placeNode(nodeA, 1);
    useWorkbenchStore.getState().placeNode(nodeB, 2);
    useWorkbenchStore.getState().moveNode(nodeA, 2);

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.slots[2]).toBe(nodeA);
    expect(grid.tray).toContain(nodeB);
  });

  it('holds when moving a node from the tray directly into a slot (moveNode delegates to placeNode)', () => {
    const [nodeId] = seedTray(1);
    useWorkbenchStore.getState().moveNode(nodeId, 42);

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.slots[42]).toBe(nodeId);
  });

  it('holds across a long chain of moves for the same node', () => {
    const [nodeId] = seedTray(1);
    const positions = [0, 15, 30, 45, 63, 1, 2, 3];
    for (const pos of positions) {
      useWorkbenchStore.getState().moveNode(nodeId, pos);
      assertInvariants(getActiveGrid());
    }
    expect(getActiveGrid().slots[positions.at(-1)!]).toBe(nodeId);
  });
});

describe('SequencerGrid invariants — returnToTray', () => {
  it('holds after returning a placed node to the tray', () => {
    const [nodeId] = seedTray(1);
    useWorkbenchStore.getState().placeNode(nodeId, 8);
    useWorkbenchStore.getState().returnToTray(nodeId);

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.slots[8]).toBeNull();
    expect(grid.tray).toContain(nodeId);
    expect(grid.nodes[nodeId].slotIndex).toBeNull();
  });

  it('is a no-op (invariant-preserving) when returning a node already in the tray', () => {
    const [nodeId] = seedTray(1);
    useWorkbenchStore.getState().returnToTray(nodeId);
    useWorkbenchStore.getState().returnToTray(nodeId);

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.tray.filter((id) => id === nodeId)).toHaveLength(1);
  });

  it('holds when returning one of several placed nodes, leaving the others untouched', () => {
    const [nodeA, nodeB, nodeC] = seedTray(3);
    useWorkbenchStore.getState().placeNode(nodeA, 0);
    useWorkbenchStore.getState().placeNode(nodeB, 1);
    useWorkbenchStore.getState().placeNode(nodeC, 2);
    useWorkbenchStore.getState().returnToTray(nodeB);

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.slots[0]).toBe(nodeA);
    expect(grid.slots[1]).toBeNull();
    expect(grid.slots[2]).toBe(nodeC);
    expect(grid.tray).toEqual([nodeB]);
  });
});

describe('SequencerGrid invariants — loadTemplate', () => {
  const template: SequencerTemplate = {
    id: 'tmpl-1',
    name: 'Test Template',
    bpm: 96,
    placements: [
      { slotIndex: 0, text: 'yo', assonanceKey: 'oʊ', emphasis: 0.8 },
      { slotIndex: 4, text: 'flow', assonanceKey: 'oʊ', emphasis: 0.6 },
      { slotIndex: 8, text: 'go', assonanceKey: 'oʊ', emphasis: 0.9 },
    ],
  };

  it('holds after loading a template into a fresh grid', () => {
    useWorkbenchStore.getState().loadTemplate(template, { artistId: 'a1', techniqueId: 't1' });

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(grid.tray).toHaveLength(0);
    expect(Object.keys(grid.nodes)).toHaveLength(3);
    expect(grid.bpm).toBe(96);
    expect(grid.activeTemplateId).toBe('tmpl-1');
    expect(grid.loadedFrom).toEqual({ artistId: 'a1', techniqueId: 't1' });
  });

  it('holds after loading a template into a grid that already has placed nodes and tray items (full reset)', () => {
    const [nodeA, nodeB] = seedTray(2);
    useWorkbenchStore.getState().placeNode(nodeA, 50);

    useWorkbenchStore.getState().loadTemplate(template, { artistId: 'a2', techniqueId: 't2' });

    const grid = getActiveGrid();
    assertInvariants(grid);
    // The pre-existing nodes are gone entirely — loadTemplate is a full reset.
    expect(grid.nodes[nodeA]).toBeUndefined();
    expect(grid.nodes[nodeB]).toBeUndefined();
    expect(grid.tray).toHaveLength(0);
    expect(Object.keys(grid.nodes)).toHaveLength(3);
  });

  it('ignores out-of-range placements in the template without corrupting state', () => {
    const badTemplate: SequencerTemplate = {
      id: 'tmpl-bad',
      name: 'Bad Template',
      bpm: 100,
      placements: [
        { slotIndex: -1, text: 'bad', assonanceKey: '', emphasis: 0.5 },
        { slotIndex: 64, text: 'bad2', assonanceKey: '', emphasis: 0.5 },
        { slotIndex: 30, text: 'good', assonanceKey: '', emphasis: 0.5 },
      ],
    };
    useWorkbenchStore.getState().loadTemplate(badTemplate, { artistId: 'a3', techniqueId: 't3' });

    const grid = getActiveGrid();
    assertInvariants(grid);
    expect(Object.keys(grid.nodes)).toHaveLength(1);
    expect(grid.slots[30]).toBeDefined();
  });

  it('holds when placeNode/moveNode/returnToTray are exercised after a template load', () => {
    useWorkbenchStore.getState().loadTemplate(template, { artistId: 'a4', techniqueId: 't4' });
    const grid1 = getActiveGrid();
    const placedId = grid1.slots[0]!;

    useWorkbenchStore.getState().moveNode(placedId, 12);
    assertInvariants(getActiveGrid());

    useWorkbenchStore.getState().returnToTray(placedId);
    assertInvariants(getActiveGrid());
    expect(getActiveGrid().tray).toContain(placedId);
  });
});
