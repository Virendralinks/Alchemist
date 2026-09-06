// tests/cache/dissection-cache.test.ts
//
// The cache key is the contract behind "trivial edits do not force a
// regeneration, real edits do" (Section 4.4).

import { describe, it, expect } from 'vitest';
import { normalizeText, sha256, cacheKey } from '@/lib/cache/dissection-cache';
import { SCHEMA_VERSION } from '@/lib/api/schemas';

describe('normalizeText', () => {
  it('lowercases, collapses whitespace, and strips trailing punctuation', () => {
    expect(normalizeText('  Deployed   The   Fix,  ')).toBe('deployed the fix');
  });

  it('drops empty lines but keeps line structure', () => {
    expect(normalizeText('one\n\n\ntwo')).toBe('one\ntwo');
  });

  it('leaves internal punctuation alone', () => {
    expect(normalizeText('deployed the fix, phir bhi naaraaz')).toBe(
      'deployed the fix, phir bhi naaraaz',
    );
  });
});

describe('cacheKey', () => {
  it('is stable across casing, spacing, and trailing punctuation', async () => {
    const a = await cacheKey('Deployed the fix, phir bhi client naaraaz.');
    const b = await cacheKey('deployed  the   fix, phir bhi client naaraaz');
    expect(a).toBe(b);
  });

  it('changes when a real word changes', async () => {
    const a = await cacheKey('deployed the fix');
    const b = await cacheKey('deployed the bug');
    expect(a).not.toBe(b);
  });

  it('is namespaced by schema version, so a bump invalidates everything', async () => {
    const key = await cacheKey('deployed the fix');
    expect(key.endsWith(`:v${SCHEMA_VERSION}`)).toBe(true);
  });

  it('produces a 64-character sha256 hex digest', async () => {
    const hash = await sha256('deployed the fix');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
