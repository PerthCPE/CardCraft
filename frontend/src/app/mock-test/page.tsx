'use client';

// ============================================================================
// frontend/src/app/mock-test/page.tsx
// โมดูลจำลองสอบจับเวลา Mini Mock Test (Boss Battle)
// ปรับปรุงด้วยหลักการของ frontend-design + cardcraft-pixel-ui:
// - ใช้ฟอนต์ Silkscreen เฉพาะตัวเลขเวลาถอยหลัง (14:59) และคะแนนประเมิน (730 / 990)
// - ใช้ข้อความปุ่มและคำอธิบายที่เป็นธรรมชาติ อ่านเข้าใจง่ายทันที
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Clock,
  Play,
  RotateCcw,
  Send,
  Square,
} from 'lucide-react';
import { QuestionItem } from '@/data/toeic-dictionary';
import {
  fetchQuestions,
  submitExamAttempt,
  SubmitExamResponse,
} from '@/lib/api';
import { PixelCharacterAvatar } from '@/components/PixelCharacterAvatar';
import RealTimeExamModal from '@/components/RealTimeExamModal';
import { useAuth } from '@/context/AuthContext';

const EXAM_DURATION_SECONDS = 15 * 60;

export default function BossBattleMockTestPage() {
  const { user: authUser, requireAuth, openAuthModal } = useAuth();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isRealTimeMultiPartOpen, setIsRealTimeMultiPartOpen] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>(
    {},
  );
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(EXAM_DURATION_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<SubmitExamResponse | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  useEffect(() => {
    fetchQuestions().then((data) => {
      setQuestions(data);
    });
  }, []);

  useEffect(() => {
    if (examResult || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examResult, questions.length]);

  const currentQuestion = questions[currentIdx] || null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const handleSelectAnswer = useCallback(
    (qId: string, opt: 'A' | 'B' | 'C' | 'D', part: number) => {
      if (!authUser) {
        requireAuth(
          undefined,
          'กรุณาเข้าสู่ระบบก่อน เพื่อเริ่มทำข้อสอบและบันทึกคำตอบลงกระดาษคำตอบของคุณ',
        );
        return;
      }
      if (part === 2 && opt === 'D') return;
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

  const handleSubmitExam = async () => {
    if (!authUser) {
      requireAuth(
        undefined,
        'กรุณาเข้าสู่ระบบก่อน เพื่อส่งกระดาษคำตอบและคำนวณคะแนนสเกล TOEIC สู่โปรไฟล์ของคุณ',
      );
      return;
    }
    if (questions.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const listeningQuestions = questions.filter(
      (q) => q.section === 'LISTENING',
    );
    const readingQuestions = questions.filter((q) => q.section === 'READING');

    const listeningCorrect = listeningQuestions.filter(
      (q) => answers[q.id] === q.correctOption,
    ).length;

    const readingCorrect = readingQuestions.filter(
      (q) => answers[q.id] === q.correctOption,
    ).length;

    const timeSpentSeconds = Math.max(
      15,
      EXAM_DURATION_SECONDS - timeLeft,
    );

    const response = await submitExamAttempt({
      userId: authUser?.id,
      mode: 'MINI_MOCK',
      listeningCorrect,
      listeningTotal: listeningQuestions.length,
      readingCorrect,
      readingTotal: readingQuestions.length,
      timeSpentSeconds,
    });

    setExamResult(response);
    setIsSubmitting(false);
  };

  const handlePlayAudio = (q: QuestionItem) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const lines =
      q.part === 1
        ? [
            'Listen to the four statements.',
            `A: ${q.optionA}`,
            `B: ${q.optionB}`,
            `C: ${q.optionC}`,
            `D: ${q.optionD || ''}`,
          ]
        : [
            q.questionText,
            `A: ${q.optionA}`,
            `B: ${q.optionB}`,
            `C: ${q.optionC}`,
          ];

    const utter = new SpeechSynthesisUtterance(lines.join(' ... '));
    utter.lang = 'en-US';
    utter.rate = 0.92;
    utter.onend = () => setIsPlayingAudio(false);
    utter.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (examResult || !currentQuestion) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') {
        handleSelectAnswer(currentQuestion.id, 'A', currentQuestion.part);
      } else if (key === '2' || key === 'B') {
        handleSelectAnswer(currentQuestion.id, 'B', currentQuestion.part);
      } else if (key === '3' || key === 'C') {
        handleSelectAnswer(currentQuestion.id, 'C', currentQuestion.part);
      } else if (
        (key === '4' || key === 'D') &&
        currentQuestion.part !== 2
      ) {
        handleSelectAnswer(currentQuestion.id, 'D', currentQuestion.part);
      } else if (key === 'F') {
        e.preventDefault();
        handleToggleFlag(currentQuestion.id);
      } else if (e.code === 'ArrowRight') {
        setCurrentIdx((prev) =>
          prev < questions.length - 1 ? prev + 1 : prev,
        );
      } else if (e.code === 'ArrowLeft') {
        setCurrentIdx((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    examResult,
    currentQuestion,
    questions.length,
    handleSelectAnswer,
    handleToggleFlag,
  ]);

  // =========================================================================
  // VIEW A: EXAM RESULT & CLASS EVOLUTION ANALYSIS
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
        <section className="bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade-lg p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 font-display font-bold text-xs border border-slate-950">
                <Award className="w-4 h-4" />
                {hasEvolved
                  ? 'เลื่อนระดับคลาสฮีโร่สำเร็จ'
                  : 'สรุปผลการประเมินคะแนนสอบ'}
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
                  การฟัง:{' '}
                  <strong className="font-pixel">
                    {scoreBreakdown.listeningScaled}
                  </strong>{' '}
                  / 495
                </span>
                <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-emerald-300">
                  การอ่าน:{' '}
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

            {/* Character Evolution Comparison */}
            <div className="bg-slate-800 border-2 border-slate-950 p-5 flex items-center gap-4 shadow-[4px_4px_0px_0px_#020617]">
              <div className="text-center">
                <span className="text-xs text-slate-400">ก่อนสอบ</span>
                <div className="my-1">
                  <PixelCharacterAvatar tier={previousTier.tier} size="md" />
                </div>
                <p className="font-display font-bold text-xs text-slate-300">
                  {previousTier.title}
                </p>
              </div>

              <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" />

              <div className="text-center bg-[#fffdf7] text-slate-900 border-2 border-slate-950 p-3">
                <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 font-pixel text-[10px]">
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
                setAnswers({});
                setFlaggedIds({});
                setTimeLeft(EXAM_DURATION_SECONDS);
                setCurrentIdx(0);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-950"
            >
              <RotateCcw className="w-4 h-4" />
              ทำข้อสอบชุดนี้อีกครั้ง
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-950"
            >
              กลับสู่หน้าหลักฮีโร่
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Detailed Question Review */}
        <section className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            เฉลยและคำอธิบายรายข้อ ({questions.length} ข้อ)
          </h2>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correctOption;

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
                      คุณตอบ: {userAns || 'ไม่ได้เลือก'} · เฉลย: {q.correctOption}
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
  // VIEW B: ACTIVE TIMED EXAM INTERFACE
  // =========================================================================
  const answeredCount = Object.keys(answers).length;
  const staminaPercent = Math.round((timeLeft / EXAM_DURATION_SECONDS) * 100);

  return (
    <div className="space-y-6">
      {/* 1. EXAM HEADER & TIMER */}
      <section className="bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade p-6">
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
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                สนามสอบจำลองจับเวลา (Mini Mock Test)
              </h1>
              <p className="text-sm text-slate-300 mt-0.5">
                ทำข้อสอบรวม 56 ข้อ เพื่อคำนวณคะแนนสเกล 10–990 และปลดล็อกคลาสใหม่
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800 border-2 border-slate-950 px-4 py-2 min-w-[200px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <img
                    src="/icons/icon-hud-timer.png"
                    alt=""
                    className="w-3.5 h-3.5 [image-rendering:pixelated]"
                  />
                  เวลาที่เหลือ
                </span>
                <span className="font-pixel text-amber-300 text-sm">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${staminaPercent}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                requireAuth(
                  () => setIsRealTimeMultiPartOpen(true),
                  'กรุณาเข้าสู่ระบบก่อน เพื่อเริ่มทำข้อสอบรวมพาร์ท Real-Time',
                )
              }
              className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617] inline-flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-slate-950" />
              การทดสอบรวมพาร์ทตามเวลาจริง (Full Real-Time)
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitExam}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617]"
            >
              <Send className="w-4 h-4" />
              ส่งกระดาษคำตอบ ({answeredCount}/{questions.length})
            </button>
          </div>
        </div>

        {/* Guest Mode Notice in Header */}
        {!authUser && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 border border-amber-400/40">
            <span className="text-amber-200">
              คุณกำลังอยู่ในโหมดทดลองเปิดดูข้อสอบ (Guest Mode) — เข้าสู่ระบบเพื่อเริ่มจับเวลาทำข้อสอบจริง 56 ข้อ และบันทึกคะแนนเพื่อเลื่อนระดับคลาส
            </span>
            <button
              type="button"
              onClick={() =>
                openAuthModal(
                  'เข้าสู่ระบบหรือสร้างบัญชีใหม่ เพื่อเริ่มทำแบบทดสอบ บันทึกคะแนน และเลื่อนระดับคลาสฮีโร่ของคุณ',
                )
              }
              className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-xs border border-slate-950 shrink-0 self-start sm:self-auto"
            >
              เข้าสู่ระบบ / สมัครสมาชิก
            </button>
          </div>
        )}
      </section>

      {/* 2. EXAM QUESTION & NAVIGATOR */}
      {currentQuestion && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left (8 cols): Question Card */}
          <div className="lg:col-span-8 bg-[#fffdf7] border-2 border-slate-900 shadow-arcade-lg p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-900 text-amber-300 font-pixel text-xs">
                  ข้อที่ {currentIdx + 1} / {questions.length}
                </span>
                <span className="px-2.5 py-1 bg-sky-100 text-slate-900 border border-slate-900 text-xs font-medium">
                  Part {currentQuestion.part}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleFlag(currentQuestion.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-2 border-slate-900 shadow-arcade-sm ${
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

            {currentQuestion.section === 'LISTENING' && (
              <div className="space-y-3">
                <div className="bg-slate-900 text-white p-3.5 border-2 border-slate-950 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(currentQuestion)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400 text-slate-950 font-display font-bold text-xs border border-slate-950"
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
                    กดเพื่อฟังเสียงโจทย์และตัวเลือกภาษาอังกฤษ
                  </span>
                </div>

                {currentQuestion.imageUrl && (
                  <div className="bg-white border-2 border-slate-900 p-3">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Part 1 Photograph"
                      className="w-full h-60 object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {currentQuestion.passageText && (
              <div className="bg-white border-2 border-slate-900 p-5 font-sans text-sm text-slate-800 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto reading-measure">
                {currentQuestion.passageText}
              </div>
            )}

            <div className="bg-white border-2 border-slate-900 p-4">
              <p className="font-sans text-base sm:text-lg font-bold text-slate-900 reading-measure">
                {currentQuestion.questionText}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map((optKey, idx) => {
                if (currentQuestion.part === 2 && optKey === 'D') return null;
                const text =
                  optKey === 'A'
                    ? currentQuestion.optionA
                    : optKey === 'B'
                      ? currentQuestion.optionB
                      : optKey === 'C'
                        ? currentQuestion.optionC
                        : currentQuestion.optionD;
                if (!text) return null;

                const isSelected = answers[currentQuestion.id] === optKey;

                return (
                  <button
                    key={optKey}
                    type="button"
                    onClick={() =>
                      handleSelectAnswer(
                        currentQuestion.id,
                        optKey,
                        currentQuestion.part,
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
                        {optKey}
                      </span>
                      <span className="font-sans text-sm">{text}</span>
                    </div>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-900">
                      {idx + 1}
                    </kbd>
                  </button>
                );
              })}
            </div>

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

              {currentIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIdx((prev) =>
                      Math.min(questions.length - 1, prev + 1),
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
                >
                  ข้อถัดไป
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
                >
                  ส่งกระดาษคำตอบ
                </button>
              )}
            </div>
          </div>

          {/* Right (4 cols): Question Navigator */}
          <div className="lg:col-span-4 bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                แผงนำทางข้อสอบ (1–{questions.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ตอบแล้ว {answeredCount} ข้อ · ปักธงทบทวน{' '}
                {Object.values(flaggedIds).filter(Boolean).length} ข้อ
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
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
              onClick={handleSubmitExam}
              className="w-full py-2.5 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade active:translate-x-[2px] active:translate-y-[2px]"
            >
              ส่งกระดาษคำตอบและดูผลคะแนน
            </button>
          </div>
        </section>
      )}

      {/* Full Multi-Part Real-Time Simulation Modal */}
      {isRealTimeMultiPartOpen && (
        <RealTimeExamModal
          isOpen={isRealTimeMultiPartOpen}
          onClose={() => setIsRealTimeMultiPartOpen(false)}
          examType="FULL_MULTIPART_REALTIME"
          allQuestions={questions}
        />
      )}
    </div>
  );
}
