// tests/helpers/attach-rhythm.ts
//
// Node-only. Next.js pages must never import this — it reaches the engine.

import type { LyricLine } from '@/lib/types/archive';
import { tierOne } from '@/lib/engine/rhythm';

export function attachRhythm(lines: LyricLine[], bpm: number): LyricLine[] {
  return lines.map((line) => {
    if (!line.dissection) return line;
    return {
      ...line,
      dissection: { ...line.dissection, rhythm: tierOne({ text: line.text, bpm }) },
    };
  });
}
