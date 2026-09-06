// tests/api/validate.test.ts
//
// Section 4.3 is the security boundary between "computed" and "argued". These
// tests feed deliberately hostile model output through it.

import { describe, it, expect } from 'vitest';
import {
  spanResolves,
  validateDevices,
  validateEntendres,
  mergeDissection,
} from '@/lib/api/validate';
import { ALL_DEVICE_IDS, SCHEMA_VERSION } from '@/lib/api/schemas';
import { tierOne } from '@/lib/engine/rhythm';
import type { DeviceInstance } from '@/lib/types/devices';

const TEXT = 'deployed the fix, phir bhi client naaraaz';
const realDeviceId = ALL_DEVICE_IDS[0];

describe('spanResolves', () => {
  it('accepts a span that points at real, non-whitespace text', () => {
    expect(spanResolves(TEXT, 0, 8)).toBe(true);
  });

  it('rejects inverted, negative, and out-of-range spans', () => {
    expect(spanResolves(TEXT, 10, 4)).toBe(false);
    expect(spanResolves(TEXT, -1, 4)).toBe(false);
    expect(spanResolves(TEXT, 0, TEXT.length + 1)).toBe(false);
    expect(spanResolves(TEXT, 5, 5)).toBe(false);
  });

  it('rejects a span that resolves to whitespace only', () => {
    const spaceAt = TEXT.indexOf(' ');
    expect(spanResolves(TEXT, spaceAt, spaceAt + 1)).toBe(false);
  });

  it('rejects non-integer offsets', () => {
    expect(spanResolves(TEXT, 0.5, 4)).toBe(false);
  });
});

describe('validateDevices — constraint 1: closed vocabulary', () => {
  it('drops invented device ids and keeps real ones', () => {
    const { kept, dropped } = validateDevices(
      [
        {
          deviceId: 'vibe-shift-metaphor',
          charStart: 0,
          charEnd: 8,
          explanation: 'invented',
        },
        {
          deviceId: realDeviceId,
          charStart: 0,
          charEnd: 8,
          explanation: 'real device',
        },
      ],
      TEXT,
    );

    expect(kept).toHaveLength(1);
    expect(kept[0].deviceId).toBe(realDeviceId);
    expect(dropped).toHaveLength(1);
    expect(dropped[0].reason).toBe('unknown-device');
    expect(dropped[0].detail).toBe('vibe-shift-metaphor');
  });

  it('survives entirely malformed entries without throwing', () => {
    const { kept, dropped } = validateDevices(
      [null, 42, 'metaphor', {}, { deviceId: realDeviceId }],
      TEXT,
    );
    expect(kept).toHaveLength(0);
    expect(dropped).toHaveLength(5);
  });

  it('forces every survivor to llm + arguable, ignoring what was claimed', () => {
    const { kept } = validateDevices(
      [
        {
          deviceId: realDeviceId,
          charStart: 0,
          charEnd: 8,
          explanation: 'x',
          detectedBy: 'engine',
          confidence: 'certain',
        },
      ],
      TEXT,
    );
    expect(kept[0].detectedBy).toBe('llm');
    expect(kept[0].confidence).toBe('arguable');
  });
});

describe('validateDevices — constraint 2: spans verified against source', () => {
  it('drops a device whose span runs past the end of the text', () => {
    const { kept, dropped } = validateDevices(
      [
        {
          deviceId: realDeviceId,
          charStart: 0,
          charEnd: 9999,
          explanation: 'off the end',
        },
      ],
      TEXT,
    );
    expect(kept).toHaveLength(0);
    expect(dropped[0].reason).toBe('bad-span');
  });
});

describe('validateEntendres', () => {
  it('keeps well-formed readings and drops unresolvable spans', () => {
    const { kept, dropped } = validateEntendres(
      [
        { reading: 'deployment as surrender', layer: 'figurative', charStart: 0, charEnd: 8 },
        { reading: 'nowhere', layer: 'meta', charStart: 500, charEnd: 520 },
        { reading: 'bad layer', layer: 'spiritual', charStart: 0, charEnd: 8 },
      ],
      TEXT,
    );
    expect(kept).toHaveLength(1);
    expect(kept[0].layer).toBe('figurative');
    expect(dropped).toHaveLength(2);
  });
});

describe('mergeDissection — constraint 3: Tier 1 is never overwritten', () => {
  const rhythm = tierOne({ text: TEXT, bpm: 90 });

  it('takes rhythm from the engine even when the model asserts its own', () => {
    // A model trying to smuggle counts in has nowhere to put them: the
    // interpretive shape has no rhythm field, so this is only reachable by
    // lying to the type system, which is exactly what a bad payload does.
    const hostile = {
      meaning: 'something',
      rhythm: { syllableCount: 999, schemeLetter: 'Z' },
      syllableCount: 999,
    } as unknown as Parameters<typeof mergeDissection>[0]['interpretive'];

    const merged = mergeDissection({
      lineId: 'line-1',
      rhythm,
      engineDevices: [],
      interpretive: hostile,
    });

    expect(merged.rhythm.syllableCount).toBe(rhythm.syllableCount);
    expect(merged.rhythm.syllableCount).not.toBe(999);
    expect(merged.rhythm.schemeLetter).toBe(rhythm.schemeLetter);
  });

  it('keeps engine devices ahead of llm devices and stamps provenance', () => {
    const engineDevice: DeviceInstance = {
      deviceId: realDeviceId,
      charStart: 0,
      charEnd: 8,
      explanation: 'computed',
      detectedBy: 'engine',
      confidence: 'certain',
    };
    const llmDevice: DeviceInstance = {
      deviceId: realDeviceId,
      charStart: 9,
      charEnd: 12,
      explanation: 'argued',
      detectedBy: 'engine', // a lie, which the merge corrects
      confidence: 'certain',
    };

    const merged = mergeDissection({
      lineId: 'line-1',
      rhythm,
      engineDevices: [engineDevice],
      interpretive: { devices: [llmDevice] },
    });

    expect(merged.devices[0].detectedBy).toBe('engine');
    expect(merged.devices[0].confidence).toBe('certain');
    expect(merged.devices[1].detectedBy).toBe('llm');
    expect(merged.devices[1].confidence).toBe('arguable');
    expect(merged.provenance).toBe('engine+llm');
    expect(merged.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('reports engine-only provenance when there is no interpretive content', () => {
    const merged = mergeDissection({ lineId: 'l', rhythm, engineDevices: [] });
    expect(merged.provenance).toBe('engine');
    expect(merged.meaning).toBeNull();
    expect(merged.entendres).toEqual([]);
  });
});
