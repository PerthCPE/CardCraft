'use client';

// ============================================================================
// frontend/src/app/page.tsx
// CardCraft v2.0: หน้าหลัก Hero Dashboard & 7-Stage Character Evolution Roadmap
// ยกระดับดีไซน์ตามแนวทาง /frontend-design & /cardcraft-pixel-ui:
// 1. Hero Dossier & Official Score Ledger: วาง Hero Avatar และคะแนนทางการอย่างสง่างาม
// 2. 7-Stage Character Evolution Roadmap: แผนผังเส้นทางวิวัฒนาการแบบเชื่อมต่อ พร้อมป้าย GOAL ตามเป้าหมาย
// 3. Dedicated TOEIC Readiness Forecast: จัดหมวดหมู่แยกพาร์ท Listening (Parts 1-4) และ Reading (Parts 5-7)
// 4. 3 Grand Adventure Portals (Training Grounds): ออกแบบเป็นการ์ดทางเข้าผจญภัย 3 มิติ สะอาดตา
// 5. รองรับ Responsive ทุกอุปกรณ์ สัมผัสนุ่มนวลด้วย Tactile Neo-Brutalist & Pixel Art
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Crosshair,
  Flame,
  Gamepad2,
  Headphones,
  Info,
  Layers,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  User,
  Zap,
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
import {
  formatDecimal,
  formatAccuracyPercent,
  formatPercent,
} from '@/utils/number-format.util';
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
        // ignore error
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
      queryClient.setQueryData(['dashboard-summary', 'guest'], newDashboard);
    }
  };

  if (!dashboard) {
    return (
      <div className="bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-10 text-center">
        <p className="text-sm text-slate-600 font-sans">
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* =================================================================== */}
      {/* 1. HERO DOSSIER & SCORE LEDGER (Official Hero Centerpiece)         */}
      {/* =================================================================== */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-amber-50 border-2 border-slate-950 shadow-arcade-lg p-5 sm:p-8 rounded-none relative overflow-hidden">
        {/* Ambient Subtle Accent Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column (7 cols): Character Pedestal & Identity */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
            {/* Elevated 3D Pedestal for Character Sprite */}
            <div className="bg-[#FFFDF7] text-slate-900 border-2 border-slate-950 shadow-[5px_5px_0px_0px_#020617] p-3.5 sm:p-4 flex flex-col items-center justify-center shrink-0 w-36 sm:w-44">
              <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
                <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-slate-900 text-amber-300 border border-slate-900">
                  Lv.{evolution.unlockedTier}
                </span>
                <span className="font-pixel text-[10px] text-slate-500">
                  {evolution.currentTier.minScore}+
                </span>
              </div>
              <div className="my-1 py-1">
                <PixelCharacterAvatar
                  tier={evolution.unlockedTier}
                  size="xl"
                  isLocked={false}
                  priority={true}
                />
              </div>
              <span className="text-[10px] font-pixel text-slate-600 mt-1 uppercase tracking-wider">
                TIER {evolution.unlockedTier} OF 7
              </span>
            </div>

            {/* Character Lore & Action Buttons */}
            <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 text-xs text-amber-300">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Official Hero Level (ระดับ {evolution.unlockedTier} จาก 7)
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-thai text-white tracking-tight leading-tight">
                  {evolution.classTitle}{' '}
                  <span className="text-amber-400 font-normal text-xl sm:text-2xl">
                    ({evolution.classTitleTh})
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>ผู้ท้าชิง:</span>
                  <strong className="text-white font-semibold">
                    {user?.name || 'ผู้เล่นทั่วไป (โหมดผู้เยี่ยมชม)'}
                  </strong>
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
                {evolution.currentTier.descriptionTh}
              </p>

              {/* Action Buttons Row */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {!authUser ? (
                  <button
                    type="button"
                    onClick={() =>
                      openAuthModal(
                        'เข้าสู่ระบบหรือสร้างบัญชีใหม่ เพื่อเริ่มทำแบบทดสอบ บันทึกคะแนน และเลื่อนระดับคลาสฮีโร่ของคุณ',
                      )
                    }
                    className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-xs sm:text-sm border-2 border-slate-950 shadow-[3px_3px_0px_0px_#020617] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    เข้าสู่ระบบ / สมัครสมาชิกเพื่อเริ่มเล่น
                  </button>
                ) : (
                  <Link
                    href="/mock-test"
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs sm:text-sm border-2 border-slate-950 shadow-[3px_3px_0px_0px_#020617] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Swords className="w-4 h-4 text-slate-950" />
                    เข้าสนามสอบจำลองเพื่อเลื่อนคลาส
                  </Link>
                )}

                <Link
                  href="/practice"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-display font-bold text-xs sm:text-sm border-2 border-slate-700 active:translate-x-[1px] active:translate-y-[1px] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4 text-sky-300" />
                  ฝึก 7 พาร์ท & เกมคำศัพท์
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Numeric Score Readout & Target Gap */}
          <div className="lg:col-span-5 bg-slate-950 border-2 border-slate-800 p-5 sm:p-6 space-y-4 shadow-inner">
            <div className="flex items-baseline justify-between border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                คะแนนทางการ (Official Estimated Score)
              </span>
              <span className="text-xs text-amber-300 font-semibold">
                เป้าหมาย {currentTargetScore} คะแนน
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="font-pixel text-4xl sm:text-5xl text-amber-300 tracking-tight">
                {formatDecimal(evolution.estimatedScore)}
              </span>
              <span className="font-pixel text-xs sm:text-sm text-slate-400">
                / 990 คะแนน
              </span>
            </div>

            {/* Target Progress Meter */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-3 bg-slate-800 border border-slate-700 overflow-hidden relative">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (evolution.estimatedScore / currentTargetScore) * 100,
                      ),
                    )}%`,
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
                <span className="font-sans">
                  {isTargetAchieved
                    ? `ผ่านเกณฑ์เป้าหมาย ${currentTargetScore}+ แล้ว`
                    : `ห่างจากเป้าหมาย ${currentTargetScore} คะแนนอีก ${formatDecimal(pointsToTarget)} คะแนน`}
                </span>
              </div>
              <span className="font-pixel text-[11px] text-amber-300">
                {currentTargetScore}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. 7-STAGE EVOLUTION ROADMAP (Connecting Expedition Track)          */}
      {/* =================================================================== */}
      <section className="bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-5 sm:p-7 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold font-thai text-slate-950">
              เส้นทางวิวัฒนาการตัวละครทั้ง 7 ระดับ (Hero Evolution Roadmap)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-sans max-w-2xl leading-relaxed">
              ปลดล็อกรูปลักษณ์และฉายาใหม่ตามระดับคะแนนสอบจริง คลาสที่ยังไปไม่ถึงจะแสดงเป็นเงาปริศนารอการพิชิต
            </p>
          </div>

          {/* Target Goal Selector */}
          <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2.5 bg-slate-50 border-2 border-slate-900 p-2 sm:px-3 sm:py-2 shadow-arcade-sm self-start xl:self-auto">
            <span className="text-xs font-bold font-display text-slate-900 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              เลือกเป้าหมายคะแนน:
            </span>
            <div className="grid grid-cols-4 gap-1.5 shrink-0 w-full sm:w-auto">
              {TARGET_GOAL_OPTIONS.map((score) => {
                const active = currentTargetScore === score;
                return (
                  <button
                    key={score}
                    type="button"
                    disabled={isUpdatingTarget}
                    onClick={() => handleUpdateTargetScore(score)}
                    className={`px-2.5 sm:px-3 py-1 font-pixel text-xs border-2 transition-all active:translate-y-[1px] cursor-pointer text-center whitespace-nowrap ${
                      active
                        ? 'bg-emerald-400 text-slate-950 border-slate-950 font-bold shadow-[2px_2px_0px_0px_#020617]'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {score}+
                  </button>
                );
              })}
            </div>
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
                className={`relative border-2 p-3.5 flex flex-col items-center text-center transition-all ${
                  tier.isCurrent
                    ? 'border-slate-950 bg-amber-50 shadow-[4px_4px_0px_0px_#0f172a] ring-2 ring-amber-400'
                    : tier.isUnlocked
                      ? 'border-slate-900 bg-white shadow-[2px_2px_0px_0px_#0f172a]'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                {/* Dynamic Goal Badge */}
                {isTargetGoal && (
                  <span className="absolute -top-3.5 px-2 py-0.5 bg-emerald-400 text-slate-950 font-pixel text-[9px] font-bold border-2 border-slate-950 shadow-[1px_1px_0px_0px_#020617] select-none">
                    GOAL {currentTargetScore}+
                  </span>
                )}

                <div className="w-full flex items-center justify-between text-[10px] text-slate-500 font-pixel mb-1">
                  <span>Lv.{tier.tier}</span>
                  <span>{tier.minScore}+</span>
                </div>

                <div className="my-2.5 h-16 flex items-center justify-center">
                  <PixelCharacterAvatar
                    tier={tier.tier}
                    size="md"
                    isLocked={!tier.isUnlocked}
                  />
                </div>

                <h3 className="font-display font-bold text-xs text-slate-900 truncate w-full">
                  {tier.title}
                </h3>
                <p className="text-[11px] text-slate-600 truncate w-full mt-0.5 font-sans">
                  {tier.titleTh}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-200 w-full flex items-center justify-center text-[10px]">
                  {tier.isCurrent ? (
                    <span className="font-display font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-300">
                      คลาสปัจจุบัน
                    </span>
                  ) : tier.isUnlocked ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ปลดล็อกแล้ว
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Lock className="w-3 h-3 text-slate-400" /> ล็อกอยู่
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. DEDICATED TOEIC READINESS FORECAST (MODULE 1.6 - 7 PARTS)         */}
      {/* =================================================================== */}
      <section className="bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-5 sm:p-7 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-200 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-950 border border-sky-400 text-xs font-display font-bold">
              <Compass className="w-4 h-4 text-sky-700" />
              TOEIC READINESS FORECAST (คาดการณ์ความพร้อมแยก 7 พาร์ท)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-thai text-slate-950">
              คะแนนคาดการณ์จากการฝึกซ้อมรายพาร์ท
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-sans">
              คำนวณจากความแม่นยำล่าสุดในแบบฝึกหัด 7-Part Skill Drills ถ่วงน้ำหนักตามโครงสร้างข้อสอบจริง ETS
            </p>
          </div>

          {/* Summed Forecast Score Display */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border-2 border-slate-900 p-4 shadow-[4px_4px_0px_0px_#020617] min-w-[280px]">
            <div className="flex items-center justify-between text-xs text-sky-300 mb-1">
              <span className="font-semibold">คะแนนคาดการณ์รวม</span>
              <span className="font-pixel text-[10px] text-slate-400">ESTIMATED TOTAL</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-pixel text-3xl sm:text-4xl text-sky-300 font-bold">
                {readinessForecast?.totalForecastScore || 0}
              </span>
              <span className="font-pixel text-xs text-slate-400">/ 990 คะแนน</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2.5 pt-2 border-t border-slate-800">
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
        <div className="bg-sky-50/90 border-2 border-sky-300 p-3.5 text-xs text-sky-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-sans">
            <strong>หมายเหตุด้านระบบคะแนน (Strict Separation Rule):</strong>{' '}
            คะแนนคาดการณ์ในส่วนนี้ประมวลผลจากการฝึกซ้อมในหน้า{' '}
            <Link
              href="/practice"
              className="underline font-bold text-sky-900 hover:text-sky-950"
            >
              /practice
            </Link>{' '}
            เพื่อชี้เป้าจุดแข็งและจุดที่ต้องพัฒนา{' '}
            <em>
              จะไม่ถูกนำไปคิดเลเวลตัวละคร หรือปลดล็อกคลาสฮีโร่ จนกว่าคุณจะลงสนามสอบจำลอง Mock Exam ทางการ
            </em>
          </p>
        </div>

        {/* Section A: Listening Comprehension (Parts 1 - 4) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-sky-200 pb-2">
            <Headphones className="w-4 h-4 text-sky-700" />
            <h3 className="text-sm font-bold font-thai text-slate-900">
              หมวดการฟัง (Listening Comprehension - Parts 1 ถึง 4, เต็ม 495 คะแนน)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((partNum) => {
              const weight = TOEIC_PART_WEIGHTS[partNum] || {
                name: `Part ${partNum}`,
                section: 'LISTENING',
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
                      ? 'border-slate-900 bg-white shadow-[3px_3px_0px_0px_#0f172a]'
                      : 'border-slate-300 bg-slate-50/80 opacity-80'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold font-display bg-sky-100 text-sky-900 border border-sky-300">
                        {weight.section}
                      </span>
                      <span className="font-pixel text-[10px] text-slate-500">
                        เต็ม {formatDecimal(weight.maxScore)} คะแนน ({formatDecimal(weight.ratioPercent)}%)
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900">
                        {weight.name}
                      </h4>
                    </div>

                    {isPracticed && supportive ? (
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-slate-500">คาดการณ์: </span>
                            <span className="font-pixel text-base font-bold text-slate-900">
                              {formatDecimal(est.estimatedScore)}
                            </span>
                            <span className="font-pixel text-xs text-slate-500">
                              {' '}/ {formatDecimal(weight.maxScore)}
                            </span>
                          </div>
                          <span className="font-pixel text-xs text-emerald-700 font-bold">
                            {formatAccuracyPercent(est.accuracy)}% แม่นยำ
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
                      className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm text-center flex items-center justify-center gap-1 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                    >
                      <span>{isPracticed ? 'ฝึกซ้อมเพิ่มเติม' : 'เริ่มฝึกพาร์ทนี้'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section B: Reading Comprehension (Parts 5 - 7) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-emerald-200 pb-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold font-thai text-slate-900">
              หมวดการอ่าน (Reading Comprehension - Parts 5 ถึง 7, เต็ม 495 คะแนน)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[5, 6, 7].map((partNum) => {
              const weight = TOEIC_PART_WEIGHTS[partNum] || {
                name: `Part ${partNum}`,
                section: 'READING',
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
                      ? 'border-slate-900 bg-white shadow-[3px_3px_0px_0px_#0f172a]'
                      : 'border-slate-300 bg-slate-50/80 opacity-80'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold font-display bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {weight.section}
                      </span>
                      <span className="font-pixel text-[10px] text-slate-500">
                        เต็ม {formatDecimal(weight.maxScore)} คะแนน ({formatDecimal(weight.ratioPercent)}%)
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900">
                        {weight.name}
                      </h4>
                    </div>

                    {isPracticed && supportive ? (
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-slate-500">คาดการณ์: </span>
                            <span className="font-pixel text-base font-bold text-slate-900">
                              {formatDecimal(est.estimatedScore)}
                            </span>
                            <span className="font-pixel text-xs text-slate-500">
                              {' '}/ {formatDecimal(weight.maxScore)}
                            </span>
                          </div>
                          <span className="font-pixel text-xs text-emerald-700 font-bold">
                            {formatAccuracyPercent(est.accuracy)}% แม่นยำ
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
                      className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm text-center flex items-center justify-center gap-1 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                    >
                      <span>{isPracticed ? 'ฝึกซ้อมเพิ่มเติม' : 'เริ่มฝึกพาร์ทนี้'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. THE 3 ADVENTURE PORTALS & RECENT ATTEMPTS (Training Grounds)     */}
      {/* =================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): The 3 Grand Adventure Portals */}
        <div className="lg:col-span-7 bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-5 sm:p-7 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-thai text-slate-950">
              ลานฝึกฝนหลัก (Training Grounds)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-sans">
              ระบบฝึกฝน 3 เสาหลักเพื่อยกระดับคะแนน Listening และ Reading สู่เป้าหมาย {currentTargetScore}+
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Portal A: 3D Flashcards Deck */}
            <div className="bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-amber-400 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
                  <img
                    src="/icons/icon-deck.png"
                    alt=""
                    className="w-7 h-7 object-contain [image-rendering:pixelated]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900 font-thai">
                      สำรับการ์ดคำศัพท์ 3D Flip
                    </h3>
                    <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {formatDecimal(masteryPercent)}% จำได้
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-md">
                    พจนานุกรมคำศัพท์ธุรกิจออกสอบบ่อย {stats.totalFlashcards.toLocaleString()} คำ พร้อมระบบ Spaced Repetition และโหมดปัดการ์ด 3D
                  </p>
                </div>
              </div>
              <Link
                href="/flashcards"
                className="shrink-0 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px] text-center cursor-pointer"
              >
                เปิดสำรับการ์ด
              </Link>
            </div>

            {/* Portal B: 7 Separate TOEIC Part Drills & 6 Vocab Games */}
            <div className="bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-sky-400 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
                  <img
                    src="/icons/icon-listening.png"
                    alt=""
                    className="w-7 h-7 object-contain [image-rendering:pixelated]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900 font-thai">
                      ฝึก 7 พาร์ท & Vocab Arcade (CardCraft v2.0)
                    </h3>
                    <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-sky-100 text-sky-800 border border-sky-300">
                      7 Parts + 6 Games
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-md">
                    ฝึกทำโจทย์แยกพาร์ทอิสระ (Part 1 ถึง 7) และมินิเกมคำศัพท์ 6 รูปแบบ (Rune Match, Dictation, Cloze, Synonym Strike ฯลฯ)
                  </p>
                </div>
              </div>
              <Link
                href="/practice"
                className="shrink-0 px-4 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px] text-center cursor-pointer"
              >
                เข้าสู่ศูนย์ฝึก
              </Link>
            </div>

            {/* Portal C: Timed Boss Battle Mock Test (7 Standard Packages) */}
            <div className="bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:shadow-[5px_5px_0px_0px_#0f172a] p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-rose-500 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
                  <img
                    src="/icons/icon-boss-gate.png"
                    alt=""
                    className="w-7 h-7 object-contain [image-rendering:pixelated]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900 font-thai">
                      สนามสอบจำลองทางการ (7 Mock Exam Packages)
                    </h3>
                    <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300">
                      50–200 ข้อ
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-md">
                    สนามสอบทางการจำลองสัดส่วนมาตรฐาน ETS พร้อมคำนวณคะแนนสเกล 10–990 และวิวัฒนาการตัวละคร 7 Tiers
                  </p>
                </div>
              </div>
              <Link
                href="/mock-test"
                className="shrink-0 px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px] text-center cursor-pointer"
              >
                เข้าสู่สนามสอบ
              </Link>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Recent Attempts Ledger & Admin Link */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold font-thai text-slate-900">
                  ประวัติการสอบทางการล่าสุด (Official Attempts)
                </h2>
                <p className="text-xs text-slate-500 font-sans">
                  บันทึกผลจากห้องสอบจำลอง Mock Exam
                </p>
              </div>
              <span className="font-pixel text-xs text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300">
                {recentAttempts.length} ครั้ง
              </span>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                <Trophy className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                <p className="font-medium text-slate-700">
                  ยังไม่มีประวัติการสอบทางการที่บันทึกไว้
                </p>
                <p className="text-slate-500">
                  เข้าสู่ระบบแล้วทำ Mock Exam เพื่อบันทึกผลคะแนนและเลื่อนระดับฮีโร่
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-sm">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="py-3 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">
                        {attempt.mode.startsWith('MOCK_EXAM_')
                          ? `สอบจำลอง Mock Exam (${attempt.mode.replace('MOCK_EXAM_', '')} ข้อ)`
                          : attempt.mode === 'MINI_MOCK'
                            ? 'สอบจำลอง Mini Mock'
                            : attempt.mode}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ฟังถูก {attempt.listeningCorrect} ข้อ · อ่านถูก{' '}
                        {attempt.readingCorrect} ข้อ
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-pixel text-sm text-slate-900 font-bold">
                        {formatDecimal(attempt.estimatedScore)}
                      </span>
                      <div className="mt-0.5">
                        <span
                          className={`inline-block font-pixel text-[9px] px-1.5 py-0.5 border border-slate-900 ${
                            attempt.isPassedTarget
                              ? 'bg-emerald-400 text-slate-950 font-bold'
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
                <h3 className="font-bold text-sm text-amber-400 font-thai">
                  ระบบจัดการฐานข้อมูล (CRUD Manager)
                </h3>
                <p className="text-xs text-slate-300 font-sans">
                  เพิ่ม แก้ไข หรือลบรายการคำศัพท์ ({stats.totalFlashcards.toLocaleString()} คำ) และข้อสอบ ({stats.totalQuestions} ข้อ)
                </p>
              </div>
              <Link
                href="/admin"
                className="shrink-0 px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617] cursor-pointer"
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
