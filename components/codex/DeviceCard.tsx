import Link from 'next/link';
import type { DeviceSummary } from '@/lib/codex/device-index';
import { cn } from '@/lib/utils';

export const FAMILY_ACCENT: Record<string, string> = {
  sound: 'border-sky-500/30 text-sky-300',
  figurative: 'border-rose-500/30 text-rose-300',
  structural: 'border-emerald-500/30 text-emerald-300',
  wordplay: 'border-amber-500/30 text-amber-300',
  cultural: 'border-violet-500/30 text-violet-300',
};

/**
 * Presentational only — no hooks, no store. Rendered from a Server Component on
 * `/codex/[deviceId]` and from the client grid on `/codex`, unchanged.
 */
export function DeviceCard({ device }: { device: DeviceSummary }) {
  return (
    <Link
      href={`/codex/${device.id}`}
      className="group flex flex-col gap-1 rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900/70"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-sans text-sm font-medium text-zinc-200 group-hover:text-zinc-50">
          {device.name}
        </span>
        <span
          className={cn(
            'shrink-0 rounded border px-1.5 font-mono text-[10px] tabular',
            device.count > 0
              ? 'border-zinc-700 text-zinc-300'
              : 'border-zinc-800 text-zinc-600',
          )}
          title={`${device.count} occurrences in the archive`}
        >
          {device.count}
        </span>
      </div>

      <p className="font-sans text-xs leading-snug text-zinc-500">
        {device.plainDefinition}
      </p>

      <div className="mt-0.5 flex flex-wrap items-center gap-1">
        <span
          className={cn(
            'rounded border px-1 font-mono text-[9px] uppercase tracking-wide',
            FAMILY_ACCENT[device.family],
          )}
        >
          {device.family}
        </span>
        <span className="rounded border border-zinc-800 px-1 font-mono text-[9px] uppercase tracking-wide text-zinc-500">
          {device.depth}
        </span>
        {device.detectable && (
          <span className="rounded border border-emerald-500/30 px-1 font-mono text-[9px] uppercase tracking-wide text-emerald-400/80">
            detectable
          </span>
        )}
        {device.bilingualOnly && (
          <span className="rounded border border-amber-500/30 px-1 font-mono text-[9px] uppercase tracking-wide text-amber-400/80">
            bilingual
          </span>
        )}
      </div>
    </Link>
  );
}
