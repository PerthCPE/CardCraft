'use client';

// ============================================================================
// frontend/src/app/page.tsx
// หน้าหลัก Hero Dashboard & 7-Stage Character Evolution Roadmap
// ปรับปรุงด้วยหลักการของ frontend-design + cardcraft-pixel-ui:
// - จัดลำดับชั้นฟอนต์ (Typography Hierarchy) แยกชัดเจนระหว่างชื่อคลาส (Chakra Petch),
//   เนื้อหาคำอธิบาย (IBM Plex Sans Thai + Plus Jakarta Sans) และตัวเลขคะแนน (Silkscreen)
// - ตัดป้ายกำกับ ALL-CAPS ซ้ำซ้อนและตัดการ์ดเรียง 1-2-3-4 แบบแพตเทิร์น AI ทั่วไปออก
//   เปลี่ยนเป็นเลย์เอาต์ 2 คอลัมน์แบบสมดุลไม่สมมาตร (Asymmetric Guild Ledger)
// ============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Crosshair,
  Lock,
  Sliders,
} from 'lucide-react';
import {
  DashboardSummaryResponse,
  fetchDashboardSummary,
  updateHeroProfile,
} from '@/lib/api';
import { PixelCharacterAvatar } from '@/components/PixelCharacterAvatar';
import { getCharacterEvolution } from '@/utils/character-evolution.util';
import { useAuth } from '@/context/AuthContext';

const DEMO_SCORE_PRESETS = [
  { label: '180', score: 180 },
  { label: '310', score: 310 },
  { label: '485', score: 485 },
  { label: '625', score: 625 },
  { label: '745', score: 745 },
  { label: '845', score: 845 },
  { label: '955', score: 955 },
];

export default function DashboardPage() {
  const { user: authUser, refreshUser } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardSummaryResponse | null>(
    null,
  );
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchDashboardSummary(authUser?.id).then(setDashboard);
  }, [authUser?.id]);

  const handleSimulateScore = async (newScore: number) => {
    if (!dashboard) return;
    setIsSimulating(true);
    const updated = await updateHeroProfile(
      {
        currentEstimatedScore: newScore,
      },
      authUser?.id,
    );
    setDashboard({
      ...dashboard,
      user: updated.user,
      evolution: getCharacterEvolution(
        updated.user.currentEstimatedScore,
        updated.user.targetScore,
      ),
    });
    await refreshUser();
    setIsSimulating(false);
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
                  ผู้ท้าชิง: <strong className="text-white">{user.name}</strong>
                </p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed reading-measure">
                {evolution.currentTier.descriptionTh}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Link
                  href="/mock-test"
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-sm border-2 border-slate-950 shadow-[3px_3px_0px_0px_#020617] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] transition-all"
                >
                  เข้าสอบจำลองเพื่อเลื่อนคลาส
                </Link>
                <Link
                  href="/flashcards"
                  className="px-4 py-2 bg-slate-800 text-slate-100 font-display font-semibold text-sm border-2 border-slate-950 hover:bg-slate-700 transition-colors"
                >
                  ทบทวนคำศัพท์ ({stats.masteredCards}/{stats.totalFlashcards})
                </Link>
              </div>
            </div>
          </div>

          {/* Right (5 cols): Score Readout & 700+ Threshold Meter */}
          <div className="lg:col-span-5 bg-slate-800/90 border-2 border-slate-950 p-5 space-y-4 shadow-[4px_4px_0px_0px_#020617]">
            <div className="flex items-start justify-between border-b border-slate-700 pb-4">
              <div>
                <p className="text-xs text-slate-300">คะแนนประเมิน TOEIC ปัจจุบัน</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-pixel text-4xl text-amber-400">
                    {evolution.estimatedScore}
                  </span>
                  <span className="font-pixel text-xs text-slate-400">
                    / 990
                  </span>
                </div>
              </div>
              <img
                src="/icons/icon-trophy-700.png"
                alt="700+ Trophy"
                className="w-11 h-11 object-contain [image-rendering:pixelated]"
              />
            </div>

            {/* Tier Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  ความคืบหน้าในคลาส {evolution.classTitle}
                </span>
                <span className="font-pixel text-amber-300">
                  {evolution.tierExpPercentage}%
                </span>
              </div>
              <div className="w-full h-4 bg-slate-950 border border-slate-600 p-0.5">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${evolution.tierExpPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-300 pt-0.5">
                {evolution.nextTier ? (
                  <>
                    ต้องการอีก{' '}
                    <strong className="font-pixel text-amber-300">
                      {evolution.pointsToNextTier}
                    </strong>{' '}
                    คะแนน เพื่อปลดล็อกคลาส{' '}
                    <strong className="text-white">
                      {evolution.nextTier.title}
                    </strong>
                  </>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    อยู่ในคลาสสูงสุดของระบบแล้ว
                  </span>
                )}
              </p>
            </div>

            {/* 700+ Goal Status */}
            <div
              className={`p-3 border-2 border-slate-950 flex items-center justify-between text-xs font-medium ${
                evolution.isPassedTarget
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-slate-900 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {evolution.isPassedTarget ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <Crosshair className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>
                  {evolution.isPassedTarget
                    ? 'ผ่านเกณฑ์เป้าหมาย 700+ (High Paladin) แล้ว'
                    : `ห่างจากเป้าหมาย 700 คะแนนอีก ${evolution.pointsToTarget700} คะแนน`}
                </span>
              </div>
              <span className="font-pixel text-[10px]">
                {user.targetScore}
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

          {/* Compact Score Simulator for Presentation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 border border-slate-300 px-3 py-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-600 mr-1" />
            <span className="text-xs text-slate-600 mr-1">ทดลองเปลี่ยนคะแนน:</span>
            {DEMO_SCORE_PRESETS.map((preset) => {
              const active =
                Math.abs(evolution.estimatedScore - preset.score) < 20;
              return (
                <button
                  key={preset.score}
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handleSimulateScore(preset.score)}
                  className={`px-2 py-0.5 font-pixel text-[10px] border transition-colors ${
                    active
                      ? 'bg-slate-900 text-amber-300 border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {evolution.roadmap.map((stage) => {
            const isTargetStage = stage.isTargetGoalTier;
            return (
              <div
                key={stage.tier}
                className={`p-3.5 border-2 border-slate-900 flex flex-col justify-between transition-all ${
                  stage.isCurrent
                    ? 'bg-amber-100/90 shadow-arcade -translate-y-0.5'
                    : stage.isUnlocked
                      ? isTargetStage
                        ? 'bg-emerald-50/80'
                        : 'bg-white'
                      : 'bg-slate-100/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`font-pixel text-[10px] px-1.5 py-0.5 border border-slate-900 ${
                      stage.isCurrent
                        ? 'bg-amber-400 text-slate-950'
                        : stage.isUnlocked
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    T{stage.tier}
                  </span>

                  {isTargetStage && (
                    <span className="font-pixel text-[9px] px-1.5 py-0.5 bg-emerald-500 text-slate-950 border border-slate-900">
                      700+
                    </span>
                  )}
                </div>

                <div className="my-2 relative flex items-center justify-center">
                  <PixelCharacterAvatar
                    tier={stage.tier}
                    size="md"
                    isLocked={!stage.isUnlocked}
                  />
                  {!stage.isUnlocked && (
                    <span className="absolute -bottom-1 inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 text-amber-300 font-pixel text-[9px] border border-slate-950">
                      <Lock className="w-2.5 h-2.5" />
                      {stage.minScore}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 text-left">
                  <p className="font-display font-bold text-xs text-slate-900 truncate">
                    {stage.title}
                  </p>
                  <p className="text-[11px] text-slate-600 truncate">
                    {stage.titleTh}
                  </p>
                  <p className="font-pixel text-[10px] text-slate-500 mt-1">
                    {stage.minScore}–{stage.maxScore}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================
          3. ASYMMETRIC 2-COLUMN WORKSPACE (Training Grounds & Score Ledger)
         =================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Training Modes */}
        <div className="lg:col-span-7 bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-6 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">
              โหมดฝึกฝนและเตรียมสอบ
            </h2>
            <p className="text-sm text-slate-600">
              เลือกฝึกคำศัพท์ เจาะลึกโจทย์รายพาร์ท หรือเข้าสนามสอบจับเวลาเพื่ออัปเดตระดับคลาส
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {/* Mode A: Flashcards & 60-Word Dictionary */}
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
                      สำรับการ์ดคำศัพท์และพจนานุกรม 60 คำ
                    </h3>
                    <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-900 border border-slate-900">
                      {masteryPercent}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 reading-measure">
                    ปัดขวาเมื่อจำแม่น ปัดซ้ายเพื่อทบทวนซ้ำ หรือค้นหาศัพท์จาก 8 หมวดธุรกิจออกสอบบ่อย
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
                    ทำข้อสอบรวม 15 ข้อภายใต้เวลา 15 นาที เพื่อคำนวณคะแนนสเกล 10–990 และปลดล็อกคลาสใหม่
                  </p>
                </div>
              </div>
              <Link
                href="/mock-test"
                className="shrink-0 px-4 py-2 bg-rose-500 text-white font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm hover:bg-rose-600 text-center"
              >
                เข้าห้องสอบ
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
          </div>

          {/* Admin Guild CRUD Card */}
          <div className="bg-slate-900 text-slate-100 border-2 border-slate-950 shadow-arcade p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-amber-400">
                ระบบจัดการฐานข้อมูล (CRUD Manager)
              </h3>
              <p className="text-xs text-slate-300">
                เพิ่ม แก้ไข หรือลบรายการคำศัพท์ ({stats.totalFlashcards} คำ) และข้อสอบ ({stats.totalQuestions} ข้อ)
              </p>
            </div>
            <Link
              href="/admin"
              className="shrink-0 px-3.5 py-2 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617]"
            >
              จัดการข้อมูล
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
