'use client';

import { useMemo } from 'react';
import { m } from 'framer-motion';
import type { LyricLine } from '@/lib/types/archive';
import type { DeviceInstance } from '@/lib/types/devices';
import { useWorkbenchStore } from '@/lib/store';
import { devices as deviceCatalogue } from '@/lib/mock/devices';
import { MOTION } from '@/lib/motion';
import { cn } from '@/lib/utils';

const catalogueById = new Map(deviceCatalogue.map((d) => [d.id, d]));

const FAMILY_UNDERLINE: Record<string, string> = {
  sound: 'decoration-sky-400',
  figurative: 'decoration-rose-400',
  structural: 'decoration-emerald-400',
  wordplay: 'decoration-amber-400',
  cultural: 'decoration-violet-400',
};

const FAMILY_GLOW: Record<string, string> = {
  sound: 'rgba(56,189,248,0.22)',
  figurative: 'rgba(251,113,133,0.22)',
  structural: 'rgba(52,211,153,0.22)',
  wordplay: 'rgba(251,191,36,0.22)',
  cultural: 'rgba(167,139,250,0.22)',
};

interface Segment {
  text: string;
  covering: DeviceInstance[];
}

/**
 * Slice the line at every span boundary so overlapping annotations each get
 * their own segment. Rendering spans as nested elements would break as soon as
 * two devices partially overlap, which they routinely do.
 */
function segment(text: string, instances: DeviceInstance[]): Segment[] {
  if (instances.length === 0) return [{ text, covering: [] }];

  const bounds = new Set<number>([0, text.length]);
  for (const d of instances) {
    if (d.charStart >= 0 && d.charEnd <= text.length && d.charStart < d.charEnd) {
      bounds.add(d.charStart);
      bounds.add(d.charEnd);
    }
  }

  const ordered = [...bounds].sort((a, b) => a - b);
  const segments: Segment[] = [];
  for (let i = 0; i < ordered.length - 1; i += 1) {
    const from = ordered[i];
    const to = ordered[i + 1];
    if (to <= from) continue;
    segments.push({
      text: text.slice(from, to),
      covering: instances.filter((d) => d.charStart <= from && d.charEnd >= to),
    });
  }
  return segments;
}

export function LyricLineRow({
  line,
  selected,
  showSpans,
  onSelect,
}: {
  line: LyricLine;
  selected: boolean;
  showSpans: boolean;
  onSelect: (lineId: string, additive: boolean) => void;
}) {
  const hoveredDeviceId = useWorkbenchStore((s) => s.hoveredDeviceId);
  const hoverDevice = useWorkbenchStore((s) => s.hoverDevice);
  const lensEnabled = useWorkbenchStore((s) => s.lensEnabled);
  const familyFilter = useWorkbenchStore((s) => s.familyFilter);
  const depthFilter = useWorkbenchStore((s) => s.depthFilter);

  const visibleInstances = useMemo(() => {
    const all = line.dissection?.devices ?? [];
    if (!showSpans) return [];
    // The lens is the only mode the family/depth filters apply to; a selected
    // line always shows all of its own annotations.
    if (!lensEnabled) return all;

    const families = new Set(familyFilter);
    const depths = new Set(depthFilter);
    return all.filter((d) => {
      const meta = catalogueById.get(d.deviceId);
      if (!meta) return false;
      return (
        (families.size === 0 || families.has(meta.family)) &&
        (depths.size === 0 || depths.has(meta.depth))
      );
    });
  }, [line.dissection, showSpans, lensEnabled, familyFilter, depthFilter]);

  const segments = useMemo(
    () => segment(line.text, visibleInstances),
    [line.text, visibleInstances],
  );

  return (
    <div
      id={line.id}
      role="button"
      tabIndex={0}
      onClick={(e) => onSelect(line.id, e.shiftKey)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(line.id, e.shiftKey);
        }
      }}
      className={cn(
        'flex cursor-pointer items-baseline gap-3 rounded px-2 py-1 transition-colors',
        selected ? 'bg-zinc-800/60' : 'hover:bg-zinc-900/60',
      )}
    >
      <span className="w-6 shrink-0 text-right font-mono text-[10px] tabular text-zinc-700">
        {line.barIndex + 1}
      </span>

      <p className="flex-1 font-mono text-sm leading-relaxed text-zinc-200">
        {segments.map((seg, i) => {
          if (seg.covering.length === 0) return <span key={i}>{seg.text}</span>;

          // The first covering instance wins the underline colour; the rest
          // still register for hover, which is what the chip list needs.
          const primary = seg.covering[0];
          const meta = catalogueById.get(primary.deviceId);
          const family = meta?.family ?? 'sound';
          const isHovered = seg.covering.some((d) => d.deviceId === hoveredDeviceId);

          return (
            <m.span
              key={i}
              onMouseEnter={() => hoverDevice(primary.deviceId)}
              onMouseLeave={() => hoverDevice(null)}
              initial={false}
              animate={{
                backgroundColor: isHovered ? FAMILY_GLOW[family] : 'rgba(0,0,0,0)',
              }}
              transition={{ duration: MOTION.hover }}
              className={cn(
                'rounded-sm underline underline-offset-4',
                FAMILY_UNDERLINE[family],
                primary.confidence === 'certain'
                  ? 'decoration-solid'
                  : 'decoration-dotted',
              )}
            >
              {seg.text}
            </m.span>
          );
        })}
      </p>

      {line.dissection && (
        <span className="shrink-0 font-mono text-[10px] tabular text-zinc-700">
          {line.dissection.rhythm.schemeLetter}
        </span>
      )}
    </div>
  );
}
