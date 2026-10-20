'use client';

// ============================================================================
// frontend/src/hooks/useCardCraftQueries.ts
// Custom TanStack Query Hooks สำหรับ CardCraft
//
// คุณสมบัติสำคัญ:
// 1. Instant 0ms Render: ใช้ Static Local Data เป็น placeholderData ทำให้หน้าเว็บ
//    แสดงผลทันทีโดยไม่มี Spinner บัง และไม่ต้องรอนาน
// 2. Background Revalidation: เบื้องหลังยังคงยิง Request จริงไปยัง Backend (รอได้ 50s รองรับ Cold Start)
//    เมื่อข้อมูลจริงจาก PostgreSQL ตอบกลับมา จะทำการสลับข้อมูลอย่างนุ่มนวล
// 3. StaleTime Optimization:
//    - Questions / Flashcards: staleTime 10 นาที (ข้อมูลกึ่งคงที่ ไม่ยิงซ้ำทุกครั้งที่สลับหน้า)
//    - Dashboard / Part Estimates: staleTime 30 วินาที
// 4. Safe Fallback: แม้ Backend ปิด หรือ Cold Start นานเกินไป UI ยังทำงานต่อได้ด้วย Local Data 100%
// ============================================================================

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DashboardSummaryResponse,
  fetchDashboardSummary,
  fetchFlashcards,
  fetchPartSkillEstimates,
  fetchQuestions,
  PartSkillEstimatesResponse,
} from '@/lib/api';
import {
  FlashcardItem,
  QuestionItem,
  TOEIC_DICTIONARY_CARDS,
  TOEIC_INITIAL_QUESTIONS,
} from '@/data/toeic-dictionary';
import { getCharacterEvolution } from '@/utils/character-evolution.util';

/**
 * สร้างข้อมูล Dashboard จำลองเริ่มต้นสำหรับสถานะ 0ms render
 */
export function getInitialGuestDashboard(): DashboardSummaryResponse {
  const guestEvolution = getCharacterEvolution(0, 700);
  return {
    user: null,
    isGuest: true,
    evolution: guestEvolution,
    stats: {
      totalFlashcards: TOEIC_DICTIONARY_CARDS.length,
      masteredCards: 0,
      learningCards: 0,
      unseenCards: TOEIC_DICTIONARY_CARDS.length,
      totalQuestions: TOEIC_INITIAL_QUESTIONS.length,
      totalExamsCompleted: 0,
    },
    recentAttempts: [],
    isBackendConnected: false,
  };
}

/**
 * Hook สำหรับ Hero Profile & Dashboard Summary
 */
export function useDashboardSummary(userId?: string) {
  const effectiveUserId = userId && userId !== 'guest' ? userId : 'guest';

  return useQuery({
    queryKey: ['dashboard-summary', effectiveUserId],
    queryFn: () => fetchDashboardSummary(userId),
    placeholderData: getInitialGuestDashboard(),
    staleTime: 30 * 1000, // 30 วินาที
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook สำหรับดึงคะแนนประเมินราย 7 พาร์ท (TOEIC Readiness Forecast)
 */
export function usePartSkillEstimates(userId?: string) {
  const effectiveUserId = userId && userId !== 'guest' ? userId : 'guest';

  return useQuery({
    queryKey: ['part-skill-estimates', effectiveUserId],
    queryFn: () => fetchPartSkillEstimates(userId),
    placeholderData: () => {
      let map: Record<number, any> = {};
      if (typeof window !== 'undefined') {
        try {
          map = JSON.parse(
            localStorage.getItem('cardcraft_part_skill_estimates') || '{}',
          );
        } catch {}
      }
      const estimates: any[] = [];
      let lTotal = 0;
      let rTotal = 0;
      for (let p = 1; p <= 7; p++) {
        if (map[p]) {
          estimates.push(map[p]);
          if (p <= 4) lTotal += map[p].estimatedScore || 0;
          else rTotal += map[p].estimatedScore || 0;
        }
      }
      return {
        estimates,
        forecastListeningTotal: lTotal,
        forecastReadingTotal: rTotal,
        totalForecastScore: lTotal + rTotal,
      };
    },
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook สำหรับดึงคลังคำศัพท์ Flashcards
 * staleTime 10 นาที เพื่อไม่ให้โหลดซ้ำเมื่อสลับไปหน้าอื่นแล้วกลับมา
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
 * Hook ตัวช่วยสำหรับ Invalidate Query เมื่อมีการเปลี่ยนแปลงข้อมูล (เช่น ส่งข้อสอบ, ปัดการ์ด, แก้ไขโปรไฟล์)
 */
export function useCardCraftQueryHelpers() {
  const queryClient = useQueryClient();

  const invalidateDashboard = (userId?: string) => {
    const effectiveUserId = userId && userId !== 'guest' ? userId : 'guest';
    queryClient.invalidateQueries({
      queryKey: ['dashboard-summary', effectiveUserId],
    });
    queryClient.invalidateQueries({
      queryKey: ['part-skill-estimates', effectiveUserId],
    });
  };

  const invalidateFlashcards = () => {
    queryClient.invalidateQueries({ queryKey: ['flashcards'] });
  };

  const invalidateQuestions = () => {
    queryClient.invalidateQueries({ queryKey: ['questions'] });
  };

  const prefetchQuestions = (part?: number, section?: string) => {
    const effectiveSection = section || 'ALL';
    const effectivePart = part ?? 'ALL';
    queryClient.prefetchQuery({
      queryKey: ['questions', effectiveSection, effectivePart],
      queryFn: () => fetchQuestions(section, part),
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchFlashcards = (category?: string) => {
    const effectiveCategory = category || 'ALL';
    queryClient.prefetchQuery({
      queryKey: ['flashcards', effectiveCategory, 'guest', 'ALL'],
      queryFn: () => fetchFlashcards(category),
      staleTime: 10 * 60 * 1000,
    });
  };

  return {
    queryClient,
    invalidateDashboard,
    invalidateFlashcards,
    invalidateQuestions,
    prefetchQuestions,
    prefetchFlashcards,
  };
}
