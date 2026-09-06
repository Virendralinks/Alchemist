'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { LineageArtist } from '@/lib/types/lineage';
import { cn } from '@/lib/utils';

/**
 * `accentColor` is a full Tailwind token ('amber-400'). Tailwind can't build
 * class names at runtime, so the hues are enumerated and keyed by family.
 */
export const hueOf = (accentColor: string): string => accentColor.split('-')[0];

export const ACCENT: Record<string, { border: string; text: string; glow: string }> = {
  sky: { border: 'border-sky-500/60', text: 'text-sky-300', glow: 'shadow-sky-500/20' },
  emerald: {
    border: 'border-emerald-500/60',
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/20',
  },
  amber: {
    border: 'border-amber-500/60',
    text: 'text-amber-300',
    glow: 'shadow-amber-500/20',
  },
  rose: { border: 'border-rose-500/60', text: 'text-rose-300', glow: 'shadow-rose-500/20' },
  violet: {
    border: 'border-violet-500/60',
    text: 'text-violet-300',
    glow: 'shadow-violet-500/20',
  },
  teal: { border: 'border-teal-500/60', text: 'text-teal-300', glow: 'shadow-teal-500/20' },
  orange: {
    border: 'border-orange-500/60',
    text: 'text-orange-300',
    glow: 'shadow-orange-500/20',
  },
  cyan: { border: 'border-cyan-500/60', text: 'text-cyan-300', glow: 'shadow-cyan-500/20' },
  lime: { border: 'border-lime-500/60', text: 'text-lime-300', glow: 'shadow-lime-500/20' },
  fuchsia: {
    border: 'border-fuchsia-500/60',
    text: 'text-fuchsia-300',
    glow: 'shadow-fuchsia-500/20',
  },
  yellow: {
    border: 'border-yellow-500/60',
    text: 'text-yellow-300',
    glow: 'shadow-yellow-500/20',
  },
  zinc: { border: 'border-zinc-500/60', text: 'text-zinc-200', glow: 'shadow-zinc-500/20' },
};

export function ArtistNode({ data, selected }: NodeProps) {
  const artist = data as unknown as LineageArtist;
  const accent = ACCENT[hueOf(artist.accentColor)] ?? ACCENT.sky;

  return (
    <div
      className={cn(
        'w-44 rounded-lg border bg-zinc-950/95 px-3 py-2 shadow-lg transition-shadow',
        accent.border,
        selected ? `shadow-xl ${accent.glow}` : 'shadow-black/40',
      )}
    >
      <Handle type="target" position={Position.Top} className="!size-1.5 !bg-zinc-600" />
      <p className={cn('font-sans text-sm font-medium', accent.text)}>{artist.name}</p>
      <p className="font-mono text-[10px] text-zinc-600">
        {artist.era} · {artist.region}
      </p>
      <p className="mt-1 line-clamp-3 font-sans text-[11px] leading-snug text-zinc-500">
        {artist.thesis}
      </p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-zinc-600">
        {artist.techniques.length} technique
        {artist.techniques.length === 1 ? '' : 's'}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-1.5 !bg-zinc-600"
      />
    </div>
  );
}
