'use client';

// ============================================================================
// RuneMatchGame.tsx
// มินิเกม 1: กระดานจับคู่ศิลาคำศัพท์ (Rune Match)
// - ตารางศิลา 12 แผ่น (6 คู่: ศัพท์ภาษาอังกฤษ 6 คำ + คำแปลภาษาไทย 6 คำ)
// - สุ่มจัดเรียงบนกระดาน 4x3 (หรือ 3x4 บนมือถือ)
// - จับเวลาถอยหลัง และเคลียร์กระดานเพื่อสะสมแต้ม
// ============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Clock, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { FlashcardItem } from '@/data/toeic-dictionary';
import { speakEnglish } from '@/utils/speech-synthesis.util';

interface RuneTile {
  id: string; // e.g., "en-card-01" or "th-card-01"
  cardId: string;
  type: 'EN' | 'TH';
  text: string;
  isMatched: boolean;
}

interface RuneMatchGameProps {
  cards: FlashcardItem[];
  timeLimitSeconds: number;
  wordCount: number;
  category: string;
  onExit: () => void;
}

export default function RuneMatchGame({
  cards,
  timeLimitSeconds,
  wordCount,
  category,
  onExit,
}: RuneMatchGameProps) {
  const [roundWords, setRoundWords] = useState<FlashcardItem[]>([]);
  const [tiles, setTiles] = useState<RuneTile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [totalPairsMatched, setTotalPairsMatched] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [wrongPairIds, setWrongPairIds] = useState<[string, string] | null>(null);

  // Initialize a round of 6 pairs (12 tiles)
  const startNewBoard = (availableCards: FlashcardItem[]) => {
    if (availableCards.length < 6) return;
    const shuffledPool = [...availableCards].sort(() => Math.random() - 0.5);
    const chosenSix = shuffledPool.slice(0, 6);
    setRoundWords(chosenSix);

    const newTiles: RuneTile[] = [];
    chosenSix.forEach((c) => {
      newTiles.push({
        id: `en-${c.id}`,
        cardId: c.id,
        type: 'EN',
        text: c.word,
        isMatched: false,
      });
      newTiles.push({
        id: `th-${c.id}`,
        cardId: c.id,
        type: 'TH',
        text: c.meaningTh,
        isMatched: false,
      });
    });

    // Shuffle tiles
    newTiles.sort(() => Math.random() - 0.5);
    setTiles(newTiles);
    setSelectedTileId(null);
    setMatchedPairsCount(0);
  };

  useEffect(() => {
    const filtered =
      category === 'ALL'
        ? cards
        : cards.filter((c) => c.category === category);
    const pool = filtered.length >= 6 ? filtered : cards;
    startNewBoard(pool);
    setTimeLeft(timeLimitSeconds);
    setIsGameOver(false);
    setTotalPairsMatched(0);
  }, [cards, category, timeLimitSeconds]);

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

  // Handle tile click
  const handleTileClick = (tile: RuneTile) => {
    if (tile.isMatched || isGameOver || wrongPairIds) return;

    if (tile.type === 'EN') {
      speakEnglish(tile.text, 0.95);
    }

    if (!selectedTileId) {
      setSelectedTileId(tile.id);
      return;
    }

    if (selectedTileId === tile.id) {
      setSelectedTileId(null);
      return;
    }

    const firstTile = tiles.find((t) => t.id === selectedTileId);
    if (!firstTile) {
      setSelectedTileId(tile.id);
      return;
    }

    // Check if matching pair
    if (firstTile.cardId === tile.cardId && firstTile.type !== tile.type) {
      // MATCH!
      setTiles((prev) =>
        prev.map((t) =>
          t.cardId === tile.cardId ? { ...t, isMatched: true } : t,
        ),
      );
      setSelectedTileId(null);
      setMatchedPairsCount((prev) => {
        const next = prev + 1;
        setTotalPairsMatched((tp) => tp + 1);
        if (next === 6) {
          // Board Cleared! Spawn next board immediately
          setTimeout(() => {
            const filtered =
              category === 'ALL'
                ? cards
                : cards.filter((c) => c.category === category);
            startNewBoard(filtered.length >= 6 ? filtered : cards);
          }, 400);
        }
        return next;
      });
    } else {
      // WRONG PAIR
      setWrongPairIds([selectedTileId, tile.id]);
      setTimeout(() => {
        setWrongPairIds(null);
        setSelectedTileId(null);
      }, 700);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-[#FFFDF7] border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Top Status HUD */}
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
            <span>{totalPairsMatched} คู่</span>
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

      {/* Main Game Arena */}
      {!isGameOver ? (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold font-thai text-slate-900">
              กระดานจับคู่ศิลาคำศัพท์ (Rune Match)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              แตะจับคู่คำศัพท์ภาษาอังกฤษกับความหมายภาษาไทยให้ครบทั้ง 6 คู่เพื่อปลดล็อกกระดานถัดไป
            </p>
          </div>

          {/* 4x3 Stone Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {tiles.map((tile) => {
              const isSelected = selectedTileId === tile.id;
              const isWrong =
                wrongPairIds &&
                (wrongPairIds[0] === tile.id || wrongPairIds[1] === tile.id);

              if (tile.isMatched) {
                return (
                  <div
                    key={tile.id}
                    className="h-20 sm:h-24 rounded border-2 border-dashed border-emerald-400 bg-emerald-50/50 flex flex-col items-center justify-center p-2 text-center opacity-60 transition-all select-none"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-emerald-800 line-clamp-2">
                      {tile.text}
                    </span>
                  </div>
                );
              }

              let tileStyle =
                'bg-white text-slate-900 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-slate-50';
              if (isSelected) {
                tileStyle =
                  'bg-amber-300 text-slate-950 border-slate-950 shadow-[1px_1px_0px_0px_#0f172a] translate-x-[2px] translate-y-[2px] ring-2 ring-amber-400';
              } else if (isWrong) {
                tileStyle =
                  'bg-rose-100 text-rose-950 border-rose-600 shadow-[2px_2px_0px_0px_#e11d48] animate-bounce';
              }

              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => handleTileClick(tile)}
                  className={`h-20 sm:h-24 p-3 border-2 font-display font-bold text-xs sm:text-sm flex items-center justify-center text-center transition-all active:translate-x-[2px] active:translate-y-[2px] select-none ${tileStyle}`}
                >
                  <span className="line-clamp-3 leading-snug">{tile.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div className="bg-[#F8F5EC] border-2 border-slate-900 p-8 text-center space-y-5">
          <div className="w-14 h-14 bg-amber-400 border-2 border-slate-900 shadow-arcade-sm mx-auto flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-slate-950" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-thai text-slate-900">
              หมดเวลา! ผลการประลองศิลาคำศัพท์
            </h3>
            <p className="text-sm text-slate-600">
              คุณสามารถจับคู่คำศัพท์ได้ทั้งหมด{' '}
              <span className="font-bold text-amber-600">{totalPairsMatched}</span> คู่
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
                startNewBoard(filtered.length >= 6 ? filtered : cards);
                setTimeLeft(timeLimitSeconds);
                setIsGameOver(false);
                setTotalPairsMatched(0);
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
