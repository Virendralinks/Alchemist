'use client';

import { useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { useWorkbenchStore } from '@/lib/store';

interface EmphasisDialProps {
  nodeId: string;
  value: number;
}

/** Velocity / emphasis for a placed syllable — drives glow intensity. */
export function EmphasisDial({ nodeId, value }: EmphasisDialProps) {
  const setEmphasis = useWorkbenchStore((s) => s.setEmphasis);
  // A fresh `[value]` every render makes Radix Slider think the value changed
  // and fire onValueChange, which setStates, which re-renders — the classic
  // "Maximum update depth exceeded" loop.
  const sliderValue = useMemo(() => [value], [value]);

  return (
    <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
      <span>VEL</span>
      <Slider
        className="w-24"
        min={0}
        max={1}
        step={0.05}
        value={sliderValue}
        onValueChange={(vals) => {
          const next = vals[0];
          if (next == null || Math.abs(next - value) < 0.001) return;
          setEmphasis(nodeId, next);
        }}
        aria-label="Syllable emphasis"
      />
      <span className="tabular w-6 text-zinc-400">{Math.round(value * 100)}</span>
    </div>
  );
}
