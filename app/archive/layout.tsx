import type { Metadata } from 'next';
import Link from 'next/link';
import { artists } from '@/lib/mock/artists';
import { artistsForNav } from '@/lib/mock/catalogue';
import { ArtistSidebar } from '@/components/archive/ArtistSidebar';

export const metadata: Metadata = {
  title: 'Archive',
};

/** Artist sidebar; reads mock data at module scope and passes it down as props. */
export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-zinc-800/50 bg-zinc-950 p-3">
        <Link
          href="/archive"
          className="mb-2 block px-3 font-mono text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Artists
        </Link>
        <ArtistSidebar artists={artistsForNav(artists)} />
      </aside>
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
