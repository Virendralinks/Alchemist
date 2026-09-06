'use client';

import { useState } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { postMetaphor, ApiCallError } from '@/lib/api/client';
import type { ExtractionResult } from '@/lib/types/reality';

const ACTIONS: { kind: ExtractionResult['kind']; label: string }[] = [
  { kind: 'metaphor', label: 'Extract Metaphor' },
  { kind: 'pocket-skeleton', label: 'Translate to Pocket' },
  { kind: 'muhawara', label: 'Find Muhawara' },
];

/** Calls /api/metaphor; a missing API key degrades to an inline notice. */
export function ExtractToolbar() {
  const selectedEntryId = useWorkbenchStore((s) => s.selectedEntryId);
  const selectionSpan = useWorkbenchStore((s) => s.selectionSpan);
  const entries = useWorkbenchStore((s) => s.entries);
  const addExtraction = useWorkbenchStore((s) => s.addExtraction);

  const [pending, setPending] = useState<ExtractionResult['kind'] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const entry =
    entries.find((e) => e.id === selectedEntryId) ?? entries[0] ?? null;
  const hasSelection =
    entry != null && selectionSpan != null && selectionSpan[1] > selectionSpan[0];

  const extract = async (kind: ExtractionResult['kind']) => {
    if (!entry || !selectionSpan) return;
    setPending(kind);
    setNotice(null);
    try {
      const result = await postMetaphor({
        entryId: entry.id,
        text: entry.body,
        span: selectionSpan,
        kind,
      });
      for (const extraction of result.extractions) {
        addExtraction(extraction);
      }
      if (result.extractions.length === 0) {
        setNotice('No extraction came back for that selection.');
      }
    } catch (err) {
      setNotice(
        err instanceof ApiCallError && err.degraded
          ? 'Extraction needs ANTHROPIC_API_KEY in .env.local.'
          : err instanceof Error
            ? err.message
            : 'Extraction failed.',
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(({ kind, label }) => (
          <Button
            key={kind}
            size="sm"
            variant={kind === 'muhawara' ? 'outline' : 'secondary'}
            disabled={!hasSelection || pending !== null}
            className="h-7 font-sans text-xs active:scale-[0.97]"
            onClick={() => void extract(kind)}
          >
            {pending === kind ? 'Working…' : label}
          </Button>
        ))}
      </div>
      {notice && (
        <p className="font-sans text-[11px] text-amber-400/80">{notice}</p>
      )}
    </div>
  );
}
