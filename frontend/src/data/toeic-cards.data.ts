// ============================================================================
// frontend/src/data/toeic-cards.data.ts
// คลังพจนานุกรมคำศัพท์ออกสอบบ่อย TOEIC (1,000 High-Frequency Business Words)
// แยกเฉพาะข้อมูล Flashcards เพื่อไม่ให้ถูก bundle รวมกับ Question Bank
// ============================================================================

import toeic1000Json from './toeic-1000-words.json';
import { FlashcardItem } from './toeic-types';

export const TOEIC_DICTIONARY_CARDS: FlashcardItem[] = (
  toeic1000Json as Array<{
    id: string;
    word: string;
    partOfSpeech: string;
    meaningTh: string;
    exampleEn: string;
    category: string;
    manaCost: number;
  }>
).map((item, index) => {
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
