'use client';

import { useWorkbenchStore } from '@/lib/store';
import type { DeviceDepth } from '@/lib/types/devices';
import { cn } from '@/lib/utils';

/** "How deep you have to be looking to notice it" — the small/deep/big filter. */
const DEPTHS: { id: DeviceDepth; label: string }[] = [
  { id: 'surface', label: 'surface' },
  { id: 'craft', label: 'craft' },
  { id: 'esoteric', label: 'esoteric' },
];

export function DepthFilter() {
  const depthFilter = useWorkbenchStore((s) => s.depthFilter);
  const toggleDepth = useWorkbenchStore((s) => s.toggleDepth);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
        Depth
      </span>
      {DEPTHS.map(({ id, label }) => {
        const active = depthFilter.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggleDepth(id)}
            aria-pressed={active}
            className={cn(
              'rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide transition-colors',
              active
                ? 'border-zinc-500 text-zinc-200'
                : 'border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
