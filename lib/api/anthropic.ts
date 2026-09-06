// lib/api/anthropic.ts
//
// One place that knows about the model vendor. Routes ask for a client and get
// null when there is no key — which is a degraded state, not an error, because
// every deterministic feature keeps working without one (Section 4.4).

import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-sonnet-4-5';
export const MAX_TOKENS = 2048;

export const hasApiKey = (): boolean =>
  typeof process.env.ANTHROPIC_API_KEY === 'string' &&
  process.env.ANTHROPIC_API_KEY.length > 0;

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic | null {
  if (!hasApiKey()) return null;
  if (!cached) {
    cached = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cached;
}

/**
 * Models wrap JSON in prose and fences no matter how firmly you ask them not
 * to. Pull the first balanced object out rather than trusting the whole body.
 */
export function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : raw).trim();

  const start = body.indexOf('{');
  const arrayStart = body.indexOf('[');
  const from =
    start === -1 ? arrayStart : arrayStart === -1 ? start : Math.min(start, arrayStart);
  if (from === -1) throw new Error('No JSON found in model response');

  const open = body[from];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = from; i < body.length; i += 1) {
    const ch = body[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return JSON.parse(body.slice(from, i + 1));
    }
  }

  throw new Error('Unbalanced JSON in model response');
}
