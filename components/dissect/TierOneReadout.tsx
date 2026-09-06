'use client';

import { useMemo } from 'react';
import type { Dissection } from '@/lib/types/archive';
import type { DeviceInstance } from '@/lib/types/devices';
import { devices as deviceCatalogue } from '@/lib/mock/devices';
import { LangBadge } from '@/components/suggest/LangBadge';
import { cn } from '@/lib/utils';

const FAMILY_COLOR: Record<string, string> = {
  sound: 'text-sky-400 decoration-sky-400',
  figurative: 'text-rose-400 decoration-rose-400',
  structural: 'text-emerald-400 decoration-emerald-400',
  wordplay: 'text-amber-400 decoration-amber-400',
  cultural: 'text-violet-400 decoration-violet-400',
};

const catalogueById = new Map(deviceCatalogue.map((d) => [d.id, d]));

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-zinc-800/50 bg-zinc-900/40 px-2 py-1.5">
      <div className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
        {label}
      </div>
      <div className="font-mono text-sm tabular text-zinc-100">{value}</div>
    </div>
  );
}

function DeviceRow({ device, text }: { device: DeviceInstance; text: string }) {
  const meta = catalogueById.get(device.deviceId);
  const family = meta?.family ?? 'sound';
  const span = text.slice(device.charStart, device.charEnd);

  return (
    <div className="rounded border border-zinc-800/50 bg-zinc-900/30 px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className={cn('font-mono text-[11px]', FAMILY_COLOR[family])}>
          {meta?.name ?? device.deviceId}
        </span>
        <span
          className={cn(
            'font-mono text-[9px] uppercase',
            device.confidence === 'certain' ? 'text-emerald-400' : 'text-zinc-500',
          )}
        >
          {device.confidence}
        </span>
      </div>
      {span && (
        <p
          className={cn(
            'mt-0.5 font-mono text-xs text-zinc-300 underline underline-offset-2',
            FAMILY_COLOR[family],
            device.confidence === 'certain'
              ? 'decoration-solid'
              : 'decoration-dotted',
          )}
        >
          {span}
        </p>
      )}
      <p className="mt-0.5 font-sans text-[11px] leading-snug text-zinc-500">
        {device.explanation}
      </p>
    </div>
  );
}

/** Everything computed: counts, stress, density, pocket, articulation, devices. */
export function TierOneReadout({
  dissection,
  text,
}: {
  dissection: Dissection;
  text: string;
}) {
  const { rhythm } = dissection;

  const stressMap = useMemo(
    () =>
      rhythm.tokens.map((t) => ({
        token: t.token,
        lang: t.lang,
        stresses:
          t.candidates[t.selectedCandidate]?.syllables.map((s) => s.stress) ?? [],
      })),
    [rhythm.tokens],
  );

  const engineDevices = dissection.devices.filter((d) => d.detectedBy === 'engine');

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        <Stat label="Syllables" value={rhythm.syllableCount} />
        <Stat label="Density" value={rhythm.density.toFixed(1)} />
        <Stat label="Scheme" value={rhythm.schemeLetter} />
        <Stat label="Pocket" value={rhythm.pocket} />
        <Stat label="Articulation" value={rhythm.articulation} />
        <Stat label="Internal" value={rhythm.internalRhymes.length} />
      </div>

      <div>
        <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Stress map
        </h3>
        <div className="flex flex-wrap gap-1">
          {stressMap.map((t, i) => (
            <span
              key={`${i}-${t.token}`}
              className="inline-flex items-center gap-1 rounded border border-zinc-800/50 bg-zinc-900/40 px-1.5 py-0.5"
            >
              <span className="font-mono text-[11px] text-zinc-300">{t.token}</span>
              <span className="font-mono text-[10px] tabular text-zinc-500">
                {t.stresses.length > 0 ? t.stresses.join('') : '·'}
              </span>
              <LangBadge lang={t.lang} compact />
            </span>
          ))}
        </div>
      </div>

      {rhythm.assonanceChains.length > 0 && (
        <div>
          <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Assonance chains
          </h3>
          <div className="flex flex-col gap-1">
            {rhythm.assonanceChains.slice(0, 8).map((chain) => (
              <div key={chain.key} className="flex items-center gap-2">
                <span className="shrink-0 rounded border border-zinc-800 px-1 font-mono text-[9px] text-zinc-500">
                  {chain.key}
                </span>
                <span className="min-w-0 truncate font-mono text-[11px] text-zinc-400">
                  {chain.spans.map((s) => text.slice(s[0], s[1])).join(' · ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {rhythm.internalRhymes.length > 0 && (
        <div>
          <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Internal rhymes
          </h3>
          <div className="flex flex-wrap gap-1">
            {rhythm.internalRhymes.slice(0, 12).map((r, i) => (
              <span
                key={i}
                className="rounded border border-zinc-800/50 bg-zinc-900/40 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300"
              >
                {text.slice(r.aSpan[0], r.aSpan[1])} /{' '}
                {text.slice(r.bSpan[0], r.bSpan[1])}
                <span className="ml-1 tabular text-[9px] text-emerald-400/80">
                  {r.score.toFixed(2)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Devices detected ({engineDevices.length})
        </h3>
        {engineDevices.length === 0 ? (
          <p className="font-sans text-xs text-zinc-600">
            No detectable devices in these bars.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {engineDevices.map((d, i) => (
              <DeviceRow key={`${d.deviceId}-${i}`} device={d} text={text} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
