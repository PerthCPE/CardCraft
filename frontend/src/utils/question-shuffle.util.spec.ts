import { QuestionItem } from '@/data/toeic-dictionary';
import {
  shuffleQuestionChoices,
  buildShuffledQuestionsMap,
} from './question-shuffle.util';

describe('Question Choice Shuffling Utility', () => {
  const sampleQuestion: QuestionItem = {
    id: 'q-test-01',
    section: 'READING',
    part: 5,
    audioUrl: null,
    imageUrl: null,
    passageText: null,
    questionText: 'The quarterly report must be submitted _______ Friday.',
    optionA: 'before',
    optionB: 'prior',
    optionC: 'ahead',
    optionD: 'previous',
    correctOption: 'A',
    explanationTh: 'Use preposition before',
    tag: 'Preposition',
  };

  it('preserves all 4 choices and contains all original texts', () => {
    const wrapped = shuffleQuestionChoices(sampleQuestion);
    expect(wrapped.choices.length).toBe(4);

    const texts = wrapped.choices.map((c) => c.text);
    expect(texts).toContain('before');
    expect(texts).toContain('prior');
    expect(texts).toContain('ahead');
    expect(texts).toContain('previous');
  });

  it('correctly maps displayCorrectOption back to originalKey A', () => {
    const wrapped = shuffleQuestionChoices(sampleQuestion);
    const displayCorrect = wrapped.displayCorrectOption;
    const originalMapped = wrapped.displayToOriginalMap[displayCorrect];

    expect(originalMapped).toBe('A');
    const correctChoice = wrapped.choices.find(
      (c) => c.displayKey === displayCorrect,
    );
    expect(correctChoice?.text).toBe('before');
  });

  it('builds shuffled map for multiple questions', () => {
    const questions: QuestionItem[] = [
      sampleQuestion,
      {
        ...sampleQuestion,
        id: 'q-test-02',
        correctOption: 'C',
      },
    ];

    const map = buildShuffledQuestionsMap(questions);
    expect(map.size).toBe(2);
    expect(map.has('q-test-01')).toBe(true);
    expect(map.has('q-test-02')).toBe(true);

    const q2 = map.get('q-test-02')!;
    expect(q2.displayToOriginalMap[q2.displayCorrectOption]).toBe('C');
  });
});
