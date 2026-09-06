'use client';

import type { AssonanceColumn } from '@/lib/types/matrix';
import type { Lang } from '@/lib/types/phonetics';
import { AssonanceChip } from './AssonanceChip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VowelColumnProps {
  column: AssonanceColumn;
  onSelect?: (text: string, lang: Lang) => void;
}

export function VowelColumn({ column, onSelect }: VowelColumnProps) {
  return (
    <div className="flex w-36 shrink-0 flex-col rounded border border-zinc-800/50 bg-zinc-900/30">
      <div className="border-b border-zinc-800/50 px-2 py-1.5 font-mono text-[10px] text-zinc-400">
        {column.label}
      </div>
      <ScrollArea className="h-40">
        <div className="flex flex-col gap-1 p-1.5">
          {column.entries.map((entry) => (
            <AssonanceChip
              key={`${entry.lang}-${entry.text}`}
              text={entry.text}
              lang={entry.lang}
              tags={entry.tags}
              score={entry.score}
              onSelect={onSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
