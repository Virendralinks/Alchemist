'use client';

import { useEffect, useRef, useState } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { CIPHER_LINE_ID } from '@/lib/store/sequencer-slice';
import { devices as deviceCatalogue } from '@/lib/mock/devices';
import { postSuggest, ApiCallError } from '@/lib/api/client';
import type { SuggestResponse } from '@/lib/api/schemas';

/** Second wave: slower than the local rhyme panel, and cancelled on further typing. */
const DEBOUNCE_MS = 600;

const catalogueById = new Map(deviceCatalogue.map((d) => [d.id, d]));

type Suggestion = SuggestResponse['suggestions'][number];

export function DeviceSuggestions() {
  const line = useWorkbenchStore((s) => s.lineTexts[CIPHER_LINE_ID] ?? '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const controller = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const text = line.trim();
    if (timer.current) clearTimeout(timer.current);
    controller.current?.abort();

    if (text.length < 8) {
      setSuggestions((prev) => (prev.length === 0 ? prev : []));
      setNotice(null);
      setLoading(false);
      return;
    }

    timer.current = setTimeout(() => {
      const ac = new AbortController();
      controller.current = ac;
      setLoading(true);
      postSuggest({ line: text }, ac.signal)
        .then((res) => {
          if (ac.signal.aborted) return;
          setSuggestions(res.suggestions);
          setNotice(null);
        })
        .catch((err: unknown) => {
          if (ac.signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
            return;
          }
          setSuggestions([]);
          setNotice(
            err instanceof ApiCallError && err.degraded
              ? 'Add ANTHROPIC_API_KEY for interpretive suggestions.'
              : 'Suggestions unavailable right now.',
          );
        })
        .finally(() => {
          if (!ac.signal.aborted) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      controller.current?.abort();
    };
  }, [line]);

  return (
    <div className="rounded border border-dashed border-zinc-800/40 px-2 py-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          Device suggestions
        </span>
        {loading && <span className="font-mono text-[9px] text-zinc-600">…</span>}
      </div>

      {notice && (
        <p className="mt-1 font-sans text-[11px] text-zinc-600">{notice}</p>
      )}

      {!notice && suggestions.length === 0 && !loading && (
        <p className="mt-1 font-sans text-[11px] text-zinc-600">
          Keep writing — interpretive angles arrive as a second wave.
        </p>
      )}

      <div className="mt-1.5 flex flex-col gap-1">
        {suggestions.map((s, i) => (
          <div
            key={`${s.deviceId}-${i}`}
            className="rounded border border-dotted border-zinc-700 bg-zinc-900/30 px-2 py-1.5"
          >
            <span className="font-mono text-[10px] text-amber-400/90">
              {catalogueById.get(s.deviceId)?.name ?? s.deviceId}
            </span>
            <p className="mt-0.5 font-sans text-[11px] leading-snug text-zinc-300">
              {s.idea}
            </p>
            {s.example && (
              <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
                {s.example}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
