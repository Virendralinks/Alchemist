import type { Metadata } from 'next';
import { artists } from '@/lib/mock/artists';
import { ArtistList } from '@/components/archive/ArtistList';

export const metadata: Metadata = {
  title: 'Archive',
};

/** Server Component — the catalogue is static module data, so this ships no JS. */
export default function ArchivePage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="font-sans text-xl font-semibold text-zinc-100">Archive</h1>
        <p className="mt-1 max-w-2xl font-sans text-sm text-zinc-500">
          {artists.length} artists, each with a chronological discography and one
          fully dissected reference song. Artist theses are technical, not
          biographical — what they changed about how rap is built.
        </p>
      </div>

      <ArtistList artists={artists} />
    </div>
  );
}
