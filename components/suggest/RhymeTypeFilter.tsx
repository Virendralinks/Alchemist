'use client';

import type { RhymeType } from '@/lib/types/rhyme';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

export const ALL_RHYME_TYPES: RhymeType[] = [
  'perfect',
  'identical',
  'slant',
  'para',
  'consonance',
  'assonance-chain',
  'internal',
  'multisyllabic',
  'mosaic',
  'holorime',
  'forced',
];

const SHORT: Record<RhymeType, string> = {
  perfect: 'perf',
  identical: 'id',
  slant: 'slant',
  para: 'para',
  consonance: 'cons',
  'assonance-chain': 'asson',
  internal: 'int',
  multisyllabic: 'multi',
  mosaic: 'mosaic',
  holorime: 'holo',
  forced: 'forced',
};

interface RhymeTypeFilterProps {
  selected: RhymeType[];
  onChange: (next: RhymeType[]) => void;
}

export function RhymeTypeFilter({ selected, onChange }: RhymeTypeFilterProps) {
  const set = new Set(selected);

  const toggle = (type: RhymeType) => {
    if (set.has(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {ALL_RHYME_TYPES.map((type) => (
        <Toggle
          key={type}
          size="sm"
          pressed={set.has(type)}
          onPressedChange={() => toggle(type)}
          className={cn(
            'h-6 px-1.5 font-mono text-[9px] uppercase text-zinc-500',
            'data-[state=on]:bg-zinc-800 data-[state=on]:text-zinc-100',
          )}
          aria-label={`Filter ${type}`}
        >
          {SHORT[type]}
        </Toggle>
      ))}
    </div>
  );
}
