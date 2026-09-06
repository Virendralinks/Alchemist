// tests/engine/phrase-search.test.ts
//
// Mosaic and holorime are the two rhyme types that need combinatorial phrase
// construction, which is why they run server-side rather than in the worker.

import { describe, it, expect } from 'vitest';
import { searchPhrases } from '@/lib/engine/phrase-search';

describe('searchPhrases', () => {
  it('returns mosaic candidates for a single-word query', () => {
    const results = searchPhrases({ token: 'hospital', lang: 'en', limit: 20 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.type === 'mosaic' || r.type === 'holorime')).toBe(
      true,
    );
  });

  it('only ever returns multi-word phrases', () => {
    const results = searchPhrases({ token: 'grind', lang: 'en', limit: 30 });
    for (const r of results) {
      expect(r.text.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('sorts by descending score and respects the limit', () => {
    const results = searchPhrases({ token: 'night', lang: 'en', limit: 5 });
    expect(results.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('adds holorime candidates only when a full line is supplied', () => {
    const withoutLine = searchPhrases({ token: 'night', lang: 'en', limit: 40 });
    expect(withoutLine.some((r) => r.type === 'holorime')).toBe(false);

    const withLine = searchPhrases({
      token: 'night',
      lang: 'en',
      line: 'late night',
      limit: 40,
    });
    expect(withLine.some((r) => r.type === 'holorime')).toBe(true);
  });

  it('handles a romanized Hindi query without throwing', () => {
    expect(() =>
      searchPhrases({ token: 'naaraaz', lang: 'hi', limit: 10 }),
    ).not.toThrow();
  });

  it('returns an empty list for an unpronounceable query', () => {
    expect(searchPhrases({ token: '', lang: 'en' })).toEqual([]);
  });

  it('never emits duplicate phrase texts within a type', () => {
    const results = searchPhrases({
      token: 'lane',
      lang: 'en',
      line: 'fast lane',
      limit: 60,
    });
    const keys = results.map((r) => `${r.type}:${r.text}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
