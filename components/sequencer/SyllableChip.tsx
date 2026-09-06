'use client';

import { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { LyricNode } from '@/lib/types/lyric';
import { accentFor } from '@/lib/engine/grid';
import { useWorkbenchStore } from '@/lib/store';
import { CIPHER_LINE_ID } from '@/lib/store/sequencer-slice';
import { cn } from '@/lib/utils';
import { LangBadge } from '@/components/suggest/LangBadge';

interface SyllableChipProps {
  node: LyricNode;
  selected?: boolean;
  onSelect?: (nodeId: string) => void;
}

export function SyllableChip({ node, selected, onSelect }: SyllableChipProps) {
  const analysis = useWorkbenchStore((s) => s.analysis[CIPHER_LINE_ID]);
  const data = useMemo(
    () => ({ type: 'syllable' as const, nodeId: node.id, fromSlot: node.slotIndex }),
    [node.id, node.slotIndex],
  );
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: node.id,
    data,
  });

  /** Override key must be the full word, not the syllable grapheme. */
  const sourceToken = useMemo(() => {
    const hit = analysis?.find(
      (t) =>
        t.lang === node.lang &&
        t.candidates[t.selectedCandidate]?.assonanceKey === node.assonanceKey,
    );
    return hit?.token;
  }, [analysis, node.lang, node.assonanceKey]);

  const accent = node.slotIndex !== null ? accentFor(node.slotIndex) : null;
  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelect?.(node.id)}
      className={cn(
        'group relative flex min-w-[2.25rem] items-center gap-1 rounded border px-1.5 py-1 font-mono text-xs',
        'bg-zinc-900 text-zinc-100 border-zinc-800/50',
        'transition-transform duration-90 ease-out',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500',
        accent === 'downbeat' &&
          'text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
        accent === 'syncopated' && 'text-amber-400 border-amber-500/40',
        selected && 'ring-1 ring-zinc-400/60',
        isDragging && 'cursor-grabbing scale-[1.06] opacity-90 shadow-lg',
        !isDragging && 'cursor-grab',
      )}
    >
      <span className="tabular">{node.text}</span>
      <LangBadge
        lang={node.lang}
        token={sourceToken}
        confidence={node.langConfidence}
        locked={node.langLocked}
        compact
      />
    </div>
  );
}
