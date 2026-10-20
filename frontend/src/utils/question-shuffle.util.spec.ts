import { QuestionItem } from '@/data/toeic-dictionary';
import {
  shuffleQuestionChoices,
  buildShuffledQuestionsMap,
  MOCK_EXAM_PACKAGES,
  generateProportionalMockExam,
} from './question-shuffle.util';

describe('Question Choice Shuffling & Mock Exam Packages Utility', () => {
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

  it('provides all 7 official mock exam packages (50, 75, 100, 125, 150, 175, 200)', () => {
    expect(MOCK_EXAM_PACKAGES.length).toBe(7);
    const sizes = MOCK_EXAM_PACKAGES.map((p) => p.size);
    expect(sizes).toEqual([50, 75, 100, 125, 150, 175, 200]);

    MOCK_EXAM_PACKAGES.forEach((pkg) => {
      // Every part 1 to 7 must have at least 2 questions
      for (let p = 1; p <= 7; p++) {
        expect(pkg.distribution[p]).toBeGreaterThanOrEqual(2);
      }
      // Sum of distribution must equal pkg.size
      const sum = Object.values(pkg.distribution).reduce((a, b) => a + b, 0);
      expect(sum).toBe(pkg.size);
    });
  });

  it('generates proportional mock exam set matching exact requested size', () => {
    const dummyBank: QuestionItem[] = [];
    for (let p = 1; p <= 7; p++) {
      for (let i = 1; i <= 3; i++) {
        dummyBank.push({
          ...sampleQuestion,
          id: `q-p${p}-${i}`,
          part: p as any,
        });
      }
    }

    const exam50 = generateProportionalMockExam(50, dummyBank);
    expect(exam50.length).toBe(50);

    const exam100 = generateProportionalMockExam(100, dummyBank);
    expect(exam100.length).toBe(100);
  });
});
