'use client';

import type { TokenAnalysis } from '@/lib/types/phonetics';
import { useWorkbenchStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/** Top-two candidates within this margin → surface the switcher. */
const SCORE_MARGIN = 0.12;

interface PronunciationSwitcherProps {
  token: TokenAnalysis;
}

/**
 * Ranked readings for ambiguous tokens. Changing the selection persists via
 * pronunciationOverrides and re-runs analysis + rhyme lookup.
 */
export function PronunciationSwitcher({ token }: PronunciationSwitcherProps) {
  const overridePronunciation = useWorkbenchStore((s) => s.overridePronunciation);
  const candidates = token.candidates;

  if (candidates.length < 2) return null;

  const close = Math.abs(candidates[0].score - candidates[1].score) <= SCORE_MARGIN;
  const userPickedAlternate = token.selectedCandidate > 0;
  if (!close && !userPickedAlternate) return null;

  const visible = candidates.slice(0, Math.min(3, candidates.length));

  return (
    <div className="rounded border border-zinc-800/50 bg-zinc-900/60 p-2 font-mono text-xs">
      <div className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
        Pronunciation · {token.token}
      </div>
      <div className="flex flex-col gap-1">
        {visible.map((c, i) => {
          const ipa = c.phonemes.map((p) => p.ipa).join('');
          const active = i === token.selectedCandidate;
          return (
            <button
              key={`${ipa}-${i}`}
              type="button"
              onClick={() => overridePronunciation(token.token, i)}
              className={cn(
                'flex items-center justify-between gap-2 rounded px-2 py-1 text-left',
                'border border-transparent active:scale-[0.98]',
                active
                  ? 'border-zinc-600 bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
              )}
            >
              <span className="text-zinc-300">/{ipa}/</span>
              <span className="tabular text-[10px] text-zinc-600">
                {c.origin} · {c.score.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
