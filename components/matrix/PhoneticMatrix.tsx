'use client';

import { useMemo, useState } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import type { Lang } from '@/lib/types/phonetics';
import { DesiToggle } from './DesiToggle';
import { VowelColumn } from './VowelColumn';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PhoneticMatrix() {
  const columns = useWorkbenchStore((s) => s.matrixColumns);
  const requestRhymes = useWorkbenchStore((s) => s.requestRhymes);
  const matrixFilter = useWorkbenchStore((s) => s.matrixFilter);
  const [desiTags, setDesiTags] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (desiTags.length === 0) return columns;
    return columns
      .map((col) => ({
        ...col,
        entries: col.entries.filter((e) =>
          desiTags.some((t) => e.tags.includes(t)),
        ),
      }))
      .filter((col) => col.entries.length > 0);
  }, [columns, desiTags]);

  const onSelect = (text: string, lang: Lang) => {
    void requestRhymes(text, text, { ...matrixFilter, langs: [lang] });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Phonetic Matrix
        </h3>
        <DesiToggle selected={desiTags} onChange={setDesiTags} />
      </div>

      {filtered.length === 0 ? (
        <p className="font-sans text-xs text-zinc-600">
          {columns.length === 0
            ? 'Matrix loads with the rhyme index…'
            : 'No columns match the Desi tag filter.'}
        </p>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {filtered.map((col) => (
              <VowelColumn key={col.key} column={col} onSelect={onSelect} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
