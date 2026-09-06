import type { TrackProduction } from '@/lib/types/production';

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className="font-mono text-xs text-zinc-300">{value}</p>
    </div>
  );
}

/** Server Component — flat facts, no interactivity. */
export function CreditsStrip({ production }: { production: TrackProduction }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded border border-zinc-800/50 bg-zinc-900/40 p-2 sm:grid-cols-4">
      <Fact label="Producers" value={production.producers.join(', ')} />
      <Fact label="BPM" value={String(production.bpm)} />
      <Fact label="Key" value={production.musicalKey} />
      <Fact label="Time" value={production.timeSignature} />
    </div>
  );
}
