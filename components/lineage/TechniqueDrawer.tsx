'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play } from 'lucide-react';
import type { LineageArtist } from '@/lib/types/lineage';
import { useWorkbenchStore } from '@/lib/store';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

/**
 * Opens on node click. "Load into sequencer" dispatches loadTemplate() and
 * navigates to the bench — the same closing-the-loop move as the codex's
 * Practice button.
 */
export function TechniqueDrawer({
  artist,
  onClose,
}: {
  artist: LineageArtist | null;
  onClose: () => void;
}) {
  const loadTemplate = useWorkbenchStore((s) => s.loadTemplate);
  const router = useRouter();

  return (
    <Drawer open={artist != null} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="border-zinc-800 bg-zinc-950">
        {artist && (
          <div className="mx-auto w-full max-w-2xl px-4 pb-8">
            <DrawerHeader className="px-0">
              <DrawerTitle className="font-sans text-lg text-zinc-100">
                {artist.name}
              </DrawerTitle>
              <DrawerDescription className="font-sans text-sm text-zinc-500">
                {artist.thesis}
              </DrawerDescription>
            </DrawerHeader>

            <p className="mb-3 font-mono text-xs text-zinc-600">
              {artist.era} · {artist.region} · active{' '}
              {artist.yearsActive[0]}–{artist.yearsActive[1] ?? 'present'}
              {artist.archiveArtistId && (
                <>
                  {' · '}
                  <Link
                    href={`/archive/${artist.archiveArtistId}`}
                    className="underline underline-offset-2 transition-colors hover:text-zinc-400"
                  >
                    open in archive
                  </Link>
                </>
              )}
            </p>

            <div className="flex flex-col gap-2">
              {artist.techniques.map((technique) => (
                <div
                  key={technique.id}
                  className="rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-sans text-sm font-medium text-zinc-200">
                        {technique.name}
                      </p>
                      <p className="mt-1 font-sans text-xs leading-relaxed text-zinc-400">
                        {technique.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 shrink-0 gap-1.5 text-xs"
                      onClick={() => {
                        loadTemplate(technique.template, {
                          artistId: artist.id,
                          techniqueId: technique.id,
                        });
                        router.push('/workbench');
                      }}
                    >
                      <Play className="size-3" />
                      Load
                    </Button>
                  </div>
                  <p className="mt-2 border-l-2 border-zinc-800 pl-2 font-sans text-[11px] leading-snug text-zinc-500">
                    <span className="font-mono uppercase tracking-wider text-zinc-600">
                      Listen for:{' '}
                    </span>
                    {technique.listenFor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
