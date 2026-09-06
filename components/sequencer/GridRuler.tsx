'use client';

import { fromSlotIndex } from '@/lib/engine/grid';

/** Bar / beat numbering above the 64-slot grid. Mono + tabular by design. */
export function GridRuler() {
  return (
    <div className="grid grid-cols-4 gap-1 font-mono text-[10px] tabular text-zinc-600">
      {Array.from({ length: 4 }, (_, bar) => (
        <div key={bar} className="grid grid-cols-4 gap-0.5">
          {Array.from({ length: 4 }, (_, beat) => {
            const slotIndex = bar * 16 + beat * 4;
            const pos = fromSlotIndex(slotIndex);
            return (
              <div key={beat} className="px-0.5">
                {beat === 0 ? (
                  <span className="text-zinc-400">B{pos.bar + 1}</span>
                ) : (
                  <span>.{pos.beat + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
