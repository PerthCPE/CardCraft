'use client';

// ============================================================================
// frontend/src/components/VocabBlitzGame.tsx
// การทดสอบการจดจำคำศัพท์ภายใน 5 นาที (5-Minute Vocab Blitz)
// - จับเวลาถอยหลัง 5:00 นาที (300 วินาที)
// - ดึงคำศัพท์สุ่มจาก "ชุดการ์ดที่ใช้งานอยู่" (Active Deck) ในบัญชี
// - ระบบคอมโบ Streak Multiplier และคิดคะแนนความแม่นยำ + ความเร็ว (WPM)
// - ปุ่มลัดคีย์บอร์ด 1-4 หรือ A-D ตอบได้อย่างรวดเร็ว
// - รายงานผลพร้อมจัดอันดับ RPG Rank และสรุปคำที่ตอบผิดเพื่อนำไปทบทวน
// ============================================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { FlashcardItem } from '@/data/toeic-dictionary';
import {
  CardSet,
  getBuiltInPresetSets,
  getSavedCustomSets,
} from '@/utils/card-sets';
import { speakEnglish, cancelSpeech } from '@/utils/speech-synthesis.util';
import { formatDecimal } from '@/utils/number-format.util';

interface VocabBlitzGameProps {
  allCards: FlashcardItem[];
  activeSet: CardSet;
  onClose: () => void;
  onFinish?: (results: {
    totalAttempted: number;
    totalCorrect: number;
    accuracy: number;
    missedWords: FlashcardItem[];
  }) => void;
}

export default function VocabBlitzGame({
  allCards,
  activeSet,
  onClose,
  onFinish,
}: VocabBlitzGameProps) {
  // Game states: 'READY' | 'PLAYING' | 'FINISHED'
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'FINISHED'>(
    'READY',
  );
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 นาที = 300 วินาที

  // ให้ผู้ใช้เลือกชุดคำศัพท์สำหรับทดสอบได้อิสระในหน้า READY
  const [selectedSetId, setSelectedSetId] = useState<string>(activeSet.id);
  const [savedSets] = useState<CardSet[]>(() => getSavedCustomSets());
  const presets = useMemo(() => getBuiltInPresetSets(allCards), [allCards]);

  const allAvailableSets = useMemo(() => {
    const list = [...savedSets];
    if (!list.some((s) => s.id === activeSet.id)) {
      list.unshift(activeSet);
    }
    for (const p of presets) {
      if (!list.some((s) => s.id === p.id)) {
        list.push(p);
      }
    }
    return list;
  }, [savedSets, activeSet, presets]);

  const currentSet = useMemo(() => {
    return allAvailableSets.find((s) => s.id === selectedSetId) || activeSet;
  }, [allAvailableSets, selectedSetId, activeSet]);

  // คลังการ์ดสำหรับเล่นเกมนี้ (ดึงจาก currentSet)
  const deckCards = useMemo(() => {
    const cardIdSet = new Set(currentSet.cardIds);
    const matched = allCards.filter((c) => cardIdSet.has(c.id));
    return matched.length > 0 ? matched : allCards.slice(0, 50);
  }, [allCards, currentSet]);

  const [questionPool, setQuestionPool] = useState<FlashcardItem[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [correctChoiceIndex, setCorrectChoiceIndex] = useState<number>(0);

  // สถิติการเล่น
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [missedList, setMissedList] = useState<FlashcardItem[]>([]);

  // Feedback ชั่วคราวเมื่อกดตอบ
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);

  // เริ่มต้นสุ่มคำถามเมื่อเข้าสู่เกม
  const prepareNewQuestion = useCallback(
    (index: number, pool: FlashcardItem[]) => {
      if (pool.length === 0) return;
      const currentCard = pool[index % pool.length];

      // สร้างตัวลวง 3 ตัวจากคลังคำศัพท์
      const otherMeanings = allCards
        .filter((c) => c.id !== currentCard.id)
        .map((c) => c.meaningTh);

      // สุ่มตัวลวง 3 ตัว
      const shuffledOthers = [...otherMeanings].sort(() => 0.5 - Math.random());
      const distractors = shuffledOthers.slice(0, 3);

      const allFour = [currentCard.meaningTh, ...distractors].sort(
        () => 0.5 - Math.random(),
      );
      const correctIdx = allFour.indexOf(currentCard.meaningTh);

      setChoices(allFour);
      setCorrectChoiceIndex(correctIdx);
      setSelectedAnswer(null);
      setIsAnswerLocked(false);
    },
    [allCards],
  );

  const startGame = () => {
    // สับการ์ดใน pool
    const shuffled = [...deckCards].sort(() => 0.5 - Math.random());
    setQuestionPool(shuffled);
    setQuestionIndex(0);
    setTimeLeft(300);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setMaxStreak(0);
    setMissedList([]);
    setGameState('PLAYING');
    prepareNewQuestion(0, shuffled);
  };

  // Timer Countdown 5:00
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('FINISHED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // เลื่อนไปข้อถัดไปทันที (ใช้เมื่อครบเวลาหน่วง หรือผู้ใช้กด Space/Enter/คลิกข้าม)
  const advanceToNextQuestion = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    const nextIdx = questionIndex + 1;
    setQuestionIndex(nextIdx);
    prepareNewQuestion(nextIdx, questionPool);
  }, [questionIndex, questionPool, prepareNewQuestion]);

  const handleSelectChoice = useCallback(
    (choiceIdx: number) => {
      if (gameState !== 'PLAYING' || isAnswerLocked) return;

      setIsAnswerLocked(true);
      setSelectedAnswer(choiceIdx);

      const currentCard = questionPool[questionIndex % questionPool.length];
      const isCorrect = choiceIdx === correctChoiceIndex;

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
        setStreak((prev) => {
          const next = prev + 1;
          if (next > maxStreak) setMaxStreak(next);
          return next;
        });
      } else {
        setWrongCount((prev) => prev + 1);
        setStreak(0);
        setMissedList((prev) => [...prev, currentCard]);
      }

      // เพิ่มเวลาหน่วงในการเปลี่ยนข้อ: ตอบถูก 1,100ms / ตอบผิด 2,200ms เพื่อให้ผู้ใช้มีเวลาดูและจดจำคำตอบที่ถูกต้อง
      // (ผู้ใช้สามารถกด Space/Enter หรือคลิกปุ่มเพื่อข้ามไปข้อถัดไปได้ทันที)
      const delayMs = isCorrect ? 1100 : 2200;

      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      transitionTimerRef.current = setTimeout(() => {
        advanceToNextQuestion();
      }, delayMs);
    },
    [
      gameState,
      isAnswerLocked,
      questionPool,
      questionIndex,
      correctChoiceIndex,
      maxStreak,
      advanceToNextQuestion,
    ],
  );

  // Keyboard Shortcuts (1-4 หรือ A-D ตอบคำถาม, และ Space/Enter เพื่อข้ามการหน่วงเวลา)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswerLocked) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          advanceToNextQuestion();
        }
        return;
      }

      if (e.key === '1' || e.key.toLowerCase() === 'a') {
        handleSelectChoice(0);
      } else if (e.key === '2' || e.key.toLowerCase() === 'b') {
        handleSelectChoice(1);
      } else if (e.key === '3' || e.key.toLowerCase() === 'c') {
        handleSelectChoice(2);
      } else if (e.key === '4' || e.key.toLowerCase() === 'd') {
        handleSelectChoice(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isAnswerLocked, handleSelectChoice, advanceToNextQuestion]);

  useEffect(() => {
    return () => {
      cancelSpeech();
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // สังเคราะห์เสียงอ่านคำศัพท์
  const handlePronounce = (text: string) => {
    cancelSpeech();
    speakEnglish(text, { rate: 0.82 });
  };

  // คำนวณอันดับ RPG Rank จากจำนวนคำที่ตอบถูก
  const rankEvaluation = useMemo(() => {
    if (correctCount >= 50) {
      return {
        title: 'Deity Omniscience (ระดับเทพเจ้าแห่งความจำ)',
        badgeColor: 'bg-amber-400 text-slate-900 border-amber-600',
        expGained: 500,
      };
    } else if (correctCount >= 35) {
      return {
        title: 'High Paladin of Memory (พาลาดินความจำขั้นสูง)',
        badgeColor: 'bg-emerald-300 text-slate-900 border-emerald-600',
        expGained: 350,
      };
    } else if (correctCount >= 20) {
      return {
        title: 'Spell Squire Recall (สไควร์ท่องจำคล่องแคล่ว)',
        badgeColor: 'bg-sky-300 text-slate-900 border-sky-600',
        expGained: 200,
      };
    }
    return {
      title: 'Novice Recollector (นักท่องศัพท์เริ่มต้น)',
      badgeColor: 'bg-slate-200 text-slate-800 border-slate-400',
      expGained: 100,
    };
  }, [correctCount]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalAttempted = correctCount + wrongCount;
  const accuracy =
    totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
  const elapsedMinutes = (300 - timeLeft) / 60;
  const wpm =
    elapsedMinutes > 0 ? Math.round(correctCount / elapsedMinutes) : correctCount;

  const currentCard =
    questionPool.length > 0
      ? questionPool[questionIndex % questionPool.length]
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] rounded-none overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Strip */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-400 border border-amber-300 text-slate-900 flex items-center justify-center font-pixel shadow-pixel-sm">
              <Zap className="w-5 h-5 fill-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-amber-300">
                  5-Minute Vocab Blitz (ประลองความจำ 5 นาที)
                </h2>
                <span className="text-[10px] font-pixel px-1.5 py-0.5 bg-red-600 text-white rounded">
                  300s SPEED
                </span>
              </div>
              <p className="text-xs text-slate-300">
                ชุดการ์ด: <span className="text-amber-200 font-semibold">{currentSet.name}</span> ({deckCards.length} คำ)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* READY STATE */}
        {gameState === 'READY' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border-2 border-slate-900 flex items-center justify-center shadow-pixel">
              <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-2xl font-bold font-display text-slate-900">
                พร้อมทดสอบความเร็วและความจำหรือยัง?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-body">
                คุณจะมีเวลา <span className="font-bold text-slate-900">5 นาทีเต็ม (300 วินาที)</span> ในการจำและตอบความหมายคำศัพท์ TOEIC 700+ จากชุด <span className="font-semibold text-indigo-700">{currentSet.name}</span> ให้ได้จำนวนคำมากที่สุด!
              </p>
            </div>

            {/* Deck Selector inside READY screen */}
            <div className="max-w-md mx-auto p-3.5 bg-slate-50 border-2 border-slate-900 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  เลือกชุดคำศัพท์สำหรับทดสอบ:
                </span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 border border-indigo-200 rounded">
                  {deckCards.length} คำ
                </span>
              </div>

              <select
                value={currentSet.id}
                onChange={(e) => setSelectedSetId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold border-2 border-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {savedSets.length > 0 && (
                  <optgroup label="── ชุดที่คุณสร้างและบันทึกไว้ ──">
                    {savedSets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.size} คำ)
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="── ชุดมาตรฐาน (Presets) ──">
                  {presets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.size} คำ)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Quick Rules */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-left">
              <div className="p-3 bg-amber-50 border-2 border-slate-900">
                <div className="text-xs font-bold text-amber-800 font-display">
                  1. เลือกตอบเร็ว
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  กดปุ่มตัวเลข 1-4 หรือ A-D ได้ทันที
                </div>
              </div>
              <div className="p-3 bg-sky-50 border-2 border-slate-900">
                <div className="text-xs font-bold text-sky-800 font-display">
                  2. คอมโบต่อเนื่อง
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  ตอบถูกติดกันเพื่อสะสม Streak Combo
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border-2 border-slate-900">
                <div className="text-xs font-bold text-emerald-800 font-display">
                  3. บันทึกคำที่ผิด
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  คำที่ตอบผิดจะถูกแยกไว้ให้ทบทวน
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="py-4 px-8 bg-amber-400 hover:bg-amber-300 text-slate-900 border-2 border-slate-900 font-display text-base font-bold shadow-pixel active:translate-x-[2px] active:translate-y-[2px] transition-all inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-900" />
              เริ่มการทดสอบ 5 นาที (Start Blitz)
            </button>
          </div>
        )}

        {/* PLAYING STATE */}
        {gameState === 'PLAYING' && currentCard && (
          <div className="flex-1 flex flex-col p-6 space-y-5">
            {/* HUD Bar */}
            <div className="flex items-center justify-between p-3 bg-slate-100 border-2 border-slate-900">
              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock
                  className={`w-5 h-5 ${
                    timeLeft <= 30
                      ? 'text-red-600 animate-bounce'
                      : 'text-slate-700'
                  }`}
                />
                <span
                  className={`text-xl font-pixel font-bold tracking-wider ${
                    timeLeft <= 30 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {formattedTime}
                </span>
              </div>

              {/* Score HUD */}
              <div className="flex items-center gap-4 text-xs font-mono font-bold">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{correctCount} คำ</span>
                </div>
                {streak >= 2 && (
                  <div className="flex items-center gap-1 text-amber-600 animate-pulse bg-amber-100 px-2 py-0.5 border border-amber-400 rounded">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{streak}x STREAK!</span>
                  </div>
                )}
                <div className="text-slate-500">
                  ข้อที่ {questionIndex + 1}
                </div>
              </div>

              {/* End early button */}
              <button
                onClick={() => setGameState('FINISHED')}
                className="text-xs text-slate-500 hover:text-red-600 underline font-medium"
              >
                หยุดก่อนเวลา
              </button>
            </div>

            {/* Time progress bar */}
            <div className="w-full h-2 bg-slate-200 border border-slate-900 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 30 ? 'bg-red-500' : 'bg-amber-400'
                }`}
                style={{ width: `${(timeLeft / 300) * 100}%` }}
              />
            </div>

            {/* Target English Word Display */}
            <div className="p-6 bg-amber-50 border-2 border-slate-900 text-center space-y-2 relative">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-900 text-white rounded">
                  {currentCard.category}
                </span>
                <span className="text-xs italic text-slate-600 font-mono">
                  {currentCard.partOfSpeech}
                </span>
                <button
                  type="button"
                  onClick={() => handlePronounce(currentCard.word)}
                  className="p-1 text-slate-600 hover:text-slate-900 hover:bg-amber-200 rounded"
                  title="ฟังการออกเสียง"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
                {currentCard.word}
              </h1>

              <p className="text-xs text-slate-500 italic max-w-md mx-auto line-clamp-1">
                &ldquo;{currentCard.exampleEn}&rdquo;
              </p>
            </div>

            {/* 4 Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {choices.map((choice, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === correctChoiceIndex;

                let btnStyle =
                  'border-slate-900 bg-white text-slate-900 hover:bg-slate-100 shadow-pixel-sm';

                if (isAnswerLocked) {
                  if (isCorrect) {
                    btnStyle =
                      'border-emerald-700 bg-emerald-100 text-emerald-950 font-bold ring-2 ring-emerald-500 shadow-pixel';
                  } else if (isSelected && !isCorrect) {
                    btnStyle =
                      'border-rose-700 bg-rose-100 text-rose-950 line-through opacity-90';
                  } else {
                    btnStyle =
                      'border-slate-300 bg-slate-50 text-slate-400 opacity-60';
                  }
                }

                const keyLabels = ['1 / A', '2 / B', '3 / C', '4 / D'];

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerLocked}
                    onClick={() => handleSelectChoice(idx)}
                    className={`p-4 border-2 text-left font-body text-sm transition-all flex items-start gap-3 active:translate-x-[2px] active:translate-y-[2px] ${btnStyle}`}
                  >
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-pixel font-bold bg-slate-200 border border-slate-700 rounded text-slate-800 shrink-0">
                      {keyLabels[idx]}
                    </span>
                    <span className="flex-1 font-medium leading-snug">
                      {choice}
                    </span>
                    {isAnswerLocked && isCorrect && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded border border-emerald-500 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        คำตอบที่ถูก
                      </span>
                    )}
                    {isAnswerLocked && isSelected && !isCorrect && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-200 px-2 py-0.5 rounded border border-rose-500 shrink-0">
                        <XCircle className="w-3.5 h-3.5 text-rose-700" />
                        คุณเลือกข้อนี้
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback Banner during transition pause */}
            {isAnswerLocked && (
              <div
                onClick={advanceToNextQuestion}
                className={`p-3.5 border-2 border-slate-900 shadow-pixel-sm flex flex-col sm:flex-row items-center justify-between gap-2.5 cursor-pointer transition-all ${
                  selectedAnswer === correctChoiceIndex
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-800'
                    : 'bg-rose-100 text-rose-950 border-rose-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {selectedAnswer === correctChoiceIndex ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      <span className="font-bold text-sm">
                        ถูกต้อง! เยี่ยมมาก (+1 คอมโบ)
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                      <div>
                        <span className="font-bold text-sm block">
                          ตอบผิด! คำตอบที่ถูกต้องคือ:
                        </span>
                        <span className="text-xs text-rose-900 font-semibold">
                          &ldquo;{choices[correctChoiceIndex]}&rdquo;
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-sans hidden sm:inline">
                    กำลังไปข้อถัดไป...
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      advanceToNextQuestion();
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded shadow-sm flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <span>ข้อถัดไป</span>
                    <kbd className="px-1 py-0.2 bg-slate-700 text-amber-300 text-[10px] font-mono rounded">
                      SPACE
                    </kbd>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FINISHED STATE */}
        {gameState === 'FINISHED' && (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-amber-100 border-2 border-slate-900 shadow-pixel">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-900">
                หมดเวลาการประลอง 5 นาที!
              </h3>
              <p className="text-sm text-slate-600">
                คุณทดสอบความจำคำศัพท์จากชุด {activeSet.name} เสร็จสิ้น
              </p>
            </div>

            {/* Rank Card */}
            <div
              className={`p-4 border-2 border-slate-900 text-center shadow-pixel ${rankEvaluation.badgeColor}`}
            >
              <div className="text-xs uppercase font-bold tracking-wider">
                ฉายาความจำที่ได้รับ (Earned Title):
              </div>
              <div className="text-lg sm:text-xl font-bold font-display mt-0.5">
                {rankEvaluation.title}
              </div>
              <div className="text-xs font-mono mt-1 opacity-90">
                + {rankEvaluation.expGained} Guild EXP สะสมสู่ระดับ 700+
              </div>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border-2 border-slate-900 text-center">
                <div className="text-2xl font-bold font-pixel text-emerald-600">
                  {correctCount}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  คำที่จำได้แม่น
                </div>
              </div>
              <div className="p-3 bg-slate-50 border-2 border-slate-900 text-center">
                <div className="text-2xl font-bold font-pixel text-slate-900">
                  {formatDecimal(accuracy)}%
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  ความแม่นยำ (Accuracy)
                </div>
              </div>
              <div className="p-3 bg-slate-50 border-2 border-slate-900 text-center">
                <div className="text-2xl font-bold font-pixel text-amber-600">
                  {maxStreak}x
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Max Streak ต่อเนื่อง
                </div>
              </div>
              <div className="p-3 bg-slate-50 border-2 border-slate-900 text-center">
                <div className="text-2xl font-bold font-pixel text-indigo-600">
                  {formatDecimal(wpm)}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  คำต่อนาที (WPM)
                </div>
              </div>
            </div>

            {/* Missed words list */}
            {missedList.length > 0 && (
              <div className="space-y-2 border-t-2 border-slate-900 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold font-display text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    คำศัพท์ที่ควรทบทวนเพิ่ม ({missedList.length} คำ):
                  </h4>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {missedList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-red-50 border border-red-200 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {item.word}
                        </span>
                        <span className="text-[10px] text-slate-500 italic">
                          ({item.partOfSpeech})
                        </span>
                      </div>
                      <span className="text-slate-700 font-medium">
                        {item.meaningTh}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 border-2 border-slate-900 font-display font-bold shadow-pixel active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                เล่นรอบใหม่ (Re-Blitz)
              </button>
              <button
                onClick={onClose}
                className="py-3 px-6 bg-slate-200 hover:bg-slate-300 text-slate-800 border-2 border-slate-900 font-bold"
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
