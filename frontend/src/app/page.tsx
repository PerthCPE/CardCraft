'use client';

// ============================================================================
// frontend/src/app/page.tsx
// CardCraft v2.0: หน้าหลัก Hero Dashboard & 7-Stage Character Evolution Roadmap
// - Strict Separation: แสดง Official Hero HUD (คำนวณจาก Mock Exam เท่านั้น)
// - TOEIC Readiness Forecast: แสดงคะแนนพยากรณ์ความพร้อมแยก 7 พาร์ท (จากการฝึกซ้อม /practice)
// - เลือกระดับเป้าหมายคะแนน (Target Goal: 600, 700, 800, 900) ได้จริง และบันทึกเข้าสู่โปรไฟล์
// - ป้าย GOAL บน Roadmap ปรับตามเป้าหมายที่ User เลือก
// - สไตล์ Neo-Brutalist & Pixel Art ไร้รอยต่อ
// ============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Crosshair,
  Flame,
  Gamepad2,
  Info,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from 'lucide-react';
import {
  DashboardSummaryResponse,
  PartSkillEstimatesResponse,
  PartSkillEstimateItem,
  updateHeroProfile,
} from '@/lib/api';
import {
  useDashboardSummary,
  usePartSkillEstimates,
  useCardCraftQueryHelpers,
  getInitialGuestDashboard,
} from '@/hooks/useDashboardQueries';
import { PixelCharacterAvatar } from '@/components/PixelCharacterAvatar';
import {
  getCharacterEvolution,
  getSupportivePerformanceTier,
  TOEIC_PART_WEIGHTS,
} from '@/utils/character-evolution.util';
import { useAuth } from '@/context/AuthContext';

const TARGET_GOAL_OPTIONS = [600, 700, 800, 900];

export default function DashboardPage() {
  const { user: authUser, refreshUser, openAuthModal } = useAuth();
  const { queryClient } = useCardCraftQueryHelpers();
  const { data: dashboardData } = useDashboardSummary(authUser?.id);
  const { data: readinessForecast } = usePartSkillEstimates(authUser?.id);

  const [guestTargetScore, setGuestTargetScore] = useState<number>(700);
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false);

  const dashboard: DashboardSummaryResponse = dashboardData || getInitialGuestDashboard();

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
        const newDashboard: DashboardSummaryResponse = {
          ...dashboard,
          user: updated.user,
          evolution: getCharacterEvolution(currentScore, newTarget),
        };
        queryClient.setQueryData(
          ['dashboard-summary', authUser.id],
          newDashboard,
        );
        await refreshUser();
      } catch {
        // ignore
      } finally {
        setIsUpdatingTarget(false);
      }
    } else {
      // โหมด Guest: อัปเดต state ในเครื่องและ TanStack Cache
      setGuestTargetScore(newTarget);
      const newDashboard: DashboardSummaryResponse = {
        ...dashboard,
        evolution: getCharacterEvolution(0, newTarget),
      };
      queryClient.setQueryData(
        ['dashboard-summary', 'guest'],
        newDashboard,
      );
    }
  };

  if (!dashboard) {
    return (
      <div className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-10 text-center">
        <p className="text-sm text-slate-600">
          กำลังโหลดข้อมูลฮีโร่และแผนผังวิวัฒนาการ...
        </p>
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

  // Build map for 7-Part Estimates
  const estimatesByPart: Record<number, PartSkillEstimateItem> = {};
  if (readinessForecast?.estimates) {
    readinessForecast.estimates.forEach((est) => {
      estimatesByPart[est.part] = est;
    });
  }

  return (
    <div className="space-y-8">
      {/* ===================================================================
          1. HERO DOSSIER & SCORE LEDGER (Official Hero Centerpiece)
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
                priority={true}
              />
            </div>

            <div className="space-y-2.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-800 border border-slate-700 text-xs text-amber-300">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Official Hero Level (ระดับ {evolution.unlockedTier} จาก 7)
                </span>
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
                    className="px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-sm border-2 border-slate-950 shadow-[3px_3px_0px_0px_#020617] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5"
                  >
                    <Swords className="w-4 h-4" />
                    เข้าสนามสอบจำลองเพื่อเลื่อนคลาส
                  </Link>
                )}
                <Link
                  href="/practice"
                  className="px-4 py-2 bg-slate-800 text-sky-300 font-display font-bold text-sm border-2 border-slate-700 hover:bg-slate-750 transition-colors flex items-center gap-1.5"
                >
                  <Gamepad2 className="w-4 h-4" />
                  ฝึก 7 พาร์ท & เกมคำศัพท์
                </Link>
              </div>
            </div>
          </div>

          {/* Right (5 cols): Numeric Score Readout & Target Gap */}
          <div className="lg:col-span-5 bg-slate-950 border-2 border-slate-800 p-5 space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-800 pb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400">
                คะแนนทางการ (Official Estimated Score)
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
              เส้นทางวิวัฒนาการตัวละครทั้ง 7 ระดับ (Hero Evolution Roadmap)
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              ปลดล็อกรูปลักษณ์และฉายาใหม่ตามระดับคะแนนสอบจริง คลาสที่ยังไปไม่ถึงจะแสดงเป็นเงาปริศนารอการพิชิต
            </p>
          </div>

          {/* Target Goal Selector */}
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
          3. DEDICATED TOEIC READINESS FORECAST (MODULE 1.6 - 7 PARTS)
          - Distinct Visual Style: Sky/Indigo & Crisp Paper
          - Strict Separation Disclaimer
          - 5 Supportive Performance Tiers
         =================================================================== */}
      <section className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-6 sm:p-7 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-200 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-950 border border-sky-400 text-xs font-display font-bold">
              <Compass className="w-4 h-4 text-sky-700" />
              TOEIC READINESS FORECAST (คาดการณ์ความพร้อมแยก 7 พาร์ท)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              คะแนนคาดการณ์จากการฝึกซ้อมรายพาร์ท
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              คำนวณจากความแม่นยำล่าสุดในแบบฝึกหัด 7-Part Skill Drills ถ่วงน้ำหนักตามโครงสร้างข้อสอบจริง ETS
            </p>
          </div>

          {/* Summed Forecast Score Display */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border-2 border-slate-900 p-4 shadow-[3px_3px_0px_0px_#020617] min-w-[280px]">
            <div className="flex items-center justify-between text-xs text-sky-300 mb-1">
              <span>คะแนนคาดการณ์รวม</span>
              <span className="font-pixel text-[10px] text-slate-400">ESTIMATED TOTAL</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-pixel text-3xl sm:text-4xl text-sky-300 font-bold">
                {readinessForecast?.totalForecastScore || 0}
              </span>
              <span className="font-pixel text-xs text-slate-400">/ 990 คะแนน</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2 pt-2 border-t border-slate-800">
              <span>
                Listening:{' '}
                <strong className="text-sky-300 font-pixel">
                  {readinessForecast?.forecastListeningTotal || 0}
                </strong>
                /495
              </span>
              <span>
                Reading:{' '}
                <strong className="text-emerald-300 font-pixel">
                  {readinessForecast?.forecastReadingTotal || 0}
                </strong>
                /495
              </span>
            </div>
          </div>
        </div>

        {/* Separation Disclaimer Notice */}
        <div className="bg-sky-50/80 border-2 border-sky-200 p-3.5 text-xs text-sky-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>หมายเหตุด้านระบบคะแนน (Strict Separation Rule):</strong>{' '}
            คะแนนคาดการณ์ในส่วนนี้ประมวลผลจากการฝึกซ้อมในหน้า{' '}
            <Link href="/practice" className="underline font-bold text-sky-800 hover:text-sky-950">
              /practice
            </Link>{' '}
            เพื่อชี้เป้าจุดแข็งและจุดที่ต้องพัฒนา{' '}
            <em>จะไม่ถูกนำไปคิดเลเวลตัวละคร หรือปลดล็อกคลาสฮีโร่ จนกว่าคุณจะลงสนามสอบจำลอง Mock Exam ทางการ</em>
          </p>
        </div>

        {/* 7-Part Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((partNum) => {
            const weight = TOEIC_PART_WEIGHTS[partNum] || {
              name: `Part ${partNum}`,
              section: partNum <= 4 ? 'LISTENING' : 'READING',
              maxScore: 100,
              ratioPercent: 10,
            };
            const est = estimatesByPart[partNum];
            const isPracticed = Boolean(est && est.totalQuestions > 0);
            const supportive = isPracticed
              ? est.supportiveInfo || getSupportivePerformanceTier(est.accuracy)
              : null;

            return (
              <div
                key={partNum}
                className={`border-2 p-4 flex flex-col justify-between transition-all ${
                  isPracticed
                    ? 'border-slate-900 bg-white shadow-arcade-sm'
                    : 'border-slate-300 bg-slate-50/80 opacity-80'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold font-display border ${
                        weight.section === 'LISTENING'
                          ? 'bg-sky-100 text-sky-900 border-sky-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {weight.section}
                    </span>
                    <span className="font-pixel text-[10px] text-slate-500">
                      เต็ม {weight.maxScore} คะแนน ({weight.ratioPercent}%)
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">
                      {weight.name}
                    </h3>
                  </div>

                  {isPracticed && supportive ? (
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xs text-slate-500">คาดการณ์: </span>
                          <span className="font-pixel text-lg font-bold text-slate-900">
                            {est.estimatedScore}
                          </span>
                          <span className="font-pixel text-xs text-slate-500">
                            {' '}/ {weight.maxScore}
                          </span>
                        </div>
                        <span className="font-pixel text-xs text-emerald-700 font-bold">
                          {est.accuracy}% แม่นยำ
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 border border-slate-200 space-y-1">
                        <span className="inline-block px-1.5 py-0.5 bg-slate-900 text-amber-300 font-display font-bold text-[10px]">
                          {supportive.stageNameTh}
                        </span>
                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                          {supportive.descriptionTh}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center border-t border-slate-200">
                      <span className="font-pixel text-2xl text-slate-400 block">
                        - / {weight.maxScore}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        ยังไม่มีประวัติการฝึกซ้อม
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100">
                  <Link
                    href={`/practice?part=${partNum}`}
                    className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm text-center flex items-center justify-center gap-1 active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <span>{isPracticed ? 'ฝึกซ้อมเพิ่มเติม' : 'เริ่มฝึกพาร์ทนี้'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================
          4. TWO-COLUMN GUILD LEDGER (Training Grounds + Recent History)
         =================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Guild Training Grounds (3 Core Pillars) */}
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

            {/* Mode B: 7 Separate TOEIC Part Drills & 6 Vocab Games */}
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">
                      ฝึก 7 พาร์ท & Vocab Arcade (CardCraft v2.0)
                    </h3>
                    <span className="font-pixel text-[10px] px-1.5 py-0.2 bg-sky-100 text-sky-800 border border-sky-300">
                      7 Parts + 6 Games
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 reading-measure">
                    ฝึกทำโจทย์แยกพาร์ทอิสระ (Part 1 ถึง 7) และมินิเกมคำศัพท์ 6 รูปแบบ (Rune Match, Dictation, Cloze, Synonym Strike ฯลฯ)
                  </p>
                </div>
              </div>
              <Link
                href="/practice"
                className="shrink-0 px-4 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm text-center"
              >
                เข้าสู่ศูนย์ฝึก
              </Link>
            </div>

            {/* Mode C: Timed Boss Battle Mock Test (7 Standard Packages) */}
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">
                      สนามสอบจำลองทางการ (7 Mock Exam Packages)
                    </h3>
                    <span className="font-pixel text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-800 border border-rose-300">
                      50–200 ข้อ
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 reading-measure">
                    สนามสอบทางการจำลองสัดส่วนมาตรฐาน ETS พร้อมคำนวณคะแนนสเกล 10–990 และวิวัฒนาการตัวละคร 7 Tiers
                  </p>
                </div>
              </div>
              <Link
                href="/mock-test"
                className="shrink-0 px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm hover:-translate-y-0.5 active:translate-y-0 text-center"
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
                  ประวัติการสอบทางการล่าสุด (Official Attempts)
                </h2>
                <p className="text-xs text-slate-500">
                  บันทึกผลจากห้องสอบจำลอง Mock Exam
                </p>
              </div>
              <span className="font-pixel text-xs text-slate-500">
                {recentAttempts.length} ครั้ง
              </span>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                <p>ยังไม่มีประวัติการสอบทางการที่บันทึกไว้</p>
                <p className="text-slate-400">
                  เข้าสู่ระบบแล้วทำ Mock Exam เพื่อบันทึกผลคะแนนและเลื่อนระดับฮีโร่
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
                        {attempt.mode.startsWith('MOCK_EXAM_')
                          ? `สอบจำลอง Mock Exam (${attempt.mode.replace('MOCK_EXAM_', '')} ข้อ)`
                          : attempt.mode === 'MINI_MOCK'
                            ? 'สอบจำลอง Mini Mock'
                            : attempt.mode}
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
