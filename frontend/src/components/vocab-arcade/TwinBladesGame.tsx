'use client';

// ============================================================================
// TwinBladesGame.tsx
// มินิเกม 4: ศึกดวลคำพ้องความหมาย (Twin Blades: Synonym Strike)
// - แสดงคำศัพท์เป้าหมาย แล้วให้เลือกคำที่มีความหมายใกล้เคียงที่สุด (Synonym Match)
// - ระบบคอมโบความเร็วสูง (Rapid-fire Streak Multiplier)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Sparkles, CheckCircle2, XCircle, RotateCcw, Swords, Flame, Volume2 } from 'lucide-react';
import { FlashcardItem } from '@/data/toeic-dictionary';
import { speakEnglish } from '@/utils/speech-synthesis.util';
import {
  getEnglishSynonym,
  hasEnglishSynonym,
  buildEnglishSynonymChoices,
} from '@/utils/toeic-synonyms.util';

interface TwinBladesGameProps {
  cards: FlashcardItem[];
  timeLimitSeconds: number;
  wordCount: number;
  category: string;
  onExit: () => void;
}

interface SynonymQuestion {
  target: FlashcardItem;
  synonym: string;
  choices: string[];
}

export default function TwinBladesGame({
  cards,
  timeLimitSeconds,
  wordCount,
  category,
  onExit,
}: TwinBladesGameProps) {
  const [questions, setQuestions] = useState<SynonymQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);

  useEffect(() => {
    // 1. กรองเฉพาะคำศัพท์ที่มีคำพ้องความหมายภาษาอังกฤษ (English Synonyms)
    const categoryCards =
      category === 'ALL'
        ? cards
        : cards.filter((c) => c.category === category);

    const cardsWithSynonyms = categoryCards.filter((c) => hasEnglishSynonym(c.word));
    // หากหมวดนั้นมีคำที่มี synonym ไม่พอ ให้ดึงจากคลังคำทั้งหมดที่มี synonym เสริม
    const allCardsWithSynonyms = cards.filter((c) => hasEnglishSynonym(c.word));
    const targetPool =
      cardsWithSynonyms.length >= wordCount
        ? cardsWithSynonyms
        : allCardsWithSynonyms.length >= wordCount
        ? allCardsWithSynonyms
        : cardsWithSynonyms.length > 0
        ? cardsWithSynonyms
        : cards;

    const shuffled = [...targetPool].sort(() => Math.random() - 0.5).slice(0, wordCount);
    const poolWords = cards.map((c) => c.word);

    const generated: SynonymQuestion[] = shuffled.map((target) => {
      // ดึงคำพ้องความหมายภาษาอังกฤษแท้ (English Synonym) เสมอ
      const rawSynonym = getEnglishSynonym(target.word) || 'similar';
      const synonym = rawSynonym.toLowerCase().trim();

      // สร้าง 4 ตัวเลือกภาษาอังกฤษล้วนที่ไม่ซ้ำกัน 100%
      const rawChoices = buildEnglishSynonymChoices(target.word, synonym, poolWords);
      const choices = [...rawChoices].sort(() => Math.random() - 0.5);

      return {
        target,
        synonym,
        choices,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(timeLimitSeconds);
    setIsGameOver(false);
    setSelectedChoice(null);
  }, [cards, category, wordCount, timeLimitSeconds]);

  const currentQ = questions[currentIndex];

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
    setSelectedChoice(choice);

    // อ่านออกเสียงคำศัพท์ที่อยู่ในตัวเลือกคำตอบที่กดทันที
    speakEnglish(choice);

    const isCorrect = choice === currentQ.synonym;
    if (isCorrect) {
      setScore((s) => s + 1);
      setCombo((c) => {
        const next = c + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
    } else {
      setCombo(0);
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelectedChoice(null);
        setIsAnswering(false);
      } else {
        setIsGameOver(true);
      }
    }, 850);
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

        <div className="flex items-center gap-3">
          {combo >= 2 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-slate-950 font-pixel text-xs border-2 border-slate-900 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>{combo}x COMBO!</span>
            </div>
          )}

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
          <div className="text-center space-y-1">
            <div className="inline-block px-2.5 py-1 bg-rose-100 text-rose-900 border-2 border-slate-900 font-pixel text-xs">
              ด่านที่ {currentIndex + 1} จาก {questions.length}
            </div>
            <h2 className="text-xl font-bold font-thai text-slate-900">
              ศึกดวลคำพ้องความหมาย (Twin Blades: Synonym Strike)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              ฟันดาบเลือกคำพ้องความหมาย (Synonym) หรือคำที่มีความหมายตรงกับคำศัพท์เป้าหมายอย่างรวดเร็ว
            </p>
          </div>

          {/* Target Word Hero Box */}
          <div className="bg-slate-900 text-amber-400 border-2 border-slate-950 p-6 rounded text-center space-y-2 shadow-arcade-sm">
            <span className="text-xs font-mono font-bold text-slate-400 block uppercase tracking-wider">
              TARGET WORD • [{currentQ.target.partOfSpeech}]
            </span>
            <div className="flex items-center justify-center gap-2.5">
              <div className="text-3xl sm:text-4xl font-bold font-display text-white tracking-wide">
                {currentQ.target.word}
              </div>
              <button
                type="button"
                onClick={() => speakEnglish(currentQ.target.word)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                title="ฟังเสียงคำศัพท์เป้าหมาย"
                aria-label="Listen to target word"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              บริบทภาษาไทย: {currentQ.target.meaningTh}
            </p>
          </div>

          {/* 4 Rapid Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.choices.map((choice, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedChoice === choice;
              const isCorrectTarget = choice === currentQ.synonym;

              let btnStyle =
                'bg-white text-slate-900 hover:bg-slate-50 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]';

              if (selectedChoice) {
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

                  {selectedChoice && isCorrectTarget && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  )}
                  {selectedChoice && isSelected && !isCorrectTarget && (
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
          <div className="w-14 h-14 bg-rose-500 text-white border-2 border-slate-900 shadow-arcade-sm mx-auto flex items-center justify-center">
            <Swords className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-thai text-slate-900">
              จบศึกดวลคำพ้องความหมาย!
            </h3>
            <p className="text-sm text-slate-600">
              ฟันดาบตอบถูก{' '}
              <span className="font-bold text-rose-600 font-pixel text-base">
                {score}
              </span>{' '}
              จากทั้งหมด {questions.length} คำ • คอมโบสูงสุด{' '}
              <span className="font-bold text-amber-600 font-pixel">{maxCombo}x</span>
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setCombo(0);
                setMaxCombo(0);
                setTimeLeft(timeLimitSeconds);
                setIsGameOver(false);
                setSelectedChoice(null);
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
