'use client';

// ============================================================================
// frontend/src/hooks/useCardCraftQueries.ts
// Re-export layer for TanStack Query Hooks
// Note: For optimal code-splitting and minimal First Load JS:
// - import { useDashboardSummary } from '@/hooks/useDashboardQueries'
// - import { useFlashcards } from '@/hooks/useFlashcardsQuery'
// - import { useQuestions } from '@/hooks/useQuestionsQuery'
// ============================================================================

export * from './useDashboardQueries';
export * from './useFlashcardsQuery';
export * from './useQuestionsQuery';
