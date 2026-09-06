import Link from 'next/link';
import type { DeviceOccurrence } from '@/lib/codex/device-index';
import { cn } from '@/lib/utils';

/**
 * Server Component. The occurrence list is derived at module scope from the
 * reverse index, so this page ships no archive data to the browser.
 */
export function OccurrenceList({
  occurrences,
}: {
  occurrences: DeviceOccurrence[];
}) {
  if (occurrences.length === 0) {
    return (
      <p className="font-sans text-sm text-zinc-600">
        No occurrences in the archive yet. Dissected reference songs populate
        this list automatically.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-1.5">
      {occurrences.map((occurrence, i) => {
        // The snippet contains the span; split on it so the fragment that is
        // actually the device can carry the certainty underline.
        const at = occurrence.snippet.indexOf(occurrence.spanText);
        const before = at >= 0 ? occurrence.snippet.slice(0, at) : occurrence.snippet;
        const after =
          at >= 0 ? occurrence.snippet.slice(at + occurrence.spanText.length) : '';

        return (
          <li key={`${occurrence.lineId}-${i}`}>
            <Link
              href={`/archive/${occurrence.artistId}/${occurrence.trackId}#${occurrence.lineId}`}
              className="group block rounded border border-zinc-800/50 bg-zinc-900/30 px-3 py-2 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
            >
              <p className="font-mono text-xs leading-relaxed text-zinc-400">
                {before}
                {at >= 0 && (
                  <span
                    className={cn(
                      'text-zinc-100 underline underline-offset-2',
                      occurrence.confidence === 'certain'
                        ? 'decoration-solid decoration-emerald-400'
                        : 'decoration-dotted decoration-zinc-500',
                    )}
                  >
                    {occurrence.spanText}
                  </span>
                )}
                {after}
              </p>
              <p className="mt-1 font-sans text-[11px] text-zinc-600 group-hover:text-zinc-500">
                {occurrence.artistName} — {occurrence.trackTitle}
                <span className="ml-2 font-mono text-[10px] uppercase">
                  {occurrence.confidence}
                </span>
              </p>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
