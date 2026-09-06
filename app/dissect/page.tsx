import type { Metadata } from 'next';
import { BarDissector } from '@/components/dissect/BarDissector';

export const metadata: Metadata = {
  title: 'Dissector',
};

/** Wraps <BarDissector/> — paste or type any bars, English or Hinglish. */
export default function DissectPage() {
  return (
    <div className="mx-auto h-full max-w-7xl overflow-hidden p-6">
      <BarDissector />
    </div>
  );
}
