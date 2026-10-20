import toeic1000Json from './toeic-1000-words.json';
import toeicQuestionsJson from './toeic-questions.json';
// ============================================================================
// frontend/src/data/toeic-dictionary.ts
// คลังพจนานุกรมคำศัพท์ออกสอบบ่อย TOEIC 700-850+ (60 High-Frequency Business Words)
// และคลังข้อสอบ TOEIC มาตรฐาน (Listening Part 1, 2 & Reading Part 5, 7)
// ใช้ทั้งเป็น Initial Store และ Fallback อัตโนมัติหากยังไม่ได้เปิด Docker PostgreSQL
// ============================================================================

export interface FlashcardItem {
  id: string;
  word: string;
  partOfSpeech: string;
  meaningTh: string;
  exampleEn: string;
  category: string;
  manaCost: number;
  progress?: {
    isKnown: boolean;
    swipeCount: number;
    updatedAt?: string;
  } | null;
}

export interface QuestionItem {
  id: string;
  section: 'LISTENING' | 'READING';
  part: 1 | 2 | 5 | 7;
  audioUrl?: string | null;
  imageUrl?: string | null;
  passageText?: string | null;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD?: string | null;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanationTh: string;
  tag: string;
}

export interface ExamAttemptItem {
  id: string;
  userId: string;
  mode: 'MINI_MOCK' | 'LISTENING_DRILL' | 'READING_DRILL';
  listeningCorrect: number;
  readingCorrect: number;
  estimatedScore: number;
  unlockedTier: number;
  isPassedTarget: boolean;
  timeSpentSeconds: number;
  createdAt: string;
}

export const TOEIC_CATEGORIES = [
  'ALL',
  'Contracts',
  'Finance',
  'Marketing',
  'Human Resources',
  'Corporate',
  'Logistics',
  'Manufacturing',
  'Technology',
  'Customer Relations',
  'Hospitality',
  'Facilities',
  'Safety & Health',
] as const;

export const TOEIC_DICTIONARY_CARDS: FlashcardItem[] = (toeic1000Json as Array<{
  id: string;
  word: string;
  partOfSpeech: string;
  meaningTh: string;
  exampleEn: string;
  category: string;
  manaCost: number;
}>).map((item, index) => {
  // จำลอง progress เริ่มต้นสำหรับการ์ด 8 ใบแรกของ Demo User
  let progress: FlashcardItem['progress'] = null;
  if (index === 0) progress = { isKnown: true, swipeCount: 2 };
  else if (index === 2) progress = { isKnown: true, swipeCount: 1 };
  else if (index === 8) progress = { isKnown: true, swipeCount: 1 };
  else if (index === 9) progress = { isKnown: false, swipeCount: 2 };
  else if (index === 16) progress = { isKnown: true, swipeCount: 1 };
  else if (index === 24) progress = { isKnown: false, swipeCount: 1 };
  else if (index === 32) progress = { isKnown: true, swipeCount: 3 };
  else if (index === 39) progress = { isKnown: true, swipeCount: 1 };

  return {
    ...item,
    progress,
  };
});

export const TOEIC_INITIAL_QUESTIONS: QuestionItem[] = toeicQuestionsJson as QuestionItem[];

export const TOEIC_INITIAL_ATTEMPTS: ExamAttemptItem[] = [];
