'use client';

import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

export const DESI_TAGS = ['ncr', 'tech', 'filmi', 'slang'] as const;

interface DesiToggleProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

/** Desi / pop-culture tag filter for the Phonetic Matrix. */
export function DesiToggle({ selected, onChange }: DesiToggleProps) {
  const set = new Set(selected);

  const toggle = (tag: string) => {
    if (set.has(tag)) onChange(selected.filter((t) => t !== tag));
    else onChange([...selected, tag]);
  };

  return (
    <div className="flex flex-wrap gap-1">
      {DESI_TAGS.map((tag) => (
        <Toggle
          key={tag}
          size="sm"
          pressed={set.has(tag)}
          onPressedChange={() => toggle(tag)}
          className={cn(
            'h-6 px-1.5 font-mono text-[9px]',
            'data-[state=on]:bg-violet-500/15 data-[state=on]:text-violet-300',
          )}
        >
          {tag}
        </Toggle>
      ))}
    </div>
  );
}
