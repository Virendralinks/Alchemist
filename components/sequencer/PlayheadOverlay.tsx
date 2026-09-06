'use client';

import { useEffect, useRef } from 'react';
import { SLOT_COUNT } from '@/lib/engine/grid';

interface PlayheadOverlayProps {
  bpm: number;
  isPlaying: boolean;
  /** Pixel width of one sixteenth-note slot, including gap. */
  slotStridePx: number;
}

/**
 * rAF-driven playhead. Mutates the DOM directly so the sequencer grid does not
 * re-render every frame during playback (Section 5.3).
 */
export function PlayheadOverlay({ bpm, isPlaying, slotStridePx }: PlayheadOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!isPlaying) {
      startRef.current = null;
      el.style.opacity = '0';
      return;
    }

    el.style.opacity = '1';
    let raf = 0;
    const msPerSlot = ((60 / Math.max(40, bpm)) * 1000) / 4;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const slot = Math.floor(elapsed / msPerSlot) % SLOT_COUNT;
      const bar = (slot / 16) | 0;
      const withinBar = slot % 16;
      // 4 beat-groups per bar with gap-1 (4px) between groups; approximate
      // horizontal position from slot stride measured by the parent.
      const x = bar * (16 * slotStridePx + 4) + withinBar * slotStridePx;
      el.style.transform = `translate3d(${x}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [bpm, isPlaying, slotStridePx]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute top-0 z-20 h-full w-0.5 bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.6)] opacity-0"
      style={{ willChange: 'transform' }}
    />
  );
}
