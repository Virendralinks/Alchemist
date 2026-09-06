'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavArtist } from '@/lib/mock/catalogue';
import { cn } from '@/lib/utils';

// `accentColor` is a full Tailwind token ('amber-400'); Tailwind cannot build
// class names at runtime, so the hues are enumerated and keyed by family.
const ACCENT_DOT: Record<string, string> = {
  sky: 'bg-sky-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  violet: 'bg-violet-400',
  teal: 'bg-teal-400',
  orange: 'bg-orange-400',
  cyan: 'bg-cyan-400',
  lime: 'bg-lime-400',
  fuchsia: 'bg-fuchsia-400',
  yellow: 'bg-yellow-400',
  zinc: 'bg-zinc-300',
};

export const hueOf = (accentColor: string): string => accentColor.split('-')[0];

/** Navigation only — the catalogue data arrives as props from the server layout. */
export function ArtistSidebar({ artists }: { artists: NavArtist[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {artists.map((artist) => {
        const active = pathname.startsWith(`/archive/${artist.id}`);
        return (
          <Link
            key={artist.id}
            href={`/archive/${artist.id}`}
            className={cn(
              'flex items-center gap-2 rounded px-3 py-1.5 font-sans text-sm transition-colors',
              active
                ? 'bg-zinc-800/60 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
            )}
          >
            <span
              className={cn(
                'size-1.5 shrink-0 rounded-full',
                ACCENT_DOT[hueOf(artist.accentColor)] ?? 'bg-zinc-500',
              )}
              aria-hidden
            />
            <span className="truncate">{artist.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
