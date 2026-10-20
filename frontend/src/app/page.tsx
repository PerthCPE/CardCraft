'use client';

// ============================================================================
// frontend/src/app/page.tsx
// CardCraft Release v1.0: หน้าหลัก Hero Dashboard & 7-Stage Character Evolution Roadmap
// - รองรับ Guest Mode เริ่มต้น คะแนนเริ่มต้นที่ 0
// - เลือกระดับเป้าหมายคะแนน (Target Goal: 600, 700, 800, 900) ได้จริง และบันทึกเข้าสู่โปรไฟล์
// - ป้าย GOAL บน Roadmap ปรับตามเป้าหมายที่ User เลือก
// - สไตล์ Neo-Brutalist & Pixel Art ไร้รอยต่อ
// ============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Crosshair,
  Lock,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  DashboardSummaryResponse,
  fetchDashboardSummary,
  updateHeroProfile,
} from '@/lib/api';
import { PixelCharacterAvatar } from '@/components/PixelCharacterAvatar';
import { getCharacterEvolution } from '@/utils/character-evolution.util';
import { useAuth } from '@/context/AuthContext';

const TARGET_GOAL_OPTIONS = [600, 700, 800, 900];

export default function DashboardPage() {
  const { user: authUser, refreshUser, openAuthModal } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardSummaryResponse | null>(
    null,
  );
  const [guestTargetScore, setGuestTargetScore] = useState<number>(700);
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false);

  useEffect(() => {
    fetchDashboardSummary(authUser?.id).then(setDashboard);
  }, [authUser?.id]);

  const currentTargetScore =
    authUser?.targetScore || dashboard?.user?.targetScore || guestTargetScore;

  const handleUpdateTargetScore = async (newTarget: number) => {
    if (!dashboard) return;

    if (authUser) {
      setIsUpdatingTarget(true);
      try {
        const updated = await updateHeroProfile(
          { targetScore: newTarget },
          authUser.id,
        );
        const currentScore = updated.user.currentEstimatedScore;
        setDashboard({
          ...dashboard,
          user: updated.user,
          evolution: getCharacterEvolution(currentScore, newTarget),
        });
        await refreshUser();
      } catch {
        // ignore
      } finally {
        setIsUpdatingTarget(false);
      }
    } else {
      // โหมด Guest: อัปเดต state ในเครื่อง
      setGuestTargetScore(newTarget);
      setDashboard({
        ...dashboard,
        evolution: getCharacterEvolution(0, newTarget),
      });
    }
  };

  if (!dashboard) {
    return (
      <div className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-10 text-center">
        <p className="text-sm text-slate-600">กำลังโหลดข้อมูลฮีโร่และแผนผังวิวัฒนาการ...</p>
      </div>
    );
  }

  const { user, evolution, stats, recentAttempts } = dashboard;
  const masteryPercent =
    stats.totalFlashcards > 0
      ? Math.round((stats.masteredCards / stats.totalFlashcards) * 100)
      : 0;

  const pointsToTarget = Math.max(
    0,
    currentTargetScore - evolution.estimatedScore,
  );
  const isTargetAchieved = evolution.estimatedScore >= currentTargetScore;

  return (
    <div className="space-y-8">
      {/* ===================================================================
          1. HERO DOSSIER & SCORE LEDGER (The Memorable Centerpiece)
         =================================================================== */}
      <section className="bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade-lg p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left (7 cols): Character Pedestal & Identity */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="bg-[#fffdf7] text-slate-900 border-2 border-slate-950 shadow-[4px_4px_0px_0px_#020617] p-4 flex flex-col items-center justify-center shrink-0 w-40">
              <div className="w-full flex items-center justify-between mb-1">
                <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-slate-900 text-amber-300">
                  Lv.{evolution.unlockedTier}
                </span>
                <span className="font-pixel text-[10px] text-slate-500">
                  {evolution.currentTier.minScore}+
                </span>
              </div>
              <PixelCharacterAvatar
                tier={evolution.unlockedTier}
                size="xl"
                isLocked={false}
              />
            </div>

            <div className="space-y-2.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-800 border border-slate-700 text-xs text-amber-300">
                <span>คลาสปัจจุบัน (ระดับ {evolution.unlockedTier} จาก 7)</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {evolution.classTitle}{' '}
                  <span className="text-amber-400 font-normal">
                    ({evolution.classTitleTh})
                  </span>
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  ผู้ท้าชิง:{' '}
                  <strong className="text-white">
                    {user?.name || 'ผู้เล่นทั่วไป (โหมดผู้เยี่ยมชม)'}
                  </strong>
                </p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed reading-measure">
                {evolution.currentTier.descriptionTh}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {!authUser ? (
                  <button
                    type="button"
                    onClick={() =>
                      openAuthModal(
                        'เข้าสู่ระบบหรือสร้างบัญชีใหม่ เพื่อเริ่มทำแบบทดสอบ บันทึกคะแนน และเลื่อนระดับคลาสฮีโร่ของคุณ',
                      )
                    }
                    className="px-4 py-2 bg-emerald-400 text-slate-950 font-display font-bold text-sm border-2 border-slate-950 shadow-[3px_3px_0px_0px_#020617] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    เข้าสู่ระบบ / สมัครสมาชิกเพื่อเริ่มเล่น
                  </button>
                ) : (
                  <Link
                    href="/mock-test"
                    className="px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-sm border-2 border-slate-950 shadow-[3px_3px_0px_0px_#020617] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] transition-all"
                  >
                    เข้าสอบจำลองเพื่อเลื่อนคลาส
                  </Link>
                )}
                <Link
                  href="/flashcards"
                  className="px-4 py-2 bg-slate-800 text-amber-300 font-display font-bold text-sm border-2 border-slate-700 hover:bg-slate-750 transition-colors"
                >
                  ดูคลังคำศัพท์ ({stats.totalFlashcards.toLocaleString()} คำ)
                </Link>
              </div>
            </div>
          </div>

          {/* Right (5 cols): Numeric Score Readout & Target Gap */}
          <div className="lg:col-span-5 bg-slate-950 border-2 border-slate-800 p-5 space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-800 pb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400">
                คะแนนประเมินปัจจุบัน
              </span>
              <span className="text-xs text-amber-300 font-medium">
                เป้าหมาย {currentTargetScore} คะแนน
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-pixel text-4xl sm:text-5xl text-amber-300 tracking-tight">
                {evolution.estimatedScore}
              </span>
              <span className="font-pixel text-sm text-slate-500">
                / 990 คะแนน
              </span>
            </div>

            {/* Target Progress Meter */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-slate-800 border border-slate-700 overflow-hidden relative">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((evolution.estimatedScore / currentTargetScore) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                {isTargetAchieved ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <Crosshair className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>
                  {isTargetAchieved
                    ? `ผ่านเกณฑ์เป้าหมาย ${currentTargetScore}+ แล้ว`
                    : `ห่างจากเป้าหมาย ${currentTargetScore} คะแนนอีก ${pointsToTarget} คะแนน`}
                </span>
              </div>
              <span className="font-pixel text-[10px]">
                {currentTargetScore}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. 7-STAGE EVOLUTION ROADMAP (Sequential Progression Track)
         =================================================================== */}
      <section className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              เส้นทางวิวัฒนาการตัวละครทั้ง 7 ระดับ
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              แบ่งตามช่วงคะแนนจริง (150, 200 และ 100 คะแนน) คลาสที่ยังไปไม่ถึงจะแสดงเป็นเงาปริศนา
            </p>
          </div>

          {/* Target Goal Selector (เปลี่ยนเป้าหมายคะแนนได้จริง) */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 border-2 border-slate-900 px-3 py-2 shadow-pixel-sm">
            <span className="text-xs font-bold font-display text-slate-900 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              เลือกเป้าหมายคะแนน:
            </span>
            {TARGET_GOAL_OPTIONS.map((score) => {
              const active = currentTargetScore === score;
              return (
                <button
                  key={score}
                  type="button"
                  disabled={isUpdatingTarget}
                  onClick={() => handleUpdateTargetScore(score)}
                  className={`px-3 py-1 font-pixel text-xs border-2 transition-all active:translate-y-[1px] ${
                    active
                      ? 'bg-emerald-400 text-slate-950 border-slate-950 font-bold shadow-[2px_2px_0px_0px_#020617]'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                  }`}
                >
                  {score}+
                </button>
              );
            })}
          </div>
        </div>

        {/* 7-Tier Timeline Track */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {evolution.roadmap.map((tier) => {
            // คำนวณว่า Tier นี้ตรงกับเป้าหมายที่เลือกไว้หรือไม่
            const isTargetGoal =
              currentTargetScore >= tier.minScore &&
              (tier.nextTierScore === null || currentTargetScore < tier.nextTierScore);

            return (
              <div
                key={tier.tier}
                className={`relative border-2 p-3 flex flex-col items-center text-center transition-all ${
                  tier.isCurrent
                    ? 'border-slate-900 bg-amber-50 shadow-arcade-sm'
                    : tier.isUnlocked
                      ? 'border-slate-400 bg-white'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                {/* Dynamic Goal Badge based on User's Selected Target */}
                {isTargetGoal && (
                  <span className="absolute -top-3 px-2 py-0.5 bg-emerald-400 text-slate-950 font-pixel text-[9px] font-bold border-2 border-slate-950 shadow-[1px_1px_0px_0px_#020617] select-none">
                    GOAL {currentTargetScore}+
                  </span>
                )}

                <div className="w-full flex items-center justify-between text-[10px] text-slate-500 font-pixel mb-1">
                  <span>Lv.{tier.tier}</span>
                  <span>{tier.minScore}+</span>
                </div>

                <div className="my-2 h-14 flex items-center justify-center">
                  <PixelCharacterAvatar
                    tier={tier.tier}
                    size="md"
                    isLocked={!tier.isUnlocked}
                  />
                </div>

                <h3 className="font-display font-bold text-xs text-slate-900 truncate w-full">
                  {tier.title}
                </h3>
                <p className="text-[11px] text-slate-600 truncate w-full mt-0.5">
                  {tier.titleTh}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-200 w-full flex items-center justify-center text-[10px]">
                  {tier.isCurrent ? (
                    <span className="font-display font-bold text-amber-700">
                      คลาสปัจจุบัน
                    </span>
                  ) : tier.isUnlocked ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> ปลดล็อกแล้ว
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Lock className="w-3 h-3" /> ล็อกอยู่
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================
          3. TWO-COLUMN GUILD LEDGER (Content + History Balance)
         =================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Guild Training Grounds (3 Clear Modes) */}
        <div className="lg:col-span-7 bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-6 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ลานฝึกฝนหลัก (Training Grounds)
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              ระบบฝึกฝน 3 เสาหลักเพื่อยกระดับคะแนน Listening และ Reading สู่เป้าหมาย {currentTargetScore}+
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {/* Mode A: 3D Flashcards Deck */}
            <div className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 bg-amber-400 border-2 border-slate-900 shadow-arcade-sm flex items-center justify-center shrink-0 mt-0.5">
                  <img
                    src="/icons/icon-deck.png"
                    alt=""
                    className="w-7 h-7 object-contain [image-rendering:pixelated]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">
                      สำรับการ์ดคำศัพท์ 3D Flip
                    </h3>
                    <span className="font-pixel text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {masteryPercent}% จำได้
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 reading-measure">
                    พจนานุกรมคำศัพท์ธุรกิจออกสอบบ่อย {stats.totalFlashcards.toLocaleString()} คำ พร้อมระบบ Spaced Repetition จำแนกคำที่จำได้แล้วกับคำที่ต้องทบทวน
                  </p>
                </div>
              </div>
              <Link
                href="/flashcards"
                className="shrink-0 px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm hover:-translate-y-0.5 active:translate-y-0 text-center"
              >
                เปิดสำรับการ์ด
              </Link>
            </div>

            {/* Mode B: Listening & Reading Drills */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 bg-sky-400 border-2 border-slate-900 shadow-arcade-sm flex items-center justify-center shrink-0 mt-0.5">
                  <img
                    src="/icons/icon-listening.png"
                    alt=""
                    className="w-7 h-7 object-contain [image-rendering:pixelated]"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900">
                    ฝึกทำโจทย์แยกพาร์ท (Part 1, 2, 5 และ 7)
                  </h3>
                  <p className="text-sm text-slate-600 reading-measure">
                    ฝึกฟังเสียงภาษาอังกฤษในพาร์ท 1–2, ฝึกสปีด 20 วินาทีในพาร์ท 5 และอ่านอีเมลธุรกิจคู่ขนานในพาร์ท 7
                  </p>
                </div>
              </div>
              <Link
                href="/practice"
                className="shrink-0 px-4 py-2 bg-white text-slate-900 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm hover:bg-slate-50 text-center"
              >
                เริ่มฝึกโจทย์
              </Link>
            </div>

            {/* Mode C: Timed Boss Battle Mock Test */}
            <div className="py-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 bg-rose-500 border-2 border-slate-900 shadow-arcade-sm flex items-center justify-center shrink-0 mt-0.5">
                  <img
                    src="/icons/icon-boss-gate.png"
                    alt=""
                    className="w-7 h-7 object-contain [image-rendering:pixelated]"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900">
                    สนามสอบจำลองจับเวลา (Mini Mock Test)
                  </h3>
                  <p className="text-sm text-slate-600 reading-measure">
                    จำลองสอบจริงครบทั้งคลัง 56 ข้อ พร้อมคำนวณคะแนนสเกล TOEIC ทันทีเพื่อประเมินระดับคลาส
                  </p>
                </div>
              </div>
              <Link
                href="/mock-test"
                className="shrink-0 px-4 py-2 bg-rose-500 text-white font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm hover:-translate-y-0.5 active:translate-y-0 text-center"
              >
                เข้าสู่สนามสอบ
              </Link>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Recent Attempts Ledger & Admin Link */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ประวัติการประเมินคะแนนล่าสุด
                </h2>
                <p className="text-xs text-slate-500">
                  บันทึกผลจากห้องสอบจำลองและแบบฝึกหัด
                </p>
              </div>
              <span className="font-pixel text-xs text-slate-500">
                {recentAttempts.length} ครั้ง
              </span>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                <p>ยังไม่มีประวัติการสอบที่บันทึกไว้</p>
                <p className="text-slate-400">
                  เข้าสู่ระบบแล้วทำ Mini Mock Test เพื่อบันทึกผลคะแนนและวิเคราะห์จุดอ่อน
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 text-sm">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="py-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">
                        {attempt.mode === 'MINI_MOCK'
                          ? 'สอบจำลอง Mini Mock'
                          : attempt.mode === 'READING_DRILL'
                            ? 'ฝึกโจทย์การอ่าน'
                            : 'ฝึกโจทย์การฟัง'}
                      </p>
                      <p className="text-xs text-slate-500">
                        ฟังถูก {attempt.listeningCorrect} ข้อ · อ่านถูก{' '}
                        {attempt.readingCorrect} ข้อ
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-pixel text-sm text-slate-900">
                        {attempt.estimatedScore}
                      </span>
                      <div className="mt-0.5">
                        <span
                          className={`inline-block font-pixel text-[9px] px-1.5 py-0.5 border border-slate-900 ${
                            attempt.isPassedTarget
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Tier {attempt.unlockedTier}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin Guild CRUD Card (Visible ONLY to Admin) */}
          {user && (user.username === 'admin' || user.email?.includes('admin')) && (
            <div className="bg-slate-900 text-slate-100 border-2 border-slate-950 shadow-arcade p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-bold font-mono">
                  ADMIN ONLY
                </div>
                <h3 className="font-bold text-sm text-amber-400">
                  ระบบจัดการฐานข้อมูล (CRUD Manager)
                </h3>
                <p className="text-xs text-slate-300">
                  เพิ่ม แก้ไข หรือลบรายการคำศัพท์ ({stats.totalFlashcards.toLocaleString()} คำ) และข้อสอบ ({stats.totalQuestions} ข้อ)
                </p>
              </div>
              <Link
                href="/admin"
                className="shrink-0 px-3.5 py-2 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617]"
              >
                จัดการข้อมูล
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
