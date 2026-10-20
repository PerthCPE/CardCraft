// ============================================================================
// frontend/src/lib/api.ts
// Production API Client (NestJS + PostgreSQL + Multi-User Auth)
//
// เชื่อมต่อ Backend API จริงแบบ Real Production:
// - ระบบ Authentication (Login / Register) แยก User แต่ละคน
// - บันทึกและดึงข้อมูลจาก PostgreSQL (Supabase / Render)
// - รองรับการระบุ userId ในทุก Request เพื่อแยกสถิติ, Tier และผลการปัดการ์ด
// ============================================================================

import type {
  ExamAttemptItem,
  FlashcardItem,
  QuestionItem,
} from '@/data/toeic-types';
import {
  TOTAL_STATIC_FLASHCARDS,
  TOTAL_STATIC_QUESTIONS,
} from '@/data/toeic-types';
import {
  calculateEstimatedPartScore,
  calculateScaledToeicScore,
  CharacterEvolutionStatus,
  CharacterTierInfo,
  getCharacterEvolution,
  ScaledScoreBreakdown,
  SupportivePerformanceTier,
} from '@/utils/character-evolution.util';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ระยะเวลา Timeout สำหรับการเชื่อมต่อ Backend (50 วินาที เพื่อรองรับ Cold Start บน Free Tier)
export const DEFAULT_REQUEST_TIMEOUT_MS = 50000;

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export interface HeroUserProfile {
  id: string;
  username?: string;
  email?: string;
  name: string;
  targetScore: number;
  currentEstimatedScore: number;
}

export interface DashboardSummaryResponse {
  user: HeroUserProfile | null;
  isGuest?: boolean;
  evolution: CharacterEvolutionStatus;
  stats: {
    totalFlashcards: number;
    masteredCards: number;
    learningCards: number;
    unseenCards: number;
    totalQuestions: number;
    totalExamsCompleted: number;
  };
  recentAttempts: ExamAttemptItem[];
  isBackendConnected: boolean;
}

export interface ExamAnswerItemPayload {
  questionId: string;
  part?: number;
  selectedOption: string;
  flagged?: boolean;
  timeSpentMs?: number;
}

export interface SubmitExamPayload {
  userId?: string;
  mode: string;
  listeningCorrect?: number;
  listeningTotal?: number;
  readingCorrect?: number;
  readingTotal?: number;
  timeSpentSeconds: number;
  answers?: ExamAnswerItemPayload[];
}

export interface LogAnswerPayload {
  userId: string;
  questionId: string;
  part: number;
  mode: string;
  selectedOption: string;
  timeSpentMs?: number;
}

export interface SubmitPracticePartPayload {
  userId?: string;
  part: number;
  totalQuestions: number;
  correctAnswers: number;
  timeLimitSeconds: number;
  timeSpentSeconds: number;
  answers?: ExamAnswerItemPayload[];
}

export interface PartSkillEstimateItem {
  id?: string;
  userId?: string;
  part: number;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  estimatedScore: number;
  maxPartScore: number;
  supportiveTier: number;
  lastPracticedAt?: string;
  supportiveInfo?: SupportivePerformanceTier;
}

export interface PartSkillEstimatesResponse {
  estimates: PartSkillEstimateItem[];
  forecastListeningTotal: number;
  forecastReadingTotal: number;
  totalForecastScore: number;
}

export interface SubmitPracticePartResponse {
  estimate: PartSkillEstimateItem;
  partEvaluation: {
    part: number;
    accuracy: number;
    accuracyPercent: number;
    estimatedPartScore: number;
    maxPartScore: number;
    supportiveTier: SupportivePerformanceTier;
  };
  officialScoreUnchanged: number;
  user?: HeroUserProfile;
}

export interface SubmitExamResponse {
  attempt: ExamAttemptItem;
  user: HeroUserProfile;
  scoreBreakdown: ScaledScoreBreakdown;
  previousScore: number;
  scoreDelta: number;
  previousTier: CharacterTierInfo;
  evolution: CharacterEvolutionStatus;
  hasEvolved: boolean;
  targetAnalysis: {
    targetScore: number;
    isPassedTarget: boolean;
    pointsToTarget700: number;
    pointsToNextTier: number;
    headlineTh: string;
  };
}

// ----------------------------------------------------------------------------
// 0. Authentication API (Simple Username + Password)
// ----------------------------------------------------------------------------
export async function authLogin(
  username: string,
  password: string,
): Promise<{ user: HeroUserProfile; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'เข้าสู่ระบบไม่สำเร็จ');
  }

  return res.json();
}

export async function authRegister(
  username: string,
  password: string,
  name?: string,
  targetScore?: number,
): Promise<{ user: HeroUserProfile; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, name, targetScore }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'สมัครสมาชิกไม่สำเร็จ');
  }

  return res.json();
}

export async function authGetMe(
  userId: string,
): Promise<{ user: HeroUserProfile }> {
  const res = await fetch(
    `${API_BASE_URL}/auth/me?userId=${encodeURIComponent(userId)}`,
    {
      cache: 'no-store',
    },
  );

  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

// ----------------------------------------------------------------------------
// 1. Dashboard & Hero Profile API
// ----------------------------------------------------------------------------
export async function fetchDashboardSummary(
  userId?: string,
): Promise<DashboardSummaryResponse> {
  try {
    const query = userId && userId !== 'guest' ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetchWithTimeout(`${API_BASE_URL}/users/dashboard${query}`);
    if (!res.ok) throw new Error('Backend not ok');
    const data = await res.json();
    return {
      ...data,
      isBackendConnected: true,
    };
  } catch {
    // โหมด Guest เริ่มต้น หรือกรณี Backend กำลัง Boot
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
}

export async function updateHeroProfile(
  payload: {
    name?: string;
    targetScore?: number;
    currentEstimatedScore?: number;
  },
  userId?: string,
): Promise<{ user: HeroUserProfile; evolution: CharacterEvolutionStatus }> {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const res = await fetch(`${API_BASE_URL}/users/profile${query}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update profile on backend');
  }

  return res.json();
}

// ----------------------------------------------------------------------------
// 2. Flashcards CRUD & Swipe API
// ----------------------------------------------------------------------------
export async function fetchFlashcards(
  category?: string,
  userId?: string,
  filter?: string,
  options?: { bypassHttpCache?: boolean },
): Promise<FlashcardItem[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.set('category', category);
    if (userId) params.set('userId', userId);
    if (filter && filter !== 'ALL') params.set('filter', filter);
    if (options?.bypassHttpCache) params.set('_t', String(Date.now()));
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await fetchWithTimeout(`${API_BASE_URL}/flashcards${qs}`, {
      cache: options?.bypassHttpCache ? 'reload' : 'default',
    });
    if (!res.ok) throw new Error('Backend fetchFlashcards failed');
    const data: FlashcardItem[] = await res.json();
    return data;
  } catch {
    // Fallback to local dictionary if backend is booting (Dynamic import to avoid shared bundle bloat)
    const { TOEIC_DICTIONARY_CARDS } = await import('@/data/toeic-cards.data');
    if (category && category !== 'ALL') {
      return TOEIC_DICTIONARY_CARDS.filter((c) => c.category === category);
    }
    return TOEIC_DICTIONARY_CARDS;
  }
}

export async function recordCardSwipe(
  cardId: string,
  isKnown: boolean,
  userId?: string,
): Promise<{ isKnown: boolean; swipeCount: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/flashcards/${cardId}/swipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isKnown, userId }),
    });
    if (!res.ok) throw new Error('Backend swipe failed');
    const data = await res.json();
    return data.progress;
  } catch {
    return { isKnown, swipeCount: 1 };
  }
}

export async function createFlashcard(
  payload: Omit<FlashcardItem, 'id' | 'progress'>,
): Promise<FlashcardItem> {
  const res = await fetch(`${API_BASE_URL}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Backend createFlashcard failed');
  return res.json();
}

export async function updateFlashcard(
  id: string,
  payload: Partial<Omit<FlashcardItem, 'id' | 'progress'>>,
): Promise<FlashcardItem> {
  const res = await fetch(`${API_BASE_URL}/flashcards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Backend updateFlashcard failed');
  return res.json();
}

export async function deleteFlashcard(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/flashcards/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Backend deleteFlashcard failed');
}

// ----------------------------------------------------------------------------
// 3. Questions CRUD & Filtering API
// ----------------------------------------------------------------------------
export async function fetchQuestions(
  section?: string,
  part?: number,
  options?: { bypassHttpCache?: boolean },
): Promise<QuestionItem[]> {
  try {
    const params = new URLSearchParams();
    if (section && section !== 'ALL') params.set('section', section);
    if (part) params.set('part', String(part));
    if (options?.bypassHttpCache) params.set('_t', String(Date.now()));
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await fetchWithTimeout(`${API_BASE_URL}/questions${qs}`, {
      cache: options?.bypassHttpCache ? 'reload' : 'default',
    });
    if (!res.ok) throw new Error('Backend fetchQuestions failed');
    const backendData: QuestionItem[] = await res.json();
    if (Array.isArray(backendData) && backendData.length > 0) {
      return backendData;
    }
    const { TOEIC_INITIAL_QUESTIONS } = await import('@/data/toeic-questions.data');
    let fallback = TOEIC_INITIAL_QUESTIONS;
    if (section && section !== 'ALL') {
      fallback = fallback.filter((q) => q.section === section);
    }
    if (part) {
      fallback = fallback.filter((q) => q.part === part);
    }
    return fallback;
  } catch {
    const { TOEIC_INITIAL_QUESTIONS } = await import('@/data/toeic-questions.data');
    let list = TOEIC_INITIAL_QUESTIONS;
    if (section && section !== 'ALL') {
      list = list.filter((q) => q.section === section);
    }
    if (part) {
      list = list.filter((q) => q.part === part);
    }
    return list;
  }
}

export async function createQuestion(
  payload: Omit<QuestionItem, 'id'>,
): Promise<QuestionItem> {
  const res = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Backend createQuestion failed');
  return res.json();
}

export async function updateQuestion(
  id: string,
  payload: Partial<Omit<QuestionItem, 'id'>>,
): Promise<QuestionItem> {
  const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Backend updateQuestion failed');
  return res.json();
}

export async function deleteQuestion(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Backend deleteQuestion failed');
}

// ----------------------------------------------------------------------------
// 4. Boss Battle Exam Submission API (POST /exams/submit)
// ----------------------------------------------------------------------------
export async function submitExamAttempt(
  payload: SubmitExamPayload,
): Promise<SubmitExamResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/exams/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Backend submitExamAttempt failed');
    return await res.json();
  } catch {
    // Fallback scoring logic if backend is unreachable
    const listeningCorrect = payload.listeningCorrect ?? 0;
    const readingCorrect = payload.readingCorrect ?? 0;
    const listeningTotal =
      payload.listeningTotal ??
      (payload.mode === 'READING_DRILL'
        ? 0
        : Math.max(7, listeningCorrect));
    const readingTotal =
      payload.readingTotal ??
      (payload.mode === 'LISTENING_DRILL'
        ? 0
        : Math.max(8, readingCorrect));

    const scoreBreakdown = calculateScaledToeicScore(
      listeningCorrect,
      listeningTotal,
      readingCorrect,
      readingTotal,
    );

    const targetScore = 700;
    const evolution = getCharacterEvolution(
      scoreBreakdown.estimatedScore,
      targetScore,
    );

    const isMockExam =
      payload.mode === 'MINI_MOCK' ||
      payload.mode === 'FULL_MOCK' ||
      payload.mode === 'BOSS_RAID' ||
      payload.mode.startsWith('MOCK_') ||
      payload.mode.includes('MOCK');

    let currentScore = 650;
    try {
      const stored = localStorage.getItem('cardcraft_auth_user_v2');
      if (stored) {
        const u = JSON.parse(stored);
        currentScore = u.currentEstimatedScore || 650;
        if (isMockExam) {
          u.currentEstimatedScore = scoreBreakdown.estimatedScore;
          localStorage.setItem('cardcraft_auth_user_v2', JSON.stringify(u));
        }
      }
    } catch {}

    const attempt: ExamAttemptItem = {
      id: `attempt-${Date.now()}`,
      userId: payload.userId || '',
      mode: (payload.mode as 'MINI_MOCK' | 'LISTENING_DRILL' | 'READING_DRILL') || 'MINI_MOCK',
      listeningCorrect,
      readingCorrect,
      estimatedScore: scoreBreakdown.estimatedScore,
      unlockedTier: evolution.unlockedTier,
      isPassedTarget: evolution.isPassedTarget,
      timeSpentSeconds: payload.timeSpentSeconds,
      createdAt: new Date().toISOString(),
    };

    const user: HeroUserProfile = {
      id: payload.userId || '',
      username: 'hero',
      name: 'CardCraft Hero',
      targetScore: 700,
      currentEstimatedScore: isMockExam ? scoreBreakdown.estimatedScore : currentScore,
    };

    return {
      attempt,
      user,
      scoreBreakdown,
      previousScore: currentScore,
      scoreDelta: scoreBreakdown.estimatedScore - currentScore,
      previousTier: getCharacterEvolution(currentScore, targetScore).currentTier,
      evolution,
      hasEvolved: isMockExam && evolution.unlockedTier > getCharacterEvolution(currentScore, targetScore).unlockedTier,
      targetAnalysis: {
        targetScore,
        isPassedTarget: evolution.isPassedTarget,
        pointsToTarget700: evolution.pointsToTarget700,
        pointsToNextTier: evolution.pointsToNextTier,
        headlineTh: evolution.isPassedTarget
          ? 'ภารกิจสำเร็จ! คุณทะลุเป้าหมาย TOEIC 700+ และปลดล็อกคลาสระดับสูงแล้ว!'
          : `อีกเพียง ${evolution.pointsToTarget700} คะแนน จะทะลุเป้าหมาย 700+ (High Paladin)!`,
      },
    };
  }
}

// ----------------------------------------------------------------------------
// 4.1 Practice Part Submission API (POST /exams/submit-practice)
// - คำนวณ Estimated Part Score และ Supportive Performance Tier (1-5)
// - STRICT SEPARATION: ไม่แก้ไข Official Hero Level หรือ User.currentEstimatedScore!
// ----------------------------------------------------------------------------
export async function submitPracticePart(
  payload: SubmitPracticePartPayload,
): Promise<SubmitPracticePartResponse> {
  const partEval = calculateEstimatedPartScore(
    payload.part,
    payload.correctAnswers,
    payload.totalQuestions,
  );

  try {
    const res = await fetch(`${API_BASE_URL}/exams/submit-practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Backend submitPracticePart failed');
    const data = await res.json();
    saveLocalPartEstimate(data.estimate);
    return data;
  } catch {
    const estimate: PartSkillEstimateItem = {
      id: `est-p${payload.part}-${Date.now()}`,
      userId: payload.userId || 'guest',
      part: payload.part,
      accuracy: partEval.accuracy,
      totalQuestions: payload.totalQuestions,
      correctAnswers: payload.correctAnswers,
      estimatedScore: partEval.estimatedPartScore,
      maxPartScore: partEval.maxPartScore,
      supportiveTier: partEval.supportiveTier.tier,
      lastPracticedAt: new Date().toISOString(),
      supportiveInfo: partEval.supportiveTier,
    };
    saveLocalPartEstimate(estimate);

    let officialScore = 0;
    try {
      const stored = localStorage.getItem('cardcraft_auth_user_v2');
      if (stored) {
        officialScore = JSON.parse(stored).currentEstimatedScore || 0;
      }
    } catch {}

    return {
      estimate,
      partEvaluation: partEval,
      officialScoreUnchanged: officialScore,
    };
  }
}

function saveLocalPartEstimate(est: PartSkillEstimateItem) {
  try {
    const key = 'cardcraft_part_skill_estimates';
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing[est.part] = est;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {}
}

export async function fetchPartSkillEstimates(
  userId?: string,
): Promise<PartSkillEstimatesResponse> {
  try {
    if (!userId || userId === 'guest') throw new Error('Guest user');
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/exams/part-estimates?userId=${encodeURIComponent(userId)}`,
    );
    if (!res.ok) throw new Error('Backend fetchPartSkillEstimates failed');
    return await res.json();
  } catch {
    let map: Record<number, PartSkillEstimateItem> = {};
    try {
      map = JSON.parse(
        localStorage.getItem('cardcraft_part_skill_estimates') || '{}',
      );
    } catch {}

    const estimates: PartSkillEstimateItem[] = [];
    let forecastListeningTotal = 0;
    let forecastReadingTotal = 0;

    for (let p = 1; p <= 7; p++) {
      if (map[p]) {
        estimates.push(map[p]);
        if (p <= 4) {
          forecastListeningTotal += map[p].estimatedScore;
        } else {
          forecastReadingTotal += map[p].estimatedScore;
        }
      }
    }

    return {
      estimates,
      forecastListeningTotal,
      forecastReadingTotal,
      totalForecastScore: forecastListeningTotal + forecastReadingTotal,
    };
  }
}

// ----------------------------------------------------------------------------
// 5. Log Single Answer API (POST /exams/log-answer) for Practice & Drills
// ----------------------------------------------------------------------------
export async function logSingleAnswer(
  payload: LogAnswerPayload,
): Promise<{
  logged: boolean;
  isCorrect?: boolean;
  correctOption?: string;
  explanationTh?: string;
  errorType?: string | null;
  vocabId?: string | null;
} | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/exams/log-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('logSingleAnswer failed');
    return await res.json();
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// 6. Error Review & Weakness Analytics API (Task C)
// ----------------------------------------------------------------------------
export interface ErrorLogItem {
  id: string;
  userId: string;
  attemptId?: string | null;
  questionId: string;
  part: number;
  mode: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  errorType: string | null;
  vocabId?: string | null;
  timeSpentMs: number;
  createdAt: string;
  question?: QuestionItem;
  vocab?: FlashcardItem | null;
}

export interface WeaknessAnalyticsResponse {
  totalAnswers: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyRate: number;
  byErrorType: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
  byPart: Array<{
    part: number;
    total: number;
    correct: number;
    wrong: number;
    errorRate: number;
  }>;
  topWeaknesses: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
}

export async function fetchErrorLogs(
  userId: string,
  part?: number,
  errorType?: string,
  limit = 50,
): Promise<ErrorLogItem[]> {
  try {
    const params = new URLSearchParams({ userId, limit: String(limit) });
    if (part) params.set('part', String(part));
    if (errorType && errorType !== 'ALL') params.set('errorType', errorType);

    const res = await fetchWithTimeout(`${API_BASE_URL}/exams/error-logs?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('fetchErrorLogs failed');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchWeaknessAnalytics(
  userId: string,
): Promise<WeaknessAnalyticsResponse> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/exams/weakness-analytics?userId=${encodeURIComponent(userId)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) throw new Error('fetchWeaknessAnalytics failed');
    return await res.json();
  } catch {
    return {
      totalAnswers: 0,
      totalCorrect: 0,
      totalWrong: 0,
      accuracyRate: 0,
      byErrorType: [],
      byPart: [],
      topWeaknesses: [],
    };
  }
}
