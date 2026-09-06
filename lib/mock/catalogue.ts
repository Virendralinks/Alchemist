// lib/mock/catalogue.ts
//
// Shapes the discography for Server Components that must not drag lyrics (and
// therefore the dissection graph) into a client island. The sidebar and album
// accordion only need identity, not phonemes.

import type { Album, ArchiveArtist, Track } from '@/lib/types/archive';

export type NavArtist = Pick<ArchiveArtist, 'id' | 'name' | 'accentColor'>;

export function artistsForNav(artists: ArchiveArtist[]): NavArtist[] {
  return artists.map(({ id, name, accentColor }) => ({ id, name, accentColor }));
}

/** Drop lyrics/production so the artist page's client accordion stays small. */
export function albumsWithoutLyrics(albums: Album[]): Album[] {
  return albums.map((album) => ({
    ...album,
    tracks: album.tracks.map(
      (track): Track => ({
        id: track.id,
        title: track.title,
        trackNumber: track.trackNumber,
        features: track.features,
        isReference: track.isReference,
      }),
    ),
  }));
}
