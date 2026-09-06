'use client';

import { useWorkbenchStore } from '@/lib/store';
import { RawRealityPane } from './RawRealityPane';
import { CipherPane } from './CipherPane';
import { ExtractToolbar } from './ExtractToolbar';
import { ExtractionCard } from './ExtractionCard';
import { ScrollArea } from '@/components/ui/scroll-area';

/** Split-pane: raw journal (sans) ↔ cipher workspace (mono). */
export function RealityFlipper() {
  const extractions = useWorkbenchStore((s) => s.extractions);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-medium text-zinc-300">Reality Flipper</h2>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-2 gap-3">
        <RawRealityPane />
        <CipherPane />
      </div>

      <ExtractToolbar />

      {extractions.length > 0 && (
        <ScrollArea className="max-h-36">
          <div className="flex flex-col gap-1.5 pr-2">
            {extractions.map((ex) => (
              <ExtractionCard key={ex.id} extraction={ex} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
