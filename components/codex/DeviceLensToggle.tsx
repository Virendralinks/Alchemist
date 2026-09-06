'use client';

import { Layers } from 'lucide-react';
import { useWorkbenchStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/** "Show me everything, even the small stuff" — overlays every span at once. */
export function DeviceLensToggle() {
  const lensEnabled = useWorkbenchStore((s) => s.lensEnabled);
  const toggleLens = useWorkbenchStore((s) => s.toggleLens);

  return (
    <button
      type="button"
      onClick={toggleLens}
      aria-pressed={lensEnabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors',
        lensEnabled
          ? 'border-sky-500/50 bg-sky-500/10 text-sky-300'
          : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300',
      )}
    >
      <Layers className="size-3" />
      Device lens
    </button>
  );
}
