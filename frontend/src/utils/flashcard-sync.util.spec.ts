import {
  mergeServerFlashcardsWithLocalSwipes,
  LocalSwipeRecord,
} from './flashcard-sync.util';
import { FlashcardItem } from '@/data/toeic-dictionary';

describe('mergeServerFlashcardsWithLocalSwipes', () => {
  const dummyCards: FlashcardItem[] = [
    {
      id: 'card-1',
      word: 'negotiate',
      partOfSpeech: 'v.',
      meaningTh: 'เจรจาต่อรอง',
      exampleEn: 'We negotiate contracts.',
      category: 'Contracts',
      manaCost: 3,
      progress: null,
    },
    {
      id: 'card-2',
      word: 'revenue',
      partOfSpeech: 'n.',
      meaningTh: 'รายได้',
      exampleEn: 'Revenue increased by 10%.',
      category: 'Finance',
      manaCost: 2,
      progress: null,
    },
    {
      id: 'card-3',
      word: 'logistics',
      partOfSpeech: 'n.',
      meaningTh: 'การขนส่ง',
      exampleEn: 'Efficient logistics reduce costs.',
      category: 'Logistics',
      manaCost: 2,
      progress: null,
    },
  ];

  it('ควรคืนค่า serverCards ทันทีหาก currentCards ว่างเปล่า', () => {
    const localSwipes = new Map<string, LocalSwipeRecord>();
    const result = mergeServerFlashcardsWithLocalSwipes(dummyCards, [], localSwipes);
    expect(result).toEqual(dummyCards);
  });

  it('ควรป้องกันการ์ดที่ถูกปัดในเซสชันไม่ให้โดน server response แบบ stale เขียนทับ', () => {
    // ผู้ใช้ปัด card-1 เป็น MASTERED (isKnown: true) ทันทีตอนเห็น local data
    const currentCards: FlashcardItem[] = [
      {
        ...dummyCards[0],
        progress: { isKnown: true, swipeCount: 1 },
      },
      dummyCards[1],
      dummyCards[2],
    ];

    const localSwipes = new Map<string, LocalSwipeRecord>();
    localSwipes.set('card-1', { isKnown: true, swipeCount: 1 });

    // Server ตอบกลับมาช้าด้วย progress: null (ยังไม่ได้รับข้อมูล swipe ล่าสุด)
    const serverCards: FlashcardItem[] = [
      { ...dummyCards[0], progress: null },
      { ...dummyCards[1], progress: { isKnown: false, swipeCount: 2 } }, // card-2 มีข้อมูลเก่าใน server
      { ...dummyCards[2], progress: null },
    ];

    const merged = mergeServerFlashcardsWithLocalSwipes(serverCards, currentCards, localSwipes);

    // card-1 ต้องยังคงเป็น isKnown: true จากการปัดในเซสชัน ไม่โดน null ทับ
    expect(merged[0].progress?.isKnown).toBe(true);
    expect(merged[0].progress?.swipeCount).toBe(1);

    // card-2 ที่ไม่ได้ปัดในเซสชัน ต้องได้รับการอัปเดตจาก server
    expect(merged[1].progress?.isKnown).toBe(false);
    expect(merged[1].progress?.swipeCount).toBe(2);
  });
});
