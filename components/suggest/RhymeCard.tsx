'use client';

import type { RhymeCandidate } from '@/lib/types/rhyme';
import { Badge } from '@/components/ui/badge';
import { LangBadge } from './LangBadge';
import { cn } from '@/lib/utils';

interface RhymeCardProps {
  candidate: RhymeCandidate;
  index: number;
}

export function RhymeCard({ candidate, index }: RhymeCardProps) {
  return (
    <div
      className={cn(
        'rounded border border-zinc-800/50 bg-zinc-900/40 px-2.5 py-2',
        candidate.isCrossLanguage && 'ring-1 ring-violet-500/40',
      )}
      style={{ animationDelay: `${Math.min(index * 20, 160)}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-mono text-sm text-zinc-100">
            <span className="truncate">{candidate.text}</span>
            <LangBadge lang={candidate.lang} />
          </div>
          {candidate.lang === 'hi' && candidate.gloss && (
            <p className="mt-0.5 font-sans text-[11px] text-zinc-500">
              {candidate.gloss}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-[10px] uppercase tabular text-zinc-400">
            {candidate.type}
          </span>
          <span className="font-mono text-xs tabular text-emerald-300/80">
            {candidate.score.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-emerald-500/70 transition-[width] duration-150"
          style={{ width: `${Math.round(candidate.score * 100)}%` }}
        />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <span className="font-mono text-[9px] tabular text-zinc-600">
          {candidate.syllableCount}syl
        </span>
        {candidate.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="h-4 border-zinc-700 px-1 font-mono text-[9px] font-normal text-zinc-500"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
