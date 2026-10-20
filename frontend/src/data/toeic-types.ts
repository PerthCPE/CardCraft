// ============================================================================
// frontend/src/data/toeic-types.ts
// Pure TypeScript Types and Lightweight Metadata for TOEIC Data Model
// (Zero JavaScript overhead when imported via 'import type' or for type checking)
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
    dueAt?: string;
    intervalDays?: number;
    easeFactor?: number;
    correctCount?: number;
    wrongCount?: number;
    lastWrongAt?: string;
    isDue?: boolean;
    updatedAt?: string;
  } | null;
}

export interface QuestionItem {
  id: string;
  section: 'LISTENING' | 'READING';
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7;
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
  mode:
    | 'MINI_MOCK'
    | 'FULL_MOCK'
    | 'FULL_LISTENING'
    | 'FULL_READING'
    | 'LISTENING_DRILL'
    | 'READING_DRILL'
    | string;
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

export type ToeicCategory = (typeof TOEIC_CATEGORIES)[number];

// Lightweight Static Constants for Instant Dashboards without Bundling Huge JSON Files
export const TOTAL_STATIC_FLASHCARDS = 3093;
export const TOTAL_STATIC_QUESTIONS = 484;
