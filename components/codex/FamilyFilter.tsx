'use client';

import { useWorkbenchStore } from '@/lib/store';
import type { DeviceFamily } from '@/lib/types/devices';
import { cn } from '@/lib/utils';
import { FAMILY_ACCENT } from './DeviceCard';

const FAMILIES: DeviceFamily[] = [
  'sound',
  'figurative',
  'structural',
  'wordplay',
  'cultural',
];

/** No selection means "everything", so the view is never accidentally empty. */
export function FamilyFilter() {
  const familyFilter = useWorkbenchStore((s) => s.familyFilter);
  const toggleFamily = useWorkbenchStore((s) => s.toggleFamily);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
        Family
      </span>
      {FAMILIES.map((family) => {
        const active = familyFilter.includes(family);
        return (
          <button
            key={family}
            type="button"
            onClick={() => toggleFamily(family)}
            aria-pressed={active}
            className={cn(
              'rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide transition-colors',
              active
                ? FAMILY_ACCENT[family]
                : 'border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400',
            )}
          >
            {family}
          </button>
        );
      })}
    </div>
  );
}
