'use client';

import { m } from 'framer-motion';
import type { Lang } from '@/lib/types/phonetics';
import { LangBadge } from '@/components/suggest/LangBadge';
import { MOTION } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface AssonanceChipProps {
  text: string;
  lang: Lang;
  tags: string[];
  score: number;
  onSelect?: (text: string, lang: Lang) => void;
}

export function AssonanceChip({
  text,
  lang,
  tags,
  score,
  onSelect,
}: AssonanceChipProps) {
  return (
    <m.button
      type="button"
      whileTap={{ scale: 0.96 }}
      transition={{ duration: MOTION.grab }}
      onClick={() => onSelect?.(text, lang)}
      className={cn(
        'flex w-full items-center justify-between gap-1 rounded px-1.5 py-1',
        'border border-zinc-800/40 bg-zinc-950/50 font-mono text-[11px] text-zinc-300',
        'hover:border-zinc-600 hover:text-zinc-100',
      )}
    >
      <span className="flex min-w-0 items-center gap-1">
        <span className="truncate">{text}</span>
        <LangBadge lang={lang} />
      </span>
      <span className="shrink-0 tabular text-[9px] text-zinc-600">
        {tags[0] ?? score.toFixed(2)}
      </span>
    </m.button>
  );
}
