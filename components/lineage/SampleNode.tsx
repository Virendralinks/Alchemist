'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { SampleSource } from '@/lib/types/production';
import { cn } from '@/lib/utils';

export interface SampleNodeData extends Record<string, unknown> {
  sample: SampleSource;
  /** Dimmed when a genre-blend segment filters it out. */
  dimmed?: boolean;
  /** The track doing the sampling, drawn as the root of the graph. */
  isRoot?: boolean;
}

const FLIP_COLOR: Record<SampleSource['flipType'], string> = {
  chop: 'text-amber-300 border-amber-500/50',
  loop: 'text-sky-300 border-sky-500/50',
  'pitch-shift': 'text-violet-300 border-violet-500/50',
  interpolation: 'text-emerald-300 border-emerald-500/50',
  replay: 'text-rose-300 border-rose-500/50',
};

/** Shared by /lineage and the musicology sample graph, per Section 2.3. */
export function SampleNode({ data }: NodeProps) {
  const { sample, dimmed, isRoot } = data as unknown as SampleNodeData;

  return (
    <div
      className={cn(
        'w-48 rounded-lg border bg-zinc-950/95 px-3 py-2 shadow-lg transition-opacity',
        isRoot ? 'border-zinc-500' : 'border-zinc-800',
        dimmed ? 'opacity-25' : 'opacity-100',
      )}
    >
      <Handle type="target" position={Position.Top} className="!size-1.5 !bg-zinc-600" />
      <p className="truncate font-sans text-xs font-medium text-zinc-200">
        {sample.title}
      </p>
      <p className="truncate font-mono text-[10px] text-zinc-500">
        {sample.artist} · {sample.year}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <span className="rounded border border-zinc-700 px-1 font-mono text-[9px] uppercase text-zinc-500">
          {sample.genre}
        </span>
        {!isRoot && (
          <span
            className={cn(
              'rounded border px-1 font-mono text-[9px] uppercase',
              FLIP_COLOR[sample.flipType],
            )}
          >
            {sample.flipType}
          </span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 font-sans text-[10px] leading-snug text-zinc-600">
        {sample.whatWasTaken}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-1.5 !bg-zinc-600"
      />
    </div>
  );
}
