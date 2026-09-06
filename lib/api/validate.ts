// lib/api/validate.ts
//
// The three constraints from Section 4.3, applied before anything the model
// produced can reach the UI:
//
//   1. Unknown device ids are dropped, not rendered.
//   2. Spans are verified against the source text.
//   3. Tier 1 claims are never overwritten.
//
// Kept as pure functions with no Next.js or SDK imports so the hostile-response
// test can exercise them directly.

import type { DeviceInstance } from '@/lib/types/devices';
import type { Entendre, Dissection, RhythmAnalysis } from '@/lib/types/archive';
import {
  DEVICE_ID_SET,
  SCHEMA_VERSION,
  deviceInstanceSchema,
  entendreSchema,
} from './schemas';

export interface DropRecord {
  reason: 'unknown-device' | 'bad-span' | 'malformed';
  detail: string;
}

export interface ValidationOutcome<T> {
  kept: T[];
  dropped: DropRecord[];
}

/**
 * Constraint 2. `0 <= charStart < charEnd <= text.length` and the slice must be
 * non-whitespace — a highlight pointing at the wrong words is worse than none.
 */
export function spanResolves(
  text: string,
  charStart: number,
  charEnd: number,
): boolean {
  if (!Number.isInteger(charStart) || !Number.isInteger(charEnd)) return false;
  if (charStart < 0 || charEnd > text.length || charStart >= charEnd) return false;
  return text.slice(charStart, charEnd).trim().length > 0;
}

/**
 * Constraints 1 + 2 for device instances. Survivors are forced to
 * `detectedBy: 'llm'` and `confidence: 'arguable'` — a model cannot claim
 * certainty for itself.
 */
export function validateDevices(
  raw: unknown[],
  text: string,
): ValidationOutcome<DeviceInstance> {
  const kept: DeviceInstance[] = [];
  const dropped: DropRecord[] = [];

  for (const item of raw) {
    const parsed = deviceInstanceSchema.safeParse(item);
    if (!parsed.success) {
      const id =
        typeof item === 'object' && item !== null && 'deviceId' in item
          ? String((item as { deviceId: unknown }).deviceId)
          : '(unparseable)';
      dropped.push({
        reason: DEVICE_ID_SET.has(id) ? 'malformed' : 'unknown-device',
        detail: id,
      });
      continue;
    }

    const device = parsed.data;
    if (!spanResolves(text, device.charStart, device.charEnd)) {
      dropped.push({
        reason: 'bad-span',
        detail: `${device.deviceId} [${device.charStart},${device.charEnd}]`,
      });
      continue;
    }

    kept.push({
      deviceId: device.deviceId,
      charStart: device.charStart,
      charEnd: device.charEnd,
      explanation: device.explanation,
      detectedBy: 'llm',
      confidence: 'arguable',
    });
  }

  return { kept, dropped };
}

/** Constraint 2 for entendres — same span rule, no device vocabulary involved. */
export function validateEntendres(
  raw: unknown[],
  text: string,
): ValidationOutcome<Entendre> {
  const kept: Entendre[] = [];
  const dropped: DropRecord[] = [];

  for (const item of raw) {
    const parsed = entendreSchema.safeParse(item);
    if (!parsed.success) {
      dropped.push({ reason: 'malformed', detail: 'entendre' });
      continue;
    }
    const entendre = parsed.data;
    if (!spanResolves(text, entendre.charStart, entendre.charEnd)) {
      dropped.push({
        reason: 'bad-span',
        detail: `entendre [${entendre.charStart},${entendre.charEnd}]`,
      });
      continue;
    }
    kept.push(entendre);
  }

  return { kept, dropped };
}

/**
 * Constraint 3. Merges interpretive output onto a Tier 1 base such that the
 * computed fields are structurally unreachable: `rhythm` is taken from the
 * engine argument only, and engine-detected devices are preserved.
 */
export function mergeDissection(args: {
  lineId: string;
  rhythm: RhythmAnalysis;
  engineDevices: DeviceInstance[];
  interpretive?: {
    meaning?: string | null;
    flowMechanics?: string | null;
    rhymeScience?: string | null;
    why?: string | null;
    entendres?: Entendre[];
    devices?: DeviceInstance[];
  };
  generatedAt?: string | null;
}): Dissection {
  const interp = args.interpretive;
  const llmDevices = (interp?.devices ?? []).map((d) => ({
    ...d,
    detectedBy: 'llm' as const,
    confidence: 'arguable' as const,
  }));

  const hasInterpretive =
    interp != null &&
    Boolean(
      interp.meaning ||
        interp.flowMechanics ||
        interp.rhymeScience ||
        interp.why ||
        (interp.entendres?.length ?? 0) > 0 ||
        llmDevices.length > 0,
    );

  return {
    lineId: args.lineId,
    // Tier 1 is passed through untouched — no interpretive field can reach it.
    rhythm: args.rhythm,
    meaning: interp?.meaning ?? null,
    entendres: interp?.entendres ?? [],
    flowMechanics: interp?.flowMechanics ?? null,
    rhymeScience: interp?.rhymeScience ?? null,
    why: interp?.why ?? null,
    devices: [...args.engineDevices, ...llmDevices],
    provenance: hasInterpretive ? 'engine+llm' : 'engine',
    schemaVersion: SCHEMA_VERSION,
    generatedAt: args.generatedAt ?? null,
  };
}
