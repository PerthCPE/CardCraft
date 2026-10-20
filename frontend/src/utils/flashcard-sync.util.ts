// ============================================================================
// frontend/src/utils/flashcard-sync.util.ts
// Utility ป้องกัน Race Condition เมื่อข้อมูลจริงจาก Backend ตอบกลับมาช้ากว่าการปัดการ์ดของผู้ใช้
// ============================================================================

import { FlashcardItem } from '@/data/toeic-dictionary';

export interface LocalSwipeRecord {
  isKnown: boolean;
  swipeCount: number;
}

/**
 * ผสานรายการการ์ดจาก Server เข้ากับ State ปัจจุบัน โดยไม่ให้ข้อมูลเก่าจาก Server
 * เขียนทับสถานะการ์ดที่เพิ่งถูกปัดในเซสชันปัจจุบัน
 */
export function mergeServerFlashcardsWithLocalSwipes(
  serverCards: FlashcardItem[],
  currentCards: FlashcardItem[],
  localSwipes: Map<string, LocalSwipeRecord>,
): FlashcardItem[] {
  if (currentCards.length === 0) {
    return serverCards;
  }

  const serverProgressMap = new Map(
    serverCards.map((c) => [c.id, c.progress]),
  );

  return currentCards.map((card) => {
    const localSwipe = localSwipes.get(card.id);
    const serverProg = serverProgressMap.get(card.id);

    // หากมีการปัดการ์ดใบนี้ในเซสชันปัจจุบัน ให้คงสถานะการปัดล่าสุดไว้
    if (localSwipe) {
      return {
        ...card,
        progress: {
          ...(serverProg ?? {}),
          isKnown: localSwipe.isKnown,
          swipeCount: Math.max(
            localSwipe.swipeCount,
            serverProg?.swipeCount ?? 0,
          ),
        },
      };
    }

    // หากไม่มีการปัดในเซสชัน ให้อัปเดตความคืบหน้าตาม Server
    return {
      ...card,
      progress: serverProg ?? card.progress,
    };
  });
}
