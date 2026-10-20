'use client';

// ============================================================================
// WordAlchemistGame.tsx
// มินิเกม 3: แปรธาตุชนิดของคำ (Word Alchemist - Part of Speech Drill)
// - ทดสอบการวิเคราะห์โครงสร้างประโยคไวยากรณ์ (Noun, Verb, Adjective, Adverb)
// - เจาะจงฝึกการตัดช้อยส์รูปคำ (Word Family & Derivatives) ในข้อสอบ TOEIC
// ============================================================================

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Sparkles, CheckCircle2, XCircle, RotateCcw, Zap } from 'lucide-react';
import { FlashcardItem } from '@/data/toeic-dictionary';

interface WordAlchemistGameProps {
  cards: FlashcardItem[];
  timeLimitSeconds: number;
  wordCount: number;
  category: string;
  onExit: () => void;
}

interface AlchemistItem {
  card: FlashcardItem;
  sentenceWithBlank: string;
  correctWord: string;
  correctPosNameTh: string;
  correctPosTag: 'noun' | 'verb' | 'adjective' | 'adverb';
  distractorChoices: string[];
  explanation: string;
}

export default function WordAlchemistGame({
  cards,
  timeLimitSeconds,
  wordCount,
  category,
  onExit,
}: WordAlchemistGameProps) {
  const [items, setItems] = useState<AlchemistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);

  // Helper to derive Word Family variants from a root word
  const deriveWordFamily = (word: string, pos: string) => {
    const clean = word.toLowerCase().trim();
    const root = clean.replace(/(tion|ing|ed|ly|able|ive|al|ment|ize|ise|ity|ness)$/, '');

    let noun = `${root}ion`;
    let verb = `${root}ize`;
    let adj = `${root}ive`;
    let adv = `${root}ively`;

    if (pos.includes('v')) {
      verb = clean;
      noun = `${root}tion`;
      adj = `${root}able`;
      adv = `${root}ably`;
    } else if (pos.includes('n')) {
      noun = clean;
      verb = `${root}ify`;
      adj = `${root}al`;
      adv = `${root}ally`;
    } else if (pos.includes('adj')) {
      adj = clean;
      noun = `${root}ness`;
      adv = `${clean}ly`;
      verb = `${root}ize`;
    } else if (pos.includes('adv')) {
      adv = clean;
      adj = clean.replace(/ly$/, '');
      noun = `${adj}ness`;
      verb = `${adj}ize`;
    }

    return { noun, verb, adj, adv };
  };

  useEffect(() => {
    const filtered =
      category === 'ALL'
        ? cards
        : cards.filter((c) => c.category === category);
    const pool = filtered.length >= 4 ? filtered : cards;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, wordCount);

    const generated: AlchemistItem[] = shuffled.map((c) => {
      // Replace target word in exampleEn with a prominent blank
      const regex = new RegExp(`\\b${c.word}\\b`, 'i');
      let sentence = c.exampleEn;
      if (regex.test(sentence)) {
        sentence = sentence.replace(regex, '_______');
      } else {
        sentence = `The supervisor asked the department to _______ the current project timeline.`;
      }

      const family = deriveWordFamily(c.word, c.partOfSpeech);
      const isVerb = c.partOfSpeech.includes('v');
      const isNoun = c.partOfSpeech.includes('n');
      const isAdj = c.partOfSpeech.includes('adj');

      let correctPosTag: 'noun' | 'verb' | 'adjective' | 'adverb' = 'verb';
      let correctPosNameTh = 'กริยา (Verb)';
      let explanation = `ตำแหน่งช่องว่างต้องการคำกริยา (Verb) เพื่อทำหน้าที่เป็นภาคแสดงหลักของประโยค`;

      if (isNoun) {
        correctPosTag = 'noun';
        correctPosNameTh = 'คำนาม (Noun)';
        explanation = `ตำแหน่งช่องว่างต้องการคำนาม (Noun) เพื่อทำหน้าที่เป็นประธานหรือกรรมของประโยค`;
      } else if (isAdj) {
        correctPosTag = 'adjective';
        correctPosNameTh = 'คุณศัพท์ (Adjective)';
        explanation = `ตำแหน่งช่องว่างอยู่หน้าคำนาม จึงต้องการคำคุณศัพท์ (Adjective) เพื่อขยายคำนาม`;
      } else if (c.partOfSpeech.includes('adv')) {
        correctPosTag = 'adverb';
        correctPosNameTh = 'กริยาวิเศษณ์ (Adverb)';
        explanation = `ตำแหน่งช่องว่างต้องการคำกริยาวิเศษณ์ (Adverb) เพื่อขยายกริยาหรือภาพรวมของประโยค`;
      }

      // 4 choices
      const rawChoices = Array.from(new Set([c.word, family.noun, family.verb, family.adj, family.adv])).slice(0, 4);
      while (rawChoices.length < 4) {
        rawChoices.push(`${c.word.toLowerCase()}ly`);
      }
      const choices = rawChoices.sort(() => Math.random() - 0.5);

      return {
        card: c,
        sentenceWithBlank: sentence,
        correctWord: c.word,
        correctPosNameTh,
        correctPosTag,
        distractorChoices: choices,
        explanation,
      };
    });

    setItems(generated);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(timeLimitSeconds);
    setIsGameOver(false);
    setSelectedChoice(null);
  }, [cards, category, wordCount, timeLimitSeconds]);

  const currentItem = items[currentIndex];

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

  const handleSelect = (choice: string) => {
    if (isAnswering || isGameOver || !currentItem) return;
    setIsAnswering(true);
    setSelectedChoice(choice);

    const isCorrect = choice.toLowerCase() === currentItem.correctWord.toLowerCase();
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      if (currentIndex + 1 < items.length) {
        setCurrentIndex((i) => i + 1);
        setSelectedChoice(null);
        setIsAnswering(false);
      } else {
        setIsGameOver(true);
      }
    }, 1200);
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
              {score} / {items.length}
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

      {!isGameOver && currentItem ? (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-block px-2.5 py-1 bg-purple-100 text-purple-900 border-2 border-slate-900 font-pixel text-xs">
              โจทย์ที่ {currentIndex + 1} จาก {items.length} • {currentItem.card.category}
            </div>
            <h2 className="text-xl font-bold font-thai text-slate-900">
              แปรธาตุชนิดของคำ (Part of Speech Drill)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              วิเคราะห์โครงสร้างประโยค แล้วเลือกรูปคำ (Derivative Form) ที่ถูกต้องตามหลักไวยากรณ์
            </p>
          </div>

          {/* Recessed Parchment Well with Sentence */}
          <div className="bg-[#F8F5EC] border-2 border-dashed border-slate-400 p-5 rounded-lg space-y-3">
            <p className="text-base sm:text-lg text-slate-900 font-serif leading-relaxed">
              {currentItem.sentenceWithBlank}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-300">
              <span>ความหมายภาษาไทย: <strong>{currentItem.card.meaningTh}</strong></span>
              <span className="font-mono text-purple-700 font-bold">ต้องการ: {currentItem.correctPosNameTh}</span>
            </div>
          </div>

          {/* 4 Word Family Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentItem.distractorChoices.map((choice, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedChoice === choice;
              const isCorrectTarget = choice.toLowerCase() === currentItem.correctWord.toLowerCase();

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
                  onClick={() => handleSelect(choice)}
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

          {/* Live Explanation upon selection */}
          {selectedChoice && (
            <div className="bg-amber-50 border-2 border-slate-900 p-3.5 text-xs text-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>เฉลยหลักไวยากรณ์:</span>
              </div>
              <p className="leading-relaxed">{currentItem.explanation}</p>
            </div>
          )}
        </div>
      ) : (
        /* Results Screen */
        <div className="bg-[#F8F5EC] border-2 border-slate-900 p-8 text-center space-y-5">
          <div className="w-14 h-14 bg-purple-400 border-2 border-slate-900 shadow-arcade-sm mx-auto flex items-center justify-center">
            <Zap className="w-7 h-7 text-slate-950" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-thai text-slate-900">
              จบการแปรธาตุชนิดของคำ!
            </h3>
            <p className="text-sm text-slate-600">
              คุณสามารถระบุชนิดของคำได้อย่างถูกต้อง{' '}
              <span className="font-bold text-purple-600 font-pixel text-base">
                {score}
              </span>{' '}
              จากทั้งหมด {items.length} ข้อ
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
                // regenerate items
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
