'use client';

import type { Dissection } from '@/lib/types/archive';
import { cn } from '@/lib/utils';

const LABEL: Record<Dissection['provenance'], string> = {
  authored: 'authored',
  engine: 'engine',
  'engine+llm': 'engine + llm',
};

/** The X-Ray layout is identical across provenance; only this badge branches. */
export function ProvenanceBadge({
  provenance,
  cached,
}: {
  provenance: Dissection['provenance'];
  cached?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          'rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider',
          provenance === 'engine' && 'border-emerald-500/40 text-emerald-300',
          provenance === 'engine+llm' && 'border-sky-500/40 text-sky-300',
          provenance === 'authored' && 'border-zinc-600 text-zinc-400',
        )}
      >
        {LABEL[provenance]}
      </span>
      {cached && (
        <span className="rounded border border-zinc-700 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
          cached
        </span>
      )}
    </span>
  );
}
