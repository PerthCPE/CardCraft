'use client';

// ============================================================================
// AnagramForgeGame.tsx
// มินิเกม 6: ตีดาบเรียงตัวอักษรสะกดคำ (Anagram Forge)
// - แสดงคำแปลภาษาไทย และ Part of Speech
// - สุ่มตัวอักษรของคำศัพท์ภาษาอังกฤษมาเป็นแผ่นศิลา/ปุ่มคีย์บอร์ด (Keycaps)
// - ผู้เล่นสามารถคลิกหรือกดคีย์บอร์ดเพื่อตีเรียงตัวสะกดลงในช่องดาบให้ถูกต้อง
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Clock, Sparkles, CheckCircle2, RotateCcw, Hammer, Delete, Undo2 } from 'lucide-react';
import { FlashcardItem } from '@/data/toeic-dictionary';
import { speakEnglish } from '@/utils/speech-synthesis.util';

interface AnagramForgeGameProps {
  cards: FlashcardItem[];
  timeLimitSeconds: number;
  wordCount: number;
  category: string;
  onExit: () => void;
}

interface LetterTile {
  id: string;
  char: string;
  isUsed: boolean;
}

export default function AnagramForgeGame({
  cards,
  timeLimitSeconds,
  wordCount,
  category,
  onExit,
}: AnagramForgeGameProps) {
  const [questions, setQuestions] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Active word forging state
  const [letterTiles, setLetterTiles] = useState<LetterTile[]>([]);
  const [placedTiles, setPlacedTiles] = useState<LetterTile[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const filtered =
      category === 'ALL'
        ? cards
        : cards.filter((c) => c.category === category);
    const pool = filtered.length >= 4 ? filtered : cards;
    // Filter words between 4 and 10 letters for fun forging gameplay
    const suitable = pool.filter(
      (c) => c.word.length >= 4 && c.word.length <= 10 && !c.word.includes(' ') && !c.word.includes('-'),
    );
    const sourcePool = suitable.length >= wordCount ? suitable : pool;
    const shuffled = [...sourcePool].sort(() => Math.random() - 0.5).slice(0, wordCount);

    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(timeLimitSeconds);
    setIsGameOver(false);
  }, [cards, category, wordCount, timeLimitSeconds]);

  const currentWord = questions[currentIndex];

  // Set up letters for current word
  useEffect(() => {
    if (!currentWord) return;
    const upper = currentWord.word.toUpperCase();
    const chars = upper.split('').map((char, idx) => ({
      id: `tile-${idx}-${char}`,
      char,
      isUsed: false,
    }));

    // Shuffle letter tiles
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    setLetterTiles(shuffled);
    setPlacedTiles([]);
    setIsSuccess(false);
    setIsError(false);
  }, [currentWord]);

  // Handle tile click
  const handlePickTile = (tile: LetterTile) => {
    if (tile.isUsed || isSuccess) return;

    const nextPlaced = [...placedTiles, tile];
    setPlacedTiles(nextPlaced);
    setLetterTiles((prev) =>
      prev.map((t) => (t.id === tile.id ? { ...t, isUsed: true } : t)),
    );

    // Check if fully placed
    if (currentWord && nextPlaced.length === currentWord.word.length) {
      const spelled = nextPlaced.map((t) => t.char).join('');
      if (spelled === currentWord.word.toUpperCase()) {
        setIsSuccess(true);
        setScore((s) => s + 1);
        speakEnglish(currentWord.word, 0.95);

        setTimeout(() => {
          if (currentIndex + 1 < questions.length) {
            setCurrentIndex((i) => i + 1);
          } else {
            setIsGameOver(true);
          }
        }, 1000);
      } else {
        setIsError(true);
        setTimeout(() => {
          setIsError(false);
          // Return tiles
          setLetterTiles((prev) => prev.map((t) => ({ ...t, isUsed: false })));
          setPlacedTiles([]);
        }, 800);
      }
    }
  };

  // Undo last placed letter
  const handleUndoLast = useCallback(() => {
    if (placedTiles.length === 0 || isSuccess) return;
    const last = placedTiles[placedTiles.length - 1];
    setPlacedTiles((prev) => prev.slice(0, prev.length - 1));
    setLetterTiles((prev) =>
      prev.map((t) => (t.id === last.id ? { ...t, isUsed: false } : t)),
    );
  }, [placedTiles, isSuccess]);

  // Physical keyboard typing support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || isSuccess) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleUndoLast();
        return;
      }

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        const availableTile = letterTiles.find(
          (t) => t.char === key && !t.isUsed,
        );
        if (availableTile) {
          handlePickTile(availableTile);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [letterTiles, isGameOver, isSuccess, handleUndoLast]);

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

      {!isGameOver && currentWord ? (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-block px-2.5 py-1 bg-orange-100 text-orange-950 border-2 border-slate-900 font-pixel text-xs">
              ดาบเล่มที่ {currentIndex + 1} จาก {questions.length} • {currentWord.category}
            </div>
            <h2 className="text-xl font-bold font-thai text-slate-900">
              ตีดาบเรียงตัวอักษรสะกดคำ (Anagram Forge)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              คลิกแผ่นศิลาหรือพิมพ์ตัวอักษรเพื่อตีสะกดคำศัพท์ภาษาอังกฤษให้ถูกต้องตามคำแปล
            </p>
          </div>

          {/* Meaning & Hint Anvil Banner */}
          <div className="bg-slate-900 text-amber-400 border-2 border-slate-950 p-5 rounded text-center space-y-1.5 shadow-arcade-sm">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              ความหมายภาษาไทย [{currentWord.partOfSpeech}]
            </span>
            <div className="text-xl sm:text-2xl font-bold text-white font-sans">
              {currentWord.meaningTh}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              ความยาว: {currentWord.word.length} ตัวอักษร
            </p>
          </div>

          {/* Target Anvil Slots */}
          <div className="space-y-3">
            <div
              className={`flex flex-wrap items-center justify-center gap-2 py-4 px-3 rounded-lg border-2 border-dashed transition-all ${
                isSuccess
                  ? 'bg-emerald-50 border-emerald-500'
                  : isError
                  ? 'bg-rose-50 border-rose-500 animate-bounce'
                  : 'bg-[#F8F5EC] border-slate-400'
              }`}
            >
              {Array.from({ length: currentWord.word.length }).map((_, idx) => {
                const placed = placedTiles[idx];
                return (
                  <div
                    key={idx}
                    className={`w-11 h-12 sm:w-12 sm:h-14 border-2 border-slate-900 rounded flex items-center justify-center font-display font-bold text-xl sm:text-2xl select-none transition-all ${
                      placed
                        ? isSuccess
                          ? 'bg-emerald-300 text-emerald-950 shadow-[2px_2px_0px_0px_#065f46]'
                          : 'bg-white text-slate-950 shadow-[2px_3px_0px_0px_#0f172a]'
                        : 'bg-slate-200/50 border-dashed border-slate-400 text-transparent'
                    }`}
                  >
                    {placed ? placed.char : ''}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                disabled={placedTiles.length === 0 || isSuccess}
                onClick={handleUndoLast}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold border-2 border-slate-900 active:translate-x-[1px] active:translate-y-[1px]"
              >
                <Undo2 className="w-3.5 h-3.5" />
                ลบตัวอักษรล่าสุด (Backspace)
              </button>
            </div>
          </div>

          {/* Keyboard Keycap Letter Tiles */}
          <div className="pt-2">
            <div className="text-center text-xs font-bold text-slate-500 mb-3">
              แผ่นตัวอักษรที่มีให้เลือก (คลิกหรือกดแป้นพิมพ์):
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {letterTiles.map((tile) => {
                return (
                  <button
                    key={tile.id}
                    type="button"
                    disabled={tile.isUsed || isSuccess}
                    onClick={() => handlePickTile(tile)}
                    className={`w-11 h-12 sm:w-12 sm:h-14 border-2 border-slate-900 rounded font-display font-bold text-lg sm:text-xl flex items-center justify-center transition-all select-none ${
                      tile.isUsed
                        ? 'opacity-25 bg-slate-200 text-slate-400 cursor-not-allowed border-dashed'
                        : 'bg-white text-slate-900 shadow-[2px_3px_0px_0px_#0f172a] hover:bg-amber-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#0f172a]'
                    }`}
                  >
                    {tile.char}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div className="bg-[#F8F5EC] border-2 border-slate-900 p-8 text-center space-y-5">
          <div className="w-14 h-14 bg-orange-400 border-2 border-slate-900 shadow-arcade-sm mx-auto flex items-center justify-center">
            <Hammer className="w-7 h-7 text-slate-950" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-thai text-slate-900">
              จบการตีดาบสะกดคำ!
            </h3>
            <p className="text-sm text-slate-600">
              คุณสามารถตีดาบสะกดคำศัพท์สำเร็จ{' '}
              <span className="font-bold text-orange-600 font-pixel text-base">
                {score}
              </span>{' '}
              จากทั้งหมด {questions.length} คำ
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setTimeLeft(timeLimitSeconds);
                setIsGameOver(false);
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
