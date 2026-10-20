// ============================================================================
// frontend/src/lib/api.ts
// Production API Client (NestJS + PostgreSQL + Multi-User Auth)
//
// เชื่อมต่อ Backend API จริงแบบ Real Production:
// - ระบบ Authentication (Login / Register) แยก User แต่ละคน
// - บันทึกและดึงข้อมูลจาก PostgreSQL (Supabase / Render)
// - รองรับการระบุ userId ในทุก Request เพื่อแยกสถิติ, Tier และผลการปัดการ์ด
// ============================================================================

import {
  ExamAttemptItem,
  FlashcardItem,
  QuestionItem,
  TOEIC_DICTIONARY_CARDS,
  TOEIC_INITIAL_ATTEMPTS,
  TOEIC_INITIAL_QUESTIONS,
} from '@/data/toeic-dictionary';
import {
  calculateScaledToeicScore,
  CharacterEvolutionStatus,
  CharacterTierInfo,
  getCharacterEvolution,
  ScaledScoreBreakdown,
} from '@/utils/character-evolution.util';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface HeroUserProfile {
  id: string;
  username?: string;
  email?: string;
  name: string;
  targetScore: number;
  currentEstimatedScore: number;
}

export interface DashboardSummaryResponse {
  user: HeroUserProfile;
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

export interface SubmitExamPayload {
  userId?: string;
  mode: 'MINI_MOCK' | 'LISTENING_DRILL' | 'READING_DRILL';
  listeningCorrect: number;
  listeningTotal?: number;
  readingCorrect: number;
  readingTotal?: number;
  timeSpentSeconds: number;
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
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE_URL}/users/dashboard${query}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Backend not ok');
    const data = await res.json();
    return {
      ...data,
      isBackendConnected: true,
    };
  } catch {
    // กรณีที่ Backend กำลังเชื่อมต่อหรืออยู่ในระหว่าง Boot ให้คำนวณจากค่าตั้งต้น
    const defaultUser: HeroUserProfile = {
      id: userId || 'demo-hero-1',
      username: 'hero',
      email: 'hero@cardcraft.dev',
      name: 'Alden the Rune Challenger',
      targetScore: 700,
      currentEstimatedScore: 625,
    };
    const evolution = getCharacterEvolution(
      defaultUser.currentEstimatedScore,
      defaultUser.targetScore,
    );

    return {
      user: defaultUser,
      evolution,
      stats: {
        totalFlashcards: TOEIC_DICTIONARY_CARDS.length,
        masteredCards: 0,
        learningCards: 0,
        unseenCards: TOEIC_DICTIONARY_CARDS.length,
        totalQuestions: TOEIC_INITIAL_QUESTIONS.length,
        totalExamsCompleted: TOEIC_INITIAL_ATTEMPTS.length,
      },
      recentAttempts: TOEIC_INITIAL_ATTEMPTS.slice(0, 5),
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
): Promise<FlashcardItem[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.set('category', category);
    if (userId) params.set('userId', userId);
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/flashcards${qs}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Backend fetchFlashcards failed');
    const data: FlashcardItem[] = await res.json();
    return data;
  } catch {
    // Fallback to local dictionary if backend is booting
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
): Promise<QuestionItem[]> {
  try {
    const params = new URLSearchParams();
    if (section && section !== 'ALL') params.set('section', section);
    if (part) params.set('part', String(part));
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/questions${qs}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Backend fetchQuestions failed');
    return await res.json();
  } catch {
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
    const listeningTotal =
      payload.listeningTotal ??
      (payload.mode === 'READING_DRILL'
        ? 0
        : Math.max(7, payload.listeningCorrect));
    const readingTotal =
      payload.readingTotal ??
      (payload.mode === 'LISTENING_DRILL'
        ? 0
        : Math.max(8, payload.readingCorrect));

    const scoreBreakdown = calculateScaledToeicScore(
      payload.listeningCorrect,
      listeningTotal,
      payload.readingCorrect,
      readingTotal,
    );

    const targetScore = 700;
    const evolution = getCharacterEvolution(
      scoreBreakdown.estimatedScore,
      targetScore,
    );

    const attempt: ExamAttemptItem = {
      id: `attempt-${Date.now()}`,
      userId: payload.userId || 'demo-hero-1',
      mode: payload.mode,
      listeningCorrect: payload.listeningCorrect,
      readingCorrect: payload.readingCorrect,
      estimatedScore: scoreBreakdown.estimatedScore,
      unlockedTier: evolution.unlockedTier,
      isPassedTarget: evolution.isPassedTarget,
      timeSpentSeconds: payload.timeSpentSeconds,
      createdAt: new Date().toISOString(),
    };

    const user: HeroUserProfile = {
      id: payload.userId || 'demo-hero-1',
      username: 'hero',
      name: 'Alden the Rune Challenger',
      targetScore: 700,
      currentEstimatedScore: scoreBreakdown.estimatedScore,
    };

    return {
      attempt,
      user,
      scoreBreakdown,
      previousScore: 625,
      scoreDelta: scoreBreakdown.estimatedScore - 625,
      previousTier: getCharacterEvolution(625, targetScore).currentTier,
      evolution,
      hasEvolved: evolution.unlockedTier > 4,
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
