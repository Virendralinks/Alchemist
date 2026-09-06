'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LyricLine, RhythmAnalysis } from '@/lib/types/archive';
import type { TrackProduction } from '@/lib/types/production';
import { useWorkbenchStore } from '@/lib/store';
import { LyricColumn } from './LyricColumn';
import { XRayPanel } from './XRayPanel';
import { ProductionPanel } from '@/components/music/ProductionPanel';

/**
 * Splits the screen: lyric column centre, X-Ray right. Selection lives in the
 * archive slice, so both columns read the same source of truth.
 *
 * Authored lines ship without Tier 1 (so the catalogue never imports CMUdict).
 * This island hydrates rhythm through the worker, the same path /dissect uses.
 */
export function TrackDissectionScreen({
  lines,
  production,
}: {
  lines: LyricLine[];
  production?: TrackProduction;
}) {
  const selectedLineIds = useWorkbenchStore((s) => s.selectedLineIds);
  const selectedBlockRange = useWorkbenchStore((s) => s.selectedBlockRange);
  const [rhythms, setRhythms] = useState<Record<string, RhythmAnalysis>>({});

  const lineKey = lines.map((l) => l.id).join('|');
  const bpm = production?.bpm ?? 90;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const { initWorker, requestTierOne } = useWorkbenchStore.getState();
      await initWorker();
      const next: Record<string, RhythmAnalysis> = {};
      for (const line of lines) {
        const rhythm = await requestTierOne(line.text, bpm);
        if (rhythm) next[line.id] = rhythm;
      }
      if (!cancelled) setRhythms(next);
    };
    if (lines.length > 0) void run();
    return () => {
      cancelled = true;
    };
    // lineKey stands in for `lines` so a new array identity from the parent
    // does not re-run the worker for the same song.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineKey, bpm]);

  const hydrated = useMemo(
    () =>
      lines.map((line) => {
        const rhythm = rhythms[line.id];
        if (!rhythm || !line.dissection) return line;
        return { ...line, dissection: { ...line.dissection, rhythm } };
      }),
    [lines, rhythms],
  );

  const selectedLines = useMemo(() => {
    if (selectedBlockRange) {
      return hydrated.filter(
        (l) =>
          l.barIndex >= selectedBlockRange[0] && l.barIndex <= selectedBlockRange[1],
      );
    }
    return hydrated.filter((l) => selectedLineIds.includes(l.id));
  }, [hydrated, selectedLineIds, selectedBlockRange]);

  // The X-Ray reads one line at a time; a block selection shows its first line
  // plus an aggregate strip, because Dissection is a per-line type.
  const primary = selectedLines[0] ?? null;

  const blockSummary = useMemo(() => {
    if (selectedLines.length < 2) return null;
    const withDissection = selectedLines.filter((l) => l.dissection);
    if (withDissection.length === 0) return null;
    const syllables = withDissection.reduce(
      (sum, l) => sum + l.dissection!.rhythm.syllableCount,
      0,
    );
    return {
      lineCount: selectedLines.length,
      syllables,
      density: syllables / withDissection.length,
      scheme: withDissection.map((l) => l.dissection!.rhythm.schemeLetter).join(''),
    };
  }, [selectedLines]);

  return (
    <div className="grid h-full min-h-0 grid-cols-1 divide-zinc-800/50 lg:grid-cols-[1.4fr_1fr] lg:divide-x">
      <section className="flex min-h-0 flex-col p-4">
        <LyricColumn lines={hydrated} sections={production?.sections} />
      </section>

      <section className="flex min-h-0 flex-col gap-3 p-4">
        {blockSummary && (
          <div className="rounded border border-zinc-800/50 bg-zinc-900/40 px-2 py-1.5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              Block · {blockSummary.lineCount} bars
            </p>
            <p className="mt-0.5 font-mono text-xs text-zinc-300">
              {blockSummary.syllables} syllables · {blockSummary.density.toFixed(1)}{' '}
              per bar · scheme {blockSummary.scheme}
            </p>
          </div>
        )}

        <div className="min-h-0 flex-1">
          <XRayPanel
            dissection={primary?.dissection ?? null}
            text={primary?.text ?? ''}
          />
        </div>

        {production && <ProductionPanel production={production} />}
      </section>
    </div>
  );
}
