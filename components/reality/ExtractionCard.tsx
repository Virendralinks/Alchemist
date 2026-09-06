'use client';

import { m } from 'framer-motion';
import type { ExtractionResult } from '@/lib/types/reality';
import { useWorkbenchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOTION } from '@/lib/motion';

interface ExtractionCardProps {
  extraction: ExtractionResult;
}

export function ExtractionCard({ extraction }: ExtractionCardProps) {
  const acceptExtraction = useWorkbenchStore((s) => s.acceptExtraction);
  const rejectExtraction = useWorkbenchStore((s) => s.rejectExtraction);

  return (
    <m.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.drop }}
      className="rounded border border-zinc-800/50 bg-zinc-900/50 p-2.5"
    >
      <div className="mb-1 flex items-center gap-1.5">
        <Badge
          variant="outline"
          className="h-4 border-zinc-700 px-1 font-mono text-[9px] font-normal text-zinc-400"
        >
          {extraction.kind}
        </Badge>
        {extraction.accepted && (
          <span className="font-mono text-[9px] text-emerald-400">accepted</span>
        )}
      </div>
      <p className="font-sans text-sm text-zinc-200">{extraction.output}</p>
      {extraction.gloss && (
        <p className="mt-1 font-sans text-[11px] text-zinc-500">{extraction.gloss}</p>
      )}
      {!extraction.accepted && (
        <div className="mt-2 flex gap-1.5">
          <Button
            size="sm"
            className="h-6 px-2 text-[11px]"
            onClick={() => acceptExtraction(extraction.id)}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[11px] text-zinc-500"
            onClick={() => rejectExtraction(extraction.id)}
          >
            Reject
          </Button>
        </div>
      )}
    </m.div>
  );
}
