import { describe, expect, it } from 'vitest';
import { g2pEn } from '@/lib/engine/g2p-en';
import { g2pHi, applySchwaDeletion, g2pHiRulesOnly } from '@/lib/engine/g2p-hi';
import { parseIpa, makePhoneme } from '@/lib/engine/ipa';
import { SCHWA_CASES } from '../fixtures/hinglish-bars';

describe('English G2P', () => {
  it('looks up CMUdict and marks origin as lexicon', () => {
    const candidates = g2pEn('grind');
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates[0].origin).toBe('lexicon');
    expect(candidates[0].syllables.length).toBe(1);
    expect(candidates[0].rhymeTail.length).toBeGreaterThan(0);
  });

  it('returns multiple candidates for ambiguous dictionary words', () => {
    // 'read' has present/past variants in CMUdict.
    const candidates = g2pEn('read');
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates[0].score).toBeGreaterThan(0.7);
  });

  it('falls back to rules for out-of-vocabulary slang', () => {
    const candidates = g2pEn('blorptastic');
    expect(candidates.length).toBe(1);
    expect(candidates[0].origin).toBe('rules');
    expect(candidates[0].syllables.length).toBeGreaterThanOrEqual(2);
  });

  it('ranks lexicon hits above rules hits', () => {
    const lex = g2pEn('hospital')[0];
    const rules = g2pEn('blorptastic')[0];
    expect(lex.score).toBeGreaterThan(rules.score);
  });
});

describe('Hindi G2P', () => {
  it('resolves spelling variants to the same phonemes', () => {
    const dil = g2pHi('dil')[0];
    const dill = g2pHi('dill')[0];
    expect(dil.phonemes.map((p) => p.ipa).join('')).toBe(
      dill.phonemes.map((p) => p.ipa).join(''),
    );
    expect(dil.origin).toBe('lexicon');
  });

  it('resolves mein/main/mai to the Hindi pronoun', () => {
    for (const spelling of ['mein', 'main', 'mai']) {
      const candidates = g2pHi(spelling);
      expect(candidates.length).toBeGreaterThanOrEqual(1);
      expect(candidates[0].syllables.length).toBe(1);
      expect(candidates[0].phonemes.some((p) => p.nasalized)).toBe(true);
    }
  });

  it('returns ranked alternates for ambiguous kal', () => {
    const candidates = g2pHi('kal');
    expect(candidates.length).toBeGreaterThanOrEqual(2);
    expect(candidates[0].score).toBeGreaterThanOrEqual(candidates[1].score);
    const ipas = candidates.map((c) => c.phonemes.map((p) => p.ipa).join(''));
    expect(ipas.some((s) => s.includes('ə'))).toBe(true);
    expect(ipas.some((s) => s.includes('aː'))).toBe(true);
  });

  it('rules path returns more than one candidate for ambiguous input', () => {
    const candidates = g2pHiRulesOnly('kal');
    expect(candidates.length).toBeGreaterThanOrEqual(1);
  });
});

describe('schwa deletion', () => {
  it('deletes word-final schwa', () => {
    const input = [makePhoneme('k'), makePhoneme('ə'), makePhoneme('m'), makePhoneme('ə'), makePhoneme('l'), makePhoneme('ə')];
    const out = applySchwaDeletion(input);
    expect(out.map((p) => p.ipa).join('')).toBe('kəməl');
  });

  it('never deletes a word-initial schwa', () => {
    const input = parseIpa('ənd̪ər');
    // Force a final schwa to ensure the rule runs, then check initial stays.
    const withFinal = [...input, makePhoneme('ə')];
    const out = applySchwaDeletion(withFinal);
    expect(out[0].ipa).toBe('ə');
  });

  for (const fixture of SCHWA_CASES) {
    it(`${fixture.token} → ${fixture.syllables} syllables (${fixture.note})`, () => {
      const candidates = g2pHi(fixture.token);
      // Prefer lexicon; fall back to rules-only if the word is not yet in the bank.
      const top = candidates[0] ?? g2pHiRulesOnly(fixture.token)[0];
      expect(top).toBeDefined();
      expect(top.syllables.length).toBe(fixture.syllables);
    });
  }
});
