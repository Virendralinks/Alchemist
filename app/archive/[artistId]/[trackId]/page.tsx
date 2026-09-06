import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { artists } from '@/lib/mock/artists';
import { TrackDissectionScreen } from '@/components/archive/TrackDissectionScreen';

function findTrack(artistId: string, trackId: string) {
  const artist = artists.find((a) => a.id === artistId);
  if (!artist) return null;
  for (const album of artist.albums) {
    const track = album.tracks.find((t) => t.id === trackId);
    if (track) return { artist, album, track };
  }
  return null;
}

export function generateMetadata({
  params,
}: {
  params: { artistId: string; trackId: string };
}): Metadata {
  const found = findTrack(params.artistId, params.trackId);
  return {
    title: found ? `${found.track.title} — ${found.artist.name}` : 'Track not found',
  };
}

export function generateStaticParams() {
  return artists.flatMap((artist) =>
    artist.albums.flatMap((album) =>
      album.tracks.map((track) => ({ artistId: artist.id, trackId: track.id })),
    ),
  );
}

/** Lyric column centre, X-Ray right — the same panel the Bar Dissector uses. */
export default function TrackPage({
  params,
}: {
  params: { artistId: string; trackId: string };
}) {
  const found = findTrack(params.artistId, params.trackId);
  if (!found) notFound();
  const { artist, album, track } = found;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-baseline justify-between gap-3 border-b border-zinc-800/50 px-4 py-2.5">
        <div className="min-w-0">
          <h1 className="truncate font-sans text-sm font-medium text-zinc-200">
            {track.title}
          </h1>
          <p className="truncate font-mono text-xs text-zinc-600">
            <Link
              href={`/archive/${artist.id}`}
              className="transition-colors hover:text-zinc-400"
            >
              {artist.name}
            </Link>{' '}
            · {album.title} ({album.year})
          </p>
        </div>
        {track.isReference && (
          <span className="shrink-0 rounded border border-emerald-500/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-emerald-300">
            reference
          </span>
        )}
      </header>

      {track.lyrics && track.lyrics.length > 0 ? (
        <div className="min-h-0 flex-1">
          <TrackDissectionScreen
            lines={track.lyrics}
            production={track.production}
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="max-w-md text-center font-sans text-sm text-zinc-600">
            This track has no dissection. Only the reference song for each artist
            is annotated line by line —{' '}
            <Link
              href={`/archive/${artist.id}`}
              className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200"
            >
              browse {artist.name}
            </Link>{' '}
            to find it.
          </p>
        </div>
      )}
    </div>
  );
}
