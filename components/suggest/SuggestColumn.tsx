'use client';

import { RhymePanel } from './RhymePanel';
import { PhoneticMatrix } from '@/components/matrix/PhoneticMatrix';

/** Right workbench column: live rhymes + vowel-structure matrix. */
export function SuggestColumn() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <RhymePanel />
      </div>
      <div className="shrink-0 border-t border-zinc-800/50 pt-3">
        <PhoneticMatrix />
      </div>
    </div>
  );
}
