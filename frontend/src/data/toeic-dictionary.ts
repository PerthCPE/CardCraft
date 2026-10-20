// ============================================================================
// frontend/src/data/toeic-dictionary.ts
// Re-export layer for backwards compatibility
// Note: For optimal code-splitting, prefer importing from:
// - '@/data/toeic-types' for interfaces and constants (0 KB JS bundle)
// - '@/data/toeic-cards.data' for flashcard deck only
// - '@/data/toeic-questions.data' for question bank only
// ============================================================================

export * from './toeic-types';
export { TOEIC_DICTIONARY_CARDS } from './toeic-cards.data';
export { TOEIC_INITIAL_QUESTIONS } from './toeic-questions.data';

import { ExamAttemptItem } from './toeic-types';
export const TOEIC_INITIAL_ATTEMPTS: ExamAttemptItem[] = [];
