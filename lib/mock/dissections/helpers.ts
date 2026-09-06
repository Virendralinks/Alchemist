// lib/mock/dissections/helpers.ts
//
// Authoring helpers for the catalogue dissections.
//
// Two rules make this data trustworthy:
//
//  1. Device and entendre spans are written as the *substring* they annotate,
//     never as hand-counted offsets, and resolved here. A span that does not
//     occur in its line throws at module load, so a wrong highlight can never
//     ship — the same "spans are verified against the source" rule the API
//     boundary applies to model output (Section 4.3).
//
//  2. `rhythm` is filled by the worker (or by tests in Node), never at
//     catalogue import. Importing the engine here pulled CMUdict into every
//     archive/codex Server Component and crashed webpack.

import type {
  Dissection,
  Entendre,
  LyricLine,
  RhythmAnalysis,
} from '@/lib/types/archive';
import type { DeviceInstance } from '@/lib/types/devices';
import type { Lang } from '@/lib/types/phonetics';
import { SCHEMA_VERSION } from '@/lib/api/schemas';

/**
 * Catalogue files must never import the bilingual engine. Doing so pulls
 * CMUdict (~4 MB) into every Server Component that reads the archive — Next
 * then fails to webpack the CJS dictionary, which is the
 * `__webpack_modules__[moduleId] is not a function` crash on /codex and the
 * missing `app/archive/layout` chunk.
 *
 * Tier 1 is filled in later: tests attach it in Node, the track page hydrates
 * it through the worker (the same path /dissect uses).
 */
export const UNEVALUATED_RHYTHM: RhythmAnalysis = {
  syllableCount: 0,
  tokens: [],
  schemeLetter: '-',
  internalRhymes: [],
  assonanceChains: [],
  density: 0,
  slotMap: [],
  pocket: 'in',
  articulation: 'mixed',
};

export interface AuthoredDevice {
  deviceId: string;
  /** The exact substring in the line that this device annotates. */
  span: string;
  explanation: string;
  /** 1-based occurrence when the substring repeats within the line. */
  nth?: number;
  confidence?: 'certain' | 'arguable';
}

export interface AuthoredEntendre {
  span: string;
  layer: Entendre['layer'];
  reading: string;
  nth?: number;
}

export interface AuthoredLine {
  text: string;
  lang?: Lang;
  sectionId?: string;
  meaning?: string;
  flowMechanics?: string;
  rhymeScience?: string;
  why?: string;
  devices?: AuthoredDevice[];
  entendres?: AuthoredEntendre[];
}

/** Resolve the nth occurrence of `span` in `text`, or throw with context. */
function resolveSpan(
  text: string,
  span: string,
  nth: number,
  context: string,
): [number, number] {
  let from = -1;
  for (let i = 0; i < nth; i += 1) {
    from = text.indexOf(span, from + 1);
    if (from === -1) break;
  }
  if (from === -1) {
    throw new Error(
      `[dissections] ${context}: span ${JSON.stringify(span)} (occurrence ${nth}) not found in ${JSON.stringify(text)}`,
    );
  }
  return [from, from + span.length];
}

/**
 * Build one annotated line. `bpm` is accepted so call sites stay aligned with
 * the track tempo; the worker applies it when hydrating Tier 1, not here.
 */
export function authoredLine(
  trackId: string,
  barIndex: number,
  _bpm: number,
  input: AuthoredLine,
): LyricLine {
  const id = `${trackId}-l${barIndex}`;
  const text = input.text;

  const devices: DeviceInstance[] = (input.devices ?? []).map((d) => {
    const [charStart, charEnd] = resolveSpan(
      text,
      d.span,
      d.nth ?? 1,
      `${id} device ${d.deviceId}`,
    );
    return {
      deviceId: d.deviceId,
      charStart,
      charEnd,
      explanation: d.explanation,
      detectedBy: 'author',
      confidence: d.confidence ?? 'certain',
    };
  });

  const entendres: Entendre[] = (input.entendres ?? []).map((e) => {
    const [charStart, charEnd] = resolveSpan(
      text,
      e.span,
      e.nth ?? 1,
      `${id} entendre`,
    );
    return { reading: e.reading, layer: e.layer, charStart, charEnd };
  });

  const hasInterpretation = Boolean(
    input.meaning ||
      input.flowMechanics ||
      input.rhymeScience ||
      input.why ||
      entendres.length > 0 ||
      devices.length > 0,
  );

  const dissection: Dissection | null = hasInterpretation
    ? {
        lineId: id,
        // Filled by the worker on the track page, never at module load.
        rhythm: UNEVALUATED_RHYTHM,
        meaning: input.meaning ?? null,
        entendres,
        flowMechanics: input.flowMechanics ?? null,
        rhymeScience: input.rhymeScience ?? null,
        why: input.why ?? null,
        devices,
        provenance: 'authored',
        schemaVersion: SCHEMA_VERSION,
        generatedAt: null,
      }
    : null;

  return {
    id,
    barIndex,
    sectionId: input.sectionId ?? 'verse-1',
    text,
    lang: input.lang ?? 'en',
    dissection,
  };
}

/** Build a whole reference song's lyric array, numbering bars in order. */
export function authoredLines(
  trackId: string,
  bpm: number,
  lines: AuthoredLine[],
): LyricLine[] {
  return lines.map((line, i) => authoredLine(trackId, i, bpm, line));
}

/** Collect the line ids belonging to a section, for TrackProduction.sections. */
export function lineIdsFor(lines: LyricLine[], sectionId: string): string[] {
  return lines.filter((l) => l.sectionId === sectionId).map((l) => l.id);
}
