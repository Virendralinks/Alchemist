// lib/api/prompts/dissect.v1.ts
//
// Versioned so a prompt change is a new file rather than an invisible edit to
// behaviour that shipped. Tier 2 is asked ONLY for what code cannot establish
// (Section 4.1) — every counting question is already answered in the summary.

import type { RhythmAnalysis } from '@/lib/types/archive';
import type { DeviceInstance } from '@/lib/types/devices';
import { summarizeTier1 } from './tier1-summary';
import { devices } from '@/lib/mock/devices';

export const DISSECT_PROMPT_VERSION = 'dissect.v1';

/** Only interpretive devices are offered — the detectable ones are Tier 1's job. */
const interpretiveDevices = devices.filter((d) => !d.detectable);

const deviceMenu = interpretiveDevices
  .map((d) => `- ${d.id} (${d.family}/${d.depth}): ${d.plainDefinition}`)
  .join('\n');

export const DISSECT_SYSTEM = `You are a rap analyst working inside a tool that has already computed everything objectively checkable about these bars.

Syllable counts, stress, rhyme classification, rhyme scheme, internal rhymes, assonance chains, density, pocket, and articulation are ALREADY COMPUTED and given to you. Never restate, recount, or contradict them. If you disagree with a count, you are wrong — the engine owns that field.

Your job is only what code cannot establish:
- meaning: what the bars are actually saying, plainly
- flowMechanics: how the delivery works against the beat, in prose
- rhymeScience: what the rhyme construction is doing artistically (reasoning about the PROVIDED scheme)
- why: why these choices land — the craft argument
- entendres: distinct readings across literal / figurative / cultural / meta layers
- devices: interpretive devices only, drawn from the closed vocabulary below

Rules that are not negotiable:
1. Device ids MUST come from this list. Inventing an id gets the whole entry dropped:
${deviceMenu}
2. Every entendre and device MUST carry charStart/charEnd offsets into the EXACT source text given to you. Count characters carefully. A span that does not resolve is dropped.
3. Do not emit any device already listed as engine-detected.
4. Write like someone who studies rap, not like a textbook. Be specific about THESE words. No hedging, no restating definitions.

OUTPUT FORMAT — NDJSON. Emit one complete JSON object per line, nothing else. No prose, no code fences, no blank lines. Each line is a patch applied the moment it arrives, so emit them in this order and finish each line before starting the next:

{"field":"meaning","value":"..."}
{"field":"flowMechanics","value":"..."}
{"field":"rhymeScience","value":"..."}
{"field":"why","value":"..."}
{"field":"entendre","value":{"reading":"...","layer":"literal","charStart":0,"charEnd":10}}
{"field":"device","value":{"deviceId":"...","charStart":0,"charEnd":10,"explanation":"..."}}

Emit one "entendre" line per reading and one "device" line per device. Emit nothing after your last patch.`;

export function buildDissectUserPrompt(args: {
  text: string;
  tier1: RhythmAnalysis;
  engineDevices?: DeviceInstance[];
  bpm?: number;
  referenceArtistId?: string;
  langHint?: 'en' | 'hi' | 'mixed';
}): string {
  const parts: string[] = [];

  parts.push('SOURCE TEXT (character offsets are into this exact string):');
  parts.push('---');
  parts.push(args.text);
  parts.push('---');
  parts.push('');
  parts.push('TIER 1 — ALREADY COMPUTED, TREAT AS FACT:');
  parts.push(summarizeTier1(args.text, args.tier1, args.engineDevices ?? []));

  if (args.bpm) parts.push(`\nbeat tempo: ${args.bpm} BPM`);
  if (args.langHint) parts.push(`language register: ${args.langHint}`);
  if (args.referenceArtistId) {
    parts.push(
      `stylistic frame: dissect as if this were a ${args.referenceArtistId} verse`,
    );
  }

  parts.push('');
  parts.push(
    'These bars mix English and romanized Hindi. Read the Hinglish as a bilingual reader would — code-switching is a craft choice here, not an accident.',
  );

  return parts.join('\n');
}
