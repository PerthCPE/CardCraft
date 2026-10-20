'use client';

// ============================================================================
// frontend/src/hooks/useQuestionsQuery.ts
// TanStack Query Hook สำหรับ Questions
// โหลดเฉพาะ toeic-questions.data เพื่อไม่ให้ปนกับการ์ดคำศัพท์
// ============================================================================

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchQuestions } from '@/lib/api';
import { TOEIC_INITIAL_QUESTIONS } from '@/data/toeic-questions.data';

/**
 * Hook สำหรับดึงคลังข้อสอบ Questions
 * รองรับทั้งแบบดึงทั้งหมด หรือดึงแยกเฉพาะ Part / Section
 */
export function useQuestions(
  part?: number,
  section?: string,
  options?: { enabled?: boolean },
) {
  const effectiveSection = section || 'ALL';
  const effectivePart = part ?? 'ALL';

  return useQuery({
    queryKey: ['questions', effectiveSection, effectivePart],
    queryFn: () => fetchQuestions(section, part),
    placeholderData: () => {
      let pool = TOEIC_INITIAL_QUESTIONS;
      if (section && section !== 'ALL') {
        pool = pool.filter((q) => q.section === section);
      }
      if (part) {
        pool = pool.filter((q) => q.part === part);
      }
      return pool;
    },
    staleTime: 10 * 60 * 1000, // 10 นาที
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Prefetch ข้อสอบล่วงหน้าเมื่อผู้ใช้นำเมาส์ไปชี้หรือแตะปุ่มเริ่มทำข้อสอบ
 */
export function prefetchQuestions(
  queryClient: ReturnType<typeof useQueryClient>,
  part?: number,
  section?: string,
) {
  const effectiveSection = section || 'ALL';
  const effectivePart = part ?? 'ALL';

  return queryClient.prefetchQuery({
    queryKey: ['questions', effectiveSection, effectivePart],
    queryFn: () => fetchQuestions(section, part),
    staleTime: 10 * 60 * 1000,
  });
}
