'use client';

// ============================================================================
// frontend/src/app/practice/page.tsx
// โมดูลฝึกทำโจทย์แยกพาร์ท (Listening Part 1-2 & Reading Part 5, 7)
// ปรับปรุงด้วยหลักการของ frontend-design + cardcraft-pixel-ui:
// - จัดวางบทความอีเมลธุรกิจใน Part 7 ด้วยความยาวบรรทัดไม่เกิน 66 ตัวอักษร (reading-measure)
//   คู่กับฟอนต์ Plus Jakarta Sans + IBM Plex Sans Thai เพื่อให้อ่านโจทย์ยาวได้สบายตาที่สุด
// - ตัดป้ายกำกับ ALL-CAPS ซ้ำซ้อนออก ใช้ข้อความปุ่มภาษาไทยที่ชัดเจนตรงไปตรงมา
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Dices,
  Flame,
  Headphones,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Sword,
  XCircle,
  Zap,
} from 'lucide-react';
import { FlashcardItem, QuestionItem } from '@/data/toeic-dictionary';
import { fetchFlashcards, fetchQuestions } from '@/lib/api';
import RealTimeExamModal, { RealTimeExamType } from '@/components/RealTimeExamModal';
import VocabBlitzGame from '@/components/VocabBlitzGame';
import BossSurvivalModal from '@/components/BossSurvivalModal';
import CollocationRushModal from '@/components/CollocationRushModal';
import { CardSet, getStoredActiveSet } from '@/utils/card-sets';
import { useAuth } from '@/context/AuthContext';

type DrillPart = 1 | 2 | 5 | 7;

export default function PracticeDrillsPage() {
  const { user: authUser } = useAuth();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [activeSet, setActiveSet] = useState<CardSet | null>(null);

  // Real-Time and Special Game Modal States
  const [realTimeExamType, setRealTimeExamType] = useState<RealTimeExamType | null>(null);
  const [isBlitzOpen, setIsBlitzOpen] = useState<boolean>(false);
  const [isBossOpen, setIsBossOpen] = useState<boolean>(false);
  const [isCollocationOpen, setIsCollocationOpen] = useState<boolean>(false);

  const [selectedPart, setSelectedPart] = useState<DrillPart>(1);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, 'A' | 'B' | 'C' | 'D'>
  >({});

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [part5TimeLeft, setPart5TimeLeft] = useState<number>(20);

  useEffect(() => {
    fetchQuestions().then((data) => {
      setQuestions(data);
    });
    fetchFlashcards(undefined, authUser?.id).then((data) => {
      setCards(data);
      const stored = getStoredActiveSet(data);
      setActiveSet(stored);
    });
  }, [authUser?.id]);

  const partQuestions = useMemo(() => {
    return questions.filter((q) => q.part === selectedPart);
  }, [questions, selectedPart]);

  const currentQuestion =
    partQuestions.length > 0
      ? partQuestions[currentIndex % partQuestions.length]
      : null;

  const userChoice = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : undefined;
  const isAnswered = Boolean(userChoice);

  useEffect(() => {
    if (selectedPart !== 5 || !currentQuestion) return;
    if (selectedAnswers[currentQuestion.id]) return;

    setPart5TimeLeft(20);
    const interval = setInterval(() => {
      setPart5TimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedPart, currentIndex, currentQuestion, selectedAnswers]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [selectedPart, currentIndex]);

  const handlePlayListeningAudio = useCallback(
    (question: QuestionItem) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      window.speechSynthesis.cancel();
      const scriptParts: string[] = [];

      if (question.part === 1) {
        scriptParts.push(
          'Look at the photograph. Listen to the four statements.',
          `Statement A: ${question.optionA}`,
          `Statement B: ${question.optionB}`,
          `Statement C: ${question.optionC}`,
          `Statement D: ${question.optionD || ''}`,
        );
      } else if (question.part === 2) {
        scriptParts.push(
          `Question: ${question.questionText}`,
          `Option A: ${question.optionA}`,
          `Option B: ${question.optionB}`,
          `Option C: ${question.optionC}`,
        );
      }

      const utterance = new SpeechSynthesisUtterance(scriptParts.join(' ... '));
      utterance.lang = 'en-US';
      utterance.rate = 0.92;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    },
    [isPlayingAudio],
  );

  const handleSelectOption = useCallback(
    (question: QuestionItem, optionKey: 'A' | 'B' | 'C' | 'D') => {
      if (question.part === 2 && optionKey === 'D') return;
      setSelectedAnswers((prev) => ({
        ...prev,
        [question.id]: optionKey,
      }));
    },
    [],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion || selectedPart === 7) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') {
        handleSelectOption(currentQuestion, 'A');
      } else if (key === '2' || key === 'B') {
        handleSelectOption(currentQuestion, 'B');
      } else if (key === '3' || key === 'C') {
        handleSelectOption(currentQuestion, 'C');
      } else if ((key === '4' || key === 'D') && currentQuestion.part !== 2) {
        handleSelectOption(currentQuestion, 'D');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentQuestion, selectedPart, handleSelectOption]);

  const part7PassageGroups = useMemo(() => {
    const p7 = questions.filter((q) => q.part === 7);
    const map = new Map<string, QuestionItem[]>();
    for (const q of p7) {
      const key = q.passageText || q.id;
      const existing = map.get(key) || [];
      existing.push(q);
      map.set(key, existing);
    }
    return Array.from(map.entries()).map(([passageText, items]) => ({
      passageText,
      items,
    }));
  }, [questions]);

  const activePart7Group =
    part7PassageGroups.length > 0
      ? part7PassageGroups[currentIndex % part7PassageGroups.length]
      : null;

  return (
    <div className="space-y-6">
      {/* 0. REAL-TIME EXAM & SPECIAL COMBAT ARENA BANNER */}
      <section className="bg-amber-300 border-2 border-slate-900 shadow-arcade p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-pixel px-2 py-0.5 bg-red-600 text-white rounded font-bold">
                TIMED MODES
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-950">
                ลานประลองและห้องสอบตามเวลาจริง (Real-Time Arena & Drills)
              </h2>
            </div>
            <p className="text-xs text-slate-700 mt-0.5">
              เลือกโหมดการทดสอบความเร็ว จับเวลาจริงตามมาตรฐานข้อสอบ TOEIC และมินิเกมประลองความจำ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Mode 1: Part 5 Real-Time */}
          <div className="p-3.5 bg-white border-2 border-slate-900 shadow-pixel-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-pixel font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                  PART 5 • 12 MINS
                </span>
                <Clock className="w-4 h-4 text-slate-700" />
              </div>
              <h3 className="font-bold font-display text-slate-900 text-sm mt-1.5">
                Part 5 Speed Exam (30 ข้อ)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                จำลองความเร็วไวยากรณ์ 30 ข้อ 12 นาที พร้อมแผงกระดาษคำตอบและส่งตรวจทันที
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRealTimeExamType('PART_5_REALTIME')}
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm"
            >
              เริ่มสอบ Part 5 (12 นาที)
            </button>
          </div>

          {/* Mode 2: 5-Minute Vocab Blitz */}
          <div className="p-3.5 bg-white border-2 border-slate-900 shadow-pixel-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-pixel font-bold bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-300">
                  VOCAB • 300 SECS
                </span>
                <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              </div>
              <h3 className="font-bold font-display text-slate-900 text-sm mt-1.5">
                5-Min Vocab Blitz (ประลอง 5 นาที)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                สุ่มคำศัพท์จากชุด {activeSet ? activeSet.name : 'ในบัญชี'} แข่งกับเวลา 5 นาทีสะสมคะแนน
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBlitzOpen(true)}
              className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm"
            >
              เริ่มประลองความจำ 5 นาที
            </button>
          </div>

          {/* Mode 3: Boss Survival Gauntlet */}
          <div className="p-3.5 bg-white border-2 border-slate-900 shadow-pixel-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-pixel font-bold bg-red-100 text-red-900 px-1.5 py-0.5 rounded border border-red-300">
                  SURVIVAL • 3-HP
                </span>
                <Sword className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="font-bold font-display text-slate-900 text-sm mt-1.5">
                Boss Survival (บอสเรด 3-HP)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                ปะทะ Void Wyrm (1,000 HP) พลาดได้ไม่เกิน 3 ครั้ง ตอบถูกทำดาเมจคริติคอล
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBossOpen(true)}
              className="w-full py-2 bg-red-500 hover:bg-red-400 text-white border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm"
            >
              ท้าทายบอส 3-HP
            </button>
          </div>

          {/* Mode 4: Collocation Rush */}
          <div className="p-3.5 bg-white border-2 border-slate-900 shadow-pixel-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-pixel font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-300">
                  SPEED MATCH • 60S
                </span>
                <Flame className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              </div>
              <h3 className="font-bold font-display text-slate-900 text-sm mt-1.5">
                Collocation Rush (จับคู่ 60 วิ)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                จับคู่สำนวนธุรกิจและคำกริยา-บุพบทที่ออกสอบบ่อยที่สุดภายใน 60 วินาที
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCollocationOpen(true)}
              className="w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-900 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm"
            >
              เริ่มจับคู่สำนวน 60 วิ
            </button>
          </div>
        </div>
      </section>

      {/* 1. HEADER & PART SELECTOR */}
      <section className="bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-400 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617] flex items-center justify-center shrink-0">
              <img
                src={
                  selectedPart <= 2
                    ? '/icons/icon-listening.png'
                    : '/icons/icon-reading.png'
                }
                alt=""
                className="w-8 h-8 object-contain [image-rendering:pixelated]"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                ฝึกทำโจทย์แยกพาร์ท (Listening & Reading)
              </h1>
              <p className="text-sm text-slate-300 mt-0.5">
                เลือกพาร์ทที่ต้องการฝึกซ้อม พร้อมรับคำอธิบายไวยากรณ์และเทคนิคการตัดช้อยส์ทันที
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                part: 1 as DrillPart,
                title: 'Part 1',
                sub: 'บรรยายรูปภาพ',
                icon: '/icons/icon-listening.png',
              },
              {
                part: 2 as DrillPart,
                title: 'Part 2',
                sub: 'ถาม-ตอบ 3 ตัวเลือก',
                icon: '/icons/icon-listening.png',
              },
              {
                part: 5 as DrillPart,
                title: 'Part 5',
                sub: 'เติมคำในช่องว่าง',
                icon: '/icons/icon-part-speed.png',
              },
              {
                part: 7 as DrillPart,
                title: 'Part 7',
                sub: 'อ่านอีเมลและประกาศ',
                icon: '/icons/icon-part-passage.png',
              },
            ].map((tab) => {
              const active = selectedPart === tab.part;
              return (
                <button
                  key={tab.part}
                  type="button"
                  onClick={() => {
                    setSelectedPart(tab.part);
                    setCurrentIndex(0);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 border-2 border-slate-950 text-left transition-all ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_#020617]'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <img
                    src={tab.icon}
                    alt=""
                    className="w-5 h-5 object-contain [image-rendering:pixelated]"
                  />
                  <div className="leading-tight">
                    <p className="font-display font-bold text-xs">
                      {tab.title}
                    </p>
                    <p
                      className={`text-[11px] ${
                        active ? 'text-slate-900 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {tab.sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2A. PARTS 1, 2, AND 5 DRILL VIEW */}
      {selectedPart !== 7 && currentQuestion && (
        <section className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade-lg p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-slate-900 text-amber-300 font-pixel text-xs">
                ข้อที่ {(currentIndex % partQuestions.length) + 1} /{' '}
                {partQuestions.length}
              </span>
              <span className="px-2.5 py-1 bg-amber-100 text-slate-800 border border-slate-900 text-xs font-medium">
                {currentQuestion.tag}
              </span>
            </div>

            {selectedPart === 5 && (
              <div className="flex items-center gap-3 bg-slate-900 text-white px-3.5 py-2 border-2 border-slate-950">
                <img
                  src="/icons/icon-hud-timer.png"
                  alt=""
                  className="w-4 h-4 [image-rendering:pixelated]"
                />
                <div className="w-36">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">เวลาแนะนำต่อข้อ</span>
                    <span
                      className={`font-pixel ${
                        part5TimeLeft <= 5 ? 'text-rose-400' : 'text-emerald-300'
                      }`}
                    >
                      {part5TimeLeft}s
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        part5TimeLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${(part5TimeLeft / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Listening Audio Player & Part 1 Photo */}
          {(selectedPart === 1 || selectedPart === 2) && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-amber-50 border-2 border-slate-950 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => handlePlayListeningAudio(currentQuestion)}
                    className={`inline-flex items-center gap-2 px-4 py-2 font-display font-bold text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617] ${
                      isPlayingAudio
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-400 text-slate-950'
                    }`}
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
                  <p className="text-xs sm:text-sm text-slate-300">
                    {isAnswered
                      ? 'แสดงข้อความสคริปต์เสียงครบทุกตัวเลือกแล้ว'
                      : 'กดฟังเสียงโจทย์แล้วเลือกคำตอบ — ข้อความสคริปต์จะแสดงหลังคุณเลือกคำตอบ'}
                  </p>
                </div>
              </div>

              {selectedPart === 1 && currentQuestion.imageUrl && (
                <div className="bg-white border-2 border-slate-900 p-3 max-w-xl mx-auto">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="ภาพประกอบโจทย์ Part 1"
                    className="w-full h-64 object-contain bg-slate-50"
                  />
                </div>
              )}
            </div>
          )}

          {/* Question Text */}
          <div className="bg-white border-2 border-slate-900 p-5">
            {selectedPart === 2 && !isAnswered ? (
              <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                <Headphones className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  ซ่อนโจทย์คำถามของ Part 2 ชั่วคราวเพื่อฝึกการฟังจริง — กดปุ่ม &ldquo;ฟังเสียงโจทย์&rdquo; ด้านบนแล้วเลือกคำตอบ A, B หรือ C
                </span>
              </div>
            ) : (
              <p className="font-sans text-base sm:text-lg font-semibold text-slate-900 leading-relaxed reading-measure">
                {currentQuestion.questionText}
              </p>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(['A', 'B', 'C', 'D'] as const).map((optKey, idx) => {
              if (currentQuestion.part === 2 && optKey === 'D') {
                return null;
              }

              const rawText =
                optKey === 'A'
                  ? currentQuestion.optionA
                  : optKey === 'B'
                    ? currentQuestion.optionB
                    : optKey === 'C'
                      ? currentQuestion.optionC
                      : currentQuestion.optionD;

              if (!rawText) return null;

              const isMaskedListening =
                (currentQuestion.part === 1 || currentQuestion.part === 2) &&
                !isAnswered;

              const isUserSelected = userChoice === optKey;
              const isCorrectOption = currentQuestion.correctOption === optKey;

              let buttonStyle =
                'bg-white text-slate-900 hover:bg-amber-50 border-slate-900';
              if (isAnswered) {
                if (isCorrectOption) {
                  buttonStyle =
                    'bg-emerald-400 text-slate-950 border-slate-950 font-semibold';
                } else if (isUserSelected && !isCorrectOption) {
                  buttonStyle = 'bg-rose-500 text-white border-slate-950';
                } else {
                  buttonStyle = 'bg-slate-100 text-slate-600 border-slate-300';
                }
              }

              return (
                <button
                  key={optKey}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion, optKey)}
                  className={`p-4 text-left border-2 shadow-arcade active:translate-x-[2px] active:translate-y-[2px] active:shadow-arcade-sm transition-all flex items-center justify-between gap-3 ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 shrink-0 bg-slate-900 text-amber-300 font-pixel text-xs flex items-center justify-center">
                      {optKey}
                    </span>
                    <span className="font-sans text-sm sm:text-base">
                      {isMaskedListening
                        ? `เลือกตัวเลือก (${optKey}) จากเสียงที่ได้ยิน`
                        : rawText}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isAnswered && isCorrectOption && (
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    )}
                    {isAnswered && isUserSelected && !isCorrectOption && (
                      <XCircle className="w-4 h-4 text-white" />
                    )}
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-900">
                      {idx + 1}
                    </kbd>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Thai Explanation */}
          {isAnswered && (
            <div
              className={`border-2 border-slate-900 p-5 ${
                userChoice === currentQuestion.correctOption
                  ? 'bg-emerald-50'
                  : 'bg-rose-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {userChoice === currentQuestion.correctOption ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-700" />
                )}
                <h3 className="font-bold text-sm text-slate-900">
                  {userChoice === currentQuestion.correctOption
                    ? 'ตอบถูกต้อง'
                    : `คำตอบที่ถูกต้องคือข้อ (${currentQuestion.correctOption})`}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-slate-800 leading-relaxed reading-measure">
                {currentQuestion.explanationTh}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev > 0 ? prev - 1 : partQuestions.length - 1,
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              ข้อก่อนหน้า
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedAnswers((prev) => {
                  const next = { ...prev };
                  delete next[currentQuestion.id];
                  return next;
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-950"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ล้างคำตอบข้อนี้
            </button>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
            >
              ข้อถัดไป
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* 2B. PART 7 SPLIT-SCREEN READING VIEW */}
      {selectedPart === 7 && activePart7Group && (
        <section className="space-y-4">
          <div className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                บทความธุรกิจชุดที่{' '}
                {(currentIndex % part7PassageGroups.length) + 1} จาก{' '}
                {part7PassageGroups.length}
              </h2>
              <p className="text-xs text-slate-500">
                อ่านอีเมลหรือบันทึกข้อความทางซ้าย แล้วตอบคำถามทางขวา
              </p>
            </div>

            <div className="flex items-center gap-2">
              {part7PassageGroups.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-3 py-1 text-xs font-semibold border-2 border-slate-900 ${
                    currentIndex % part7PassageGroups.length === idx
                      ? 'bg-amber-400 text-slate-950 shadow-arcade-sm'
                      : 'bg-white text-slate-700'
                  }`}
                >
                  ชุดที่ {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Business Passage Document */}
            <div className="lg:col-span-6 bg-[#fffdf7] border-2 border-slate-900 shadow-arcade-lg p-6 lg:sticky lg:top-20">
              <div className="bg-white border-2 border-slate-900 p-5 sm:p-6 font-sans text-sm sm:text-base text-slate-800 whitespace-pre-line leading-relaxed reading-measure">
                {activePart7Group.passageText}
              </div>
            </div>

            {/* Right: Questions for Passage */}
            <div className="lg:col-span-6 space-y-5">
              {activePart7Group.items.map((q, qIdx) => {
                const chosen = selectedAnswers[q.id];
                const answered = Boolean(chosen);

                return (
                  <div
                    key={q.id}
                    className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-display font-bold text-xs text-slate-700">
                        คำถามข้อที่ {qIdx + 1}
                      </span>
                      <span className="text-xs text-slate-500">{q.tag}</span>
                    </div>

                    <p className="font-sans text-base font-bold text-slate-900">
                      {q.questionText}
                    </p>

                    <div className="space-y-2.5">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const text =
                          optKey === 'A'
                            ? q.optionA
                            : optKey === 'B'
                              ? q.optionB
                              : optKey === 'C'
                                ? q.optionC
                                : q.optionD;
                        if (!text) return null;

                        const isCorrect = q.correctOption === optKey;
                        const isSelected = chosen === optKey;

                        let cls =
                          'bg-white text-slate-900 hover:bg-amber-50 border-slate-900';
                        if (answered) {
                          if (isCorrect) {
                            cls =
                              'bg-emerald-400 text-slate-950 border-slate-950 font-semibold';
                          } else if (isSelected && !isCorrect) {
                            cls = 'bg-rose-500 text-white border-slate-950';
                          } else {
                            cls =
                              'bg-slate-100 text-slate-500 border-slate-300';
                          }
                        }

                        return (
                          <button
                            key={optKey}
                            type="button"
                            onClick={() => handleSelectOption(q, optKey)}
                            className={`w-full p-3 text-left border-2 shadow-arcade-sm flex items-center justify-between gap-3 transition-all ${cls}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 shrink-0 bg-slate-900 text-amber-300 font-pixel text-xs flex items-center justify-center">
                                {optKey}
                              </span>
                              <span className="font-sans text-sm">{text}</span>
                            </div>
                            {answered && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {answered && (
                      <div className="p-4 bg-emerald-50 border-2 border-slate-900 text-sm text-slate-800 leading-relaxed">
                        <strong className="block text-slate-900 mb-1">
                          คำอธิบายเฉลย:
                        </strong>
                        {q.explanationTh}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Real-Time Exam Modal */}
      {realTimeExamType && (
        <RealTimeExamModal
          isOpen={Boolean(realTimeExamType)}
          onClose={() => setRealTimeExamType(null)}
          examType={realTimeExamType}
          allQuestions={questions}
        />
      )}

      {/* 5-Minute Vocab Blitz Modal */}
      {isBlitzOpen && activeSet && (
        <VocabBlitzGame
          allCards={cards}
          activeSet={activeSet}
          onClose={() => setIsBlitzOpen(false)}
        />
      )}

      {/* Boss Survival Gauntlet */}
      {isBossOpen && (
        <BossSurvivalModal
          isOpen={isBossOpen}
          onClose={() => setIsBossOpen(false)}
          questions={questions}
        />
      )}

      {/* Collocation Rush */}
      {isCollocationOpen && (
        <CollocationRushModal
          isOpen={isCollocationOpen}
          onClose={() => setIsCollocationOpen(false)}
        />
      )}
    </div>
  );
}
