'use client';

import { useEffect, useMemo, useState } from 'react';
import { m } from 'framer-motion';
import type { SongSection } from '@/lib/types/production';
import { useWorkbenchStore } from '@/lib/store';
import { MOTION } from '@/lib/motion';
import { cn } from '@/lib/utils';

const KIND_COLOR: Record<SongSection['kind'], string> = {
  intro: 'bg-zinc-700',
  verse: 'bg-sky-500/70',
  pre: 'bg-violet-500/70',
  hook: 'bg-amber-500/70',
  bridge: 'bg-emerald-500/70',
  outro: 'bg-zinc-700',
  skit: 'bg-rose-500/70',
};

/**
 * Which lyric line currently occupies the most of the viewport. The rail reads
 * this so scrolling the lyric column moves the marker, rather than the rail only
 * ever pushing the column (Section 2.4).
 */
function useVisibleLineId(sections: SongSection[]): string | null {
  const [visibleId, setVisibleId] = useState<string | null>(null);
  const lineIds = useMemo(() => sections.flatMap((s) => s.lineIds), [sections]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const elements = lineIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // Keep every ratio rather than reacting to whichever entry fired last, so
    // the winner is the line most in view instead of the one that happened to
    // cross a threshold most recently.
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }
        let best: string | null = null;
        let bestRatio = 0;
        // Walking in document order means ties resolve to the earlier line,
        // which keeps the marker from flickering between two equal neighbours.
        for (const id of lineIds) {
          const ratio = ratios.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setVisibleId(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lineIds]);

  return visibleId;
}

/**
 * Section markers along the song, synced to the lyric column in both
 * directions: clicking a section scrolls to its first line, and scrolling the
 * lyrics moves the marker.
 */
export function ArrangementRail({ sections }: { sections: SongSection[] }) {
  const selectedLineIds = useWorkbenchStore((s) => s.selectedLineIds);
  const selectLine = useWorkbenchStore((s) => s.selectLine);
  const visibleLineId = useVisibleLineId(sections);

  if (sections.length === 0) return null;

  const lastBar = sections.reduce((max, s) => Math.max(max, s.endBar), 0) || 1;
  // Scroll position wins over selection: a writer who has scrolled away from
  // the line they clicked wants the rail to show where they are now.
  const activeSection =
    (visibleLineId
      ? sections.find((s) => s.lineIds.includes(visibleLineId))
      : undefined) ??
    sections.find((s) => s.lineIds.some((id) => selectedLineIds.includes(id)));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-5 w-full overflow-hidden rounded border border-zinc-800">
        {sections.map((section) => {
          const width = ((section.endBar - section.startBar + 1) / (lastBar + 1)) * 100;
          const active = activeSection?.id === section.id;
          return (
            <m.button
              key={section.id}
              type="button"
              aria-current={active ? 'true' : undefined}
              title={`${section.label} · bars ${section.startBar + 1}–${section.endBar + 1}`}
              onClick={() => {
                const first = section.lineIds[0];
                if (!first) return;
                selectLine(first, false);
                // MotionConfig does not reach scrollIntoView, so reduced-motion
                // has to be honoured here by hand.
                const reduced = window.matchMedia(
                  '(prefers-reduced-motion: reduce)',
                ).matches;
                document.getElementById(first)?.scrollIntoView({
                  behavior: reduced ? 'auto' : 'smooth',
                  block: 'center',
                });
              }}
              initial={false}
              animate={{ opacity: active ? 1 : 0.55 }}
              transition={{ duration: MOTION.hover }}
              style={{ width: `${width}%` }}
              className={cn(
                'relative h-full border-r border-zinc-950/60 last:border-r-0',
                KIND_COLOR[section.kind],
              )}
            >
              {section.beatSwitch && (
                <span
                  className="absolute inset-y-0 left-0 w-0.5 bg-amber-300"
                  aria-hidden
                />
              )}
              <span className="sr-only">{section.label}</span>
            </m.button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {sections.map((section) => (
          <span
            key={section.id}
            className={cn(
              'font-mono text-[10px]',
              activeSection?.id === section.id ? 'text-zinc-200' : 'text-zinc-600',
            )}
          >
            {section.label}
          </span>
        ))}
      </div>
    </div>
  );
}
