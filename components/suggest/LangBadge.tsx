'use client';

import type { Lang } from '@/lib/types/phonetics';
import { useWorkbenchStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LangBadgeProps {
  lang: Lang;
  /** Token text used as the override key. When omitted, badge is display-only. */
  token?: string;
  confidence?: number;
  locked?: boolean;
  compact?: boolean;
}

/**
 * One-click language override. Persists via langOverrides in the engine slice
 * and immediately re-analyzes (Section 3.2).
 */
export function LangBadge({
  lang,
  token,
  confidence,
  locked,
  compact,
}: LangBadgeProps) {
  const overrideLang = useWorkbenchStore((s) => s.overrideLang);

  const flip = () => {
    if (!token) return;
    overrideLang(token, lang === 'en' ? 'hi' : 'en');
  };

  const label = lang.toUpperCase();
  const title =
    token != null
      ? `Language ${label}${locked ? ' (locked)' : ''}. Click to flip.`
      : label;

  const badge = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        flip();
      }}
      disabled={!token}
      className={cn(
        'rounded border font-mono uppercase leading-none',
        compact ? 'px-1 py-0.5 text-[8px]' : 'px-1.5 py-0.5 text-[10px]',
        lang === 'hi'
          ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
          : 'border-sky-500/40 bg-sky-500/10 text-sky-300',
        locked && 'ring-1 ring-zinc-400/40',
        !token && 'cursor-default',
        token && 'cursor-pointer hover:brightness-125 active:scale-95',
      )}
      aria-label={title}
    >
      {label}
      {!compact && confidence != null && (
        <span className="ml-1 tabular text-zinc-500">
          {Math.round(confidence * 100)}
        </span>
      )}
    </button>
  );

  if (!token) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="font-sans text-xs">
        {title}
      </TooltipContent>
    </Tooltip>
  );
}
