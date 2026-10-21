'use client';

// ============================================================================
// ArcadePerformanceRadar.tsx
// กราฟเรดาร์เพนทากอนสถิติ 5 ด้าน (5-Axis Arcade Performance Radar Chart)
// สำหรับ 6 Vocab Arcade Mini-Games ใน CardCraft v2.0
// - เรดาร์ SVG 5 แกน: ความแม่นยำ, ความเร็ว, คอมโบ, การจดจำ, ความชำนาญ
// - แอนิเมชัน Framer Motion คลี่ตัวจากจุดศูนย์กลาง (Center Spring Expansion)
// - ดีไซน์ Neo-Brutalist & Pixel RPG: ขอบดำ 2px, พื้นกระดาษ, ตัวเลข Silkscreen
// ============================================================================

import React, { useId } from 'react';
import { m } from 'framer-motion';
import { Sparkles, Zap, Award, Target, Flame } from 'lucide-react';
import { formatDecimal } from '@/utils/number-format.util';

export interface ArcadePerformanceStats {
  accuracy: number; // 0 - 100 percentage
  speedWpm: number; // words / minute
  maxStreak: number; // maximum combo achieved
  score: number; // correct answers or score
  totalItems: number; // total items attempted
  timeSpentSeconds: number; // total duration spent
  gameTitle?: string;
}

interface ArcadePerformanceRadarProps {
  stats: ArcadePerformanceStats;
}

export default function ArcadePerformanceRadar({ stats }: ArcadePerformanceRadarProps) {
  const gradientId = useId();

  // ปรับค่าทั้ง 5 แกนให้อยู่ในช่วง 0.15 ถึง 1.0 (ให้มีพื้นที่มองเห็นได้แม้คะแนน 0)
  const accuracyNorm = Math.max(0.15, Math.min(1, stats.accuracy / 100));
  
  // Normalized Speed: เกณฑ์มาตรฐาน 35 WPM = 100%
  const speedNorm = Math.max(0.15, Math.min(1, stats.speedWpm / 35));
  
  // Normalized Streak: เกณฑ์คอมโบ 8 = 100%
  const streakNorm = Math.max(0.15, Math.min(1, stats.maxStreak / 8));
  
  // Normalized Retention: คำนวณจากความแม่นยำผสมกับคอมโบ
  const retentionNorm = Math.max(
    0.15,
    Math.min(1, (stats.accuracy * 0.7 + Math.min(100, stats.maxStreak * 12.5) * 0.3) / 100)
  );

  // Normalized Mastery: คำนวณจากสัดส่วนคะแนนที่ทำได้
  const masteryRatio = stats.totalItems > 0 ? stats.score / stats.totalItems : 0;
  const masteryNorm = Math.max(0.15, Math.min(1, masteryRatio));

  // 5 แกน: [0] ความเร็ว, [1] การจดจำ, [2] ความชำนาญ, [3] คอมโบ, [4] ความแม่นยำ
  const axisMetrics = [
    { label: 'ความเร็ว', valueText: `${stats.speedWpm} WPM`, norm: speedNorm, icon: Zap },
    { label: 'การจดจำ', valueText: `${Math.round(retentionNorm * 100)}%`, norm: retentionNorm, icon: Award },
    { label: 'ความชำนาญ', valueText: `${Math.round(masteryNorm * 100)}%`, norm: masteryNorm, icon: Target },
    { label: 'คอมโบ', valueText: `${stats.maxStreak}x`, norm: streakNorm, icon: Flame },
    { label: 'ความแม่นยำ', valueText: `${Math.round(stats.accuracy)}%`, norm: accuracyNorm, icon: Sparkles },
  ];

  // พารามิเตอร์เรดาร์ SVG
  const cx = 160;
  const cy = 135;
  const maxR = 85;
  const totalAxes = 5;

  // ฟังก์ชันคำนวณพิกัดมุมเรดาร์ (เริ่มที่ยอดบนสุด -90 องศา)
  const getCoordinates = (index: number, radiusRatio: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / totalAxes;
    return {
      x: cx + maxR * radiusRatio * Math.cos(angle),
      y: cy + maxR * radiusRatio * Math.sin(angle),
    };
  };

  // สร้างจุดสำหรับโครงตาข่าย 3 ระดับ (33%, 66%, 100%)
  const gridLevels = [0.33, 0.66, 1.0];
  const gridPolygons = gridLevels.map((lvl) => {
    return Array.from({ length: totalAxes })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  // สร้างจุดของข้อมูลผู้เล่นจริง
  const playerPoints = axisMetrics
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.norm);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // คำนวณ EXP ที่ได้รับจากการประลอง
  const expEarned = Math.round(stats.score * 20 + stats.maxStreak * 15);

  return (
    <div className="w-full max-w-lg mx-auto bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-4 sm:p-5 space-y-4">
      {/* Header ของเรดาร์ */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-400 border border-slate-900 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-slate-950" />
          </div>
          <span className="font-display font-bold text-sm text-slate-950">
            กราฟประเมินทักษะการประลอง 5 ด้าน
          </span>
        </div>
        <span className="font-pixel text-[11px] px-2 py-0.5 bg-slate-900 text-amber-300">
          ARCADE RADAR
        </span>
      </div>

      {/* กราฟ SVG 5-Axis Spider Radar */}
      <div className="relative w-full aspect-[4/3] max-h-[270px] flex items-center justify-center bg-[#F8F5EC] border border-slate-300 overflow-hidden">
        <svg
          viewBox="0 0 320 270"
          className="w-full h-full select-none"
          aria-label="Arcade Performance 5-Axis Radar Chart"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* เส้นโครงใยตาข่าย 3 ระดับ */}
          {gridPolygons.map((pts, idx) => (
            <polygon
              key={`grid-${idx}`}
              points={pts}
              fill={idx === 2 ? '#FFFDF7' : 'none'}
              stroke="#0F172A"
              strokeWidth={idx === 2 ? '1.5' : '1'}
              strokeDasharray={idx === 2 ? undefined : '3 3'}
              opacity={idx === 2 ? 0.9 : 0.3}
            />
          ))}

          {/* เส้นรัศมี Spoke 5 แกน จากศูนย์กลาง */}
          {Array.from({ length: totalAxes }).map((_, i) => {
            const { x, y } = getCoordinates(i, 1.0);
            return (
              <line
                key={`spoke-${i}`}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="#0F172A"
                strokeWidth="1"
                strokeOpacity="0.25"
              />
            );
          })}

          {/* รูปหลายเหลี่ยมสถิติผู้เล่น (Animated Player Data Polygon) */}
          <m.polygon
            points={playerPoints}
            fill={`url(#${gradientId})`}
            stroke="#D97706"
            strokeWidth="2.5"
            strokeLinejoin="round"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 160,
              damping: 18,
              delay: 0.2,
            }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* จุดหมุดสี่เหลี่ยมพิกเซล 8x8px ที่ปลายยอดทั้ง 5 ด้าน */}
          {axisMetrics.map((axis, i) => {
            const { x, y } = getCoordinates(i, axis.norm);
            return (
              <m.rect
                key={`point-${i}`}
                x={x - 4}
                y={y - 4}
                width={8}
                height={8}
                fill="#0F172A"
                stroke="#FBBF24"
                strokeWidth="1.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                  delay: 0.35 + i * 0.06,
                }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            );
          })}

          {/* ป้ายชื่อและตัวเลขสถิติรอบนอกทั้ง 5 แกน */}
          {axisMetrics.map((axis, i) => {
            const { x, y } = getCoordinates(i, 1.25);
            // ปรับตำแหน่งตัวอักษรให้อยู่ในกรอบ ViewBox
            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            let dy = 0;
            if (i === 0) {
              dy = -6;
            } else if (i === 1 || i === 2) {
              textAnchor = 'start';
            } else if (i === 3 || i === 4) {
              textAnchor = 'end';
            }

            return (
              <g key={`label-${i}`} transform={`translate(${x}, ${y + dy})`}>
                <text
                  textAnchor={textAnchor}
                  className="font-sans font-bold text-[10px] fill-slate-800"
                >
                  {axis.label}
                </text>
                <text
                  textAnchor={textAnchor}
                  y={13}
                  className="font-pixel text-[11px] font-bold fill-slate-950"
                >
                  {axis.valueText}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* เกจสะสม EXP ประลองคำศัพท์ (Stepped Experience Bar) */}
      <div className="p-3 bg-[#F8F5EC] border-2 border-slate-900 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            EXP ที่ได้รับจากการประลองรอบนี้:
          </span>
          <span className="font-pixel font-bold text-amber-700 text-xs">
            +{expEarned} EXP
          </span>
        </div>
        <div className="w-full h-3 bg-slate-200 border border-slate-900 overflow-hidden flex">
          <m.div
            className="h-full bg-amber-400 border-r border-slate-900"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(15, (expEarned / 350) * 100))}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.4 }}
          />
        </div>
      </div>

      {/* 3 กล่องสถิติย่อยแบบ Neo-Brutalist */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-emerald-50 border border-slate-900">
          <div className="text-[10px] font-bold text-emerald-800">ความแม่นยำ</div>
          <div className="text-base font-bold font-pixel text-emerald-700">
            {formatDecimal(stats.accuracy)}%
          </div>
        </div>

        <div className="p-2 bg-sky-50 border border-slate-900">
          <div className="text-[10px] font-bold text-sky-800">ความเร็ว</div>
          <div className="text-base font-bold font-pixel text-sky-700">
            {stats.speedWpm} <span className="text-[10px]">WPM</span>
          </div>
        </div>

        <div className="p-2 bg-amber-50 border border-slate-900">
          <div className="text-[10px] font-bold text-amber-800">คอมโบสูงสุด</div>
          <div className="text-base font-bold font-pixel text-amber-700">
            {stats.maxStreak}x
          </div>
        </div>
      </div>
    </div>
  );
}
