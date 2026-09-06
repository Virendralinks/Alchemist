import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { artists } from '@/lib/mock/artists';
import { albumsWithoutLyrics } from '@/lib/mock/catalogue';
import { AlbumAccordion } from '@/components/archive/AlbumAccordion';

export function generateMetadata({
  params,
}: {
  params: { artistId: string };
}): Metadata {
  const artist = artists.find((a) => a.id === params.artistId);
  return { title: artist ? artist.name : 'Artist not found' };
}

export function generateStaticParams() {
  return artists.map((artist) => ({ artistId: artist.id }));
}

/** Chronological discography as an accordion, reference album open by default. */
export default function ArtistPage({ params }: { params: { artistId: string } }) {
  const artist = artists.find((a) => a.id === params.artistId);
  if (!artist) notFound();

  const trackCount = artist.albums.reduce((sum, a) => sum + a.tracks.length, 0);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="font-sans text-xl font-semibold text-zinc-100">
          {artist.name}
        </h1>
        {artist.aka.length > 0 && (
          <p className="font-mono text-xs text-zinc-600">
            aka {artist.aka.join(', ')}
          </p>
        )}
        <p className="mt-2 max-w-2xl font-sans text-sm text-zinc-500">
          {artist.thesis}
        </p>
        <p className="mt-1 font-mono text-xs text-zinc-600">
          {artist.origin} · active since {artist.activeSince} ·{' '}
          {artist.albums.length} releases · {trackCount} tracks
        </p>
      </div>

      <AlbumAccordion artistId={artist.id} albums={albumsWithoutLyrics(artist.albums)} />
    </div>
  );
}
