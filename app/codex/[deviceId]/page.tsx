import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { devices } from '@/lib/mock/devices';
import { occurrencesFor, deviceCounts } from '@/lib/codex/device-index';
import { OccurrenceList } from '@/components/codex/OccurrenceList';
import { PracticeButton } from '@/components/codex/PracticeButton';
import { DeviceSeenTracker } from '@/components/codex/DeviceSeenTracker';

export function generateMetadata({
  params,
}: {
  params: { deviceId: string };
}): Metadata {
  const device = devices.find((d) => d.id === params.deviceId);
  return { title: device ? device.name : 'Device not found' };
}

export function generateStaticParams() {
  return devices.map((device) => ({ deviceId: device.id }));
}

/** Definition, canonical example, and every occurrence across the archive. */
export default function DevicePage({ params }: { params: { deviceId: string } }) {
  const device = devices.find((d) => d.id === params.deviceId);
  if (!device) notFound();

  const occurrences = occurrencesFor(device.id);
  const related = device.relatedDeviceIds
    .map((id) => devices.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => d != null);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <DeviceSeenTracker deviceId={device.id} />

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {device.family} · {device.depth} ·{' '}
          {device.detectable ? 'engine-detectable' : 'interpretive'}
        </p>
        <h1 className="mt-1 font-sans text-xl font-semibold text-zinc-100">
          {device.name}
        </h1>
        <p className="mt-2 font-sans text-sm text-zinc-300">
          {device.plainDefinition}
        </p>
      </div>

      <PracticeButton
        deviceId={device.id}
        hasTemplate={device.practiceTemplateId !== null}
      />

      <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Definition
        </p>
        <p className="mt-1 font-sans text-sm text-zinc-400">{device.definition}</p>
      </div>

      <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Canonical example
        </p>
        <p className="mt-2 font-sans text-sm italic text-zinc-200">
          {device.canonicalExample.text}
        </p>
        <p className="mt-1 font-mono text-xs text-zinc-500">
          — {device.canonicalExample.attribution}
        </p>
        <p className="mt-2 font-sans text-sm text-zinc-500">
          {device.canonicalExample.note}
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
          Occurrences ({deviceCounts[device.id] ?? 0})
        </h2>
        <OccurrenceList occurrences={occurrences} />
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
            Related
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/codex/${r.id}`}
                className="rounded-full border border-zinc-800/50 bg-zinc-900/60 px-3 py-1 font-sans text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
