// ============================================================================
// frontend/src/utils/question-shuffle.util.ts
// ยูทิลิตีสลับสุ่มตำแหน่งตัวเลือก (Choice Shuffling Engine)
// ป้องกันการจำตัวอักษรเฉลย (A, B, C, D) โดยการสุ่มจัดเรียงช้อยส์ใหม่ทุกครั้งที่เปิดข้อสอบ
// พร้อมทำการ Map กลับไปยังรหัสเฉลยดั้งเดิมในฐานข้อมูลอย่างสมบูรณ์แบบ
// ============================================================================

import { QuestionItem } from '@/data/toeic-dictionary';

export interface ShuffledChoice {
  displayKey: 'A' | 'B' | 'C' | 'D';
  originalKey: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ShuffledQuestionWrapper {
  question: QuestionItem;
  choices: ShuffledChoice[];
  displayToOriginalMap: Record<'A' | 'B' | 'C' | 'D', 'A' | 'B' | 'C' | 'D'>;
  originalToDisplayMap: Record<'A' | 'B' | 'C' | 'D', 'A' | 'B' | 'C' | 'D'>;
  displayCorrectOption: 'A' | 'B' | 'C' | 'D';
}

/**
 * สลับตำแหน่งตัวเลือกของข้อสอบ 4 ตัวเลือกแบบสุ่ม
 * ให้คำตอบที่ถูกต้องกระจายตัวไปยัง A, B, C, D อย่างเท่าเทียมกัน
 */
export function shuffleQuestionChoices(
  question: QuestionItem,
): ShuffledQuestionWrapper {
  const allChoices: Array<{ originalKey: 'A' | 'B' | 'C' | 'D'; text: string }> = [
    { originalKey: 'A', text: question.optionA },
    { originalKey: 'B', text: question.optionB },
    { originalKey: 'C', text: question.optionC },
    ...(question.optionD ? [{ originalKey: 'D' as const, text: question.optionD }] : []),
  ];
  const rawList = allChoices.filter(
    (item) => typeof item.text === 'string' && item.text.trim() !== '',
  );

  // Fisher-Yates Shuffle
  const shuffled = [...rawList];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const optionLetters: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const choices: ShuffledChoice[] = [];
  const displayToOriginal: any = {};
  const originalToDisplay: any = {};
  let displayCorrectOption: 'A' | 'B' | 'C' | 'D' = 'A';

  shuffled.forEach((item, idx) => {
    const letter = optionLetters[idx];
    choices.push({
      displayKey: letter,
      originalKey: item.originalKey,
      text: item.text,
    });
    displayToOriginal[letter] = item.originalKey;
    originalToDisplay[item.originalKey] = letter;

    if (item.originalKey === question.correctOption) {
      displayCorrectOption = letter;
    }
  });

  return {
    question,
    choices,
    displayToOriginalMap: displayToOriginal,
    originalToDisplayMap: originalToDisplay,
    displayCorrectOption,
  };
}

/**
 * สร้าง Map การสลับช้อยส์สำหรับชุดข้อสอบทั้งหมด
 */
export function buildShuffledQuestionsMap(
  questions: QuestionItem[],
): Map<string, ShuffledQuestionWrapper> {
  const map = new Map<string, ShuffledQuestionWrapper>();
  for (const q of questions) {
    map.set(q.id, shuffleQuestionChoices(q));
  }
  return map;
}

export interface MockExamPackageInfo {
  size: 50 | 75 | 100 | 125 | 150 | 175 | 200;
  label: string;
  timeLimitMinutes: number;
  timeLimitSeconds: number;
  descriptionTh: string;
  distribution: Record<number, number>;
}

export const MOCK_EXAM_PACKAGES: MockExamPackageInfo[] = [
  {
    size: 50,
    label: '50 Questions Set',
    timeLimitMinutes: 30,
    timeLimitSeconds: 1800,
    descriptionTh: 'ชุดจำลองด่วน 50 ข้อ สัดส่วนครบทั้ง 7 พาร์ท (30 นาที)',
    distribution: { 1: 2, 2: 6, 3: 10, 4: 7, 5: 8, 6: 4, 7: 13 },
  },
  {
    size: 75,
    label: '75 Questions Set',
    timeLimitMinutes: 45,
    timeLimitSeconds: 2700,
    descriptionTh: 'ชุดความเร็วสูง 75 ข้อ ครบทุกพาร์ท (45 นาที)',
    distribution: { 1: 3, 2: 9, 3: 15, 4: 10, 5: 12, 6: 6, 7: 20 },
  },
  {
    size: 100,
    label: '100 Questions Set (Half TOEIC)',
    timeLimitMinutes: 60,
    timeLimitSeconds: 3600,
    descriptionTh: 'ชุดครึ่งสนามสอบจริง 100 ข้อ (60 นาที)',
    distribution: { 1: 3, 2: 12, 3: 20, 4: 15, 5: 15, 6: 8, 7: 27 },
  },
  {
    size: 125,
    label: '125 Questions Set',
    timeLimitMinutes: 75,
    timeLimitSeconds: 4500,
    descriptionTh: 'ชุดทดสอบความอดทน 125 ข้อ (75 นาที)',
    distribution: { 1: 4, 2: 16, 3: 24, 4: 19, 5: 19, 6: 10, 7: 33 },
  },
  {
    size: 150,
    label: '150 Questions Set',
    timeLimitMinutes: 90,
    timeLimitSeconds: 5400,
    descriptionTh: 'ชุดเข้มข้น 150 ข้อ ประลองฝีมือ (90 นาที)',
    distribution: { 1: 5, 2: 19, 3: 29, 4: 22, 5: 22, 6: 12, 7: 41 },
  },
  {
    size: 175,
    label: '175 Questions Set',
    timeLimitMinutes: 105,
    timeLimitSeconds: 6300,
    descriptionTh: 'ชุดท้าทายระดับสูง 175 ข้อ (105 นาที)',
    distribution: { 1: 5, 2: 22, 3: 34, 4: 26, 5: 26, 6: 14, 7: 48 },
  },
  {
    size: 200,
    label: '200 Questions Set (Full Official Scale)',
    timeLimitMinutes: 120,
    timeLimitSeconds: 7200,
    descriptionTh: 'ชุดสอบมาตรฐานสากลเต็มรูปแบบ 200 ข้อ (120 นาที)',
    distribution: { 1: 6, 2: 25, 3: 39, 4: 30, 5: 30, 6: 16, 7: 54 },
  },
];

/**
 * สุ่มจัดชุดข้อสอบตามสัดส่วนมาตรฐานทั้ง 7 พาร์ทสำหรับ Mock Exam
 */
export function generateProportionalMockExam(
  size: 50 | 75 | 100 | 125 | 150 | 175 | 200,
  questionBank: QuestionItem[],
): QuestionItem[] {
  const pkg =
    MOCK_EXAM_PACKAGES.find((p) => p.size === size) || MOCK_EXAM_PACKAGES[0];
  const byPart: Record<number, QuestionItem[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  };

  questionBank.forEach((q) => {
    if (byPart[q.part]) {
      byPart[q.part].push(q);
    }
  });

  const selectedQuestions: QuestionItem[] = [];

  for (let p = 1; p <= 7; p++) {
    const quota = pkg.distribution[p] || 2;
    const pool = byPart[p] && byPart[p].length > 0 ? [...byPart[p]] : [];

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Pull quota items
    for (let i = 0; i < quota; i++) {
      if (pool.length > 0) {
        const item = pool[i % pool.length];
        selectedQuestions.push({
          ...item,
          id: i >= pool.length ? `${item.id}-dup-${i}` : item.id,
        });
      }
    }
  }

  return selectedQuestions;
}
