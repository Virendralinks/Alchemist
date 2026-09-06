// lib/codex/device-index.ts
//
// The reverse index: "show me every line in the archive that uses this device".
// Derived, never stored (Section 2.2). Built once at module scope, so a Server
// Component can render occurrence counts with zero client work and zero fetches.

import { artists } from '@/lib/mock/artists';
import { devices } from '@/lib/mock/devices';
import type { ArchiveArtist, LyricLine, Track } from '@/lib/types/archive';
import type { DeviceFamily, DeviceDepth } from '@/lib/types/devices';

export interface DeviceOccurrence {
  artistId: string;
  artistName: string;
  trackId: string;
  trackTitle: string;
  lineId: string;
  /** The highlighted span in context. */
  snippet: string;
  /** The exact span text, for the bolded fragment inside the snippet. */
  spanText: string;
  confidence: 'certain' | 'arguable';
}

export type DeviceIndex = Record<string, DeviceOccurrence[]>;

/** How much of the line to keep either side of the span. */
const CONTEXT_CHARS = 42;

function snippetFor(text: string, charStart: number, charEnd: number): string {
  const from = Math.max(0, charStart - CONTEXT_CHARS);
  const to = Math.min(text.length, charEnd + CONTEXT_CHARS);
  const body = text.slice(from, to);
  return `${from > 0 ? '…' : ''}${body}${to < text.length ? '…' : ''}`;
}

function collectFromLine(
  index: DeviceIndex,
  artist: ArchiveArtist,
  track: Track,
  line: LyricLine,
): void {
  const dissection = line.dissection;
  if (!dissection) return;

  for (const instance of dissection.devices) {
    // A span that does not resolve is a data bug; drop it rather than render a
    // highlight pointing at the wrong words (same rule as Section 4.3).
    if (
      instance.charStart < 0 ||
      instance.charEnd > line.text.length ||
      instance.charStart >= instance.charEnd
    ) {
      continue;
    }

    const list = index[instance.deviceId] ?? (index[instance.deviceId] = []);
    list.push({
      artistId: artist.id,
      artistName: artist.name,
      trackId: track.id,
      trackTitle: track.title,
      lineId: line.id,
      snippet: snippetFor(line.text, instance.charStart, instance.charEnd),
      spanText: line.text.slice(instance.charStart, instance.charEnd),
      confidence: instance.confidence,
    });
  }
}

/** Walks every ArchiveArtist → Album → Track → LyricLine → devices. */
export function buildDeviceIndex(source: ArchiveArtist[]): DeviceIndex {
  const index: DeviceIndex = {};
  for (const artist of source) {
    for (const album of artist.albums) {
      for (const track of album.tracks) {
        if (!track.lyrics) continue;
        for (const line of track.lyrics) {
          collectFromLine(index, artist, track, line);
        }
      }
    }
  }
  return index;
}

export const deviceIndex: DeviceIndex = buildDeviceIndex(artists);

export const deviceCounts: Record<string, number> = Object.fromEntries(
  devices.map((d) => [d.id, deviceIndex[d.id]?.length ?? 0]),
);

/** Occurrences for one device, or an empty list — callers never handle undefined. */
export function occurrencesFor(deviceId: string): DeviceOccurrence[] {
  return deviceIndex[deviceId] ?? [];
}

export interface DeviceSummary {
  id: string;
  name: string;
  family: DeviceFamily;
  depth: DeviceDepth;
  plainDefinition: string;
  count: number;
  detectable: boolean;
  bilingualOnly: boolean;
  practiceTemplateId: string | null;
}

/**
 * The shape `/codex` renders. Precomputed here so the grid page stays a Server
 * Component and ships no taxonomy JavaScript to the browser.
 */
export const deviceSummaries: DeviceSummary[] = devices.map((d) => ({
  id: d.id,
  name: d.name,
  family: d.family,
  depth: d.depth,
  plainDefinition: d.plainDefinition,
  count: deviceCounts[d.id] ?? 0,
  detectable: d.detectable,
  bilingualOnly: d.bilingualOnly ?? false,
  practiceTemplateId: d.practiceTemplateId,
}));

/** Devices grouped by family, in taxonomy order, for the grid's section headers. */
export const summariesByFamily: Record<DeviceFamily, DeviceSummary[]> = {
  sound: [],
  figurative: [],
  structural: [],
  wordplay: [],
  cultural: [],
};
for (const summary of deviceSummaries) {
  summariesByFamily[summary.family].push(summary);
}
