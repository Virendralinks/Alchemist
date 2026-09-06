'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { CIPHER_LINE_ID } from '@/lib/store/sequencer-slice';
import { Textarea } from '@/components/ui/textarea';
import { LangBadge } from '@/components/suggest/LangBadge';
import { PronunciationSwitcher } from '@/components/suggest/PronunciationSwitcher';
import { normalizeToken } from '@/lib/engine/tokenizer';

const DEBOUNCE_MS = 120;

/** font-mono structured workspace — typing analyzes and fills the tray. */
export function CipherPane() {
  const analysis = useWorkbenchStore((s) => s.analysis[CIPHER_LINE_ID]);
  const lineText = useWorkbenchStore((s) => s.lineTexts[CIPHER_LINE_ID] ?? '');
  const [text, setText] = useState(lineText);
  const [cursorWord, setCursorWord] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (text.trim().length === 0) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void useWorkbenchStore.getState().analyzeLine(CIPHER_LINE_ID, text);
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text]);

  const activeToken = useMemo(() => {
    if (!analysis || !cursorWord) return null;
    return (
      analysis.find((t) => normalizeToken(t.token) === normalizeToken(cursorWord)) ??
      null
    );
  }, [analysis, cursorWord]);

  const activeTokenKey = activeToken?.token ?? null;
  useEffect(() => {
    if (!activeTokenKey) return;
    const { requestRhymes, matrixFilter } = useWorkbenchStore.getState();
    void requestRhymes(activeTokenKey, activeTokenKey, matrixFilter);
  }, [activeTokenKey]);

  const updateCursorWord = (
    value: string,
    selectionStart: number | null,
  ) => {
    if (selectionStart == null) {
      setCursorWord(null);
      return;
    }
    const left = value.slice(0, selectionStart);
    const right = value.slice(selectionStart);
    const prefix = left.match(/[A-Za-z']+$/)?.[0] ?? '';
    const suffix = right.match(/^[A-Za-z']+/)?.[0] ?? '';
    const word = `${prefix}${suffix}`;
    setCursorWord(word.length > 0 ? word : null);
  };

  return (
    <div className="flex h-full flex-col gap-2 font-mono">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-zinc-400">Cipher</h3>
        <span className="text-[10px] tabular text-zinc-600">
          {analysis?.length ?? 0} tokens
        </span>
      </div>

      <Textarea
        value={text}
        placeholder="deployed the fix, phir bhi client naaraaz"
        className="min-h-[7rem] resize-none border-zinc-800/50 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-700"
        onChange={(e) => {
          setText(e.target.value);
          updateCursorWord(e.target.value, e.target.selectionStart);
        }}
        onClick={(e) =>
          updateCursorWord(e.currentTarget.value, e.currentTarget.selectionStart)
        }
        onKeyUp={(e) =>
          updateCursorWord(e.currentTarget.value, e.currentTarget.selectionStart)
        }
      />

      {analysis && analysis.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {analysis.map((t) => (
            <button
              key={`${t.charStart}-${t.token}`}
              type="button"
              onClick={() => {
                setCursorWord(t.token);
                const { requestRhymes, matrixFilter } = useWorkbenchStore.getState();
                void requestRhymes(t.token, t.token, matrixFilter);
              }}
              className="inline-flex items-center gap-1 rounded border border-zinc-800/50 bg-zinc-900/50 px-1.5 py-0.5 text-[11px] text-zinc-300 hover:border-zinc-600"
            >
              {t.token}
              <LangBadge
                lang={t.lang}
                token={t.token}
                confidence={t.langConfidence}
                locked={t.langLocked}
                compact
              />
            </button>
          ))}
        </div>
      )}

      {activeToken && <PronunciationSwitcher token={activeToken} />}
    </div>
  );
}
