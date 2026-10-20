'use client';

// ============================================================================
// frontend/src/app/mock-test/page.tsx
// CardCraft v2.0: โมดูลจำลองสอบเสมือนจริงมาตรฐาน ETS TOEIC (Mock Exam Simulation)
//
// CORE ARCHITECTURAL RULE:
// - Mock Exam คือสนามสอบทางการแห่งเดียวที่มีสิทธิ์อัปเดต Official Score (10–990)
//   และวิวัฒนาการตัวละคร Character Evolution (Tiers 1–7)
// - มี 7 แพ็กเกจมาตรฐาน (50, 75, 100, 125, 150, 175, 200 ข้อ)
// - เข้าสู่หน้าเว็บต้องเป็น Mock Exam Selection Lobby ก่อนเสมอ (ห้าม Auto-Start ทันที)
// - สลับสุ่มช้อยส์ (Choice Shuffling) ทุกครั้ง ป้องกันการจำตำแหน่งคำตอบ
// - Part 2 มีช้อยส์ A, B, C อย่างเคร่งครัด
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Play,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Square,
  Swords,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { QuestionItem, TOEIC_INITIAL_QUESTIONS } from '@/data/toeic-dictionary';
import {
  submitExamAttempt,
  SubmitExamResponse,
  DashboardSummaryResponse,
} from '@/lib/api';
import {
  useQuestions,
  useDashboardSummary,
  useCardCraftQueryHelpers,
} from '@/hooks/useCardCraftQueries';
import { PixelCharacterAvatar } from '@/components/PixelCharacterAvatar';
import RealTimeExamModal from '@/components/RealTimeExamModal';
import { useAuth } from '@/context/AuthContext';
import {
  buildShuffledQuestionsMap,
  generateProportionalMockExam,
  MOCK_EXAM_PACKAGES,
  MockExamPackageInfo,
  ShuffledQuestionWrapper,
} from '@/utils/question-shuffle.util';
import { speakEnglish, cancelSpeech } from '@/utils/speech-synthesis.util';
import { getCharacterEvolution } from '@/utils/character-evolution.util';

// RPG Boss Trial Rank Meta for 7 packages
const PACKAGE_DIFFICULTY_META: Record<
  number,
  {
    tierLabel: string;
    tierColor: string;
    bossTitle: string;
    difficultyStars: string;
  }
> = {
  50: {
    tierLabel: 'Apprentice Trial',
    tierColor: 'bg-emerald-100 text-emerald-900 border-emerald-400',
    bossTitle: 'Goblin Scout Raid',
    difficultyStars: '★☆☆☆☆',
  },
  75: {
    tierLabel: 'Adept Trial',
    tierColor: 'bg-teal-100 text-teal-900 border-teal-400',
    bossTitle: 'Orc Vanguard Skirmish',
    difficultyStars: '★★☆☆☆',
  },
  100: {
    tierLabel: 'Knight Raid',
    tierColor: 'bg-sky-100 text-sky-900 border-sky-400',
    bossTitle: 'Shadow Knight Showdown (Half TOEIC)',
    difficultyStars: '★★★☆☆',
  },
  125: {
    tierLabel: 'Elite Challenge',
    tierColor: 'bg-indigo-100 text-indigo-900 border-indigo-400',
    bossTitle: 'Dark Sorcerer Trial',
    difficultyStars: '★★★½☆',
  },
  150: {
    tierLabel: 'Heroic Dungeon',
    tierColor: 'bg-amber-100 text-amber-900 border-amber-400',
    bossTitle: 'Abyssal Chimera Battle',
    difficultyStars: '★★★★☆',
  },
  175: {
    tierLabel: 'Mythic Gauntlet',
    tierColor: 'bg-rose-100 text-rose-900 border-rose-400',
    bossTitle: 'Ancient Wyrm Gauntlet',
    difficultyStars: '★★★★½',
  },
  200: {
    tierLabel: 'Grand Master Raid',
    tierColor: 'bg-purple-100 text-purple-900 border-purple-500',
    bossTitle: 'Archdemon Sovereign (Official Full Simulation)',
    difficultyStars: '★★★★★',
  },
};

export default function BossBattleMockTestPage() {
  const { user: authUser, requireAuth, openAuthModal, refreshUser } = useAuth();
  const { invalidateDashboard } = useCardCraftQueryHelpers();

  const { data: questionsData } = useQuestions();
  const { data: dashboardData } = useDashboardSummary(authUser?.id);

  // Raw question bank from TanStack Query with instant fallback
  const rawQuestions: QuestionItem[] = questionsData || TOEIC_INITIAL_QUESTIONS;
  const dashboard: DashboardSummaryResponse | null = dashboardData || null;

  // Selection Lobby & Configuration State
  const [selectedPackage, setSelectedPackage] =
    useState<MockExamPackageInfo | null>(null);
  const [pendingConfirmPackage, setPendingConfirmPackage] =
    useState<MockExamPackageInfo | null>(null);

  // Active Timed Exam State
  const [activeQuestions, setActiveQuestions] = useState<QuestionItem[]>([]);
  const [shuffledMap, setShuffledMap] = useState<
    Map<string, ShuffledQuestionWrapper>
  >(new Map());
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>(
    {},
  );
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examTotalSeconds, setExamTotalSeconds] = useState<number>(1800);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);

  // Results & Evolution State
  const [examResult, setExamResult] = useState<SubmitExamResponse | null>(null);
  const [showRankUpModal, setShowRankUpModal] = useState<boolean>(false);

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Real-Time Multi-Part Modal
  const [isRealTimeMultiPartOpen, setIsRealTimeMultiPartOpen] =
    useState<boolean>(false);

  // Speech cleanup on unmount
  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  // Exam Countdown Timer
  useEffect(() => {
    if (!selectedPackage || examResult || activeQuestions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out
          handleForceSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedPackage, examResult, activeQuestions.length]);

  const currentQuestion = activeQuestions[currentIdx] || null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // Launch the Timed Exam from Selected Package
  const handleLaunchPackage = (pkg: MockExamPackageInfo) => {
    if (rawQuestions.length === 0) return;

    cancelSpeech();
    const proportionalQuestions = generateProportionalMockExam(
      pkg.size,
      rawQuestions,
    );
    const map = buildShuffledQuestionsMap(proportionalQuestions);

    setActiveQuestions(proportionalQuestions);
    setShuffledMap(map);
    setSelectedPackage(pkg);
    setExamTotalSeconds(pkg.timeLimitSeconds);
    setTimeLeft(pkg.timeLimitSeconds);
    setCurrentIdx(0);
    setAnswers({});
    setFlaggedIds({});
    setExamResult(null);
    setShowRankUpModal(false);
    setPendingConfirmPackage(null);
  };

  // Answer selection handler
  const handleSelectAnswer = useCallback(
    (qId: string, opt: 'A' | 'B' | 'C' | 'D') => {
      if (!authUser) {
        requireAuth(
          undefined,
          'กรุณาเข้าสู่ระบบก่อน เพื่อทำข้อสอบและบันทึกคะแนนสะสมสู่ฮีโร่ของคุณ',
        );
        return;
      }
      setAnswers((prev) => ({
        ...prev,
        [qId]: opt,
      }));
    },
    [authUser, requireAuth],
  );

  const handleToggleFlag = useCallback((qId: string) => {
    setFlaggedIds((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  }, []);

  // Force submit (used when timer expires)
  const handleForceSubmitExam = async () => {
    await executeSubmission();
  };

  // User-initiated submit
  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false);
    await executeSubmission();
  };

  const executeSubmission = async () => {
    if (!authUser) {
      requireAuth(
        undefined,
        'กรุณาเข้าสู่ระบบก่อน เพื่อส่งกระดาษคำตอบและคำนวณคะแนนสเกล TOEIC สู่โปรไฟล์ของคุณ',
      );
      return;
    }
    if (activeQuestions.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    cancelSpeech();

    const listeningQuestions = activeQuestions.filter(
      (q) => q.section === 'LISTENING',
    );
    const readingQuestions = activeQuestions.filter(
      (q) => q.section === 'READING',
    );

    const listeningCorrect = listeningQuestions.filter((q) => {
      const wrap = shuffledMap.get(q.id);
      const originalOption =
        wrap && answers[q.id]
          ? wrap.displayToOriginalMap[answers[q.id]]
          : answers[q.id];
      return originalOption === q.correctOption;
    }).length;

    const readingCorrect = readingQuestions.filter((q) => {
      const wrap = shuffledMap.get(q.id);
      const originalOption =
        wrap && answers[q.id]
          ? wrap.displayToOriginalMap[answers[q.id]]
          : answers[q.id];
      return originalOption === q.correctOption;
    }).length;

    const timeSpentSeconds = Math.max(15, examTotalSeconds - timeLeft);

    const formattedAnswers = activeQuestions
      .filter((q) => answers[q.id])
      .map((q) => {
        const wrap = shuffledMap.get(q.id);
        const originalOption =
          wrap && answers[q.id]
            ? wrap.displayToOriginalMap[answers[q.id]]
            : answers[q.id];
        return {
          questionId: q.id,
          part: q.part,
          selectedOption: originalOption,
          flagged: Boolean(flaggedIds[q.id]),
          timeSpentMs: 0,
        };
      });

    const response = await submitExamAttempt({
      userId: authUser?.id,
      mode: `MOCK_EXAM_${selectedPackage?.size || 50}`,
      listeningCorrect,
      listeningTotal: listeningQuestions.length,
      readingCorrect,
      readingTotal: readingQuestions.length,
      timeSpentSeconds,
      answers: formattedAnswers,
    });

    setExamResult(response);
    setIsSubmitting(false);

    if (response.hasEvolved) {
      setShowRankUpModal(true);
    }

    // Refresh user context to sync updated official score and avatar
    await refreshUser();
    invalidateDashboard(authUser?.id);
  };

  // Audio player with TTS rate 0.82
  const handlePlayAudio = (q: QuestionItem) => {
    if (isPlayingAudio) {
      cancelSpeech();
      setIsPlayingAudio(false);
      return;
    }

    cancelSpeech();
    const wrap = shuffledMap.get(q.id);
    const lines: string[] = [];

    if (q.part === 1) {
      lines.push('Look at the photograph and listen to the statements.');
      if (wrap) {
        wrap.choices.forEach((c) => lines.push(`${c.displayKey}: ${c.text}`));
      } else {
        lines.push(
          `A: ${q.optionA}`,
          `B: ${q.optionB}`,
          `C: ${q.optionC}`,
          `D: ${q.optionD || ''}`,
        );
      }
    } else if (q.part === 2) {
      lines.push(q.questionText);
      lines.push('Mark your answer A, B, or C on your answer sheet.');
      if (wrap) {
        wrap.choices
          .filter((c) => c.text)
          .forEach((c) => lines.push(`${c.displayKey}: ${c.text}`));
      } else {
        lines.push(`A: ${q.optionA}`, `B: ${q.optionB}`, `C: ${q.optionC}`);
      }
    } else {
      lines.push(q.questionText);
      if (wrap) {
        wrap.choices
          .filter((c) => c.text)
          .forEach((c) => lines.push(`${c.displayKey}: ${c.text}`));
      } else {
        lines.push(
          `A: ${q.optionA}`,
          `B: ${q.optionB}`,
          `C: ${q.optionC}`,
          `D: ${q.optionD || ''}`,
        );
      }
    }

    setIsPlayingAudio(true);
    speakEnglish(lines.join(' ... '), {
      rate: 0.82,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        !selectedPackage ||
        examResult ||
        !currentQuestion ||
        showSubmitConfirm ||
        showCancelConfirm
      )
        return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') {
        handleSelectAnswer(currentQuestion.id, 'A');
      } else if (key === '2' || key === 'B') {
        handleSelectAnswer(currentQuestion.id, 'B');
      } else if (key === '3' || key === 'C') {
        handleSelectAnswer(currentQuestion.id, 'C');
      } else if ((key === '4' || key === 'D') && currentQuestion.part !== 2) {
        handleSelectAnswer(currentQuestion.id, 'D');
      } else if (key === 'F') {
        e.preventDefault();
        handleToggleFlag(currentQuestion.id);
      } else if (e.code === 'ArrowRight') {
        setCurrentIdx((prev) =>
          prev < activeQuestions.length - 1 ? prev + 1 : prev,
        );
      } else if (e.code === 'ArrowLeft') {
        setCurrentIdx((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    selectedPackage,
    examResult,
    currentQuestion,
    activeQuestions.length,
    showSubmitConfirm,
    showCancelConfirm,
    handleSelectAnswer,
    handleToggleFlag,
  ]);

  // Current user's official hero tier calculations
  const heroScore = authUser?.currentEstimatedScore || 0;
  const targetScore = authUser?.targetScore || 700;
  const currentHeroEvolution = getCharacterEvolution(heroScore, targetScore);

  // =========================================================================
  // VIEW 1: EXAM RESULT & OFFICIAL CHARACTER EVOLUTION ANALYSIS
  // =========================================================================
  if (examResult) {
    const {
      scoreBreakdown,
      previousScore,
      scoreDelta,
      previousTier,
      evolution,
      hasEvolved,
      targetAnalysis,
    } = examResult;

    return (
      <div className="space-y-8">
        {/* Rank Up Celebratory Banner / Modal */}
        {showRankUpModal && (
          <div className="relative bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 border-4 border-slate-950 shadow-arcade-lg p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
            <button
              type="button"
              onClick={() => setShowRankUpModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-950 text-white hover:bg-slate-800 border-2 border-slate-950"
              aria-label="Close rank up banner"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative w-24 h-24 bg-[#fffdf7] border-3 border-slate-950 shadow-arcade flex items-center justify-center shrink-0">
                <PixelCharacterAvatar tier={evolution.unlockedTier} size="xl" />
                <span className="absolute -bottom-2 px-2 py-0.5 bg-emerald-400 text-slate-950 font-pixel text-[10px] font-bold border border-slate-950">
                  RANK UP!
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 text-amber-300 font-display font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  ฮีโร่วิวัฒนาการสู่คลาสใหม่สำเร็จ!
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
                  ยินดีด้วย! คุณเลื่อนระดับเป็น Tier {evolution.unlockedTier}:{' '}
                  {evolution.classTitle}
                </h2>
                <p className="text-sm font-semibold text-slate-900">
                  {evolution.classTitleTh} — คะแนนอย่างเป็นทางการของคุณเพิ่มขึ้น{' '}
                  <span className="font-pixel text-emerald-800">
                    +{scoreDelta}
                  </span>{' '}
                  คะแนน!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Official Score Summary Card */}
        <section className="bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade-lg p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 font-display font-bold text-xs border border-slate-950">
                <Award className="w-4 h-4" />
                {hasEvolved
                  ? 'เลื่อนระดับคลาสฮีโร่สำเร็จ (Official Upgrade)'
                  : 'สรุปผลคะแนนสอบทางการ (Official Score Assessment)'}
              </div>

              <div className="flex items-baseline justify-center lg:justify-start gap-3">
                <span className="font-pixel text-4xl sm:text-5xl text-amber-400">
                  {scoreBreakdown.estimatedScore}
                </span>
                <span className="font-pixel text-sm text-slate-400">
                  / 990 คะแนน
                </span>
              </div>

              <p className="text-base sm:text-lg font-semibold text-white">
                {targetAnalysis.headlineTh}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1 text-xs">
                <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-sky-300">
                  Listening (การฟัง):{' '}
                  <strong className="font-pixel">
                    {scoreBreakdown.listeningScaled}
                  </strong>{' '}
                  / 495
                </span>
                <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-emerald-300">
                  Reading (การอ่าน):{' '}
                  <strong className="font-pixel">
                    {scoreBreakdown.readingScaled}
                  </strong>{' '}
                  / 495
                </span>
                <span
                  className={`px-3 py-1.5 font-semibold border border-slate-950 ${
                    scoreDelta >= 0
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} จากคะแนนเดิม{' '}
                  {previousScore}
                </span>
              </div>
            </div>

            {/* Character Evolution Comparison (Before vs After) */}
            <div className="bg-slate-800 border-2 border-slate-950 p-5 flex items-center gap-4 shadow-[4px_4px_0px_0px_#020617]">
              <div className="text-center">
                <span className="text-xs text-slate-400">ก่อนสอบ</span>
                <div className="my-1">
                  <PixelCharacterAvatar tier={previousTier.tier} size="md" />
                </div>
                <p className="font-display font-bold text-xs text-slate-300">
                  {previousTier.title}
                </p>
                <span className="font-pixel text-[10px] text-slate-400">
                  Tier {previousTier.tier}
                </span>
              </div>

              <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" />

              <div className="text-center bg-[#fffdf7] text-slate-900 border-2 border-slate-950 p-3">
                <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 font-pixel text-[10px] font-bold">
                  Tier {evolution.unlockedTier}
                </span>
                <div className="my-1">
                  <PixelCharacterAvatar
                    tier={evolution.unlockedTier}
                    size="lg"
                  />
                </div>
                <p className="font-display font-bold text-sm text-slate-900">
                  {evolution.classTitle}
                </p>
                <p className="text-xs text-slate-600">
                  {evolution.classTitleTh}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setExamResult(null);
                setSelectedPackage(null);
                setActiveQuestions([]);
                setAnswers({});
                setFlaggedIds({});
                setCurrentIdx(0);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 hover:bg-amber-300 shadow-arcade-sm"
            >
              <RotateCcw className="w-4 h-4" />
              กลับสู่ล็อบบี้เลือกชุดสอบ (Mock Lobby)
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 hover:bg-emerald-300 shadow-arcade-sm"
            >
              กลับสู่หน้าหลักฮีโร่ (Hero Dashboard)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Detailed Question Review */}
        <section className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                เฉลยและคำอธิบายรายข้อ ({activeQuestions.length} ข้อ)
              </h2>
              <p className="text-xs text-slate-600">
                ตรวจคำตอบพร้อมเหตุผลประกอบ เพื่อพัฒนาจุดอ่อนก่อนการสอบครั้งถัดไป
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {activeQuestions.map((q, idx) => {
              const userAns = answers[q.id];
              const wrap = shuffledMap.get(q.id);
              const originalUserChoice =
                wrap && userAns ? wrap.displayToOriginalMap[userAns] : userAns;
              const isCorrect = originalUserChoice === q.correctOption;
              const displayCorrect = wrap
                ? wrap.displayCorrectOption
                : q.correctOption;

              return (
                <div
                  key={q.id}
                  className={`p-4 border-2 border-slate-900 ${
                    isCorrect ? 'bg-emerald-50/70' : 'bg-rose-50/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-xs text-slate-900">
                      ข้อที่ {idx + 1} · Part {q.part} ({q.tag})
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold border border-slate-900 ${
                        isCorrect
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      คุณตอบ: {userAns || 'ไม่ได้ตอบ'} · เฉลย: {displayCorrect}
                    </span>
                  </div>
                  <p className="font-sans text-sm font-bold text-slate-900 reading-measure">
                    {q.questionText}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 mt-2 pt-2 border-t border-slate-200 leading-relaxed reading-measure">
                    <strong>คำอธิบาย:</strong> {q.explanationTh}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MOCK EXAM SELECTION LOBBY (INITIAL STATE - NO AUTO-START)
  // =========================================================================
  if (!selectedPackage) {
    return (
      <div className="space-y-8">
        {/* Lobby Hero Status Banner */}
        <section className="bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade-lg p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-20 h-20 bg-rose-500 border-2 border-slate-950 shadow-arcade flex items-center justify-center shrink-0">
                <img
                  src="/icons/boss-gate.png"
                  alt=""
                  className="w-12 h-12 object-contain [image-rendering:pixelated]"
                />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 font-display font-bold text-xs border border-slate-950">
                  <Swords className="w-4 h-4" />
                  สนามสอบจำลองทางการ (Official Boss Raid)
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  สนามประลองข้อสอบจำลองเต็มรูปแบบ (Mock Exam Lobby)
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  เลือกแพ็กเกจข้อสอบตามความพร้อมของคุณตั้งแต่ 50 ถึง 200 ข้อ
                  จำลองสัดส่วนมาตรฐาน ETS ทั้ง 7 พาร์ทอย่างแท้จริง
                  <strong className="text-amber-300 block mt-1">
                    * การสอบที่สนามนี้เท่านั้นที่จะบันทึกคะแนนทางการ (Official
                    Score 10–990) และวิวัฒนาการตัวละคร 7 Tiers
                  </strong>
                </p>
              </div>
            </div>

            {/* Current Official Hero Status Card */}
            <div className="bg-slate-800 border-2 border-slate-950 p-4 min-w-[240px] text-center shadow-[4px_4px_0px_0px_#020617] shrink-0">
              <span className="text-xs text-amber-300 font-pixel font-bold">
                OFFICIAL HERO STATUS
              </span>
              <div className="my-2 flex justify-center">
                <PixelCharacterAvatar
                  tier={currentHeroEvolution.unlockedTier}
                  size="md"
                />
              </div>
              <p className="font-display font-bold text-sm text-white">
                {currentHeroEvolution.classTitle}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1 text-xs">
                <span className="font-pixel text-amber-400 text-sm">
                  {heroScore}
                </span>
                <span className="text-slate-400 font-pixel">/ 990</span>
                <span className="px-1.5 py-0.5 bg-slate-900 text-emerald-400 font-pixel text-[10px] border border-slate-700">
                  Tier {currentHeroEvolution.unlockedTier}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice Banner for Separation of Practice vs Mock */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-950/70 p-3.5 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <Shield className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                <strong>ระบบป้องกันความสับสน:</strong> ผลคะแนนฝึกซ้อมในหน้า{' '}
                <Link
                  href="/practice"
                  className="text-sky-300 underline font-semibold hover:text-sky-200"
                >
                  /practice
                </Link>{' '}
                จะไม่กระทบต่อเลเวลตัวละครของคุณจนกว่าจะผ่านการทดสอบในสนาม Mock
                Exam นี้
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                requireAuth(
                  () => setIsRealTimeMultiPartOpen(true),
                  'กรุณาเข้าสู่ระบบก่อน เพื่อเริ่มทำข้อสอบรวมพาร์ท Real-Time',
                )
              }
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-display font-bold text-xs border border-slate-700 shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              การทดสอบรวมพาร์ท Real-Time (Popup)
            </button>
          </div>
        </section>

        {/* 7 Standard Mock Packages Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-display">
                เลือกแพ็กเกจข้อสอบจำลอง (7 Mock Exam Packages)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                จัดสัดส่วนคำถามทั้ง 7 พาร์ทตามหลักเกณฑ์การสอบมาตรฐาน TOEIC จริง
              </p>
            </div>
            <span className="font-pixel text-xs text-slate-500">
              7 Packages Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_EXAM_PACKAGES.map((pkg) => {
              const meta =
                PACKAGE_DIFFICULTY_META[pkg.size] ||
                PACKAGE_DIFFICULTY_META[50];
              const paceSeconds = Math.round(
                pkg.timeLimitSeconds / pkg.size,
              );

              return (
                <div
                  key={pkg.size}
                  className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-5 flex flex-col justify-between hover:-translate-y-1 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 font-display font-bold text-[11px] border ${meta.tierColor}`}
                      >
                        {meta.tierLabel}
                      </span>
                      <span className="font-pixel text-[11px] text-amber-600">
                        {meta.difficultyStars}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-display font-black text-lg text-slate-900">
                          {pkg.label}
                        </h3>
                      </div>
                      <p className="font-display font-bold text-xs text-rose-600">
                        {meta.bossTitle}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {pkg.descriptionTh}
                      </p>
                    </div>

                    {/* Time & Pace Badge */}
                    <div className="flex items-center gap-2 bg-slate-100 p-2.5 border border-slate-300 text-xs">
                      <Clock className="w-4 h-4 text-slate-700 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">
                          เวลาสอบ:{' '}
                        </span>
                        <span className="font-pixel text-slate-900 font-bold">
                          {pkg.timeLimitMinutes} นาที
                        </span>
                        <span className="text-slate-500 ml-1.5 text-[11px]">
                          (~{paceSeconds}s / ข้อ)
                        </span>
                      </div>
                    </div>

                    {/* Part Distribution Breakdown */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        สัดส่วนข้อสอบ 7 พาร์ท:
                      </span>
                      <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-pixel">
                        <div className="bg-sky-50 border border-sky-300 p-1 text-sky-900">
                          P1: {pkg.distribution[1]}
                        </div>
                        <div className="bg-sky-50 border border-sky-300 p-1 text-sky-900">
                          P2: {pkg.distribution[2]}
                        </div>
                        <div className="bg-sky-50 border border-sky-300 p-1 text-sky-900">
                          P3: {pkg.distribution[3]}
                        </div>
                        <div className="bg-sky-50 border border-sky-300 p-1 text-sky-900">
                          P4: {pkg.distribution[4]}
                        </div>
                        <div className="bg-emerald-50 border border-emerald-300 p-1 text-emerald-900">
                          P5: {pkg.distribution[5]}
                        </div>
                        <div className="bg-emerald-50 border border-emerald-300 p-1 text-emerald-900">
                          P6: {pkg.distribution[6]}
                        </div>
                        <div className="bg-emerald-50 border border-emerald-300 p-1 text-emerald-900 col-span-2">
                          P7: {pkg.distribution[7]}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        if (!authUser) {
                          openAuthModal(
                            'เข้าสู่ระบบเพื่อเริ่มทำข้อสอบจำลอง บันทึกคะแนน และเลื่อนระดับคลาสฮีโร่ของคุณ',
                          );
                          return;
                        }
                        setPendingConfirmPackage(pkg);
                      }}
                      className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      เข้าสู่สนามสอบ ({pkg.size} ข้อ)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pre-Exam Confirmation Modal */}
        {pendingConfirmPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 animate-in fade-in duration-200">
            <div className="bg-[#fffdf7] border-4 border-slate-950 shadow-arcade-lg max-w-lg w-full p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b-2 border-slate-950 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-600" />
                  <h3 className="text-lg font-black font-display text-slate-950">
                    ยืนยันการเริ่มสอบ {pendingConfirmPackage.label}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingConfirmPackage(null)}
                  className="p-1 hover:bg-slate-200 text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-800 leading-relaxed">
                <p>
                  คุณกำลังจะเข้าสู่สนามสอบจำลอง{' '}
                  <strong>{pendingConfirmPackage.label}</strong> จำนวน{' '}
                  <strong>{pendingConfirmPackage.size} ข้อ</strong> โดยมีเวลาทำข้อสอบ{' '}
                  <strong className="text-rose-600">
                    {pendingConfirmPackage.timeLimitMinutes} นาที
                  </strong>
                </p>

                <div className="bg-amber-50 border-2 border-amber-300 p-3.5 text-xs text-amber-950 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    กฎการสอบจำลองทางการ (Official Rules):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                    <li>เวลานับถอยหลังจะดำเนินต่อไปอย่างต่อเนื่อง</li>
                    <li>
                      ระบบจะคำนวณคะแนนสเกล TOEIC (10–990) ด้วยเส้นโค้งมาตรฐาน
                      ETS
                    </li>
                    <li>
                      คะแนนที่ได้จะอัปเดตสู่ Official Hero Level
                      และปลดล็อกคลาสตัวละครใหม่ทันที
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPendingConfirmPackage(null)}
                  className="px-4 py-2 bg-white text-slate-900 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchPackage(pendingConfirmPackage)}
                  className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 shadow-arcade-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  เริ่มจับเวลาทำข้อสอบทันที
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Simulation Modal */}
        {isRealTimeMultiPartOpen && (
          <RealTimeExamModal
            isOpen={isRealTimeMultiPartOpen}
            onClose={() => setIsRealTimeMultiPartOpen(false)}
            examType="FULL_MULTIPART_REALTIME"
            allQuestions={rawQuestions}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ACTIVE TIMED EXAM INTERFACE
  // =========================================================================
  const answeredCount = Object.keys(answers).length;
  const staminaPercent = Math.max(
    0,
    Math.min(100, Math.round((timeLeft / examTotalSeconds) * 100)),
  );
  const isTimeCritical = timeLeft <= 300; // under 5 minutes

  return (
    <div className="space-y-6">
      {/* 1. ACTIVE EXAM HEADER & TIMER */}
      <section className="bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617] flex items-center justify-center shrink-0">
              <img
                src="/icons/boss-gate.png"
                alt=""
                className="w-8 h-8 object-contain [image-rendering:pixelated]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-display font-bold text-[10px]">
                  OFFICIAL MOCK EXAM
                </span>
                <span className="font-pixel text-xs text-slate-400">
                  {selectedPackage.size} Questions
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {selectedPackage.label}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timer HUD */}
            <div className="bg-slate-800 border-2 border-slate-950 px-4 py-2 min-w-[210px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <img
                    src="/icons/icon-hud-timer.png"
                    alt=""
                    className="w-3.5 h-3.5 [image-rendering:pixelated]"
                  />
                  เวลาที่เหลือ
                </span>
                <span
                  className={`font-pixel text-base font-bold ${
                    isTimeCritical ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isTimeCritical ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${staminaPercent}%` }}
                />
              </div>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-bold text-xs border-2 border-slate-950"
            >
              ยกเลิกการสอบ
            </button>

            {/* Submit Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowSubmitConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617]"
            >
              <Send className="w-4 h-4" />
              ส่งกระดาษคำตอบ ({answeredCount}/{activeQuestions.length})
            </button>
          </div>
        </div>
      </section>

      {/* 2. EXAM QUESTION & NAVIGATOR */}
      {currentQuestion && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left (8 cols): Question Card */}
          <div className="lg:col-span-8 bg-[#fffdf7] border-2 border-slate-900 shadow-arcade-lg p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-900 text-amber-300 font-pixel text-xs">
                  ข้อที่ {currentIdx + 1} / {activeQuestions.length}
                </span>
                <span className="px-2.5 py-1 bg-sky-100 text-slate-900 border border-slate-900 text-xs font-semibold">
                  Part {currentQuestion.part} ({currentQuestion.section})
                </span>
                {currentQuestion.part === 2 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-400 text-[10px] font-bold">
                    3 Choices (A, B, C)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleToggleFlag(currentQuestion.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-2 border-slate-900 shadow-arcade-sm transition-all ${
                  flaggedIds[currentQuestion.id]
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white text-slate-700 hover:bg-amber-50'
                }`}
              >
                <img
                  src="/icons/icon-action-flag.png"
                  alt=""
                  className="w-4 h-4 [image-rendering:pixelated]"
                />
                {flaggedIds[currentQuestion.id]
                  ? 'ปักธงทบทวนแล้ว'
                  : 'ปักธงไว้ทบทวน'}
                <kbd className="ml-1 px-1 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-900 border border-slate-900">
                  F
                </kbd>
              </button>
            </div>

            {/* Listening Section Audio / Image */}
            {currentQuestion.section === 'LISTENING' && (
              <div className="space-y-3">
                <div className="bg-slate-900 text-white p-3.5 border-2 border-slate-950 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(currentQuestion)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400 text-slate-950 font-display font-bold text-xs border border-slate-950 hover:bg-amber-300"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        หยุดเสียง
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        ฟังเสียงโจทย์
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-300">
                    กดเพื่อฟังสำเนียงภาษาอังกฤษมาตรฐาน (Web Speech API)
                  </span>
                </div>

                {currentQuestion.imageUrl && (
                  <div className="bg-white border-2 border-slate-900 p-3">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Part 1 Photograph"
                      className="w-full h-64 object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Reading Passage (Part 6 & 7) */}
            {currentQuestion.passageText && (
              <div className="bg-white border-2 border-slate-900 p-5 font-sans text-sm text-slate-800 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto reading-measure shadow-inner">
                {currentQuestion.passageText}
              </div>
            )}

            {/* Question Text */}
            <div className="bg-white border-2 border-slate-900 p-4">
              <p className="font-sans text-base sm:text-lg font-bold text-slate-900 reading-measure">
                {currentQuestion.questionText}
              </p>
            </div>

            {/* Choice Buttons (Part 2 has strictly 3 choices, others have 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(() => {
                const wrap = shuffledMap.get(currentQuestion.id);
                const rawChoices = wrap
                  ? wrap.choices
                  : (['A', 'B', 'C', 'D'] as const).map((optKey) => ({
                      displayKey: optKey,
                      originalKey: optKey,
                      text:
                        optKey === 'A'
                          ? currentQuestion.optionA
                          : optKey === 'B'
                            ? currentQuestion.optionB
                            : optKey === 'C'
                              ? currentQuestion.optionC
                              : currentQuestion.optionD,
                    }));

                // Part 2: Strictly filter out choice D
                const choiceList =
                  currentQuestion.part === 2
                    ? rawChoices.filter((c) => c.displayKey !== 'D')
                    : rawChoices;

                return choiceList.map((choice, idx) => {
                  if (!choice.text) return null;
                  const isSelected =
                    answers[currentQuestion.id] === choice.displayKey;

                  return (
                    <button
                      key={choice.displayKey}
                      type="button"
                      onClick={() =>
                        handleSelectAnswer(
                          currentQuestion.id,
                          choice.displayKey,
                        )
                      }
                      className={`p-3.5 text-left border-2 border-slate-900 shadow-arcade-sm flex items-center justify-between gap-2 transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-semibold -translate-y-0.5'
                          : 'bg-white text-slate-900 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 shrink-0 bg-slate-900 text-amber-300 font-pixel text-xs flex items-center justify-center">
                          {choice.displayKey}
                        </span>
                        <span className="font-sans text-sm">{choice.text}</span>
                      </div>
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-900">
                        {idx + 1}
                      </kbd>
                    </button>
                  );
                });
              })()}
            </div>

            {/* Navigation Next/Prev Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
                ข้อก่อนหน้า
              </button>

              {currentIdx < activeQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIdx((prev) =>
                      Math.min(activeQuestions.length - 1, prev + 1),
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm hover:bg-amber-300"
                >
                  ข้อถัดไป
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm hover:bg-emerald-300"
                >
                  ส่งกระดาษคำตอบ
                </button>
              )}
            </div>
          </div>

          {/* Right (4 cols): Question Navigator Sheet */}
          <div className="lg:col-span-4 bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                แผงนำทางกระดาษคำตอบ (1–{activeQuestions.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ตอบแล้ว {answeredCount} ข้อ · ปักธงทบทวน{' '}
                {Object.values(flaggedIds).filter(Boolean).length} ข้อ
              </p>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 max-h-[420px] overflow-y-auto p-1">
              {activeQuestions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = Boolean(answers[q.id]);
                const isFlagged = Boolean(flaggedIds[q.id]);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`relative h-11 font-pixel text-xs border-2 border-slate-900 flex flex-col items-center justify-center transition-all ${
                      isCurrent
                        ? 'ring-2 ring-slate-950 bg-amber-400 text-slate-950 font-bold'
                        : isAnswered
                          ? 'bg-emerald-400 text-slate-950 font-bold'
                          : 'bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isAnswered && (
                      <span className="text-[9px] leading-none">
                        ({answers[q.id]})
                      </span>
                    )}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border border-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade active:translate-x-[2px] active:translate-y-[2px]"
            >
              ส่งกระดาษคำตอบและดูผลคะแนน
            </button>
          </div>
        </section>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-[#fffdf7] border-4 border-slate-950 shadow-arcade-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black font-display text-slate-950 border-b-2 border-slate-950 pb-2">
              ยืนยันการส่งกระดาษคำตอบ
            </h3>
            <p className="text-sm text-slate-800">
              คุณตอบไปแล้ว{' '}
              <strong className="text-emerald-700">
                {answeredCount} / {activeQuestions.length} ข้อ
              </strong>
              {activeQuestions.length - answeredCount > 0 && (
                <span className="text-rose-600 block mt-1">
                  (ยังมีข้อที่ยังไม่ได้ตอบอีก{' '}
                  {activeQuestions.length - answeredCount} ข้อ)
                </span>
              )}
            </p>
            <p className="text-xs text-slate-600">
              ระบบจะคำนวณคะแนนสเกล TOEIC
              และบันทึกผลการสอบอย่างเป็นทางการสู่โปรไฟล์ของคุณทันที
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 bg-white text-slate-900 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
              >
                กลับไปทำต่อ
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 shadow-arcade-sm"
              >
                {isSubmitting ? 'กำลังส่งผลคะแนน...' : 'ยืนยันการส่ง'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Exam Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-[#fffdf7] border-4 border-slate-950 shadow-arcade-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-black font-display text-slate-950 border-b-2 border-slate-950 pb-2">
              ต้องการยกเลิกการสอบใช่หรือไม่?
            </h3>
            <p className="text-sm text-slate-800">
              หากยกเลิกตอนนี้ กระดาษคำตอบที่ทำไว้จะไม่ถูกส่งตรวจ
              และคะแนนจะไม่ถูกบันทึก
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-white text-slate-900 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
              >
                ทำข้อสอบต่อ
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelSpeech();
                  setSelectedPackage(null);
                  setActiveQuestions([]);
                  setShowCancelConfirm(false);
                }}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-display font-bold text-xs border-2 border-slate-950 shadow-arcade-sm"
              >
                ยกเลิกและกลับสู่ล็อบบี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
