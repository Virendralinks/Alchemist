// tests/api/dissect-stream.test.ts
//
// The NDJSON patch pipeline, driven with a deliberately hostile model stream:
// fences, prose, invented device ids, impossible spans, and patches split
// across chunk boundaries.

import { describe, it, expect } from 'vitest';
import { processModelLine, streamPatches } from '@/lib/api/dissect-stream';
import { ALL_DEVICE_IDS } from '@/lib/api/schemas';

const TEXT = 'deployed the fix, phir bhi client naaraaz';
const realDeviceId = ALL_DEVICE_IDS[0];

async function* chunksOf(parts: string[]): AsyncGenerator<string> {
  for (const part of parts) yield part;
}

async function collect(parts: string[]) {
  const dropped: string[] = [];
  const patches = [];
  for await (const patch of streamPatches(chunksOf(parts), TEXT, (r) =>
    dropped.push(r),
  )) {
    patches.push(patch);
  }
  return { patches, dropped };
}

describe('processModelLine', () => {
  it('accepts a well-formed prose patch', () => {
    const { patch } = processModelLine(
      '{"field":"meaning","value":"A bar about deployment guilt."}',
      TEXT,
    );
    expect(patch).toEqual({
      field: 'meaning',
      value: 'A bar about deployment guilt.',
    });
  });

  it('ignores fence and array noise without reporting a drop', () => {
    for (const noise of ['```json', '```', '[', ']', '   ']) {
      const outcome = processModelLine(noise, TEXT);
      expect(outcome.patch).toBeNull();
      expect(outcome.dropped).toBeNull();
    }
  });

  it('drops prose that is not JSON at all', () => {
    const { patch, dropped } = processModelLine(
      'Here is my analysis of the bars:',
      TEXT,
    );
    expect(patch).toBeNull();
    expect(dropped).toContain('unparseable line');
  });

  it('drops a device patch with an invented id', () => {
    const { patch, dropped } = processModelLine(
      '{"field":"device","value":{"deviceId":"quantum-flex","charStart":0,"charEnd":8,"explanation":"x"}}',
      TEXT,
    );
    expect(patch).toBeNull();
    expect(dropped).toBeTruthy();
  });

  it('drops a device patch whose span does not resolve', () => {
    const { patch, dropped } = processModelLine(
      `{"field":"device","value":{"deviceId":"${realDeviceId}","charStart":900,"charEnd":950,"explanation":"x"}}`,
      TEXT,
    );
    expect(patch).toBeNull();
    expect(dropped).toContain('bad-span');
  });

  it('normalizes a surviving device to llm + arguable', () => {
    const { patch } = processModelLine(
      `{"field":"device","value":{"deviceId":"${realDeviceId}","charStart":0,"charEnd":8,"explanation":"x","detectedBy":"engine","confidence":"certain"}}`,
      TEXT,
    );
    expect(patch).toMatchObject({
      field: 'device',
      value: { detectedBy: 'llm', confidence: 'arguable' },
    });
  });

  it('has no patch shape that can carry a Tier 1 field', () => {
    const { patch, dropped } = processModelLine(
      '{"field":"syllableCount","value":999}',
      TEXT,
    );
    expect(patch).toBeNull();
    expect(dropped).toContain('field=syllableCount');
  });
});

describe('streamPatches', () => {
  it('reassembles a patch split across chunk boundaries', async () => {
    const { patches } = await collect([
      '{"field":"mea',
      'ning","value":"split across chunks"}\n',
    ]);
    expect(patches).toEqual([
      { field: 'meaning', value: 'split across chunks' },
    ]);
  });

  it('emits the final line even without a trailing newline', async () => {
    const { patches } = await collect(['{"field":"why","value":"no newline"}']);
    expect(patches).toHaveLength(1);
  });

  it('keeps the good patches from a hostile stream and drops the rest', async () => {
    const { patches, dropped } = await collect([
      '```json\n',
      'Sure! Here is the dissection.\n',
      '{"field":"meaning","value":"real"}\n',
      '{"field":"device","value":{"deviceId":"made-up-device","charStart":0,"charEnd":4,"explanation":"x"}}\n',
      `{"field":"entendre","value":{"reading":"r","layer":"cultural","charStart":0,"charEnd":8}}\n`,
      '{"field":"entendre","value":{"reading":"r","layer":"cultural","charStart":9000,"charEnd":9100}}\n',
      '```\n',
    ]);

    expect(patches.map((p) => p.field)).toEqual(['meaning', 'entendre']);
    // The invented device and the impossible span, and the prose line.
    expect(dropped).toHaveLength(3);
  });
});
