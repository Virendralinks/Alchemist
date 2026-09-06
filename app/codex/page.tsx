import type { Metadata } from 'next';
import { deviceSummaries } from '@/lib/codex/device-index';
import { DeviceGrid } from '@/components/codex/DeviceGrid';
import { FamilyFilter } from '@/components/codex/FamilyFilter';
import { DepthFilter } from '@/components/codex/DepthFilter';

export const metadata: Metadata = {
  title: 'Codex',
};

/**
 * Device inventory with real occurrence counts. The reverse index is built at
 * module scope on the server (lib/codex/device-index.ts), so the browser
 * receives 81 precomputed summaries and never walks the archive itself.
 */
export default function CodexPage() {
  const annotated = deviceSummaries.filter((d) => d.count > 0).length;
  const total = deviceSummaries.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="font-sans text-xl font-semibold text-zinc-100">Codex</h1>
        <p className="mt-1 font-sans text-sm text-zinc-500">
          {deviceSummaries.length} literary devices across five families.{' '}
          {total} annotated occurrences across {annotated} devices in the
          archive.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <FamilyFilter />
        <DepthFilter />
      </div>

      <DeviceGrid summaries={deviceSummaries} />
    </div>
  );
}
