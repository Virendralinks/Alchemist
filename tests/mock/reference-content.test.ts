// tests/mock/reference-content.test.ts
//
// The authored catalogue is hand-written prose with hand-written spans, which
// is exactly the kind of data that rots silently: a span that no longer matches
// its line renders as a missing highlight, not an error. These tests are the
// only thing standing between a typo and a broken annotation in the UI.

import { describe, expect, it } from 'vitest';

import { DEVICE_ID_SET } from '@/lib/api/schemas';
import { artists } from '@/lib/mock/artists';
import { referenceContent } from '@/lib/mock/dissections';
import { UNEVALUATED_RHYTHM } from '@/lib/mock/dissections/helpers';
import { attachRhythm } from '../helpers/attach-rhythm';
import type { LyricLine, Track } from '@/lib/types/archive';

const allTracks: Track[] = artists.flatMap((a) =>
  a.albums.flatMap((album) => album.tracks),
);

const referenceTracks = allTracks.filter((t) => t.isReference);

describe('reference catalogue wiring', () => {
  it('gives every reference track lyrics and production', () => {
    expect(referenceTracks).toHaveLength(10);
    for (const track of referenceTracks) {
      expect(track.lyrics, `${track.id} has no lyrics`).toBeTruthy();
      expect(track.lyrics!.length, `${track.id} has empty lyrics`).toBeGreaterThan(0);
      expect(track.production, `${track.id} has no production`).toBeTruthy();
    }
  });

  it('keys every authored file to a real track', () => {
    const ids = new Set(allTracks.map((t) => t.id));
    for (const trackId of Object.keys(referenceContent)) {
      expect(ids.has(trackId), `${trackId} matches no track in the discography`).toBe(
        true,
      );
    }
  });

  it('leaves non-reference tracks undissected', () => {
    for (const track of allTracks) {
      if (track.isReference) continue;
      expect(track.lyrics, `${track.id} should not carry lyrics`).toBeUndefined();
    }
  });
});

describe('authored spans', () => {
  const lines: Array<{ trackId: string; line: LyricLine }> = Object.entries(
    referenceContent,
  ).flatMap(([trackId, content]) =>
    content.lyrics.map((line) => ({ trackId, line })),
  );

  it('resolves every device span to the exact text it claims', () => {
    for (const { trackId, line } of lines) {
      for (const device of line.dissection?.devices ?? []) {
        const slice = line.text.slice(device.charStart, device.charEnd);
        expect(
          slice.length,
          `${trackId} / "${line.text}" / ${device.deviceId}: empty span`,
        ).toBeGreaterThan(0);
        expect(
          line.text.includes(slice),
          `${trackId} / ${device.deviceId}: span does not occur in the line`,
        ).toBe(true);
      }
    }
  });

  it('resolves every entendre span to the exact text it claims', () => {
    for (const { trackId, line } of lines) {
      for (const entendre of line.dissection?.entendres ?? []) {
        const slice = line.text.slice(entendre.charStart, entendre.charEnd);
        expect(
          slice.length,
          `${trackId} / "${line.text}": empty entendre span`,
        ).toBeGreaterThan(0);
        expect(
          line.text.includes(slice),
          `${trackId} / entendre "${entendre.reading}": span does not occur in the line`,
        ).toBe(true);
      }
    }
  });

  it('keeps every span inside its line', () => {
    for (const { trackId, line } of lines) {
      const spans = [
        ...(line.dissection?.devices ?? []),
        ...(line.dissection?.entendres ?? []),
      ];
      for (const span of spans) {
        expect(span.charStart, `${trackId}: negative start`).toBeGreaterThanOrEqual(0);
        expect(span.charEnd, `${trackId}: end past line`).toBeLessThanOrEqual(
          line.text.length,
        );
        expect(span.charStart, `${trackId}: inverted span`).toBeLessThan(span.charEnd);
      }
    }
  });

  it('only cites devices that exist in the taxonomy', () => {
    for (const { trackId, line } of lines) {
      for (const device of line.dissection?.devices ?? []) {
        expect(
          DEVICE_ID_SET.has(device.deviceId),
          `${trackId} cites unknown device "${device.deviceId}"`,
        ).toBe(true);
      }
    }
  });
});

describe('authored dissections', () => {
  it('marks authored content as authored, not engine output', () => {
    for (const content of Object.values(referenceContent)) {
      for (const line of content.lyrics) {
        expect(line.dissection?.provenance).toBe('authored');
      }
    }
  });

  it('does not precompute rhythm at catalogue import', () => {
    for (const content of Object.values(referenceContent)) {
      for (const line of content.lyrics) {
        expect(line.dissection?.rhythm).toEqual(UNEVALUATED_RHYTHM);
      }
    }
  });

  it('lets the engine compute Tier 1 for every authored line', () => {
    // Rhythm is attached in Node, not at catalogue import — that import path is
    // what crashed /codex and /archive when CMUdict entered the RSC graph.
    for (const [trackId, content] of Object.entries(referenceContent)) {
      const hydrated = attachRhythm(content.lyrics, content.production.bpm);
      for (const line of hydrated) {
        const rhythm = line.dissection?.rhythm;
        expect(rhythm, `${trackId} / "${line.text}" has no rhythm`).toBeTruthy();
        expect(
          rhythm!.syllableCount,
          `${trackId} / "${line.text}" has zero syllables`,
        ).toBeGreaterThan(0);
        expect(
          rhythm!.tokens.length,
          `${trackId} / "${line.text}" tokenized to nothing`,
        ).toBeGreaterThan(0);
        expect(
          rhythm!.schemeLetter.length,
          `${trackId} / "${line.text}" has no scheme letter`,
        ).toBeGreaterThan(0);
        expect(
          rhythm!.slotMap.some((s) => s !== null),
          `${trackId} / "${line.text}" mapped to an empty grid`,
        ).toBe(true);
      }
    }
  });

  it('writes all four interpretive fields for every line', () => {
    for (const [trackId, content] of Object.entries(referenceContent)) {
      for (const line of content.lyrics) {
        const d = line.dissection!;
        for (const field of ['meaning', 'flowMechanics', 'rhymeScience', 'why'] as const) {
          expect(
            d[field]?.trim().length ?? 0,
            `${trackId} / "${line.text}" is missing ${field}`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('authored production', () => {
  it('gives every reference track a genre blend that sums to 1', () => {
    for (const [trackId, content] of Object.entries(referenceContent)) {
      const total = content.production.genreBlend.reduce((s, g) => s + g.weight, 0);
      expect(total, `${trackId} genre blend sums to ${total}`).toBeCloseTo(1, 5);
    }
  });

  it('gives every section a non-empty, resolvable line set', () => {
    for (const [trackId, content] of Object.entries(referenceContent)) {
      const lineIds = new Set(content.lyrics.map((l) => l.id));
      expect(
        content.production.sections.length,
        `${trackId} has no sections`,
      ).toBeGreaterThan(0);
      for (const section of content.production.sections) {
        expect(
          section.lineIds.length,
          `${trackId} / ${section.id} has no lines`,
        ).toBeGreaterThan(0);
        for (const id of section.lineIds) {
          expect(lineIds.has(id), `${trackId} / ${section.id} cites unknown line ${id}`).toBe(
            true,
          );
        }
      }
    }
  });

  it('assigns every lyric line to exactly one section', () => {
    for (const [trackId, content] of Object.entries(referenceContent)) {
      const assigned = content.production.sections.flatMap((s) => s.lineIds);
      expect(new Set(assigned).size, `${trackId} assigns a line twice`).toBe(
        assigned.length,
      );
      expect(assigned.length, `${trackId} leaves lines unassigned`).toBe(
        content.lyrics.length,
      );
    }
  });

  it('matches every section bar range to the lines it actually contains', () => {
    // The arrangement rail sizes each marker from startBar/endBar but scrolls
    // using lineIds, so the two drifting apart renders a rail whose widths lie
    // about the song. Inserting a line into an earlier section is exactly how
    // that happens.
    for (const [trackId, content] of Object.entries(referenceContent)) {
      const barOf = new Map(content.lyrics.map((l) => [l.id, l.barIndex]));
      for (const section of content.production.sections) {
        const bars = section.lineIds.map((id) => barOf.get(id)!);
        expect(Math.min(...bars), `${trackId} / ${section.id} startBar`).toBe(
          section.startBar,
        );
        expect(Math.max(...bars), `${trackId} / ${section.id} endBar`).toBe(
          section.endBar,
        );
      }
    }
  });

  it('keeps sections contiguous and in bar order', () => {
    for (const [trackId, content] of Object.entries(referenceContent)) {
      const ordered = [...content.production.sections].sort(
        (a, b) => a.startBar - b.startBar,
      );
      ordered.forEach((section, i) => {
        if (i === 0) {
          expect(section.startBar, `${trackId} does not start at bar 0`).toBe(0);
          return;
        }
        expect(
          section.startBar,
          `${trackId} / ${section.id} leaves a gap or overlaps`,
        ).toBe(ordered[i - 1]!.endBar + 1);
      });
    }
  });

  it('keeps BPM in a plausible range', () => {
    for (const [trackId, content] of Object.entries(referenceContent)) {
      expect(content.production.bpm, `${trackId} BPM`).toBeGreaterThan(50);
      expect(content.production.bpm, `${trackId} BPM`).toBeLessThan(220);
    }
  });
});
