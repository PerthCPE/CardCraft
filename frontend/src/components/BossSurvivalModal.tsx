'use client';

// ============================================================================
// frontend/src/components/BossSurvivalModal.tsx
// โหมดบอสเรดสุดระทึก: Boss Survival Gauntlet (3-HP Sudden Death)
// - ผู้เล่นมีพลังชีวิต 3 ดวงใจ (3 HP)
// - บอส "Void Wyrm of Distraction" มีพลังชีวิต 1,000 HP
// - ตอบถูกทำความเสียหายใส่บอสตามระดับความยาก (Mana Cost) และสะสม Combo Critical!
// - ตอบผิด 1 ครั้ง เสีย 1 ดวงใจ หากหมด 3 ดวงใจจะ Game Over ทันที!
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Flame,
  Heart,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Sword,
  X,
  Zap,
} from 'lucide-react';
import { QuestionItem } from '@/data/toeic-dictionary';
import { logSingleAnswer } from '@/lib/api';
import {
  buildShuffledQuestionsMap,
  ShuffledQuestionWrapper,
} from '@/utils/question-shuffle.util';

interface BossSurvivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionItem[];
  userId?: string;
}

export default function BossSurvivalModal({
  isOpen,
  onClose,
  questions,
  userId,
}: BossSurvivalModalProps) {
  const [bossHp, setBossHp] = useState<number>(1000);
  const [playerHp, setPlayerHp] = useState<number>(3);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [damageDealtTotal, setDamageDealtTotal] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const shuffledQuestions = useMemo(() => {
    return [...questions].sort(() => 0.5 - Math.random());
  }, [questions]);

  const [shuffledMap, setShuffledMap] = useState<Map<string, ShuffledQuestionWrapper>>(
    new Map(),
  );

  const resetGame = () => {
    setBossHp(1000);
    setPlayerHp(3);
    setCurrentIndex(0);
    setStreak(0);
    setDamageDealtTotal(0);
    setIsGameOver(false);
    setIsVictory(false);
    setLastAction(null);
    setShuffledMap(buildShuffledQuestionsMap(questions));
  };

  useEffect(() => {
    if (isOpen) resetGame();
  }, [isOpen]);

  const currentQ = shuffledQuestions[currentIndex % shuffledQuestions.length];
  const currentShuffled = currentQ ? shuffledMap.get(currentQ.id) : null;

  const handleAnswer = (chosen: 'A' | 'B' | 'C' | 'D') => {
    if (isGameOver || isVictory || !currentQ) return;

    const wrap = shuffledMap.get(currentQ.id);
    const originalChosen = wrap ? wrap.displayToOriginalMap[chosen] : chosen;

    if (userId) {
      logSingleAnswer({
        userId,
        questionId: currentQ.id,
        part: currentQ.part,
        mode: 'BOSS_GAUNTLET',
        selectedOption: originalChosen,
      });
    }

    const isCorrect = originalChosen === currentQ.correctOption;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const isCrit = nextStreak >= 3;
      const baseDmg = 85;
      const damage = isCrit ? baseDmg * 2 : baseDmg;

      const newBossHp = Math.max(0, bossHp - damage);
      setBossHp(newBossHp);
      setDamageDealtTotal((prev) => prev + damage);
      setLastAction(`โจมตีสำเร็จ! ${isCrit ? '[CRITICAL HIT] ' : ''}ทำดาเมจ -${damage} HP`);

      if (newBossHp <= 0) {
        setIsVictory(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      const nextHp = playerHp - 1;
      setPlayerHp(nextHp);
      setStreak(0);
      setLastAction(`บอสโจมตีสวนกลับ! เสีย 1 ดวงใจ (เหลือ ${nextHp} HP)`);

      if (nextHp <= 0) {
        setIsGameOver(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] rounded-none overflow-hidden flex flex-col max-h-[92vh]">
        {/* Boss Arena Banner */}
        <div className="px-6 py-4 bg-red-950 text-white flex items-center justify-between border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-red-600 border border-red-400 text-white flex items-center justify-center font-pixel shadow-pixel-sm">
              <Sword className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-red-300">
                  Boss Survival Gauntlet (3-HP Sudden Death)
                </h2>
                <span className="text-[10px] font-pixel px-1.5 py-0.5 bg-red-600 text-white rounded">
                  SURVIVAL
                </span>
              </div>
              <p className="text-xs text-red-200">
                เผชิญหน้ากับ &ldquo;The Void Wyrm of Distraction&rdquo; • พลาดได้ไม่เกิน 3 ครั้ง!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player & Boss Combat HUD */}
        <div className="p-4 bg-slate-900 text-white border-b-2 border-slate-900 grid grid-cols-2 gap-4">
          {/* Player HP */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300">Hero Stamina:</span>
              <span className="font-mono">{playerHp} / 3 HP</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-6 h-6 transition-all ${
                    heart <= playerHp
                      ? 'fill-red-500 text-red-500 scale-100'
                      : 'text-slate-600 fill-slate-800 scale-90'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Boss HP */}
          <div className="space-y-1 text-right">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-red-400">{bossHp} / 1000 HP</span>
              <span className="font-bold text-red-400">Boss HP:</span>
            </div>
            <div className="w-full h-4 bg-slate-800 border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${(bossHp / 1000) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {lastAction && (
          <div className="px-4 py-2 bg-amber-100 border-b border-amber-300 text-center text-xs font-bold text-slate-900">
            {lastAction}
          </div>
        )}

        {/* In Battle */}
        {!isGameOver && !isVictory && currentQ && (
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-pixel px-2 py-0.5 bg-slate-900 text-amber-300 rounded">
                Question {currentIndex + 1}
              </span>
              {streak >= 2 && (
                <span className="text-xs font-pixel font-bold text-amber-600 bg-amber-100 px-2 py-0.5 border border-amber-400 rounded flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  {streak}x COMBO!
                </span>
              )}
            </div>

            <div className="text-base sm:text-lg font-bold font-display text-slate-900">
              {currentQ.questionText}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(currentShuffled
                ? currentShuffled.choices
                : [
                    { displayKey: 'A' as const, text: currentQ.optionA },
                    { displayKey: 'B' as const, text: currentQ.optionB },
                    { displayKey: 'C' as const, text: currentQ.optionC },
                    ...(currentQ.optionD ? [{ displayKey: 'D' as const, text: currentQ.optionD }] : []),
                  ]
              ).map((opt) => (
                <button
                  key={opt.displayKey}
                  type="button"
                  onClick={() => handleAnswer(opt.displayKey)}
                  className="p-3.5 border-2 border-slate-900 bg-white hover:bg-amber-50 text-left text-sm font-body transition-all flex items-start gap-2.5 shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <span className="px-2 py-0.5 text-xs font-pixel font-bold bg-slate-200 text-slate-800 rounded">
                    {opt.displayKey}
                  </span>
                  <span className="flex-1 font-medium">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VICTORY SCREEN */}
        {isVictory && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border-2 border-slate-900 flex items-center justify-center shadow-pixel">
              <Sparkles className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold font-display text-slate-900">
              VICTORY! ปราบปรามบอสสำเร็จ!
            </h3>
            <p className="text-sm text-slate-600 font-body">
              คุณทำดาเมจรวม {damageDealtTotal} HP และพิชิตบอสโดยรอดชีวิตด้วย {playerHp} ดวงใจ!
            </p>
            <button
              onClick={resetGame}
              className="py-3 px-6 bg-amber-400 hover:bg-amber-300 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel"
            >
              เล่นอีกรอบ (Replay)
            </button>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {isGameOver && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 border-2 border-slate-900 flex items-center justify-center shadow-pixel">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold font-display text-slate-900">
              DEFEAT! ดวงใจหมดลงแล้ว
            </h3>
            <p className="text-sm text-slate-600 font-body">
              คุณทำดาเมจใส่บอสไปได้ {damageDealtTotal} / 1000 HP พยายามฝึกฝนความแม่นยำแล้วลองใหม่อีกครั้ง!
            </p>
            <button
              onClick={resetGame}
              className="py-3 px-6 bg-amber-400 hover:bg-amber-300 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel"
            >
              ท้าทายบอสอีกครั้ง (Retry)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
