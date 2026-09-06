'use client';

import { useMemo, useRef } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

/** font-sans journal pane — highlight-to-select feeds the extract toolbar. */
export function RawRealityPane() {
  const entries = useWorkbenchStore((s) => s.entries);
  const selectedEntryId = useWorkbenchStore((s) => s.selectedEntryId);
  const selectEntry = useWorkbenchStore((s) => s.selectEntry);
  const setSelectionSpan = useWorkbenchStore((s) => s.setSelectionSpan);
  const selectionSpan = useWorkbenchStore((s) => s.selectionSpan);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  const entry = useMemo(
    () => entries.find((e) => e.id === selectedEntryId) ?? entries[0] ?? null,
    [entries, selectedEntryId],
  );

  const onMouseUp = () => {
    if (!entry || !bodyRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setSelectionSpan(null);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!bodyRef.current.contains(range.commonAncestorContainer)) {
      setSelectionSpan(null);
      return;
    }

    // Offsets relative to the entry body text node content.
    const pre = range.cloneRange();
    pre.selectNodeContents(bodyRef.current);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    const end = start + range.toString().length;
    if (end > start) setSelectionSpan([start, end]);
    else setSelectionSpan(null);
  };

  return (
    <div className="flex h-full flex-col gap-2 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-zinc-400">Raw Reality</h3>
        <span className="text-[10px] text-zinc-600">{entries.length} entries</span>
      </div>

      <ScrollArea className="h-24 shrink-0">
        <div className="flex flex-col gap-0.5 pr-2">
          {entries.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => selectEntry(e.id)}
              className={cn(
                'rounded px-2 py-1 text-left text-[11px] text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300',
                (selectedEntryId ?? entries[0]?.id) === e.id &&
                  'bg-zinc-900 text-zinc-200',
              )}
            >
              <span className="line-clamp-1">{e.body}</span>
            </button>
          ))}
        </div>
      </ScrollArea>

      {entry ? (
        <div className="flex min-h-0 flex-1 flex-col rounded border border-zinc-800/50 bg-zinc-900/40 p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-zinc-800 px-1 font-mono text-[9px] text-zinc-500"
              >
                {tag}
              </span>
            ))}
            <span className="font-mono text-[9px] text-zinc-600">{entry.mood}</span>
          </div>
          <p
            ref={bodyRef}
            onMouseUp={onMouseUp}
            className="flex-1 overflow-y-auto text-sm leading-relaxed text-zinc-300 selection:bg-violet-500/30"
          >
            {entry.body}
          </p>
          {selectionSpan && (
            <p className="mt-2 border-t border-zinc-800/50 pt-2 text-[11px] text-zinc-500">
              Selected:{' '}
              <span className="text-zinc-300">
                “{entry.body.slice(selectionSpan[0], selectionSpan[1])}”
              </span>
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-zinc-600">No journal entries yet.</p>
      )}
    </div>
  );
}
