'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkbenchStore } from '@/lib/store';
import { CIPHER_LINE_ID } from '@/lib/store/sequencer-slice';
import type { Lang } from '@/lib/types/phonetics';
import type { RhymeType } from '@/lib/types/rhyme';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { RhymeTypeFilter, ALL_RHYME_TYPES } from './RhymeTypeFilter';
import { RhymeCard } from './RhymeCard';
import { DeviceSuggestions } from './DeviceSuggestions';
import { cn } from '@/lib/utils';

const TAG_OPTIONS = ['ncr', 'tech', 'filmi', 'slang', 'corporate'] as const;

export function RhymePanel() {
  const activeQueryId = useWorkbenchStore((s) => s.activeQueryId);
  const activeQueryToken = useWorkbenchStore((s) => s.activeQueryToken);
  const rhymes = useWorkbenchStore((s) =>
    s.activeQueryId ? s.rhymes[s.activeQueryId] ?? [] : [],
  );
  const phraseRhymes = useWorkbenchStore((s) =>
    s.activeQueryId ? s.phraseRhymes[s.activeQueryId] ?? [] : [],
  );
  const cipherLine = useWorkbenchStore((s) => s.lineTexts[CIPHER_LINE_ID]);
  const matrixFilter = useWorkbenchStore((s) => s.matrixFilter);
  const setMatrixFilter = useWorkbenchStore((s) => s.setMatrixFilter);
  const workerReady = useWorkbenchStore((s) => s.workerReady);

  const [typeFilter, setTypeFilter] = useState<RhymeType[]>([...ALL_RHYME_TYPES]);

  // Mosaic and holorime arrive asynchronously and merge into the same list.
  useEffect(() => {
    if (!activeQueryId || !activeQueryToken) return;
    const { requestPhraseRhymes, lineTexts } = useWorkbenchStore.getState();
    void requestPhraseRhymes(
      activeQueryId,
      activeQueryToken,
      lineTexts[CIPHER_LINE_ID],
    );
  }, [activeQueryId, activeQueryToken, cipherLine]);

  const filtered = useMemo(() => {
    const types = new Set(typeFilter);
    const merged = [...rhymes, ...phraseRhymes];
    return merged
      .filter((r) => types.has(r.type))
      .sort((a, b) => b.score - a.score);
  }, [rhymes, phraseRhymes, typeFilter]);

  const toggleLang = (lang: Lang) => {
    const langs = matrixFilter.langs.includes(lang)
      ? matrixFilter.langs.filter((l) => l !== lang)
      : [...matrixFilter.langs, lang];
    setMatrixFilter({ langs });
  };

  const toggleTag = (tag: string) => {
    const tags = matrixFilter.tags.includes(tag)
      ? matrixFilter.tags.filter((t) => t !== tag)
      : [...matrixFilter.tags, tag];
    setMatrixFilter({ tags });
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-medium text-zinc-300">Suggestions</h2>
        <span className="font-mono text-[10px] text-zinc-600">
          {workerReady ? 'engine ready' : 'loading…'}
        </span>
      </div>

      <div className="space-y-2 rounded border border-zinc-800/50 bg-zinc-900/40 p-2">
        <div className="font-mono text-[10px] text-zinc-500">
          Query:{' '}
          <span className="text-zinc-300">
            {activeQueryToken ?? 'select a syllable or type in cipher'}
          </span>
        </div>

        <RhymeTypeFilter selected={typeFilter} onChange={setTypeFilter} />

        <div className="flex flex-wrap items-center gap-1">
          {(['en', 'hi'] as Lang[]).map((lang) => (
            <Toggle
              key={lang}
              size="sm"
              pressed={matrixFilter.langs.includes(lang)}
              onPressedChange={() => toggleLang(lang)}
              className="h-6 px-1.5 font-mono text-[9px] uppercase"
            >
              {lang}
            </Toggle>
          ))}
          <Toggle
            size="sm"
            pressed={matrixFilter.crossLanguageOnly}
            onPressedChange={(on) => setMatrixFilter({ crossLanguageOnly: on })}
            className="h-6 px-1.5 font-mono text-[9px]"
          >
            x-lang
          </Toggle>
          <Input
            type="number"
            min={1}
            max={8}
            placeholder="syl"
            className="h-6 w-14 border-zinc-800 bg-zinc-950 px-1.5 font-mono text-[10px]"
            value={matrixFilter.syllableCount ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setMatrixFilter({
                syllableCount: v === '' ? null : Number(v),
              });
            }}
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {TAG_OPTIONS.map((tag) => (
            <Toggle
              key={tag}
              size="sm"
              pressed={matrixFilter.tags.includes(tag)}
              onPressedChange={() => toggleTag(tag)}
              className={cn(
                'h-6 px-1.5 font-mono text-[9px]',
                'data-[state=on]:bg-violet-500/15 data-[state=on]:text-violet-300',
              )}
            >
              {tag}
            </Toggle>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 pr-2">
        <div className="flex flex-col gap-1.5 pb-4">
          {filtered.length === 0 ? (
            <p className="font-sans text-xs text-zinc-600">
              {activeQueryId
                ? 'No candidates for the current filters.'
                : 'Rhymes appear within a keystroke of selecting a token.'}
            </p>
          ) : (
            filtered.map((c, i) => (
              <RhymeCard key={`${c.text}-${c.type}-${i}`} candidate={c} index={i} />
            ))
          )}
        </div>
      </ScrollArea>

      <DeviceSuggestions />
    </div>
  );
}
