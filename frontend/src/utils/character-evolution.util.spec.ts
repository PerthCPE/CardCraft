import {
  calculateScaledToeicScore,
  getCharacterEvolution,
} from './character-evolution.util';

describe('Frontend Character Evolution & Scaled TOEIC Score Utility', () => {
  it.each([
    [0, 1, 'Novice Villager', false],
    [250, 2, 'Word Scout', false],
    [400, 3, 'Spell Squire', false],
    [600, 4, 'Rune Knight', false],
    [700, 5, 'High Paladin', true],
    [800, 6, 'Grand Archmage', true],
    [900, 7, 'CardCraft Deity', true],
  ])(
    'maps score %i to Tier %i (%s) with passed700=%s',
    (score, expectedTier, expectedTitle, expectedPassed) => {
      const evo = getCharacterEvolution(score, 700);
      expect(evo.unlockedTier).toBe(expectedTier);
      expect(evo.classTitle).toBe(expectedTitle);
      expect(evo.isPassedTarget).toBe(expectedPassed);
    },
  );

  it('calculates scaled TOEIC score between 10 and 990', () => {
    const min = calculateScaledToeicScore(0, 7, 0, 8);
    expect(min.estimatedScore).toBe(10);

    const max = calculateScaledToeicScore(7, 7, 8, 8);
    expect(max.estimatedScore).toBe(990);
  });
});
