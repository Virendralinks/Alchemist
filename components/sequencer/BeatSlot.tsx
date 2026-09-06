'use client';

import { useDroppable } from '@dnd-kit/core';
import { useState, useEffect, useMemo } from 'react';
import { accentFor } from '@/lib/engine/grid';
import type { LyricNode } from '@/lib/types/lyric';
import { cn } from '@/lib/utils';
import { MOTION } from '@/lib/motion';
import { SyllableChip } from './SyllableChip';

interface BeatSlotProps {
  slotIndex: number;
  node: LyricNode | null;
  selected?: boolean;
  onSelectNode?: (nodeId: string) => void;
}

export function BeatSlot({ slotIndex, node, selected, onSelectNode }: BeatSlotProps) {
  const accent = accentFor(slotIndex);
  const droppable = useMemo(
    () => ({ id: `slot-${slotIndex}`, data: { type: 'slot' as const, slotIndex } }),
    [slotIndex],
  );
  const { isOver, setNodeRef } = useDroppable(droppable);
  const [flash, setFlash] = useState(false);

  const nodeId = node?.id;
  useEffect(() => {
    if (!nodeId) return;
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), MOTION.drop * 1000);
    return () => window.clearTimeout(t);
  }, [nodeId]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative flex h-12 items-center justify-center rounded-sm border font-mono',
        'border-zinc-800/50 bg-zinc-900/60',
        'transition-colors duration-150',
        accent === 'downbeat' && 'shadow-[inset_0_0_12px_rgba(16,185,129,0.12)]',
        accent === 'syncopated' && 'border-amber-500/20',
        isOver && 'border-zinc-500/60 bg-zinc-800/80',
        flash && 'bg-emerald-500/20',
      )}
    >
      {node ? (
        <SyllableChip
          node={node}
          selected={selected}
          onSelect={onSelectNode}
        />
      ) : (
        <span
          className={cn(
            'text-[9px] tabular text-zinc-700',
            accent === 'downbeat' && 'text-emerald-900',
            accent === 'syncopated' && 'text-amber-900/60',
          )}
        >
          {slotIndex % 4 === 0 ? '·' : ''}
        </span>
      )}
    </div>
  );
}
