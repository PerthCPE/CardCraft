import {
  TOEIC_SYNONYMS_MAP,
  getEnglishSynonym,
  hasEnglishSynonym,
  buildEnglishSynonymChoices,
} from './toeic-synonyms.util';

describe('Twin Blades - TOEIC English Synonyms Utility', () => {
  it('should have extensive bidirectional synonym mappings', () => {
    expect(hasEnglishSynonym('commence')).toBe(true);
    expect(hasEnglishSynonym('begin')).toBe(true);
    expect(hasEnglishSynonym('acquire')).toBe(true);
    expect(hasEnglishSynonym('obtain')).toBe(true);
    expect(hasEnglishSynonym('lucrative')).toBe(true);
    expect(hasEnglishSynonym('terminate')).toBe(true);
  });

  it('should return pure English synonyms without any Thai characters', () => {
    const testWords = ['stipulate', 'breach', 'revenue', 'allocate', 'feasible', 'comply', 'audit'];
    const thaiRegex = /[\u0E00-\u0E7F]/;

    for (const w of testWords) {
      const syn = getEnglishSynonym(w);
      expect(syn).not.toBeNull();
      expect(thaiRegex.test(syn!)).toBe(false);
      expect(typeof syn).toBe('string');
      expect(syn!.length).toBeGreaterThan(1);
    }
  });

  it('should build 4 strictly unique English choices', () => {
    const target = 'acquire';
    const syn = 'obtain';
    const choices = buildEnglishSynonymChoices(target, syn, ['purchase', 'gain', 'market']);

    expect(choices.length).toBe(4);
    expect(choices).toContain(syn);
    expect(choices).not.toContain(target);

    // Case-insensitively unique
    const lowerSet = new Set(choices.map((c) => c.toLowerCase()));
    expect(lowerSet.size).toBe(4);

    // None should contain Thai characters
    const thaiRegex = /[\u0E00-\u0E7F]/;
    choices.forEach((c) => {
      expect(thaiRegex.test(c)).toBe(false);
    });
  });
});
