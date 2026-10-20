'use client';

// ============================================================================
// ContextClozeGame.tsx
// มินิเกม 5: เติมคำตามบริบทประโยคธุรกิจ (Context Cloze Strike)
// - นำประโยคตัวอย่างข้อสอบธุรกิจ (exampleEn) ของคำศัพท์ มาซ่อนคำเป้าหมายเป็นช่องว่าง (_____)
// - ผู้เล่นต้องอ่านจับใจความบริบท แล้วเลือกคำศัพท์ที่ถูกต้องตรงตามความหมาย
// ============================================================================

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Sparkles, CheckCircle2, XCircle, RotateCcw, FileText } from 'lucide-react';
import { FlashcardItem } from '@/data/toeic-dictionary';
import { speakEnglish } from '@/utils/speech-synthesis.util';

interface ContextClozeGameProps {
  cards: FlashcardItem[];
  timeLimitSeconds: number;
  wordCount: number;
  category: string;
  onExit: () => void;
}

interface ClozeQuestion {
  target: FlashcardItem;
  sentenceWithBlank: string;
  choices: string[];
}

export default function ContextClozeGame({
  cards,
  timeLimitSeconds,
  wordCount,
  category,
  onExit,
}: ContextClozeGameProps) {
  const [questions, setQuestions] = useState<ClozeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);

  useEffect(() => {
    const filtered =
      category === 'ALL'
        ? cards
        : cards.filter((c) => c.category === category);
    const pool = filtered.length >= 4 ? filtered : cards;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, wordCount);

    const generated: ClozeQuestion[] = shuffled.map((target) => {
      const regex = new RegExp(`\\b${target.word}\\b`, 'i');
      let sentence = target.exampleEn;
      if (regex.test(sentence)) {
        sentence = sentence.replace(regex, '________');
      } else {
        sentence = `The executive board must ________ the quarterly budget proposal before Monday.`;
      }

      // 3 distractors
      const distractors = pool
        .filter((c) => c.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((c) => c.word);

      const choices = [target.word, ...distractors].sort(() => Math.random() - 0.5);

      return {
        target,
        sentenceWithBlank: sentence,
        choices,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
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

    const isCorrect = choice.toLowerCase() === currentQ.target.word.toLowerCase();
    if (isCorrect) {
      setScore((s) => s + 1);
      speakEnglish(currentQ.target.word, 0.95);
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelectedChoice(null);
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
          <div className="text-center space-y-1">
            <div className="inline-block px-2.5 py-1 bg-teal-100 text-teal-900 border-2 border-slate-900 font-pixel text-xs">
              ข้อที่ {currentIndex + 1} จาก {questions.length} • {currentQ.target.category}
            </div>
            <h2 className="text-xl font-bold font-thai text-slate-900">
              เติมคำตามบริบทประโยคธุรกิจ (Context Cloze)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              อ่านบริบทประโยค แล้วเลือกคำศัพท์ที่ถูกต้องที่สุดเพื่อเติมลงในช่องว่าง
            </p>
          </div>

          {/* Recessed Parchment Well with Sentence */}
          <div className="bg-[#F8F5EC] border-2 border-dashed border-slate-400 p-5 rounded-lg space-y-3">
            <p className="text-base sm:text-lg text-slate-900 font-serif leading-relaxed">
              {currentQ.sentenceWithBlank}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-300">
              <span>คำใบ้ความหมาย: <strong>{currentQ.target.meaningTh}</strong></span>
              <span className="font-mono text-teal-800 font-bold">[{currentQ.target.partOfSpeech}]</span>
            </div>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.choices.map((choice, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedChoice === choice;
              const isCorrectTarget = choice.toLowerCase() === currentQ.target.word.toLowerCase();

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
          <div className="w-14 h-14 bg-teal-400 border-2 border-slate-900 shadow-arcade-sm mx-auto flex items-center justify-center">
            <FileText className="w-7 h-7 text-slate-950" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-thai text-slate-900">
              จบการเติมคำตามบริบทธุรกิจ!
            </h3>
            <p className="text-sm text-slate-600">
              คุณทำคะแนนได้{' '}
              <span className="font-bold text-teal-600 font-pixel text-base">
                {score}
              </span>{' '}
              จากทั้งหมด {questions.length} ข้อ
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
