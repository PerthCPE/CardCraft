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
