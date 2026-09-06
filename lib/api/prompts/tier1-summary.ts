// lib/api/prompts/tier1-summary.ts
//
// Tier 1 goes into the prompt as a compact readout, not as raw phoneme objects.
// The model needs to reason about a rhyme scheme that has already been computed
// (Section 4.1); it does not need 60 IPA structs per bar, and sending them
// would burn the context window for no interpretive gain.

import type { RhythmAnalysis } from '@/lib/types/archive';
import type { DeviceInstance } from '@/lib/types/devices';

export function summarizeTier1(
  text: string,
  tier1: RhythmAnalysis,
  engineDevices: DeviceInstance[] = [],
): string {
  const lines: string[] = [];

  lines.push(`syllables: ${tier1.syllableCount}`);
  lines.push(`density: ${tier1.density.toFixed(2)} syllables/bar`);
  lines.push(`end-rhyme scheme letter: ${tier1.schemeLetter}`);
  lines.push(`pocket: ${tier1.pocket}`);
  lines.push(`articulation: ${tier1.articulation}`);

  const langs = tier1.tokens.map((t) => `${t.token}:${t.lang}`).join(' ');
  if (langs) lines.push(`per-token language: ${langs}`);

  if (tier1.internalRhymes.length > 0) {
    const pairs = tier1.internalRhymes
      .slice(0, 12)
      .map(
        (r) =>
          `"${text.slice(r.aSpan[0], r.aSpan[1])}"/"${text.slice(
            r.bSpan[0],
            r.bSpan[1],
          )}" (${r.score.toFixed(2)})`,
      )
      .join(', ');
    lines.push(`internal rhymes: ${pairs}`);
  }

  if (tier1.assonanceChains.length > 0) {
    const chains = tier1.assonanceChains
      .slice(0, 8)
      .map(
        (c) =>
          `${c.key} → ${c.spans
            .map((s) => `"${text.slice(s[0], s[1])}"`)
            .join(' ')}`,
      )
      .join('; ');
    lines.push(`assonance chains: ${chains}`);
  }

  if (engineDevices.length > 0) {
    const found = engineDevices
      .slice(0, 20)
      .map((d) => `${d.deviceId}@[${d.charStart},${d.charEnd}]`)
      .join(', ');
    lines.push(`devices already detected by the engine (do NOT repeat): ${found}`);
  }

  return lines.join('\n');
}
