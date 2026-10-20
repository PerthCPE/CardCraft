'use client';

// ============================================================================
// BardsEchoGame.tsx
// มินิเกม 2: เสียงสะท้อนแห่งกวี (Bard's Echo - Audio Dictation)
// - ปุ่มโทเทมเสียงตรงกลาง (กด Spacebar หรือคลิกเพื่อฟังเสียงคำศัพท์ซ้ำ)
// - ซ่อนตัวสะกดคำศัพท์ ผู้เล่นต้องฟังแล้วเลือกตัวสะกดที่ถูกต้องจาก 4 ตัวเลือก
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Clock, Volume2, Sparkles, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { FlashcardItem } from '@/data/toeic-dictionary';
import { speakEnglish } from '@/utils/speech-synthesis.util';

interface BardsEchoGameProps {
  cards: FlashcardItem[];
  timeLimitSeconds: number;
  wordCount: number;
  category: string;
  onExit: () => void;
}

export default function BardsEchoGame({
  cards,
  timeLimitSeconds,
  wordCount,
  category,
  onExit,
}: BardsEchoGameProps) {
  const [questions, setQuestions] = useState<
    Array<{
      target: FlashcardItem;
      choices: string[];
    }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);

  // Generate questions
  useEffect(() => {
    const filtered =
      category === 'ALL'
        ? cards
        : cards.filter((c) => c.category === category);
    const pool = filtered.length >= 4 ? filtered : cards;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, wordCount);

    const generated = shuffled.map((target) => {
      // Pick 3 case-insensitively unique distractors
      const seen = new Set<string>([target.word.toLowerCase()]);
      const distractors: string[] = [];
      const others = pool
        .filter((c) => c.word.toLowerCase() !== target.word.toLowerCase())
        .sort(() => Math.random() - 0.5);

      for (const card of others) {
        if (distractors.length >= 3) break;
        const low = card.word.toLowerCase();
        if (!seen.has(low)) {
          seen.add(low);
          distractors.push(card.word);
        }
      }

      const choices = [target.word, ...distractors].sort(() => Math.random() - 0.5);
      return { target, choices };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(timeLimitSeconds);
    setIsGameOver(false);
    setSelectedAnswer(null);
  }, [cards, category, wordCount, timeLimitSeconds]);

  const currentQ = questions[currentIndex];

  // Play audio on mount or index change
  const playCurrentAudio = useCallback(() => {
    if (currentQ) {
      speakEnglish(currentQ.target.word, 0.9);
    }
  }, [currentQ]);

  useEffect(() => {
    if (!isGameOver && currentQ) {
      playCurrentAudio();
    }
  }, [currentQ, isGameOver, playCurrentAudio]);

  // Spacebar to replay audio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isGameOver) {
        e.preventDefault();
        playCurrentAudio();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playCurrentAudio, isGameOver]);

  // Timer
  useEffect(() => {
    if (isGameOver || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, timeLeft]);

  const handleSelectChoice = (choice: string) => {
    if (isAnswering || isGameOver || !currentQ) return;
    setIsAnswering(true);
    setSelectedAnswer(choice);

    const isCorrect = choice === currentQ.target.word;
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
        setIsAnswering(false);
      } else {
        setIsGameOver(true);
      }
    }, 900);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-[#FFFDF7] border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Top HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-slate-900">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border-2 border-slate-900 active:translate-x-[1px] active:translate-y-[1px]"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับสู่ Arcade Hub
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-950 font-pixel text-sm border-2 border-slate-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>
              {score} / {questions.length}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 font-pixel text-sm border-2 border-slate-900 ${
              timeLeft <= 10
                ? 'bg-rose-100 text-rose-950 animate-pulse'
                : 'bg-white text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
          </div>
        </div>
      </div>

      {!isGameOver && currentQ ? (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block px-2.5 py-1 bg-sky-100 text-sky-900 border-2 border-slate-900 font-pixel text-xs">
              คำที่ {currentIndex + 1} จาก {questions.length}
            </div>
            <h2 className="text-xl font-bold font-thai text-slate-900">
              ฟังเสียงสะท้อนคำศัพท์ (Audio Dictation)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              กดปุ่มโทรโข่งหรือกด <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-700 text-xs font-mono font-bold">Space</kbd> เพื่อฟังเสียงคำศัพท์ แล้วเลือกตัวสะกดที่ถูกต้อง
            </p>
          </div>

          {/* Central Audio Totem Button */}
          <div className="flex flex-col items-center justify-center py-6 bg-[#F8F5EC] border-2 border-dashed border-slate-400 rounded-lg">
            <button
              type="button"
              onClick={playCurrentAudio}
              className="w-20 h-20 rounded-full bg-amber-400 hover:bg-amber-300 border-2 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#0f172a] transition-all"
              aria-label="ฟังเสียงคำศัพท์อีกครั้ง"
            >
              <Volume2 className="w-9 h-9 text-slate-950" />
            </button>
            <span className="text-xs font-bold font-thai text-slate-700 mt-3">
              แตะหรือกด Space เพื่อฟังเสียง
            </span>
          </div>

          {/* Meaning Hint Box */}
          <div className="bg-white border-2 border-slate-900 p-3 text-center">
            <span className="text-xs text-slate-500 font-bold block mb-0.5">
              คำแปลภาษาไทย ({currentQ.target.partOfSpeech})
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-900 font-sans">
              {currentQ.target.meaningTh}
            </p>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.choices.map((choice, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedAnswer === choice;
              const isCorrectTarget = choice === currentQ.target.word;

              let btnStyle =
                'bg-white text-slate-900 hover:bg-slate-50 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]';

              if (selectedAnswer) {
                if (isCorrectTarget) {
                  btnStyle =
                    'bg-emerald-200 text-emerald-950 border-emerald-900 shadow-[2px_2px_0px_0px_#065f46]';
                } else if (isSelected) {
                  btnStyle =
                    'bg-rose-200 text-rose-950 border-rose-900 shadow-[2px_2px_0px_0px_#9f1239]';
                }
              }

              return (
                <button
                  key={choice}
                  type="button"
                  disabled={isAnswering}
                  onClick={() => handleSelectChoice(choice)}
                  className={`p-4 border-2 font-display font-bold text-base flex items-center justify-between text-left transition-all active:translate-x-[2px] active:translate-y-[2px] ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded border-2 border-slate-900 bg-slate-100 flex items-center justify-center font-pixel text-xs text-slate-900">
                      {letter}
                    </span>
                    <span className="text-slate-950">{choice}</span>
                  </div>

                  {selectedAnswer && isCorrectTarget && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  )}
                  {selectedAnswer && isSelected && !isCorrectTarget && (
                    <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div className="bg-[#F8F5EC] border-2 border-slate-900 p-8 text-center space-y-5">
          <div className="w-14 h-14 bg-sky-400 border-2 border-slate-900 shadow-arcade-sm mx-auto flex items-center justify-center">
            <Volume2 className="w-7 h-7 text-slate-950" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-thai text-slate-900">
              จบการทดสอบเสียงสะท้อนแห่งกวี!
            </h3>
            <p className="text-sm text-slate-600">
              คุณฟังเสียงและตอบถูก{' '}
              <span className="font-bold text-sky-600 font-pixel text-base">
                {score}
              </span>{' '}
              จากทั้งหมด {questions.length} คำ
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const filtered =
                  category === 'ALL'
                    ? cards
                    : cards.filter((c) => c.category === category);
                const pool = filtered.length >= 4 ? filtered : cards;
                const shuffled = [...pool]
                  .sort(() => Math.random() - 0.5)
                  .slice(0, wordCount);
                const generated = shuffled.map((target) => {
                  const distractors = pool
                    .filter((c) => c.id !== target.id)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map((c) => c.word);
                  const choices = [target.word, ...distractors].sort(
                    () => Math.random() - 0.5,
                  );
                  return { target, choices };
                });
                setQuestions(generated);
                setCurrentIndex(0);
                setScore(0);
                setTimeLeft(timeLimitSeconds);
                setIsGameOver(false);
                setSelectedAnswer(null);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-sm border-2 border-slate-900 shadow-pixel active:translate-x-[1px] active:translate-y-[1px]"
            >
              <RotateCcw className="w-4 h-4" />
              เล่นใหม่อีกครั้ง
            </button>

            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-sm border-2 border-slate-900 shadow-pixel active:translate-x-[1px] active:translate-y-[1px]"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับสู่ Arcade Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
