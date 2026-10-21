'use client';

// ============================================================================
// DeckMasteryVisualizer.tsx
// กราฟแอนิเมชันวัดสัดส่วนความเชี่ยวชาญคำศัพท์ และกราฟเส้นจังหวะความแม่นยำ
// สำหรับ Flashcard Swipe Deck ใน CardCraft v2.0
// - 1. Animated Tri-Band Spring Gauge (เขียวมรกต / ทองอำพัน / เทากระดาษ)
// - 2. Session Recall Flow Sparkline (กราฟเส้นไมโครแสดงจังหวะการปัดการ์ด 12 ใบล่าสุด)
// ============================================================================

import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { Activity, CheckCircle2, RotateCcw } from 'lucide-react';
import { formatDecimal } from '@/utils/number-format.util';

interface DeckMasteryVisualizerProps {
  totalCards: number;
  masteredCount: number;
  learningCount: number;
  recentSwipes: boolean[]; // true = mastered, false = learning
}

export default function DeckMasteryVisualizer({
  totalCards,
  masteredCount,
  learningCount,
  recentSwipes,
}: DeckMasteryVisualizerProps) {
  const safeTotal = Math.max(1, totalCards);
  const unseenCount = Math.max(0, totalCards - masteredCount - learningCount);

  const masteredPct = Math.min(100, (masteredCount / safeTotal) * 100);
  const learningPct = Math.min(100 - masteredPct, (learningCount / safeTotal) * 100);
  const unseenPct = Math.max(0, 100 - masteredPct - learningPct);

  // คำนวณ Session Accuracy ล่าสุด
  const sessionSuccessCount = recentSwipes.filter(Boolean).length;
  const sessionAccuracy =
    recentSwipes.length > 0
      ? Math.round((sessionSuccessCount / recentSwipes.length) * 100)
      : 0;

  // คำนวณจุดพิกัด SVG Sparkline (กว้าง 180, สูง 32)
  const sparklineData = useMemo(() => {
    if (recentSwipes.length < 2) return null;

    const width = 180;
    const height = 30;
    const padX = 8;
    const padY = 6;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    const points: { x: number; y: number; isKnown: boolean }[] = [];
    let cumulative = 0;

    recentSwipes.forEach((isKnown, idx) => {
      if (isKnown) cumulative += 1;
      const rate = cumulative / (idx + 1); // 0.0 ถึง 1.0
      const x = padX + (idx / (recentSwipes.length - 1)) * innerW;
      // y: 0.0 อยู่ล่างสุด (height - padY), 1.0 อยู่บนสุด (padY)
      const y = height - padY - rate * innerH;
      points.push({ x, y, isKnown });
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    return { points, pathD, width, height };
  }, [recentSwipes]);

  return (
    <div className="w-full bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade-sm p-3.5 sm:p-4 space-y-3">
      {/* 1. Header & Quick Labels */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-400 border border-slate-900 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-slate-950" />
          </div>
          <span className="font-display font-bold text-slate-950">
            สัดส่วนความคืบหน้าของสำรับ (Deck Mastery Gauge)
          </span>
        </div>

        <div className="flex items-center gap-3 font-medium text-[11px] text-slate-700 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 border border-slate-900 inline-block" />
            จำแม่น:{' '}
            <strong className="font-pixel text-slate-950 text-xs">
              {masteredCount}
            </strong>{' '}
            ({formatDecimal(masteredPct)}%)
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-400 border border-slate-900 inline-block" />
            กำลังจำ:{' '}
            <strong className="font-pixel text-slate-950 text-xs">
              {learningCount}
            </strong>{' '}
            ({formatDecimal(learningPct)}%)
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-slate-200 border border-slate-900 inline-block" />
            ยังไม่เริ่ม:{' '}
            <strong className="font-pixel text-slate-950 text-xs">
              {unseenCount}
            </strong>
          </span>
        </div>
      </div>

      {/* 2. Interactive Tri-Band Spring Gauge */}
      <div className="w-full h-3.5 bg-slate-200 border-2 border-slate-900 overflow-hidden flex shadow-inner">
        {/* แถบสีเขียว: จำแม่นแล้ว */}
        <m.div
          className="h-full bg-emerald-500 border-r border-slate-900"
          initial={{ width: 0 }}
          animate={{ width: `${masteredPct}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        />

        {/* แถบสีทอง: กำลังเรียนรู้ / รอทบทวน */}
        <m.div
          className="h-full bg-amber-400 border-r border-slate-900"
          initial={{ width: 0 }}
          animate={{ width: `${learningPct}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        />

        {/* แถบสีเทา: ยังไม่ได้เริ่ม */}
        <m.div
          className="h-full bg-slate-100"
          initial={{ width: 0 }}
          animate={{ width: `${unseenPct}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        />
      </div>

      {/* 3. Session Recall Flow Sparkline (Micro-Graph แสดงจังหวะการปัด 12 ใบล่าสุด) */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-600">
            จังหวะการจำในเซสชันนี้ ({recentSwipes.length} ใบล่าสุด):
          </span>
          {recentSwipes.length > 0 && (
            <span
              className={`font-pixel text-[11px] px-1.5 py-0.5 border border-slate-900 ${
                sessionAccuracy >= 70
                  ? 'bg-emerald-100 text-emerald-900'
                  : sessionAccuracy >= 50
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-rose-100 text-rose-900'
              }`}
            >
              {sessionAccuracy}% ความแม่นยำ
            </span>
          )}
        </div>

        {/* SVG Sparkline หรือ Prompt เริ่มปัด */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {sparklineData ? (
            <div className="flex items-center gap-2">
              <svg
                width={sparklineData.width}
                height={sparklineData.height}
                viewBox={`0 0 ${sparklineData.width} ${sparklineData.height}`}
                className="overflow-visible bg-[#F8F5EC] border border-slate-300 p-0.5 select-none"
              >
                {/* เส้นประไกด์ 50% */}
                <line
                  x1="8"
                  y1={sparklineData.height / 2}
                  x2={sparklineData.width - 8}
                  y2={sparklineData.height / 2}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* เส้นกราฟเชื่อมความแม่นยำ */}
                <m.path
                  d={sparklineData.pathD}
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />

                {/* จุดพิกเซลสี่เหลี่ยม 6x6px บนแต่ละจุด */}
                {sparklineData.points.map((p, idx) => (
                  <rect
                    key={`pt-${idx}`}
                    x={p.x - 3}
                    y={p.y - 3}
                    width={6}
                    height={6}
                    fill={p.isKnown ? '#10B981' : '#E11D48'}
                    stroke="#0F172A"
                    strokeWidth="1"
                  />
                ))}
              </svg>

              {/* Node ล่าสุด */}
              <span className="text-[10px] text-slate-500 font-pixel">
                {recentSwipes[recentSwipes.length - 1] ? (
                  <span className="text-emerald-700 font-bold">จำได้</span>
                ) : (
                  <span className="text-rose-600 font-bold">ทบทวน</span>
                )}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 italic">
              เริ่มปัดการ์ดเพื่อวาดเส้นความแม่นยำแบบ Real-time
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
