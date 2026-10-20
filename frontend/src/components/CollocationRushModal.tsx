'use client';

// ============================================================================
// frontend/src/components/CollocationRushModal.tsx
// มินิเกมประลองความเร็ว: Collocation Rush (จับคู่สำนวนธุรกิจ 60 วินาที)
// - จับเวลา 60 วินาที
// - แผ่นป้ายจับคู่คำศัพท์และคำบุพบท/คู่สำนวน TOEIC 700+ ออกบ่อย
// - สะสมคะแนนความเร็วและคอมโบ
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Clock,
  Flame,
  RotateCcw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

interface CollocationRushModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLLOCATION_PAIRS = [
  { left: 'Comply', right: 'with (ปฏิบัติตามกฎ)' },
  { left: 'Contingent', right: 'upon (ขึ้นอยู่กับเงื่อนไข)' },
  { left: 'Prior', right: 'to (ก่อนหน้าที่จะถึง)' },
  { left: 'Subject', right: 'to (ต้องอยู่ภายใต้เงื่อนไข)' },
  { left: 'In accordance', right: 'with (สอดคล้องตามข้อตกลง)' },
  { left: 'Substantially', right: 'increase (เพิ่มขึ้นอย่างมีนัยสำคัญ)' },
  { left: 'Take advantage', right: 'of (ใช้ประโยชน์จากโอกาส)' },
  { left: 'Strictly', right: 'confidential (เป็นความลับสุดยอด)' },
  { left: 'Reach a', right: 'consensus (บรรลุความเห็นพ้องต้องกัน)' },
  { left: 'Meet the', right: 'deadline (ส่งงานทันตามกำหนด)' },
  { left: 'In charge', right: 'of (รับผิดชอบดูแล)' },
  { left: 'Familiar', right: 'with (คุ้นเคยกับระบบ)' },
];

export default function CollocationRushModal({
  isOpen,
  onClose,
}: CollocationRushModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Active round pairs (4 คู่ต่อรอบ)
  const [roundPairs, setRoundPairs] = useState<typeof COLLOCATION_PAIRS>([]);
  const [shuffledLeft, setShuffledLeft] = useState<string[]>([]);
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());

  const initRound = () => {
    const shuffledPool = [...COLLOCATION_PAIRS].sort(() => 0.5 - Math.random());
    const round = shuffledPool.slice(0, 4);
    setRoundPairs(round);
    setShuffledLeft(round.map((p) => p.left).sort(() => 0.5 - Math.random()));
    setShuffledRight(round.map((p) => p.right).sort(() => 0.5 - Math.random()));
    setSelectedLeft(null);
    setMatchedPairs(new Set());
  };

  const startGame = () => {
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
    initRound();
  };

  useEffect(() => {
    if (isOpen) startGame();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isGameOver]);

  const handleSelectLeft = (leftText: string) => {
    if (isGameOver || matchedPairs.has(leftText)) return;
    setSelectedLeft(leftText);
  };

  const handleSelectRight = (rightText: string) => {
    if (isGameOver || !selectedLeft) return;

    // ตรวจสอบว่าตรงคู่หรือไม่
    const targetPair = roundPairs.find((p) => p.left === selectedLeft);
    if (targetPair && targetPair.right === rightText) {
      // จับคู่ถูก
      const nextMatched = new Set(matchedPairs);
      nextMatched.add(selectedLeft);
      setMatchedPairs(nextMatched);
      setSelectedLeft(null);
      setStreak((prev) => prev + 1);
      setScore((prev) => prev + 100 + streak * 20);

      // ถ้าจับคู่ครบ 4 คู่ในรอบนี้ ให้โหลดรอบใหม่
      if (nextMatched.size === 4) {
        setTimeout(() => {
          initRound();
        }, 300);
      }
    } else {
      // จับคู่ผิด
      setStreak(0);
      setSelectedLeft(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] rounded-none overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-emerald-400 border border-emerald-300 text-slate-900 flex items-center justify-center font-pixel shadow-pixel-sm">
              <Zap className="w-5 h-5 fill-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-emerald-200">
                  Collocation Rush (จับคู่สำนวนธุรกิจ 60 วินาที)
                </h2>
                <span className="text-[10px] font-pixel px-1.5 py-0.5 bg-amber-400 text-slate-900 rounded font-bold">
                  60s SPEED
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                จับคู่คำกริยาและคำบุพบท/คำนามที่ออกคู่กันบ่อยที่สุดใน TOEIC!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HUD Bar */}
        <div className="p-3 bg-slate-100 border-b-2 border-slate-900 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 font-pixel">
            <Clock className={`w-4 h-4 ${timeLeft <= 10 ? 'text-red-600 animate-bounce' : 'text-slate-700'}`} />
            <span className={timeLeft <= 10 ? 'text-red-600' : 'text-slate-900'}>
              00:{String(timeLeft).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {streak >= 2 && (
              <span className="text-amber-600 font-bold bg-amber-100 px-2 py-0.5 border border-amber-400 rounded flex items-center gap-1 font-pixel">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                {streak}x COMBO!
              </span>
            )}
            <span className="font-bold text-emerald-700 text-sm font-pixel">
              Score: {score}
            </span>
          </div>
        </div>

        {/* Playing Area */}
        {!isGameOver ? (
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600 text-center font-body">
              คลิกคำฝั่งซ้ายก่อน แล้วคลิกคำคู่ที่ถูกต้องฝั่งขวา:
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  คำศัพท์หลัก (Word)
                </div>
                {shuffledLeft.map((leftText) => {
                  const isMatched = matchedPairs.has(leftText);
                  const isSelected = selectedLeft === leftText;

                  return (
                    <button
                      key={leftText}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleSelectLeft(leftText)}
                      className={`w-full p-3 border-2 font-display text-sm font-bold transition-all text-center ${
                        isMatched
                          ? 'border-emerald-600 bg-emerald-100 text-emerald-800 line-through opacity-50'
                          : isSelected
                            ? 'border-indigo-600 bg-indigo-100 text-indigo-900 shadow-pixel'
                            : 'border-slate-900 bg-white hover:bg-amber-50 text-slate-900 shadow-pixel-sm'
                      }`}
                    >
                      {leftText}
                    </button>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  คู่คำที่ถูกต้อง (Collocation)
                </div>
                {shuffledRight.map((rightText) => {
                  // เช็คว่าคู่นี้ถูกจับคู่ไปแล้วหรือยัง
                  const parentPair = roundPairs.find((p) => p.right === rightText);
                  const isMatched = parentPair ? matchedPairs.has(parentPair.left) : false;

                  return (
                    <button
                      key={rightText}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleSelectRight(rightText)}
                      className={`w-full p-3 border-2 font-body text-xs font-semibold transition-all text-center leading-snug ${
                        isMatched
                          ? 'border-emerald-600 bg-emerald-100 text-emerald-800 line-through opacity-50'
                          : 'border-slate-900 bg-white hover:bg-emerald-50 text-slate-900 shadow-pixel-sm'
                      }`}
                    >
                      {rightText}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Game Over Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border-2 border-slate-900 flex items-center justify-center shadow-pixel">
              <Award className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold font-display text-slate-900">
              หมดเวลาการจับคู่ 60 วินาที!
            </h3>
            <div className="text-3xl font-extrabold font-pixel text-emerald-600">
              {score} คะแนน
            </div>
            <p className="text-xs text-slate-600">
              การจำคู่สำนวนช่วยให้คุณทำข้อสอบ TOEIC Part 5 ได้อย่างรวดเร็วโดยไม่ต้องแปลทั้งประโยค!
            </p>
            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                onClick={startGame}
                className="py-3 px-6 bg-amber-400 hover:bg-amber-300 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                เล่นอีกรอบ (Replay)
              </button>
              <button
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
