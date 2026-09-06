'use client';

import { useEffect, useRef } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RhymeSchemeRail } from './RhymeSchemeRail';
import { InterpretivePanel } from './InterpretivePanel';
import { XRayPanel } from '@/components/archive/XRayPanel';

/** Tier 1 is instant enough to run on a short debounce, like the cipher pane. */
const DEBOUNCE_MS = 200;

export function BarDissector() {
  const draft = useWorkbenchStore((s) => s.draft);
  const setDraft = useWorkbenchStore((s) => s.setDraft);
  const status = useWorkbenchStore((s) => s.status);
  const servedFromCache = useWorkbenchStore((s) => s.servedFromCache);
  const currentLines = useWorkbenchStore((s) => s.currentLines);
  const currentLineTokens = useWorkbenchStore((s) => s.currentLineTokens);
  const dissection = useWorkbenchStore((s) =>
    s.currentKey ? s.userDissections[s.currentKey] ?? null : null,
  );

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const { initWorker, checkInterpretive } = useWorkbenchStore.getState();
    void initWorker();
    void checkInterpretive();
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void useWorkbenchStore.getState().runTierOne();
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft]);

  const text = draft.trim();

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="flex min-h-0 flex-col gap-3">
        <div>
          <h1 className="font-sans text-lg font-semibold text-zinc-100">
            Bar Dissector
          </h1>
          <p className="mt-1 font-sans text-sm text-zinc-500">
            Paste any bars — English, Hinglish, or both. Tier 1 is computed
            instantly and offline; interpretation is layered on top.
          </p>
        </div>

        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          placeholder={
            'deployed the fix, phir bhi client naaraaz\nmeri migration ka yahi andaaz'
          }
          className="min-h-[13rem] flex-none resize-none rounded-lg border-zinc-800/50 bg-zinc-900/40 p-4 font-mono text-sm leading-loose text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-emerald-500/30"
        />

        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              status === 'tier1' || status === 'streaming'
                ? 'bg-amber-400'
                : text.length > 0
                  ? 'bg-emerald-400'
                  : 'bg-zinc-700',
            )}
          />
          {status === 'tier1'
            ? 'computing'
            : status === 'streaming'
              ? 'streaming interpretation'
              : text.length === 0
                ? 'waiting for bars'
                : 'ready'}
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="pr-3">
            {currentLines.length > 0 ? (
              <RhymeSchemeRail lines={currentLines} lineTokens={currentLineTokens} />
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-800/70 p-4">
                <p className="font-sans text-sm text-zinc-400">
                  Type a couple of bars to begin.
                </p>
                <p className="mt-1.5 font-sans text-xs leading-relaxed text-zinc-600">
                  Syllable counts, stress, rhyme scheme, internal rhymes and
                  assonance chains are computed on your machine — no network, no
                  API key. Interpretation is a separate, optional layer.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="min-h-0 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4">
        {/* The same panel the archive uses for a Kendrick line. */}
        <XRayPanel
          dissection={dissection}
          text={text}
          cached={servedFromCache}
          actions={<InterpretivePanel dissection={dissection} />}
        />
      </div>
    </div>
  );
}
