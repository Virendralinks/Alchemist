// lib/api/client.ts
//
// The only place the app knows the route URLs. Every call is abortable, because
// suggestions are cancelled on further typing and a dissection is cancelled when
// the draft changes underneath it (Sections 4.4, 4.5).

import {
  dissectPatch,
  metaphorResponse,
  rhymeResponse,
  suggestResponse,
  type DissectPatch,
  type DissectRequest,
  type MetaphorRequest,
  type MetaphorResponse,
  type RhymeRequest,
  type RhymeResponse,
  type SuggestRequest,
  type SuggestResponse,
} from './schemas';

/** A handled failure. `degraded` means "no API key", not "something broke". */
export class ApiCallError extends Error {
  readonly status: number;
  readonly degraded: boolean;

  constructor(message: string, status: number, degraded = false) {
    super(message);
    this.name = 'ApiCallError';
    this.status = status;
    this.degraded = degraded;
  }
}

async function readError(res: Response): Promise<ApiCallError> {
  let message = `Request failed (${res.status})`;
  let degraded = false;
  try {
    const body = (await res.json()) as { error?: string; degraded?: boolean };
    if (typeof body.error === 'string') message = body.error;
    degraded = body.degraded === true;
  } catch {
    // Non-JSON error body — keep the status-derived message.
  }
  return new ApiCallError(message, res.status, degraded);
}

/**
 * POST /api/dissect. Yields validated patches as they stream in, so the panel
 * fills progressively rather than appearing at once.
 */
export async function* streamDissect(
  body: DissectRequest,
  signal?: AbortSignal,
): AsyncGenerator<DissectPatch> {
  const res = await fetch('/api/dissect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) throw await readError(res);
  if (!res.body) throw new ApiCallError('Empty response stream', 502);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newline = buffer.indexOf('\n');
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line.length > 0) {
          const parsed = dissectPatch.safeParse(JSON.parse(line));
          // The route already validated; this is the client-side half of the
          // shared contract, so a mismatch is a bug rather than model noise.
          if (parsed.success) yield parsed.data;
        }
        newline = buffer.indexOf('\n');
      }
    }

    const tail = buffer.trim();
    if (tail.length > 0) {
      const parsed = dissectPatch.safeParse(JSON.parse(tail));
      if (parsed.success) yield parsed.data;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function postSuggest(
  body: SuggestRequest,
  signal?: AbortSignal,
): Promise<SuggestResponse> {
  const res = await fetch('/api/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw await readError(res);
  return suggestResponse.parse(await res.json());
}

export async function postRhyme(
  body: RhymeRequest,
  signal?: AbortSignal,
): Promise<RhymeResponse> {
  const res = await fetch('/api/rhyme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw await readError(res);
  return rhymeResponse.parse(await res.json());
}

export async function postMetaphor(
  body: MetaphorRequest,
  signal?: AbortSignal,
): Promise<MetaphorResponse> {
  const res = await fetch('/api/metaphor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw await readError(res);
  return metaphorResponse.parse(await res.json());
}
