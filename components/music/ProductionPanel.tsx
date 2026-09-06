'use client';

import { useMemo, useState } from 'react';
import type { TrackProduction } from '@/lib/types/production';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GenreBlendBar } from './GenreBlendBar';
import { SampleGraph } from './SampleGraph';
import { ArrangementRail } from './ArrangementRail';
import { CreditsStrip } from './CreditsStrip';

/** Studying rap without studying the beat is studying half of it. */
export function ProductionPanel({ production }: { production: TrackProduction }) {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  // Clicking a genre segment filters the graph; the panel owns that state
  // because both children need it.
  const filteredSamples = useMemo(() => production.samples, [production.samples]);

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3">
      <Tabs defaultValue="blend">
        <TabsList className="h-7 bg-zinc-900/60">
          <TabsTrigger
            value="blend"
            className="h-5 px-2 font-mono text-[10px] uppercase tracking-wider"
          >
            Blend
          </TabsTrigger>
          <TabsTrigger
            value="samples"
            className="h-5 px-2 font-mono text-[10px] uppercase tracking-wider"
          >
            Samples
          </TabsTrigger>
          <TabsTrigger
            value="arrangement"
            className="h-5 px-2 font-mono text-[10px] uppercase tracking-wider"
          >
            Arrangement
          </TabsTrigger>
          <TabsTrigger
            value="credits"
            className="h-5 px-2 font-mono text-[10px] uppercase tracking-wider"
          >
            Credits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blend" className="mt-2">
          <GenreBlendBar
            blend={production.genreBlend}
            activeGenre={activeGenre}
            onSelect={setActiveGenre}
          />
        </TabsContent>

        <TabsContent value="samples" className="mt-2">
          <SampleGraph samples={filteredSamples} activeGenre={activeGenre} />
        </TabsContent>

        <TabsContent value="arrangement" className="mt-2">
          <ArrangementRail sections={production.sections} />
          <p className="mt-2 font-sans text-[11px] leading-snug text-zinc-500">
            {production.vocalPlacement}
          </p>
        </TabsContent>

        <TabsContent value="credits" className="mt-2 flex flex-col gap-2">
          <CreditsStrip production={production} />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              Drums
            </p>
            <p className="font-sans text-[11px] text-zinc-400">
              {production.drumPalette.join(' · ')}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              Instrumentation
            </p>
            <p className="font-sans text-[11px] text-zinc-400">
              {production.instrumentation.join(' · ')}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              Mix
            </p>
            <p className="font-sans text-[11px] text-zinc-400">
              {production.mixCharacter}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              Era
            </p>
            <p className="font-sans text-[11px] leading-snug text-zinc-400">
              {production.eraContext}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
