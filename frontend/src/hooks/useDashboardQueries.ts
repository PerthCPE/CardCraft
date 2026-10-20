'use client';

// ============================================================================
// frontend/src/hooks/useDashboardQueries.ts
// Lightweight TanStack Query Hooks for Dashboard & Progress Estimates
// Zero JSON data bundle overhead (uses lightweight constants and types)
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
  TOTAL_STATIC_FLASHCARDS,
  TOTAL_STATIC_QUESTIONS,
} from '@/data/toeic-types';
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
      totalFlashcards: TOTAL_STATIC_FLASHCARDS,
      masteredCards: 0,
      learningCards: 0,
      unseenCards: TOTAL_STATIC_FLASHCARDS,
      totalQuestions: TOTAL_STATIC_QUESTIONS,
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
