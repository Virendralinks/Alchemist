'use client';

import type { LyricNode } from '@/lib/types/lyric';
import { BeatSlot } from './BeatSlot';

interface BarRowProps {
  bar: number;
  slots: (string | null)[];
  nodes: Record<string, LyricNode>;
  selectedNodeIds: string[];
  onSelectNode?: (nodeId: string) => void;
}

/** One bar = 16 sixteenth-note slots, rendered as 4 beat groups of 4. */
export function BarRow({
  bar,
  slots,
  nodes,
  selectedNodeIds,
  onSelectNode,
}: BarRowProps) {
  const start = bar * 16;
  const selected = new Set(selectedNodeIds);

  return (
    <div className="grid grid-cols-4 gap-1">
      {Array.from({ length: 4 }, (_, beat) => (
        <div key={beat} className="grid grid-cols-4 gap-0.5">
          {Array.from({ length: 4 }, (_, tick) => {
            const slotIndex = start + beat * 4 + tick;
            const nodeId = slots[slotIndex];
            const node = nodeId ? nodes[nodeId] ?? null : null;
            return (
              <BeatSlot
                key={slotIndex}
                slotIndex={slotIndex}
                node={node}
                selected={nodeId ? selected.has(nodeId) : false}
                onSelectNode={onSelectNode}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
