'use client';

import type { Album } from '@/lib/types/archive';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TrackList } from './TrackList';

/**
 * Chronological discography. Albums containing the reference track start open,
 * because that is the one the archive can actually teach from.
 */
export function AlbumAccordion({
  artistId,
  albums,
}: {
  artistId: string;
  albums: Album[];
}) {
  const chronological = [...albums].sort((a, b) => a.year - b.year);
  const defaultOpen = chronological
    .filter((album) => album.tracks.some((t) => t.isReference))
    .map((album) => album.id);

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className="flex flex-col gap-2">
      {chronological.map((album) => (
        <AccordionItem
          key={album.id}
          value={album.id}
          className="rounded-lg border border-zinc-800/50 bg-zinc-900/40"
        >
          <AccordionTrigger className="px-4 py-2.5 hover:no-underline">
            <div className="flex flex-1 items-center justify-between gap-3 text-left">
              <div>
                <p className="font-sans text-sm font-medium text-zinc-200">
                  {album.title}
                </p>
                <p className="font-mono text-xs text-zinc-600">
                  {album.year} · {album.kind} · {album.label}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10px] tabular text-zinc-600">
                {album.tracks.length} tracks
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <TrackList artistId={artistId} tracks={album.tracks} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
