// app/api/dissect/route.ts
//
// Tier 2 interpretation, streamed as NDJSON patches (Section 4.2). Never called
// from a Server Component render path — the dissect slice calls it from the
// client after Tier 1 has already rendered.

import { NextResponse } from 'next/server';
import { dissectRequest, type DissectPatch } from '@/lib/api/schemas';
import { streamPatches } from '@/lib/api/dissect-stream';
import { getAnthropic, hasApiKey, MODEL, MAX_TOKENS } from '@/lib/api/anthropic';
import {
  DISSECT_SYSTEM,
  buildDissectUserPrompt,
} from '@/lib/api/prompts/dissect.v1';

export const runtime = 'nodejs';

const encoder = new TextEncoder();
const ndjson = (patch: DissectPatch) => encoder.encode(`${JSON.stringify(patch)}\n`);

/**
 * Capability probe so the panel can show the degraded state before the writer
 * clicks anything, rather than after a failed request.
 */
export async function GET() {
  return NextResponse.json({ interpretiveAvailable: hasApiKey() });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = dissectRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', detail: parsed.error.issues.slice(0, 5) },
      { status: 400 },
    );
  }

  if (!hasApiKey()) {
    // Degraded, not broken: Tier 1 has already rendered on the client.
    return NextResponse.json(
      {
        error:
          'Interpretive layer unavailable — add ANTHROPIC_API_KEY to .env.local',
        degraded: true,
      },
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

  const { text, tier1, context } = parsed.data;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const modelStream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: DISSECT_SYSTEM,
          messages: [
            {
              role: 'user',
              content: buildDissectUserPrompt({
                text,
                tier1,
                bpm: context?.bpm,
                referenceArtistId: context?.referenceArtistId,
                langHint: context?.langHint,
              }),
            },
          ],
        });

        async function* textChunks(): AsyncGenerator<string> {
          for await (const event of modelStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              yield event.delta.text;
            }
          }
        }

        for await (const patch of streamPatches(textChunks(), text, (reason) =>
          console.warn('[dissect] dropped:', reason),
        )) {
          controller.enqueue(ndjson(patch));
        }

        controller.enqueue(ndjson({ field: 'done', value: { model: MODEL } }));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[dissect] stream failed:', message);
        controller.enqueue(ndjson({ field: 'error', value: { message } }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
