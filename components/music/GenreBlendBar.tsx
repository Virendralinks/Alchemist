'use client';

import { m } from 'framer-motion';
import type { GenreWeight } from '@/lib/types/production';
import { MOTION } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Stable palette so the same genre reads the same colour across tracks. */
const GENRE_COLOR: Record<string, string> = {
  'boom bap': 'bg-amber-500/70',
  jazz: 'bg-violet-500/70',
  soul: 'bg-rose-500/70',
  gospel: 'bg-fuchsia-500/70',
  trap: 'bg-sky-500/70',
  funk: 'bg-orange-500/70',
  'psych rock': 'bg-emerald-500/70',
  rock: 'bg-emerald-500/70',
  electronic: 'bg-cyan-500/70',
  ambient: 'bg-teal-500/70',
  blues: 'bg-indigo-500/70',
  disco: 'bg-pink-500/70',
};

const colorFor = (genre: string, i: number) =>
  GENRE_COLOR[genre.toLowerCase()] ??
  ['bg-zinc-500/70', 'bg-zinc-400/70', 'bg-zinc-600/70'][i % 3];

/**
 * An interactive stacked bar, not a sentence. Clicking a segment filters the
 * sample graph to the samples contributing that genre (Section 2.4).
 */
export function GenreBlendBar({
  blend,
  activeGenre,
  onSelect,
}: {
  blend: GenreWeight[];
  activeGenre: string | null;
  onSelect: (genre: string | null) => void;
}) {
  const total = blend.reduce((sum, g) => sum + g.weight, 0) || 1;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-6 w-full overflow-hidden rounded border border-zinc-800">
        {blend.map((genre, i) => {
          const active = activeGenre === genre.genre;
          return (
            <m.button
              key={genre.genre}
              type="button"
              onClick={() => onSelect(active ? null : genre.genre)}
              aria-pressed={active}
              title={`${genre.genre} — ${Math.round((genre.weight / total) * 100)}%`}
              initial={false}
              animate={{ opacity: activeGenre && !active ? 0.3 : 1 }}
              transition={{ duration: MOTION.hover }}
              style={{ width: `${(genre.weight / total) * 100}%` }}
              className={cn(
                'group relative h-full border-r border-zinc-950/60 last:border-r-0',
                colorFor(genre.genre, i),
              )}
            >
              <span className="sr-only">{genre.genre}</span>
            </m.button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {blend.map((genre, i) => {
          const active = activeGenre === genre.genre;
          return (
            <button
              key={genre.genre}
              type="button"
              onClick={() => onSelect(active ? null : genre.genre)}
              className={cn(
                'flex items-center gap-1.5 font-mono text-[10px] transition-colors',
                active ? 'text-zinc-200' : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              <span className={cn('size-2 rounded-sm', colorFor(genre.genre, i))} />
              {genre.genre}
              <span className="tabular text-zinc-600">
                {Math.round((genre.weight / total) * 100)}%
              </span>
            </button>
          );
        })}
      </div>

      {activeGenre && (
        <p className="font-sans text-[11px] leading-snug text-zinc-500">
          {blend.find((g) => g.genre === activeGenre)?.contribution}
        </p>
      )}
    </div>
  );
}
