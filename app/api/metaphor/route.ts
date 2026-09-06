// app/api/metaphor/route.ts
//
// Reality Flipper extraction: highlighted journal text in, ExtractionResult[]
// out (Section 4.2).

import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import {
  metaphorRequest,
  metaphorResponse,
  type MetaphorResponse,
} from '@/lib/api/schemas';
import { spanResolves } from '@/lib/api/validate';
import { getAnthropic, hasApiKey, MODEL, extractJson } from '@/lib/api/anthropic';
import {
  METAPHOR_SYSTEM,
  buildMetaphorUserPrompt,
} from '@/lib/api/prompts/metaphor.v1';

export const runtime = 'nodejs';

interface RawExtraction {
  output?: unknown;
  gloss?: unknown;
  literal?: unknown;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = metaphorRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { text, span, kind, entryId } = parsed.data;

  // Same span rule as every other boundary — a selection that does not resolve
  // against the entry is a bug upstream, not something to send to a model.
  if (!spanResolves(text, span[0], span[1])) {
    return NextResponse.json(
      { error: 'Selection span does not resolve against the entry text' },
      { status: 400 },
    );
  }

  if (!hasApiKey()) {
    return NextResponse.json(
      { error: 'Extraction unavailable — no ANTHROPIC_API_KEY', degraded: true },
      { status: 503 },
    );
  }

  const client = getAnthropic();
  if (!client) {
    return NextResponse.json(
      { error: 'Model client unavailable', degraded: true },
      { status: 503 },
    );
  }

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: METAPHOR_SYSTEM,
      messages: [
        { role: 'user', content: buildMetaphorUserPrompt({ text, span, kind }) },
      ],
    });

    const raw = message.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');
    const json = extractJson(raw) as { extractions?: RawExtraction[] };

    const extractions = (json.extractions ?? []).flatMap((item) => {
      if (typeof item?.output !== 'string' || item.output.trim().length === 0) {
        return [];
      }
      return [
        {
          id: randomUUID(),
          sourceEntryId: entryId,
          sourceSpan: span,
          kind,
          output: item.output.trim(),
          gloss: typeof item.gloss === 'string' ? item.gloss : undefined,
          literal: typeof item.literal === 'string' ? item.literal : undefined,
          accepted: false,
        },
      ];
    });

    const payload: MetaphorResponse = metaphorResponse.parse({
      extractions,
      model: MODEL,
    });
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[metaphor] failed:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
