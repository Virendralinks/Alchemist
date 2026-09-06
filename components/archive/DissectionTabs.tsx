'use client';

import { m } from 'framer-motion';
import type { Dissection } from '@/lib/types/archive';
import { devices as deviceCatalogue } from '@/lib/mock/devices';
import { DeviceChip } from '@/components/codex/DeviceChip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOTION } from '@/lib/motion';
import { cn } from '@/lib/utils';

const catalogueById = new Map(deviceCatalogue.map((d) => [d.id, d]));

const LAYER_COLOR: Record<string, string> = {
  literal: 'border-zinc-600 text-zinc-300',
  figurative: 'border-rose-500/40 text-rose-300',
  cultural: 'border-violet-500/40 text-violet-300',
  meta: 'border-amber-500/40 text-amber-300',
};

const TABS = [
  { id: 'meaning', label: 'Meaning' },
  { id: 'flow', label: 'Flow' },
  { id: 'rhyme', label: 'Rhyme' },
  { id: 'why', label: 'Why' },
] as const;

function Prose({ body, empty }: { body: string | null; empty: string }) {
  if (!body) {
    return <p className="font-sans text-xs text-zinc-600">{empty}</p>;
  }
  return (
    <m.p
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.rhymeTotal / 2 }}
      className="font-sans text-sm leading-relaxed text-zinc-300"
    >
      {body}
    </m.p>
  );
}

/**
 * The four interpretive parts, plus entendres and devices. Identical for an
 * authored catalogue line and a line you just typed — provenance only changes
 * the badge, never the layout.
 */
export function DissectionTabs({
  dissection,
  text,
}: {
  dissection: Dissection | null;
  text: string;
}) {
  const entendres = dissection?.entendres ?? [];
  const allDevices = dissection?.devices ?? [];

  return (
    <div className="flex flex-col gap-3">
      <Tabs defaultValue="meaning">
        <TabsList className="h-7 bg-zinc-900/60">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="h-5 px-2 font-mono text-[10px] uppercase tracking-wider"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="meaning" className="mt-2">
          <Prose
            body={dissection?.meaning ?? null}
            empty="No reading yet — this is the interpretive half."
          />
        </TabsContent>
        <TabsContent value="flow" className="mt-2">
          <Prose
            body={dissection?.flowMechanics ?? null}
            empty="No flow-mechanics prose yet."
          />
        </TabsContent>
        <TabsContent value="rhyme" className="mt-2">
          <Prose
            body={dissection?.rhymeScience ?? null}
            empty="No rhyme-science prose yet."
          />
        </TabsContent>
        <TabsContent value="why" className="mt-2">
          <Prose body={dissection?.why ?? null} empty="No craft argument yet." />
        </TabsContent>
      </Tabs>

      {entendres.length > 0 && (
        <div>
          <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Entendres ({entendres.length})
          </h3>
          <div className="flex flex-col gap-1.5">
            {entendres.map((e, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: MOTION.drop }}
                className="rounded border border-zinc-800/50 bg-zinc-900/30 px-2 py-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'rounded border px-1 font-mono text-[9px] uppercase',
                      LAYER_COLOR[e.layer],
                    )}
                  >
                    {e.layer}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-400 underline decoration-dotted underline-offset-2">
                    {text.slice(e.charStart, e.charEnd)}
                  </span>
                </div>
                <p className="mt-0.5 font-sans text-xs leading-snug text-zinc-300">
                  {e.reading}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      )}

      {allDevices.length > 0 && (
        <div>
          <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Devices ({allDevices.length})
          </h3>
          <div className="mb-1.5 flex flex-wrap gap-1">
            {allDevices.map((d, i) => (
              <DeviceChip
                key={`${d.deviceId}-${i}`}
                deviceId={d.deviceId}
                name={catalogueById.get(d.deviceId)?.name ?? d.deviceId}
                family={catalogueById.get(d.deviceId)?.family ?? 'sound'}
                confidence={d.confidence}
              />
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {allDevices.map((d, i) => (
              <div
                key={`exp-${d.deviceId}-${i}`}
                className="rounded border border-zinc-800/50 bg-zinc-900/30 px-2 py-1.5"
              >
                <p
                  className={cn(
                    'font-mono text-[11px] text-zinc-300 underline underline-offset-2',
                    d.confidence === 'certain'
                      ? 'decoration-solid decoration-emerald-400/70'
                      : 'decoration-dotted decoration-zinc-500',
                  )}
                >
                  {text.slice(d.charStart, d.charEnd)}
                </p>
                <p className="mt-0.5 font-sans text-[11px] leading-snug text-zinc-500">
                  {d.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
