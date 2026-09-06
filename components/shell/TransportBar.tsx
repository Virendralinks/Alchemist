'use client';

import { Play, Pause, Square } from 'lucide-react';
import { useWorkbenchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

/** Store subscription (bpm, play state) — this is what forces the client boundary. */
export function TransportBar() {
  const bpm = useWorkbenchStore((s) => s.grids[s.activeGridId]?.bpm ?? 90);
  const isPlaying = useWorkbenchStore((s) => s.grids[s.activeGridId]?.isPlaying ?? false);
  const transport = useWorkbenchStore((s) => s.transport);
  const setBpm = useWorkbenchStore((s) => s.setBpm);

  return (
    <div className="flex items-center gap-4 border-b border-zinc-800/50 bg-zinc-950 px-4 py-2 font-mono text-sm text-zinc-400">
      <div className="flex items-center gap-1.5">
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-zinc-300 hover:text-zinc-100"
          onClick={() => (isPlaying ? transport.pause() : transport.play())}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-zinc-300 hover:text-zinc-100"
          onClick={() => transport.stop()}
          aria-label="Stop"
        >
          <Square className="size-3.5" />
        </Button>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-zinc-500">BPM</span>
        <input
          type="number"
          className="tabular w-14 rounded border border-zinc-800/50 bg-zinc-900 px-1.5 py-0.5 text-zinc-100 outline-none focus:border-zinc-700"
          value={bpm}
          min={40}
          max={220}
          onChange={(e) => setBpm(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
