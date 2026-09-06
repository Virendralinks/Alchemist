'use client';

import { useCallback, useMemo } from 'react';
import type { LyricLine } from '@/lib/types/archive';
import type { SongSection } from '@/lib/types/production';
import { useWorkbenchStore } from '@/lib/store';
import { DeviceLensToggle } from '@/components/codex/DeviceLensToggle';
import { FamilyFilter } from '@/components/codex/FamilyFilter';
import { DepthFilter } from '@/components/codex/DepthFilter';
import { LyricLineRow } from './LyricLineRow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** A 4-bar block is the unit a writer actually studies. */
const BLOCK_SIZE = 4;

export function LyricColumn({
  lines,
  sections,
}: {
  lines: LyricLine[];
  sections?: SongSection[];
}) {
  const selectedLineIds = useWorkbenchStore((s) => s.selectedLineIds);
  const selectedBlockRange = useWorkbenchStore((s) => s.selectedBlockRange);
  const selectLine = useWorkbenchStore((s) => s.selectLine);
  const selectBlockRange = useWorkbenchStore((s) => s.selectBlockRange);
  const clearSelection = useWorkbenchStore((s) => s.clearSelection);
  const lensEnabled = useWorkbenchStore((s) => s.lensEnabled);

  const onSelect = useCallback(
    (lineId: string, additive: boolean) => selectLine(lineId, additive),
    [selectLine],
  );

  const sectionByLineId = useMemo(() => {
    const map = new Map<string, SongSection>();
    for (const section of sections ?? []) {
      for (const lineId of section.lineIds) map.set(lineId, section);
    }
    return map;
  }, [sections]);

  const isSelected = useCallback(
    (line: LyricLine) => {
      if (selectedBlockRange) {
        return (
          line.barIndex >= selectedBlockRange[0] &&
          line.barIndex <= selectedBlockRange[1]
        );
      }
      return selectedLineIds.includes(line.id);
    },
    [selectedBlockRange, selectedLineIds],
  );

  const blockStarts = useMemo(() => {
    const maxBar = lines.reduce((m, l) => Math.max(m, l.barIndex), 0);
    const starts: number[] = [];
    for (let bar = 0; bar <= maxBar; bar += BLOCK_SIZE) starts.push(bar);
    return starts;
  }, [lines]);

  let lastSectionId: string | null = null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <DeviceLensToggle />
        {(selectedLineIds.length > 0 || selectedBlockRange) && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[11px] text-zinc-500"
            onClick={clearSelection}
          >
            Clear selection
          </Button>
        )}
      </div>

      {lensEnabled && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded border border-sky-500/20 bg-sky-500/5 px-2 py-1.5">
          <FamilyFilter />
          <DepthFilter />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          4-bar blocks
        </span>
        {blockStarts.map((start) => {
          const end = start + BLOCK_SIZE - 1;
          const active =
            selectedBlockRange?.[0] === start && selectedBlockRange?.[1] === end;
          return (
            <button
              key={start}
              type="button"
              onClick={() => selectBlockRange(active ? null : [start, end])}
              aria-pressed={active}
              className={cn(
                'rounded border px-1.5 py-0.5 font-mono text-[10px] tabular transition-colors',
                active
                  ? 'border-zinc-500 text-zinc-200'
                  : 'border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400',
              )}
            >
              {start + 1}–{end + 1}
            </button>
          );
        })}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-0.5 pr-3">
          {lines.map((line) => {
            const section = sectionByLineId.get(line.id);
            const showHeader = section != null && section.id !== lastSectionId;
            if (section) lastSectionId = section.id;

            return (
              <div key={line.id}>
                {showHeader && (
                  <div className="mb-1 mt-3 flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                      {section!.label}
                    </span>
                    {section!.beatSwitch && (
                      <span className="rounded border border-amber-500/40 px-1 font-mono text-[9px] uppercase text-amber-400/80">
                        beat switch
                      </span>
                    )}
                    <div className="h-px flex-1 bg-zinc-800/50" />
                  </div>
                )}
                <LyricLineRow
                  line={line}
                  selected={isSelected(line)}
                  showSpans={lensEnabled || isSelected(line)}
                  onSelect={onSelect}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
