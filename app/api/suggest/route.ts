// app/api/suggest/route.ts
//
// The second wave of the writing surface (Section 4.5). Debounced 600 ms and
// cancellable client-side; suggestions never mutate the draft.

import { NextResponse } from 'next/server';
import {
  suggestRequest,
  deviceSuggestion,
  type SuggestResponse,
} from '@/lib/api/schemas';
import { getAnthropic, hasApiKey, MODEL, extractJson } from '@/lib/api/anthropic';
import {
  SUGGEST_SYSTEM,
  buildSuggestUserPrompt,
} from '@/lib/api/prompts/suggest.v1';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = suggestRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!hasApiKey()) {
    return NextResponse.json(
      { error: 'Suggestions unavailable — no ANTHROPIC_API_KEY', degraded: true },
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
      system: SUGGEST_SYSTEM,
      messages: [
        { role: 'user', content: buildSuggestUserPrompt(parsed.data) },
      ],
    });

    const raw = message.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');
    const json = extractJson(raw) as { suggestions?: unknown[] };

    // Same closed-vocabulary rule as /api/dissect: unknown ids are dropped.
    const suggestions = (json.suggestions ?? []).flatMap((item) => {
      const result = deviceSuggestion.safeParse(item);
      if (!result.success) {
        console.warn('[suggest] dropped suggestion with unknown device id');
        return [];
      }
      return [result.data];
    });

    const payload: SuggestResponse = { suggestions, model: MODEL };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[suggest] failed:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
