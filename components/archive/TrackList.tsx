import Link from 'next/link';
import type { Track } from '@/lib/types/archive';

/** Presentational; rendered inside the client accordion but holds no state. */
export function TrackList({
  artistId,
  tracks,
}: {
  artistId: string;
  tracks: Track[];
}) {
  return (
    <ul className="divide-y divide-zinc-800/50">
      {tracks.map((track) => (
        <li key={track.id}>
          <Link
            href={`/archive/${artistId}/${track.id}`}
            className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
          >
            <span className="w-5 shrink-0 text-right font-mono text-xs tabular text-zinc-600">
              {track.trackNumber}
            </span>
            <span className="flex-1 truncate">
              {track.title}
              {track.features.length > 0
                ? ` (feat. ${track.features.join(', ')})`
                : ''}
            </span>
            {track.isReference && (
              <span className="shrink-0 rounded border border-emerald-500/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-emerald-300">
                reference
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
