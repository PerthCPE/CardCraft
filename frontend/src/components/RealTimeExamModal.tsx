'use client';

// ============================================================================
// frontend/src/components/RealTimeExamModal.tsx
// การทดสอบพาร์ทต่างๆ และการทดสอบรวมพาร์ทตามเวลาจริง (Real-Time TOEIC Exam)
// - จับเวลาจริงตามมาตรฐานข้อสอบ TOEIC:
//   * Part 5 Real-Time Speed Exam: 30 ข้อ 12:00 นาที (ข้อละประมาณ 24 วินาที)
//   * Part 7 Real-Time Reading Exam: 10 ข้อ 15:00 นาที (อ่านบทความแยกหน้าจอ)
//   * Real-Time Multi-Part Simulation: รวม Listening + Reading จับเวลาจริง
// - มี Question Navigator Palette (1-30) แสดงสถานะข้อที่ตอบแล้ว และปุ่ม Flag For Review
// - ส่งผลสอบและคำนวณสเกลคะแนน TOEIC (10 - 990) พร้อมเฉลยละเอียดภาษาไทย
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Flag,
  RotateCcw,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import { QuestionItem } from '@/data/toeic-dictionary';
import { getCharacterEvolution, calculateScaledToeicScore } from '@/utils/character-evolution.util';

export type RealTimeExamType =
  | 'PART_5_REALTIME'
  | 'PART_7_REALTIME'
  | 'FULL_MULTIPART_REALTIME';

interface RealTimeExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  examType: RealTimeExamType;
  allQuestions: QuestionItem[];
  onFinish?: (result: {
    scaledScore: number;
    listeningCorrect: number;
    readingCorrect: number;
    timeSpentSeconds: number;
    passed700: boolean;
  }) => void;
}

export default function RealTimeExamModal({
  isOpen,
  onClose,
  examType,
  allQuestions,
  onFinish,
}: RealTimeExamModalProps) {
  // กรองข้อสอบตามประเภทการทดสอบ
  const examQuestions = useMemo(() => {
    if (examType === 'PART_5_REALTIME') {
      const p5 = allQuestions.filter((q) => q.part === 5);
      return p5.slice(0, 30); // สูงสุด 30 ข้อ
    }
    if (examType === 'PART_7_REALTIME') {
      return allQuestions.filter((q) => q.part === 7);
    }
    // FULL_MULTIPART_REALTIME: รวม Listening (P1, P2) + Reading (P5, P7)
    const p1 = allQuestions.filter((q) => q.part === 1).slice(0, 3);
    const p2 = allQuestions.filter((q) => q.part === 2).slice(0, 5);
    const p5 = allQuestions.filter((q) => q.part === 5).slice(0, 15);
    const p7 = allQuestions.filter((q) => q.part === 7).slice(0, 7);
    return [...p1, ...p2, ...p5, ...p7];
  }, [allQuestions, examType]);

  // เวลาเริ่มต้นตามประเภท
  const totalDurationSeconds = useMemo(() => {
    if (examType === 'PART_5_REALTIME') return 720; // 12 นาที
    if (examType === 'PART_7_REALTIME') return 900; // 15 นาที
    return 1500; // 25 นาทีสำหรับ Multi-Part
  }, [examType]);

  const [timeLeft, setTimeLeft] = useState<number>(totalDurationSeconds);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // รีเซ็ตสถานะเมื่อเปิด Modal
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(totalDurationSeconds);
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      setIsSubmitted(false);
      setIsPlayingAudio(false);
    }
  }, [isOpen, totalDurationSeconds]);

  // ตัวจับเวลา Real-Time
  useEffect(() => {
    if (!isOpen || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSubmitted]);

  const currentQ = examQuestions[currentIndex] || null;

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted || !currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // เล่นเสียงสังเคราะห์สำหรับ Listening
  const handlePlayAudio = (q: QuestionItem) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const scripts: string[] = [];
    if (q.part === 1) {
      scripts.push(
        'Look at the photograph and listen to the statements.',
        `Statement A: ${q.optionA}`,
        `Statement B: ${q.optionB}`,
        `Statement C: ${q.optionC}`,
        `Statement D: ${q.optionD || ''}`,
      );
    } else if (q.part === 2) {
      scripts.push(
        `Question: ${q.questionText}`,
        `Option A: ${q.optionA}`,
        `Option B: ${q.optionB}`,
        `Option C: ${q.optionC}`,
      );
    }

    const utterance = new SpeechSynthesisUtterance(scripts.join(' ... '));
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // ตรวจคำตอบและคำนวณผลลัพธ์
  const results = useMemo(() => {
    if (!isSubmitted) return null;

    let listeningCorrect = 0;
    let listeningTotal = 0;
    let readingCorrect = 0;
    let readingTotal = 0;

    examQuestions.forEach((q) => {
      const userChoice = answers[q.id];
      const isCorrect = userChoice === q.correctOption;

      if (q.section === 'LISTENING') {
        listeningTotal++;
        if (isCorrect) listeningCorrect++;
      } else {
        readingTotal++;
        if (isCorrect) readingCorrect++;
      }
    });

    const scaled = calculateScaledToeicScore(
      listeningCorrect,
      listeningTotal || 1,
      readingCorrect,
      readingTotal || 1,
    );

    const evolution = getCharacterEvolution(scaled.estimatedScore);
    const timeSpent = totalDurationSeconds - timeLeft;

    return {
      scaled,
      evolution,
      listeningCorrect,
      listeningTotal,
      readingCorrect,
      readingTotal,
      timeSpent,
      totalCorrect: listeningCorrect + readingCorrect,
      totalQuestions: examQuestions.length,
    };
  }, [isSubmitted, examQuestions, answers, totalDurationSeconds, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timeLeft <= 120; // เตือนเมื่อเหลือต่ำกว่า 2 นาที

  const examTitle =
    examType === 'PART_5_REALTIME'
      ? 'Part 5 Real-Time Speed Exam (30 ข้อ 12 นาที)'
      : examType === 'PART_7_REALTIME'
        ? 'Part 7 Reading Speed Exam (การอ่านจับเวลาจริง 15 นาที)'
        : 'Full Multi-Part Real-Time Simulation (ทดสอบรวมพาร์ทจับเวลาจริง)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] rounded-none overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header Strip */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-400 text-slate-900 border border-amber-300 flex items-center justify-center font-pixel shadow-pixel-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-amber-300">
                  {examTitle}
                </h2>
                <span className="text-[10px] font-pixel px-1.5 py-0.5 bg-red-600 text-white rounded">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-slate-300">
                ข้อสอบมาตรฐาน TOEIC • ระบบจับเวลาจริงและวิเคราะห์สเกลคะแนน 10-990
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Badge */}
            {!isSubmitted && (
              <div
                className={`flex items-center gap-2 px-3 py-1 border-2 font-pixel text-sm ${
                  isUrgent
                    ? 'border-red-500 bg-red-950 text-red-400 animate-pulse'
                    : 'border-amber-400 bg-slate-800 text-amber-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formattedTime}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* EXAM IN PROGRESS */}
        {!isSubmitted && currentQ && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left/Main Column: Question Display */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-pixel font-bold px-2 py-0.5 bg-slate-900 text-amber-300 rounded">
                    Part {currentQ.part}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ข้อที่ {currentIndex + 1} จาก {examQuestions.length}
                  </span>
                  <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                    {currentQ.tag}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border transition-colors ${
                    flagged[currentQ.id]
                      ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {flagged[currentQ.id] ? 'ปักธงแล้ว (Flagged)' : 'ปักธงทบทวน'}
                </button>
              </div>

              {/* Listening Audio Button for Part 1/2 */}
              {(currentQ.part === 1 || currentQ.part === 2) && (
                <div className="p-3 bg-amber-50 border-2 border-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Volume2 className="w-4 h-4 text-amber-700" />
                    <span>คลิกเพื่อฟังเสียงบรรยายข้อสอบพาร์ทการฟัง</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(currentQ)}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 border border-slate-900 text-xs font-bold text-slate-900 shadow-pixel-sm flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {isPlayingAudio ? 'กำลังเล่นเสียง...' : 'ฟังเสียงข้อสอบ (Play Audio)'}
                  </button>
                </div>
              )}

              {/* Part 7 Reading Passage (if available) */}
              {currentQ.passageText && (
                <div className="p-4 bg-slate-50 border-2 border-slate-900 max-h-56 overflow-y-auto text-xs leading-relaxed font-body text-slate-800 whitespace-pre-wrap">
                  {currentQ.passageText}
                </div>
              )}

              {/* Question Text */}
              <div className="text-base sm:text-lg font-bold font-display text-slate-900 leading-snug">
                {currentQ.questionText}
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {(
                  [
                    { key: 'A', text: currentQ.optionA },
                    { key: 'B', text: currentQ.optionB },
                    { key: 'C', text: currentQ.optionC },
                    ...(currentQ.optionD ? [{ key: 'D', text: currentQ.optionD }] : []),
                  ] as const
                ).map((opt) => {
                  const isChosen = answers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(opt.key as 'A' | 'B' | 'C' | 'D')}
                      className={`w-full p-3.5 border-2 text-left text-sm font-body transition-all flex items-start gap-3 active:translate-x-[1px] active:translate-y-[1px] ${
                        isChosen
                          ? 'border-indigo-600 bg-indigo-50 font-semibold shadow-pixel-sm'
                          : 'border-slate-900 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-pixel font-bold rounded ${
                          isChosen
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav inside question box */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 border-2 border-slate-900 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  ← ข้อก่อนหน้า
                </button>

                <div className="text-xs text-slate-500 font-mono">
                  ตอบแล้ว {Object.keys(answers).length}/{examQuestions.length} ข้อ
                </div>

                {currentIndex < examQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        Math.min(examQuestions.length - 1, prev + 1),
                      )
                    }
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 border-2 border-slate-900 text-xs font-bold shadow-pixel-sm"
                  >
                    ข้อถัดไป →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(true)}
                    className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 border-2 border-slate-900 text-xs font-bold shadow-pixel-sm"
                  >
                    ส่งกระดาษคำตอบ (Submit)
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Question Navigator Grid (1-30) */}
            <div className="w-full md:w-64 border-t-2 md:border-t-0 md:border-l-2 border-slate-900 bg-slate-50 p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold font-display uppercase tracking-wide text-slate-700 mb-2">
                  แผงกระดาษคำตอบ (Palette)
                </h3>
                <div className="grid grid-cols-5 gap-1.5 max-h-56 md:max-h-80 overflow-y-auto p-1">
                  {examQuestions.map((q, idx) => {
                    const isAnswered = Boolean(answers[q.id]);
                    const isFlagged = Boolean(flagged[q.id]);
                    const isCurrent = idx === currentIndex;

                    let bg = 'bg-white text-slate-700 border-slate-300';
                    if (isAnswered) bg = 'bg-indigo-600 text-white border-indigo-700';
                    if (isFlagged) bg = 'bg-red-500 text-white border-red-700';
                    if (isCurrent) bg += ' ring-2 ring-amber-400 font-bold';

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-8 border text-xs font-pixel rounded flex items-center justify-center transition-all ${bg}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-1 text-[11px] text-slate-600 border-t border-slate-200 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-indigo-600 rounded inline-block" />
                    <span>ตอบแล้ว ({Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-red-500 rounded inline-block" />
                    <span>ปักธงทบทวน ({Object.values(flagged).filter(Boolean).length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-white border border-slate-400 rounded inline-block" />
                    <span>ยังไม่ได้ตอบ ({examQuestions.length - Object.keys(answers).length})</span>
                  </div>
                </div>
              </div>

              {/* Submit Final Button */}
              <button
                type="button"
                onClick={() => setIsSubmitted(true)}
                className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm"
              >
                ส่งกระดาษคำตอบทันที
              </button>
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {isSubmitted && results && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-amber-100 border-2 border-slate-900 shadow-pixel">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-900">
                สรุปผลคะแนนสอบตามเวลาจริง (Real-Time Result)
              </h3>
              <p className="text-xs text-slate-600">
                เวลาที่ใช้: {Math.floor(results.timeSpent / 60)} นาที {results.timeSpent % 60} วินาที • ตอบถูก {results.totalCorrect}/{results.totalQuestions} ข้อ
              </p>
            </div>

            {/* Scaled Score Showcase */}
            <div className="p-6 bg-slate-900 text-white border-2 border-slate-900 shadow-pixel text-center space-y-2">
              <div className="text-xs font-pixel text-amber-400">
                ESTIMATED TOEIC SCALED SCORE
              </div>
              <div className="text-5xl font-extrabold font-pixel text-amber-300">
                {results.scaled.estimatedScore} / 990
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div>
                  Listening:{' '}
                  <span className="font-bold text-sky-400">
                    {results.scaled.listeningScaled}
                  </span>{' '}
                  / 495 ({results.listeningCorrect}/{results.listeningTotal})
                </div>
                <div>
                  Reading:{' '}
                  <span className="font-bold text-emerald-400">
                    {results.scaled.readingScaled}
                  </span>{' '}
                  / 495 ({results.readingCorrect}/{results.readingTotal})
                </div>
              </div>
            </div>

            {/* Evolution Tier Card */}
            <div className="p-4 bg-amber-50 border-2 border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase">
                  คลาสฮีโร่ที่ปลดล็อก:
                </span>
                <div className="text-lg font-bold font-display text-slate-900">
                  {results.evolution.currentTier.title} (Tier {results.evolution.currentTier.tier})
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {results.evolution.isPassedTarget
                    ? '🎯 บรรลุเป้าหมาย TOEIC 700+ เรียบร้อยแล้ว!'
                    : `ขาดอีก ${results.evolution.pointsToTarget700} คะแนนเพื่อบรรลุเป้าหมาย 700+`}
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-400 border border-slate-900 font-pixel text-xs text-slate-900 rounded font-bold">
                {results.evolution.currentTier.badgeText}
              </span>
            </div>

            {/* Answer Key Review with Thai Explanations */}
            <div className="space-y-3 border-t-2 border-slate-900 pt-4">
              <h4 className="text-sm font-bold font-display text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                เฉลยและเทคนิคการตัดช้อยส์รายข้อ:
              </h4>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {examQuestions.map((q, idx) => {
                  const userChoice = answers[q.id];
                  const isCorrect = userChoice === q.correctOption;

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 border-2 text-xs space-y-1.5 ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-red-300 bg-red-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900">
                          ข้อ {idx + 1} (Part {q.part}): {q.questionText}
                        </span>
                        <span
                          className={`font-pixel px-1.5 py-0.5 rounded ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {isCorrect ? 'ถูกต้อง' : 'ผิด'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-slate-600">
                        <span>คำตอบของคุณ: <strong className="text-slate-900">{userChoice || 'ไม่ได้ตอบ'}</strong></span>
                        <span>เฉลยที่ถูกต้อง: <strong className="text-emerald-700">{q.correctOption}</strong></span>
                      </div>

                      <p className="text-slate-700 bg-white p-2 border border-slate-200 rounded leading-relaxed">
                        💡 {q.explanationTh}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTimeLeft(totalDurationSeconds);
                  setCurrentIndex(0);
                  setAnswers({});
                  setFlagged({});
                  setIsSubmitted(false);
                }}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 border-2 border-slate-900 text-slate-900 font-display font-bold text-xs shadow-pixel-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                ทดสอบใหม่อีกครั้ง
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-6 bg-slate-200 hover:bg-slate-300 border-2 border-slate-900 text-slate-800 font-bold text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
