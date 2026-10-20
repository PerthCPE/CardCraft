'use client';

// ============================================================================
// frontend/src/hooks/useFlashcardsQuery.ts
// TanStack Query Hook สำหรับ Flashcards
// โหลดเฉพาะ toeic-cards.data เพื่อไม่ให้ปนกับข้อสอบ
// ============================================================================

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFlashcards } from '@/lib/api';
import { TOEIC_DICTIONARY_CARDS } from '@/data/toeic-cards.data';

/**
 * Hook สำหรับการ์ดคำศัพท์ (Flashcards Deck)
 */
export function useFlashcards(
  category?: string,
  userId?: string,
  filter?: string,
  options?: { enabled?: boolean },
) {
  const effectiveCategory = category || 'ALL';
  const effectiveUserId = userId && userId !== 'guest' ? userId : 'guest';
  const effectiveFilter = filter || 'ALL';

  return useQuery({
    queryKey: ['flashcards', effectiveCategory, effectiveUserId, effectiveFilter],
    queryFn: () => fetchFlashcards(category, userId, filter),
    placeholderData: () => {
      if (category && category !== 'ALL') {
        return TOEIC_DICTIONARY_CARDS.filter((c) => c.category === category);
      }
      return TOEIC_DICTIONARY_CARDS;
    },
    staleTime: 10 * 60 * 1000, // 10 นาที
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Prefetch คำศัพท์ล่วงหน้าเมื่อผู้ใช้นำเมาส์ไปชี้ที่ปุ่ม
 */
export function prefetchFlashcards(
  queryClient: ReturnType<typeof useQueryClient>,
  category?: string,
  userId?: string,
  filter?: string,
) {
  const effectiveCategory = category || 'ALL';
  const effectiveUserId = userId && userId !== 'guest' ? userId : 'guest';
  const effectiveFilter = filter || 'ALL';

  return queryClient.prefetchQuery({
    queryKey: ['flashcards', effectiveCategory, effectiveUserId, effectiveFilter],
    queryFn: () => fetchFlashcards(category, userId, filter),
    staleTime: 10 * 60 * 1000,
  });
}
