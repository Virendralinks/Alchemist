import type { Metadata } from 'next';
import { LineageCanvas } from '@/components/lineage/LineageCanvas';

export const metadata: Metadata = {
  title: 'Lineage',
};

/**
 * The influence graph. Edges are technical claims — "this artist's structural
 * innovation is visible in that artist's writing" — not biography.
 */
export default function LineagePage() {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-zinc-800/50 px-6 py-3">
        <h1 className="font-sans text-lg font-semibold text-zinc-100">Lineage</h1>
        <p className="mt-0.5 font-sans text-sm text-zinc-500">
          Click an artist to open their techniques and load one into the
          sequencer.
        </p>
      </header>
      <div className="min-h-0 flex-1">
        <LineageCanvas />
      </div>
    </div>
  );
}
