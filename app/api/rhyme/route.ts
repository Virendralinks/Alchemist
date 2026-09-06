// app/api/rhyme/route.ts
//
// Mosaic and holorime phrase search. Combinatorial rather than an index lookup,
// which is why it lives here and not in the worker (Section 3.8). No model is
// involved, so this route works with no API key.

import { NextResponse } from 'next/server';
import { rhymeRequest, rhymeResponse } from '@/lib/api/schemas';
import { searchPhrases } from '@/lib/engine/phrase-search';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = rhymeRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const candidates = searchPhrases(parsed.data);
    const payload = rhymeResponse.parse({ candidates });
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[rhyme] failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
