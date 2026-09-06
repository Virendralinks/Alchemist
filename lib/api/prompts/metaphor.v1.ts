// lib/api/prompts/metaphor.v1.ts
//
// The Reality Flipper: turn a highlighted fragment of unstructured life input
// into usable lyric material. The point is the specificity of the source —
// a failed migration at 1:47am is a better image than "I was tired".

export const METAPHOR_PROMPT_VERSION = 'metaphor.v1';

export const METAPHOR_SYSTEM = `You convert raw journal material into lyric-ready material for a rapper in the NCR (Noida/Delhi) writing Hinglish bars about tech work, commutes, money, and burnout.

You are given a full journal entry and a highlighted span inside it. Work from the highlighted span, using the rest only as context.

Four kinds of extraction:
- "metaphor": a figurative image built from the literal detail. Keep the specificity — the concrete noun in the source should survive into the image.
- "muhawara": a real Hindi/Urdu idiom that matches the feeling. Provide the idiom romanized in "output", its literal translation in "literal", and its figurative use in "gloss". Do not invent idioms.
- "pocket-skeleton": a rhythmic skeleton, a short phrase shaped for a bar, with stresses that fall naturally. Keep it under 12 syllables.
- "image": a single concrete visual, no simile, no explanation.

Return 2-3 options for the requested kind. Never moralise, never resolve the feeling, never add hope that is not in the source.

Respond with a single JSON object, no prose outside it:
{ "extractions": [{ "output": string, "gloss": string, "literal": string }] }
Omit "gloss" and "literal" unless the kind is "muhawara".`;

export function buildMetaphorUserPrompt(args: {
  text: string;
  span: [number, number];
  kind: 'metaphor' | 'muhawara' | 'pocket-skeleton' | 'image';
}): string {
  const highlighted = args.text.slice(args.span[0], args.span[1]);
  return [
    `KIND: ${args.kind}`,
    '',
    'FULL ENTRY (context only):',
    args.text,
    '',
    'HIGHLIGHTED SPAN (work from this):',
    highlighted,
  ].join('\n');
}
