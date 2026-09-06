'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useWorkbenchStore } from '@/lib/store';
import { MOTION } from '@/lib/motion';
import { GridRuler } from './GridRuler';
import { BarRow } from './BarRow';
import { SyllableTray } from './SyllableTray';
import { PlayheadOverlay } from './PlayheadOverlay';
import { EmphasisDial } from './EmphasisDial';
import { PronunciationSwitcher } from '@/components/suggest/PronunciationSwitcher';
import { CIPHER_LINE_ID } from '@/lib/store/sequencer-slice';

export function SequencerBoard() {
  const grid = useWorkbenchStore((s) => s.grids[s.activeGridId]);
  const selectedNodeIds = useWorkbenchStore((s) => s.selectedNodeIds);
  const placeNode = useWorkbenchStore((s) => s.placeNode);
  const returnToTray = useWorkbenchStore((s) => s.returnToTray);
  const selectNodes = useWorkbenchStore((s) => s.selectNodes);
  const analysis = useWorkbenchStore((s) => s.analysis[CIPHER_LINE_ID]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [shakeTray, setShakeTray] = useState(false);

  useEffect(() => {
    void useWorkbenchStore.getState().initWorker();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const selectedNode = useMemo(() => {
    if (!grid || selectedNodeIds.length === 0) return null;
    return grid.nodes[selectedNodeIds[0]] ?? null;
  }, [grid, selectedNodeIds]);

  const selectedToken = useMemo(() => {
    if (!selectedNode || !analysis) return null;
    // Prefer the full word from analysis over the syllable grapheme.
    const byWord = analysis.find((t) =>
      t.candidates[t.selectedCandidate]?.assonanceKey === selectedNode.assonanceKey &&
      t.lang === selectedNode.lang,
    );
    return byWord ?? null;
  }, [selectedNode, analysis]);

  const onSelectNode = useCallback(
    (nodeId: string) => {
      selectNodes([nodeId]);
      const node = grid?.nodes[nodeId];
      if (!node || !analysis) return;
      const token =
        analysis.find(
          (t) =>
            t.candidates[t.selectedCandidate]?.assonanceKey === node.assonanceKey &&
            t.lang === node.lang,
        ) ?? analysis.find((t) => t.token.toLowerCase().includes(node.text.toLowerCase()));
      if (token) {
        const { requestRhymes, matrixFilter } = useWorkbenchStore.getState();
        void requestRhymes(token.token, token.token, matrixFilter);
      }
    },
    [selectNodes, grid, analysis],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) {
      setShakeTray(true);
      window.setTimeout(() => setShakeTray(false), MOTION.shake * 1000);
      return;
    }

    const nodeId = String(active.id);
    const overId = String(over.id);

    if (overId === 'tray') {
      returnToTray(nodeId);
      return;
    }

    if (overId.startsWith('slot-')) {
      const slotIndex = Number(overId.slice('slot-'.length));
      if (Number.isFinite(slotIndex)) placeNode(nodeId, slotIndex);
      return;
    }

    setShakeTray(true);
    window.setTimeout(() => setShakeTray(false), MOTION.shake * 1000);
  };

  if (!grid) return null;

  const activeNode = activeId ? grid.nodes[activeId] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{
        droppable: { strategy: MeasuringStrategy.WhileDragging },
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full flex-col gap-3 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Sequencer</h2>
          <span className="text-[10px] tabular text-zinc-600">
            {grid.tray.length} in tray ·{' '}
            {grid.slots.filter(Boolean).length}/64 placed
          </span>
        </div>

        <GridRuler />

        <div className="relative flex flex-col gap-1">
          <PlayheadOverlay
            bpm={grid.bpm}
            isPlaying={grid.isPlaying}
            slotStridePx={28}
          />
          {Array.from({ length: 4 }, (_, bar) => (
            <BarRow
              key={bar}
              bar={bar}
              slots={grid.slots}
              nodes={grid.nodes}
              selectedNodeIds={selectedNodeIds}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>

        <div className={shakeTray ? 'tray-shake' : undefined}>
          <SyllableTray
            trayIds={grid.tray}
            nodes={grid.nodes}
            selectedNodeIds={selectedNodeIds}
            onSelectNode={onSelectNode}
          />
        </div>

        {selectedNode && selectedNode.slotIndex !== null && (
          <EmphasisDial nodeId={selectedNode.id} value={selectedNode.emphasis} />
        )}

        {selectedToken && (
          <PronunciationSwitcher token={selectedToken} />
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeNode ? (
          <div className="rounded border border-zinc-600 bg-zinc-900 px-1.5 py-1 font-mono text-xs text-zinc-100 shadow-lg">
            {activeNode.text}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
