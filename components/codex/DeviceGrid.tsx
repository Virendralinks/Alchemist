'use client';

import { useMemo } from 'react';
import { m } from 'framer-motion';
import { useWorkbenchStore } from '@/lib/store';
import type { DeviceSummary } from '@/lib/codex/device-index';
import type { DeviceFamily } from '@/lib/types/devices';
import { DeviceCard } from './DeviceCard';
import { MOTION } from '@/lib/motion';

const FAMILY_ORDER: DeviceFamily[] = [
  'sound',
  'figurative',
  'structural',
  'wordplay',
  'cultural',
];

/**
 * Receives fully-precomputed summaries — the walk over every artist, album,
 * track, and line that produces the counts happened at module scope on the
 * server (lib/codex/device-index.ts). This component only filters.
 */
export function DeviceGrid({ summaries }: { summaries: DeviceSummary[] }) {
  const familyFilter = useWorkbenchStore((s) => s.familyFilter);
  const depthFilter = useWorkbenchStore((s) => s.depthFilter);

  const visible = useMemo(() => {
    // An empty filter array means "everything".
    const families = new Set(familyFilter);
    const depths = new Set(depthFilter);
    return summaries.filter(
      (d) =>
        (families.size === 0 || families.has(d.family)) &&
        (depths.size === 0 || depths.has(d.depth)),
    );
  }, [summaries, familyFilter, depthFilter]);

  const grouped = useMemo(() => {
    const map = new Map<DeviceFamily, DeviceSummary[]>();
    for (const family of FAMILY_ORDER) map.set(family, []);
    for (const device of visible) map.get(device.family)!.push(device);
    return map;
  }, [visible]);

  if (visible.length === 0) {
    return (
      <p className="font-sans text-sm text-zinc-600">
        No devices match those filters.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {FAMILY_ORDER.map((family) => {
        const items = grouped.get(family) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={family}>
            <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
              {family} ({items.length})
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((device, i) => (
                <m.div
                  key={device.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: MOTION.drop,
                    delay: Math.min(i * MOTION.staggerItem, 0.12),
                  }}
                >
                  <DeviceCard device={device} />
                </m.div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
