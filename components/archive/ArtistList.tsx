import Link from 'next/link';
import type { ArchiveArtist } from '@/lib/types/archive';

// `accentColor` is a full token ('amber-400'); Tailwind needs literal classes,
// so the hues are enumerated and looked up by family.
const ACCENT_BORDER: Record<string, string> = {
  sky: 'hover:border-sky-500/50',
  emerald: 'hover:border-emerald-500/50',
  amber: 'hover:border-amber-500/50',
  rose: 'hover:border-rose-500/50',
  violet: 'hover:border-violet-500/50',
  teal: 'hover:border-teal-500/50',
  orange: 'hover:border-orange-500/50',
  cyan: 'hover:border-cyan-500/50',
  lime: 'hover:border-lime-500/50',
  fuchsia: 'hover:border-fuchsia-500/50',
  yellow: 'hover:border-yellow-500/50',
  zinc: 'hover:border-zinc-500/50',
};

const hueOf = (accentColor: string): string => accentColor.split('-')[0];

/** Server Component — a static list with no interactivity by design. */
export function ArtistList({ artists }: { artists: ArchiveArtist[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {artists.map((artist) => {
        const referenceTrack = artist.albums
          .flatMap((a) => a.tracks)
          .find((t) => t.isReference);

        return (
          <Link
            key={artist.id}
            href={`/archive/${artist.id}`}
            className={`group flex flex-col gap-1 rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3 transition-colors hover:bg-zinc-900/70 ${
              ACCENT_BORDER[hueOf(artist.accentColor)] ?? 'hover:border-zinc-700'
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-sans text-sm font-medium text-zinc-200 group-hover:text-zinc-50">
                {artist.name}
              </span>
              <span className="shrink-0 font-mono text-[10px] tabular text-zinc-600">
                {artist.activeSince}
              </span>
            </div>
            <p className="font-sans text-xs leading-snug text-zinc-500">
              {artist.thesis}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
              {artist.origin} · {artist.albums.length} releases
              {referenceTrack ? ` · ref: ${referenceTrack.title}` : ''}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
