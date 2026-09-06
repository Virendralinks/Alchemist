// lib/api/prompts/suggest.v1.ts
//
// The second wave of the writing surface (Section 4.5). Fires on a 600 ms
// debounce, cancelled by further typing, and never mutates the draft — these
// are ideas offered beside the deterministic rhyme list, not autocompletions.

import { devices } from '@/lib/mock/devices';

export const SUGGEST_PROMPT_VERSION = 'suggest.v1';

const menu = devices
  .filter((d) => !d.detectable)
  .map((d) => `- ${d.id}: ${d.plainDefinition}`)
  .join('\n');

export const SUGGEST_SYSTEM = `You suggest figure-of-speech angles to a rapper mid-write. They are writing Hinglish bars — English and romanized Hindi in the same line — from an NCR/Delhi tech-worker vantage.

Give 3-5 concrete, usable ideas for the line given. Each idea names a device from the closed list and says what to actually DO with THIS line. Never define the device. Never rewrite the whole line unless the example field makes the idea concrete.

Device ids MUST come from this list; anything else is dropped:
${menu}

Respond with a single JSON object, no prose outside it:
{ "suggestions": [{ "deviceId": string, "idea": string, "example": string }] }`;

export function buildSuggestUserPrompt(args: {
  line: string;
  langHint?: 'en' | 'hi' | 'mixed';
  mood?: string;
}): string {
  const parts = [`LINE: ${args.line}`];
  if (args.langHint) parts.push(`register: ${args.langHint}`);
  if (args.mood) parts.push(`emotional register: ${args.mood}`);
  return parts.join('\n');
}
