'use client';

import { AlertCircle, Sparkles } from 'lucide-react';
import type { Dissection } from '@/lib/types/archive';
import { useWorkbenchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

/**
 * The Tier 2 control strip. The interpretive *content* renders through the
 * shared DissectionTabs, identically to an authored catalogue line — this
 * component only owns generating it, cancelling it, and saying so when there is
 * no API key (Section 4.4).
 */
export function InterpretivePanel({ dissection }: { dissection: Dissection | null }) {
  const status = useWorkbenchStore((s) => s.status);
  const interpretiveAvailable = useWorkbenchStore((s) => s.interpretiveAvailable);
  const errorMessage = useWorkbenchStore((s) => s.errorMessage);
  const runTierTwo = useWorkbenchStore((s) => s.runTierTwo);
  const cancel = useWorkbenchStore((s) => s.cancel);

  if (!interpretiveAvailable) {
    return (
      <div className="rounded border border-dashed border-amber-500/30 bg-amber-500/5 p-3">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-400">
          <AlertCircle className="size-3" />
          Interpretive layer unavailable
        </div>
        <p className="mt-1 font-sans text-xs leading-relaxed text-zinc-400">
          Add <code className="font-mono text-zinc-300">ANTHROPIC_API_KEY</code> to{' '}
          <code className="font-mono text-zinc-300">.env.local</code> to enable
          meaning, entendres, and flow prose. Everything above is computed and
          stays fully functional without it.
        </p>
      </div>
    );
  }

  const hasContent =
    dissection != null &&
    Boolean(
      dissection.meaning ||
        dissection.flowMechanics ||
        dissection.rhymeScience ||
        dissection.why ||
        dissection.entendres.length > 0,
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {status === 'streaming' ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[11px] text-zinc-400"
            onClick={cancel}
          >
            Cancel
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="h-6 gap-1 px-2 text-[11px]"
            onClick={() => void runTierTwo()}
            disabled={!dissection}
          >
            <Sparkles className="size-3" />
            {hasContent ? 'Regenerate' : 'Interpret'}
          </Button>
        )}
        {status === 'streaming' && (
          <span className="font-mono text-[10px] text-zinc-600">interpreting…</span>
        )}
      </div>

      {status === 'error' && errorMessage && (
        <div className="rounded border border-rose-500/30 bg-rose-500/5 p-2">
          <p className="font-sans text-xs text-rose-300">{errorMessage}</p>
          <Button
            size="sm"
            variant="ghost"
            className="mt-1 h-6 px-2 text-[11px] text-zinc-400"
            onClick={() => void runTierTwo()}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
