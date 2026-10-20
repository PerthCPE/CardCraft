import {
  buildAlchemistChoices,
  deriveWordFamily,
  KNOWN_WORD_FAMILIES,
} from './word-alchemist.util';

describe('WordAlchemistGame - Choice Uniqueness & Anti-Duplication Safeguards', () => {
  const sampleWords = [
    { word: 'Negotiate', pos: 'v.' },
    { word: 'negotiate', pos: 'v.' },
    { word: 'application', pos: 'n.' },
    { word: 'Application', pos: 'n.' },
    { word: 'competitive', pos: 'adj.' },
    { word: 'Competitive', pos: 'adj.' },
    { word: 'expand', pos: 'v.' },
    { word: 'efficiency', pos: 'n.' },
    { word: 'strategy', pos: 'n.' },
    { word: 'reliable', pos: 'adj.' },
    { word: 'comply', pos: 'v.' },
    { word: 'finance', pos: 'n.' },
    { word: 'create', pos: 'v.' },
    { word: 'sustain', pos: 'v.' },
    { word: 'produce', pos: 'v.' },
    { word: 'manage', pos: 'v.' },
    { word: 'significantly', pos: 'adv.' },
    { word: 'innovative', pos: 'adj.' },
    { word: 'qualify', pos: 'v.' },
    { word: 'satisfaction', pos: 'n.' },
  ];

  it('guarantees exactly 4 choices are generated for each word', () => {
    for (const item of sampleWords) {
      const choices = buildAlchemistChoices(item.word, item.pos, false, ['corporate', 'business', 'company']);
      expect(choices).toHaveLength(4);
    }
  });

  it('guarantees that all 4 choices are 100% case-insensitively unique (zero duplicates differing only in case)', () => {
    for (const item of sampleWords) {
      const choices = buildAlchemistChoices(item.word, item.pos, false, ['corporate', 'business', 'company']);
      const lowercasedSet = new Set(choices.map((c) => c.toLowerCase()));

      // Must have exactly 4 unique lowercased words
      expect(lowercasedSet.size).toBe(4);

      // Verify no two choices are identical or differ only by case
      for (let i = 0; i < choices.length; i++) {
        for (let j = i + 1; j < choices.length; j++) {
          expect(choices[i].toLowerCase()).not.toBe(choices[j].toLowerCase());
        }
      }
    }
  });

  it('guarantees consistent casing when blank is inside sentence (all lowercase)', () => {
    for (const item of sampleWords) {
      const choices = buildAlchemistChoices(item.word, item.pos, false);
      for (const choice of choices) {
        expect(choice).toBe(choice.toLowerCase());
      }
    }
  });

  it('guarantees consistent casing when blank is at sentence start (all Capitalized)', () => {
    for (const item of sampleWords) {
      const choices = buildAlchemistChoices(item.word, item.pos, true);
      for (const choice of choices) {
        const firstChar = choice.charAt(0);
        expect(firstChar).toBe(firstChar.toUpperCase());
        expect(choice.slice(1)).toBe(choice.slice(1).toLowerCase());
      }
    }
  });

  it('guarantees that the target word is always included in the choices', () => {
    for (const item of sampleWords) {
      const choices = buildAlchemistChoices(item.word, item.pos, false);
      const targetLower = item.word.toLowerCase();
      const containsTarget = choices.some((c) => c.toLowerCase() === targetLower);
      expect(containsTarget).toBe(true);
    }
  });

  it('correctly maps known authentic TOEIC word families', () => {
    const family = deriveWordFamily('negotiate', 'v.');
    expect(family.noun).toBe('negotiation');
    expect(family.adj).toBe('negotiable');
    expect(family.adv).toBe('negotiably');
  });
});
