// lib/api/dissect-stream.ts
//
// The NDJSON patch pipeline for Tier 2, kept free of Next.js and the vendor SDK
// so the hostile-response test can drive it with a hand-written stream.
//
// Everything here exists to enforce Section 4.3: unknown device ids are dropped
// with a warning, spans that do not resolve are dropped, and no patch shape
// exists that could touch a Tier 1 field.

import { dissectPatch, type DissectPatch } from './schemas';
import { spanResolves, validateDevices, validateEntendres } from './validate';

export interface LineOutcome {
  patch: DissectPatch | null;
  dropped: string | null;
}

/**
 * Turn one raw model line into a validated patch, or drop it with a reason.
 * Returns `{ patch: null, dropped: null }` for blank lines and fence noise,
 * which are expected rather than suspicious.
 */
export function processModelLine(raw: string, text: string): LineOutcome {
  const line = raw.trim();
  if (line.length === 0) return { patch: null, dropped: null };
  // Models occasionally wrap NDJSON in fences despite instructions.
  if (line.startsWith('```') || line === '[' || line === ']') {
    return { patch: null, dropped: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(line.replace(/,\s*$/, ''));
  } catch {
    return { patch: null, dropped: `unparseable line: ${line.slice(0, 60)}` };
  }

  const result = dissectPatch.safeParse(parsed);
  if (!result.success) {
    const field =
      typeof parsed === 'object' && parsed !== null && 'field' in parsed
        ? String((parsed as { field: unknown }).field)
        : '(no field)';
    // A device patch that fails schema parsing almost always means an invented
    // device id — the enum is the only closed part of that shape.
    return { patch: null, dropped: `rejected patch field=${field}` };
  }

  const patch = result.data;

  if (patch.field === 'device') {
    const { kept, dropped } = validateDevices([patch.value], text);
    if (kept.length === 0) {
      return {
        patch: null,
        dropped: `device dropped (${dropped[0]?.reason ?? 'invalid'}: ${
          dropped[0]?.detail ?? '?'
        })`,
      };
    }
    return { patch: { field: 'device', value: kept[0] }, dropped: null };
  }

  if (patch.field === 'entendre') {
    const { kept, dropped } = validateEntendres([patch.value], text);
    if (kept.length === 0) {
      return {
        patch: null,
        dropped: `entendre dropped (${dropped[0]?.reason ?? 'invalid'})`,
      };
    }
    return { patch: { field: 'entendre', value: kept[0] }, dropped: null };
  }

  return { patch, dropped: null };
}

/**
 * Consume raw text chunks, split on newlines, and yield validated patches.
 * Buffers partial lines so a patch split across two chunks still arrives whole.
 */
export async function* streamPatches(
  chunks: AsyncIterable<string>,
  text: string,
  onDrop: (reason: string) => void = () => {},
): AsyncGenerator<DissectPatch> {
  let buffer = '';

  for await (const chunk of chunks) {
    buffer += chunk;
    let newline = buffer.indexOf('\n');
    while (newline !== -1) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      const { patch, dropped } = processModelLine(line, text);
      if (dropped) onDrop(dropped);
      if (patch) yield patch;
      newline = buffer.indexOf('\n');
    }
  }

  if (buffer.trim().length > 0) {
    const { patch, dropped } = processModelLine(buffer, text);
    if (dropped) onDrop(dropped);
    if (patch) yield patch;
  }
}

/** Re-export for callers that only need the span rule. */
export { spanResolves };
