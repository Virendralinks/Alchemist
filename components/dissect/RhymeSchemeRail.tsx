'use client';

import { useMemo } from 'react';
import { m } from 'framer-motion';
import type { TokenAnalysis } from '@/lib/types/phonetics';
import { schemeLettersFromAnalyses } from '@/lib/engine/scheme';
import { MOTION } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Stable per-letter colours so the same scheme reads the same every render. */
const LETTER_COLORS = [
  'text-emerald-300 border-emerald-500/40',
  'text-sky-300 border-sky-500/40',
  'text-amber-300 border-amber-500/40',
  'text-violet-300 border-violet-500/40',
  'text-rose-300 border-rose-500/40',
  'text-teal-300 border-teal-500/40',
];

interface RhymeSchemeRailProps {
  lines: string[];
  lineTokens: TokenAnalysis[][];
}

export function RhymeSchemeRail({ lines, lineTokens }: RhymeSchemeRailProps) {
  const letters = useMemo(
    () => schemeLettersFromAnalyses(lineTokens),
    [lineTokens],
  );

  if (lines.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        Rhyme scheme
      </h3>
      <div className="flex flex-col gap-0.5">
        {lines.map((line, i) => {
          const letter = letters[i] ?? '-';
          const colorIndex =
            letter === '-' ? -1 : (letter.charCodeAt(0) - 65) % LETTER_COLORS.length;
          const syllables = (lineTokens[i] ?? []).reduce(
            (sum, t) => sum + (t.candidates[t.selectedCandidate]?.syllables.length ?? 0),
            0,
          );
          return (
            <m.div
              key={`${i}-${line}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: MOTION.drop,
                delay: Math.min(i * MOTION.staggerItem, 0.12),
              }}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  'w-5 shrink-0 rounded border text-center font-mono text-[10px] tabular',
                  colorIndex >= 0
                    ? LETTER_COLORS[colorIndex]
                    : 'border-zinc-800 text-zinc-600',
                )}
              >
                {letter}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-300">
                {line}
              </span>
              <span className="shrink-0 font-mono text-[10px] tabular text-zinc-600">
                {syllables}
              </span>
            </m.div>
          );
        })}
      </div>
    </div>
  );
}
