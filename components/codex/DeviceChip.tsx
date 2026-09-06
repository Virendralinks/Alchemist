'use client';

import Link from 'next/link';
import { useWorkbenchStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { FAMILY_ACCENT } from './DeviceCard';

/**
 * Hovering sets `hoveredDeviceId`, which the lyric column reads to highlight the
 * matching span. Clicking routes to the device page (Section 2.4).
 */
export function DeviceChip({
  deviceId,
  name,
  family,
  confidence,
  href,
}: {
  deviceId: string;
  name: string;
  family: string;
  confidence: 'certain' | 'arguable';
  href?: string;
}) {
  const hoverDevice = useWorkbenchStore((s) => s.hoverDevice);
  const hovered = useWorkbenchStore((s) => s.hoveredDeviceId === deviceId);

  return (
    <Link
      href={href ?? `/codex/${deviceId}`}
      onMouseEnter={() => hoverDevice(deviceId)}
      onMouseLeave={() => hoverDevice(null)}
      onFocus={() => hoverDevice(deviceId)}
      onBlur={() => hoverDevice(null)}
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] transition-colors',
        FAMILY_ACCENT[family] ?? 'border-zinc-700 text-zinc-300',
        hovered && 'bg-zinc-800/80',
      )}
    >
      <span
        className={cn(
          'size-1 rounded-full',
          confidence === 'certain' ? 'bg-emerald-400' : 'bg-zinc-500',
        )}
        aria-hidden
      />
      {name}
    </Link>
  );
}
