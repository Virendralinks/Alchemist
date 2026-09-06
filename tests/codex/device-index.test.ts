// tests/codex/device-index.test.ts
//
// The reverse index is what makes /codex answer "show me every line that uses
// this device" with zero client work, so its span handling has to be exact.

import { describe, it, expect } from 'vitest';
import { buildDeviceIndex, deviceCounts, deviceSummaries } from '@/lib/codex/device-index';
import { devices } from '@/lib/mock/devices';
import { templates, PRACTICE_TEMPLATE_BY_DEVICE } from '@/lib/mock/templates';
import type { ArchiveArtist, Dissection } from '@/lib/types/archive';
import type { DeviceInstance } from '@/lib/types/devices';
import { tierOne } from '@/lib/engine/rhythm';

const LINE = 'deployed the fix, phir bhi client naaraaz';

function dissectionWith(deviceInstances: DeviceInstance[]): Dissection {
  return {
    lineId: 'line-1',
    rhythm: tierOne({ text: LINE, bpm: 90 }),
    meaning: null,
    entendres: [],
    flowMechanics: null,
    rhymeScience: null,
    why: null,
    devices: deviceInstances,
    provenance: 'authored',
    schemaVersion: 1,
    generatedAt: null,
  };
}

function archiveWith(deviceInstances: DeviceInstance[]): ArchiveArtist[] {
  return [
    {
      id: 'test-artist',
      name: 'Test Artist',
      aka: [],
      origin: 'Noida',
      activeSince: 2020,
      thesis: 'A fixture.',
      accentColor: 'sky',
      albums: [
        {
          id: 'alb-1',
          title: 'Album',
          year: 2024,
          kind: 'album',
          label: 'Indie',
          tracks: [
            {
              id: 'trk-1',
              title: 'Track',
              trackNumber: 1,
              features: [],
              isReference: true,
              lyrics: [
                {
                  id: 'line-1',
                  barIndex: 0,
                  sectionId: 'verse-1',
                  text: LINE,
                  lang: 'en',
                  dissection: dissectionWith(deviceInstances),
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

const instance = (over: Partial<DeviceInstance> = {}): DeviceInstance => ({
  deviceId: 'perfect-rhyme',
  charStart: 0,
  charEnd: 8,
  explanation: 'x',
  detectedBy: 'engine',
  confidence: 'certain',
  ...over,
});

describe('buildDeviceIndex', () => {
  it('indexes an occurrence with artist, track, and line provenance', () => {
    const index = buildDeviceIndex(archiveWith([instance()]));
    expect(index['perfect-rhyme']).toHaveLength(1);

    const occurrence = index['perfect-rhyme'][0];
    expect(occurrence.artistName).toBe('Test Artist');
    expect(occurrence.trackTitle).toBe('Track');
    expect(occurrence.lineId).toBe('line-1');
    expect(occurrence.spanText).toBe('deployed');
    expect(occurrence.snippet).toContain('deployed');
    expect(occurrence.confidence).toBe('certain');
  });

  it('drops occurrences whose spans do not resolve against the line', () => {
    const index = buildDeviceIndex(
      archiveWith([
        instance({ charStart: 0, charEnd: 9999 }),
        instance({ charStart: 10, charEnd: 4 }),
        instance({ charStart: -3, charEnd: 5 }),
      ]),
    );
    expect(index['perfect-rhyme']).toBeUndefined();
  });

  it('preserves the certain / arguable distinction', () => {
    const index = buildDeviceIndex(
      archiveWith([
        instance({ deviceId: 'metaphor', confidence: 'arguable', detectedBy: 'llm' }),
      ]),
    );
    expect(index['metaphor'][0].confidence).toBe('arguable');
  });

  it('ignores tracks with no lyrics and lines with no dissection', () => {
    const archive = archiveWith([instance()]);
    archive[0].albums[0].tracks[0].lyrics![0].dissection = null;
    expect(buildDeviceIndex(archive)).toEqual({});

    delete archive[0].albums[0].tracks[0].lyrics;
    expect(buildDeviceIndex(archive)).toEqual({});
  });
});

describe('device summaries', () => {
  it('covers every device in the taxonomy exactly once', () => {
    expect(deviceSummaries).toHaveLength(devices.length);
    expect(new Set(deviceSummaries.map((d) => d.id)).size).toBe(devices.length);
  });

  it('gives every device a count, defaulting to zero', () => {
    for (const device of devices) {
      expect(deviceCounts[device.id]).toBeTypeOf('number');
      expect(deviceCounts[device.id]).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('practice templates', () => {
  it('maps every device id in the mapping to a real device', () => {
    const ids = new Set(devices.map((d) => d.id));
    for (const deviceId of Object.keys(PRACTICE_TEMPLATE_BY_DEVICE)) {
      expect(ids.has(deviceId), `unknown device id: ${deviceId}`).toBe(true);
    }
  });

  it('maps every device to a template that exists', () => {
    const templateIds = new Set(templates.map((t) => t.id));
    for (const templateId of Object.values(PRACTICE_TEMPLATE_BY_DEVICE)) {
      expect(templateIds.has(templateId), `unknown template: ${templateId}`).toBe(true);
    }
  });

  it('populates practiceTemplateId on exactly the mapped devices', () => {
    for (const device of devices) {
      const expected = PRACTICE_TEMPLATE_BY_DEVICE[device.id] ?? null;
      expect(device.practiceTemplateId).toBe(expected);
    }
  });

  it('keeps every placement inside the 64-slot grid', () => {
    for (const template of templates) {
      expect(template.placements.length).toBeGreaterThan(0);
      for (const placement of template.placements) {
        expect(placement.slotIndex).toBeGreaterThanOrEqual(0);
        expect(placement.slotIndex).toBeLessThan(64);
        expect(placement.emphasis).toBeGreaterThan(0);
        expect(placement.emphasis).toBeLessThanOrEqual(1);
      }
    }
  });

  it('never places two syllables in the same slot', () => {
    for (const template of templates) {
      const slots = template.placements.map((p) => p.slotIndex);
      expect(new Set(slots).size, `duplicate slot in ${template.id}`).toBe(
        slots.length,
      );
    }
  });
});
