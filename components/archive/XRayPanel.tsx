'use client';

import type { ReactNode } from 'react';
import type { Dissection } from '@/lib/types/archive';
import { TierOneReadout } from '@/components/dissect/TierOneReadout';
import { ProvenanceBadge } from '@/components/dissect/ProvenanceBadge';
import { DissectionTabs } from './DissectionTabs';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * One X-Ray panel for the whole app. A dissection of a Kendrick line and a
 * dissection of a bar you just typed are the same type, so this component
 * cannot tell them apart — it branches only on the provenance badge.
 *
 * `actions` is where /dissect injects its Tier 2 controls; the archive passes
 * nothing, because authored dissections have nothing to generate.
 */
export function XRayPanel({
  dissection,
  text,
  cached,
  actions,
  title = 'X-Ray',
}: {
  dissection: Dissection | null;
  text: string;
  cached?: boolean;
  actions?: ReactNode;
  title?: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-sans text-sm font-medium text-zinc-300">{title}</h2>
        {dissection && (
          <ProvenanceBadge provenance={dissection.provenance} cached={cached} />
        )}
      </div>

      {!dissection ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-800/70 p-6">
          <p className="max-w-[22rem] text-center font-sans text-xs leading-relaxed text-zinc-600">
            Select a line to see how it works — syllables and stress, where the
            rhymes land, what the bar is doing, and why it lands.
          </p>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 pr-3">
            <TierOneReadout dissection={dissection} text={text} />
            {actions}
            <DissectionTabs dissection={dissection} text={text} />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
