// ============================================================================
// frontend/src/lib/api.ts
// Hybrid API Client (NestJS Backend + Automatic LocalStorage Sync Fallback)
//
// เปรียบเทียบกับ Go / React:
// - พยายามเรียก REST API ของ NestJS (`http://localhost:4000`) ก่อนเสมอ
// - หากผู้พัฒนายังไม่ได้รัน Docker PostgreSQL หรือเปิดเฉพาะ Frontend ตอนพรีเซนต์
//   ระบบจะสลับมาใช้ LocalStorage + TOEIC 60-Word Dictionary อัตโนมัติ
//   ทำให้ฟังก์ชัน CRUD (Create, Read, Update, Delete), การปัดการ์ด และการสอบ Boss Battle
//   ทำงานได้ครบ 100% แบบไม่มีวันพัง!
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

const STORAGE_KEYS = {
  USER: 'cardcraft_hero_user_v1',
  CARDS: 'cardcraft_flashcards_v1',
  QUESTIONS: 'cardcraft_questions_v1',
  ATTEMPTS: 'cardcraft_attempts_v1',
};

export interface HeroUserProfile {
  id: string;
  email: string;
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
// LocalStorage Helpers (สำหรับโหมด Offline / Demo Fallback)
// ----------------------------------------------------------------------------
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getLocalUser(): HeroUserProfile {
  const defaultUser: HeroUserProfile = {
    id: 'demo-hero-1',
    email: 'hero@cardcraft.dev',
    name: 'Alden the Rune Challenger',
    targetScore: 700,
    currentEstimatedScore: 625,
  };
  if (!isBrowser()) return defaultUser;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : defaultUser;
  } catch {
    return defaultUser;
  }
}

function saveLocalUser(user: HeroUserProfile): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

function getLocalCards(): FlashcardItem[] {
  if (!isBrowser()) return TOEIC_DICTIONARY_CARDS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.CARDS);
    if (!raw) {
      window.localStorage.setItem(
        STORAGE_KEYS.CARDS,
        JSON.stringify(TOEIC_DICTIONARY_CARDS),
      );
      return TOEIC_DICTIONARY_CARDS;
    }
    const parsed: FlashcardItem[] = JSON.parse(raw);
    // หากจำนวนการ์ดใน LocalStorage น้อยกว่าคลัง 60 คำใหม่ ให้อัปเดตผสานรวมคำศัพท์ใหม่ทันที
    if (parsed.length < TOEIC_DICTIONARY_CARDS.length) {
      const existingIds = new Set(parsed.map((c) => c.id));
      const merged = [
        ...parsed,
        ...TOEIC_DICTIONARY_CARDS.filter((c) => !existingIds.has(c.id)),
      ];
      window.localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return TOEIC_DICTIONARY_CARDS;
  }
}

function saveLocalCards(cards: FlashcardItem[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
}

function getLocalQuestions(): QuestionItem[] {
  if (!isBrowser()) return TOEIC_INITIAL_QUESTIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      window.localStorage.setItem(
        STORAGE_KEYS.QUESTIONS,
        JSON.stringify(TOEIC_INITIAL_QUESTIONS),
      );
      return TOEIC_INITIAL_QUESTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return TOEIC_INITIAL_QUESTIONS;
  }
}

function saveLocalQuestions(questions: QuestionItem[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    STORAGE_KEYS.QUESTIONS,
    JSON.stringify(questions),
  );
}

function getLocalAttempts(): ExamAttemptItem[] {
  if (!isBrowser()) return TOEIC_INITIAL_ATTEMPTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) {
      window.localStorage.setItem(
        STORAGE_KEYS.ATTEMPTS,
        JSON.stringify(TOEIC_INITIAL_ATTEMPTS),
      );
      return TOEIC_INITIAL_ATTEMPTS;
    }
    return JSON.parse(raw);
  } catch {
    return TOEIC_INITIAL_ATTEMPTS;
  }
}

function saveLocalAttempts(attempts: ExamAttemptItem[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
}

// ----------------------------------------------------------------------------
// 1. Dashboard & Hero Profile API
// ----------------------------------------------------------------------------
export async function fetchDashboardSummary(): Promise<DashboardSummaryResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/dashboard`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Backend not ok');
    const data = await res.json();
    return {
      ...data,
      isBackendConnected: true,
    };
  } catch {
    const user = getLocalUser();
    const cards = getLocalCards();
    const questions = getLocalQuestions();
    const attempts = getLocalAttempts();
    const evolution = getCharacterEvolution(
      user.currentEstimatedScore,
      user.targetScore,
    );

    const masteredCards = cards.filter((c) => c.progress?.isKnown === true).length;
    const learningCards = cards.filter((c) => c.progress?.isKnown === false).length;
    const unseenCards = Math.max(
      0,
      cards.length - masteredCards - learningCards,
    );

    return {
      user,
      evolution,
      stats: {
        totalFlashcards: cards.length,
        masteredCards,
        learningCards,
        unseenCards,
        totalQuestions: questions.length,
        totalExamsCompleted: attempts.length,
      },
      recentAttempts: attempts.slice(0, 5),
      isBackendConnected: false,
    };
  }
}

export async function updateHeroProfile(payload: {
  name?: string;
  targetScore?: number;
  currentEstimatedScore?: number;
}): Promise<{ user: HeroUserProfile; evolution: CharacterEvolutionStatus }> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update profile on backend');
    const data = await res.json();
    saveLocalUser(data.user);
    return data;
  } catch {
    const current = getLocalUser();
    const updated: HeroUserProfile = {
      ...current,
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.targetScore !== undefined
        ? { targetScore: payload.targetScore }
        : {}),
      ...(payload.currentEstimatedScore !== undefined
        ? { currentEstimatedScore: payload.currentEstimatedScore }
        : {}),
    };
    saveLocalUser(updated);
    return {
      user: updated,
      evolution: getCharacterEvolution(
        updated.currentEstimatedScore,
        updated.targetScore,
      ),
    };
  }
}

// ----------------------------------------------------------------------------
// 2. Flashcards CRUD & Swipe API
// ----------------------------------------------------------------------------
export async function fetchFlashcards(
  category?: string,
): Promise<FlashcardItem[]> {
  try {
    const query =
      category && category !== 'ALL'
        ? `?category=${encodeURIComponent(category)}`
        : '';
    const res = await fetch(`${API_BASE_URL}/flashcards${query}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Backend fetchFlashcards failed');
    const data: FlashcardItem[] = await res.json();
    return data;
  } catch {
    const allCards = getLocalCards();
    if (category && category !== 'ALL') {
      return allCards.filter((c) => c.category === category);
    }
    return allCards;
  }
}

export async function recordCardSwipe(
  cardId: string,
  isKnown: boolean,
): Promise<{ isKnown: boolean; swipeCount: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/flashcards/${cardId}/swipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isKnown }),
    });
    if (!res.ok) throw new Error('Backend swipe failed');
    const data = await res.json();
    // อัปเดตลง LocalStorage ควบคู่กันเสมอ
    const cards = getLocalCards();
    const updated = cards.map((c) =>
      c.id === cardId
        ? {
            ...c,
            progress: {
              isKnown,
              swipeCount: (c.progress?.swipeCount ?? 0) + 1,
              updatedAt: new Date().toISOString(),
            },
          }
        : c,
    );
    saveLocalCards(updated);
    return data.progress;
  } catch {
    const cards = getLocalCards();
    let swipeCount = 1;
    const updated = cards.map((c) => {
      if (c.id === cardId) {
        swipeCount = (c.progress?.swipeCount ?? 0) + 1;
        return {
          ...c,
          progress: {
            isKnown,
            swipeCount,
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return c;
    });
    saveLocalCards(updated);
    return { isKnown, swipeCount };
  }
}

export async function createFlashcard(
  payload: Omit<FlashcardItem, 'id' | 'progress'>,
): Promise<FlashcardItem> {
  try {
    const res = await fetch(`${API_BASE_URL}/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Backend createFlashcard failed');
    const created: FlashcardItem = await res.json();
    const cards = getLocalCards();
    saveLocalCards([created, ...cards]);
    return created;
  } catch {
    const created: FlashcardItem = {
      id: `card-${Date.now()}`,
      ...payload,
      progress: null,
    };
    const cards = getLocalCards();
    saveLocalCards([created, ...cards]);
    return created;
  }
}

export async function updateFlashcard(
  id: string,
  payload: Partial<Omit<FlashcardItem, 'id' | 'progress'>>,
): Promise<FlashcardItem> {
  try {
    const res = await fetch(`${API_BASE_URL}/flashcards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Backend updateFlashcard failed');
    const updated: FlashcardItem = await res.json();
    const cards = getLocalCards().map((c) =>
      c.id === id ? { ...c, ...updated } : c,
    );
    saveLocalCards(cards);
    return updated;
  } catch {
    const cards = getLocalCards();
    let target = cards.find((c) => c.id === id)!;
    const nextCards = cards.map((c) => {
      if (c.id === id) {
        target = { ...c, ...payload };
        return target;
      }
      return c;
    });
    saveLocalCards(nextCards);
    return target;
  }
}

export async function deleteFlashcard(id: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/flashcards/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Backend deleteFlashcard failed');
  } catch {
    // Fallback to local deletion
  }
  const cards = getLocalCards().filter((c) => c.id !== id);
  saveLocalCards(cards);
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
    let list = getLocalQuestions();
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
  try {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Backend createQuestion failed');
    const created: QuestionItem = await res.json();
    const list = getLocalQuestions();
    saveLocalQuestions([created, ...list]);
    return created;
  } catch {
    const created: QuestionItem = {
      id: `q-custom-${Date.now()}`,
      ...payload,
      optionD: payload.part === 2 ? null : (payload.optionD ?? null),
    };
    const list = getLocalQuestions();
    saveLocalQuestions([created, ...list]);
    return created;
  }
}

export async function updateQuestion(
  id: string,
  payload: Partial<Omit<QuestionItem, 'id'>>,
): Promise<QuestionItem> {
  try {
    const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Backend updateQuestion failed');
    const updated: QuestionItem = await res.json();
    const list = getLocalQuestions().map((q) =>
      q.id === id ? { ...q, ...updated } : q,
    );
    saveLocalQuestions(list);
    return updated;
  } catch {
    const list = getLocalQuestions();
    let target = list.find((q) => q.id === id)!;
    const nextList = list.map((q) => {
      if (q.id === id) {
        target = {
          ...q,
          ...payload,
          optionD:
            (payload.part ?? q.part) === 2
              ? null
              : (payload.optionD ?? q.optionD ?? null),
        };
        return target;
      }
      return q;
    });
    saveLocalQuestions(nextList);
    return target;
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Backend deleteQuestion failed');
  } catch {
    // Fallback to local deletion
  }
  const list = getLocalQuestions().filter((q) => q.id !== id);
  saveLocalQuestions(list);
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
    const data: SubmitExamResponse = await res.json();
    saveLocalUser(data.user);
    const attempts = getLocalAttempts();
    saveLocalAttempts([data.attempt, ...attempts]);
    return data;
  } catch {
    const user = getLocalUser();
    const previousScore = user.currentEstimatedScore;
    const previousEvolution = getCharacterEvolution(
      previousScore,
      user.targetScore,
    );

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

    const evolution = getCharacterEvolution(
      scoreBreakdown.estimatedScore,
      user.targetScore,
    );

    const attempt: ExamAttemptItem = {
      id: `attempt-${Date.now()}`,
      userId: user.id,
      mode: payload.mode,
      listeningCorrect: payload.listeningCorrect,
      readingCorrect: payload.readingCorrect,
      estimatedScore: scoreBreakdown.estimatedScore,
      unlockedTier: evolution.unlockedTier,
      isPassedTarget: evolution.isPassedTarget,
      timeSpentSeconds: payload.timeSpentSeconds,
      createdAt: new Date().toISOString(),
    };

    const updatedUser: HeroUserProfile = {
      ...user,
      currentEstimatedScore: scoreBreakdown.estimatedScore,
    };

    saveLocalUser(updatedUser);
    saveLocalAttempts([attempt, ...getLocalAttempts()]);

    const hasEvolved = evolution.unlockedTier > previousEvolution.unlockedTier;

    return {
      attempt,
      user: updatedUser,
      scoreBreakdown,
      previousScore,
      scoreDelta: scoreBreakdown.estimatedScore - previousScore,
      previousTier: previousEvolution.currentTier,
      evolution,
      hasEvolved,
      targetAnalysis: {
        targetScore: user.targetScore,
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
