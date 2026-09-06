'use client';

import { useDroppable } from '@dnd-kit/core';
import { useMemo } from 'react';
import type { LyricNode } from '@/lib/types/lyric';
import { cn } from '@/lib/utils';
import { SyllableChip } from './SyllableChip';

interface SyllableTrayProps {
  trayIds: string[];
  nodes: Record<string, LyricNode>;
  selectedNodeIds: string[];
  onSelectNode?: (nodeId: string) => void;
}

export function SyllableTray({
  trayIds,
  nodes,
  selectedNodeIds,
  onSelectNode,
}: SyllableTrayProps) {
  const droppable = useMemo(() => ({ id: 'tray', data: { type: 'tray' as const } }), []);
  const { isOver, setNodeRef } = useDroppable(droppable);
  const selected = new Set(selectedNodeIds);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[3.5rem] rounded border border-dashed border-zinc-800/50 bg-zinc-950/40 p-2',
        isOver && 'border-zinc-500/50 bg-zinc-900/60',
      )}
    >
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
        Tray
      </div>
      {trayIds.length === 0 ? (
        <p className="font-mono text-xs text-zinc-600">
          Type in the cipher pane — syllables land here.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {trayIds.map((id) => {
            const node = nodes[id];
            if (!node) return null;
            return (
              <SyllableChip
                key={id}
                node={node}
                selected={selected.has(id)}
                onSelect={onSelectNode}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
