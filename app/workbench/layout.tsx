import type { Metadata } from 'next';
import { TransportBar } from '@/components/shell/TransportBar';

export const metadata: Metadata = {
  title: 'Workbench',
};

/**
 * Three-pane frame: sequencer (centre), raw-reality (left), suggestions (right).
 * Panes are composed by page.tsx; this layout owns the transport bar.
 */
export default function WorkbenchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <TransportBar />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
