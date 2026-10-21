'use client';

// ============================================================================
// WeaknessAnalyticsCharts.tsx
// กราฟแอนิเมชันสำหรับ Weakness Dashboard ใน CardCraft v2.0
// 1. กราฟแท่งจัดอันดับ 10 หมวดไวยากรณ์ (10-Category Staggered Vulnerability Bars)
// 2. กราฟวงแหวนเปรียบเทียบสัดส่วนข้อผิด Listening vs Reading (Dual-Arch Donut Gauge)
// 3. กราฟวิเคราะห์อัตราการตอบผิดรายพาร์ท (Part-by-Part Error Rate Spring Bars)
// ============================================================================

import React, { useId, useMemo } from 'react';
import { m } from 'framer-motion';
import { Target, Layers, PieChart, ShieldAlert, Headphones, BookOpen } from 'lucide-react';
import { WeaknessAnalyticsResponse } from '@/lib/api';
import { formatDecimal } from '@/utils/number-format.util';

interface WeaknessAnalyticsChartsProps {
  analytics: WeaknessAnalyticsResponse;
  errorTypeLabels: Record<string, { label: string; desc: string; color: string }>;
}

export default function WeaknessAnalyticsCharts({
  analytics,
  errorTypeLabels,
}: WeaknessAnalyticsChartsProps) {
  const gradientId = useId();

  // สรุปข้อมูล Listening (Part 1-4) และ Reading (Part 5-7)
  const skillSummary = useMemo(() => {
    let listeningWrong = 0;
    let listeningTotal = 0;
    let readingWrong = 0;
    let readingTotal = 0;

    analytics.byPart.forEach((p) => {
      if (p.part <= 4) {
        listeningWrong += p.wrong;
        listeningTotal += p.total;
      } else {
        readingWrong += p.wrong;
        readingTotal += p.total;
      }
    });

    const totalWrong = listeningWrong + readingWrong;
    const listeningPct = totalWrong > 0 ? (listeningWrong / totalWrong) * 100 : 50;
    const readingPct = totalWrong > 0 ? (readingWrong / totalWrong) * 100 : 50;

    const listeningErrorRate = listeningTotal > 0 ? (listeningWrong / listeningTotal) * 100 : 0;
    const readingErrorRate = readingTotal > 0 ? (readingWrong / readingTotal) * 100 : 0;

    return {
      listeningWrong,
      listeningTotal,
      readingWrong,
      readingTotal,
      totalWrong,
      listeningPct,
      readingPct,
      listeningErrorRate,
      readingErrorRate,
    };
  }, [analytics.byPart]);

  // พารามิเตอร์สำหรับ Donut Chart (Radius = 40, Circumference = 2 * PI * 40 = ~251.32)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const listeningOffset = circumference - (skillSummary.listeningPct / 100) * circumference;
  const readingOffset = circumference - (skillSummary.readingPct / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* 1. แถบกราฟวงแหวนเปรียบเทียบ Listening vs Reading & สรุปภาพรวม */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Dual-Arch Donut Gauge (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade-md p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              สัดส่วนข้อผิดทักษะฟัง vs อ่าน
            </h3>
            <span className="font-pixel text-[11px] px-2 py-0.5 bg-slate-900 text-amber-300">
              DUAL DONUT
            </span>
          </div>

          {/* SVG Animated Donut Chart */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-2">
            <svg
              className="w-full h-full -rotate-90 transform select-none"
              viewBox="0 0 100 100"
              aria-label="Listening vs Reading Error Distribution Chart"
            >
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="12"
                fill="none"
              />

              {/* Listening Arc (Indigo #6366F1) */}
              <m.circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#6366F1"
                strokeWidth="12"
                fill="none"
                strokeLinecap="butt"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: listeningOffset }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              />

              {/* Reading Arc (Amber #F59E0B) */}
              <m.circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#F59E0B"
                strokeWidth="12"
                fill="none"
                strokeLinecap="butt"
                strokeDasharray={circumference}
                strokeDashoffset={readingOffset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                style={{
                  transformOrigin: '50% 50%',
                  transform: `rotate(${(skillSummary.listeningPct / 100) * 360}deg)`,
                }}
              />
            </svg>

            {/* Readout ตรงกลางวงแหวน */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                ความแม่นยำรวม
              </span>
              <span className="font-pixel text-xl sm:text-2xl font-bold text-slate-950">
                {formatDecimal(analytics.accuracyRate)}%
              </span>
              <span className="text-[10px] text-slate-600 font-semibold">
                จาก {analytics.totalAnswers} ข้อ
              </span>
            </div>
          </div>

          {/* 2 กล่องสถิติย่อยพาร์ทฟัง vs พาร์ทอ่าน */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-indigo-50 border-2 border-slate-900 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <Headphones className="w-3.5 h-3.5 text-indigo-700" />
                <span>พาร์ทฟัง (1–4)</span>
              </div>
              <div className="font-pixel text-lg font-bold text-indigo-950">
                {skillSummary.listeningWrong} ข้อ
              </div>
              <div className="text-[11px] text-indigo-700 font-medium">
                สัดส่วน {formatDecimal(skillSummary.listeningPct)}% ของข้อผิด
              </div>
            </div>

            <div className="p-3 bg-amber-50 border-2 border-slate-900 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>พาร์ทอ่าน (5–7)</span>
              </div>
              <div className="font-pixel text-lg font-bold text-amber-950">
                {skillSummary.readingWrong} ข้อ
              </div>
              <div className="text-[11px] text-amber-700 font-medium">
                สัดส่วน {formatDecimal(skillSummary.readingPct)}% ของข้อผิด
              </div>
            </div>
          </div>
        </div>

        {/* Right: 10-Category Staggered Vulnerability Bars (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade-md p-5 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-red-600" />
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                จัดอันดับจุดอ่อน 10 หมวดข้อสอบ (Vulnerability Hierarchy)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 font-pixel">
              {analytics.topWeaknesses.length} หมวดที่มีข้อผิด
            </span>
          </div>

          {analytics.topWeaknesses.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 space-y-2">
              <div className="w-12 h-12 bg-emerald-100 border-2 border-slate-900 mx-auto flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-700" />
              </div>
              <p className="font-bold text-slate-900">ยอดเยี่ยมมาก! ยังไม่มีประวัติข้อสอบที่ตอบผิดในระบบ</p>
              <p className="text-xs text-slate-600">ทำโจทย์แบบฝึกหัดหรือสอบ Mock Exam เพื่อให้ระบบบันทึกจุดอ่อน</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {analytics.topWeaknesses.map((item, idx) => {
                const meta = errorTypeLabels[item.errorType] || {
                  label: item.errorType,
                  desc: '',
                  color: 'bg-slate-100 text-slate-900',
                };

                return (
                  <div key={item.errorType} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 bg-slate-900 text-amber-300 inline-flex items-center justify-center font-pixel text-[10px] border border-slate-900">
                          {idx + 1}
                        </span>
                        <span className="font-display font-bold text-slate-950">
                          {meta.label}
                        </span>
                        {meta.desc && (
                          <span className="font-normal text-slate-500 text-[11px] hidden sm:inline">
                            ({meta.desc})
                          </span>
                        )}
                      </span>

                      <span className="text-rose-600 font-pixel text-xs">
                        {item.count} ข้อ ({formatDecimal(item.percentage)}%)
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-3 bg-slate-100 border-2 border-slate-900 overflow-hidden flex shadow-inner">
                      <m.div
                        className="h-full bg-rose-500 border-r border-slate-900"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          delay: idx * 0.06,
                          type: 'spring',
                          stiffness: 180,
                          damping: 18,
                        }}
                        style={{
                          width: `${Math.min(100, Math.max(8, item.percentage))}%`,
                          transformOrigin: 'left',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. กราฟวิเคราะห์อัตราการตอบผิดแยกตาม Part (Parts 1–7) */}
      <div className="bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
          <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            อัตราการตอบผิดแยกรายพาร์ท TOEIC (Parts 1–7)
          </h3>
          <span className="text-xs font-bold text-slate-500 font-sans">
            เกณฑ์: <span className="text-rose-600 font-pixel">≥50%</span> ต้องระวัง •{' '}
            <span className="text-amber-600 font-pixel">&lt;50%</span> ปานกลาง
          </span>
        </div>

        {analytics.byPart.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            ยังไม่มีประวัติการทำข้อสอบแยกรายพาร์ท
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.byPart.map((p, idx) => {
              const isHigh = p.errorRate >= 50;
              const isMedium = p.errorRate >= 25 && p.errorRate < 50;
              const barColor = isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-400' : 'bg-emerald-500';

              return (
                <div key={p.part} className="p-3 bg-[#F8F5EC] border-2 border-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 flex items-center gap-1.5">
                      <span className="font-pixel text-[11px] px-1.5 py-0.5 bg-slate-900 text-white">
                        P{p.part}
                      </span>
                      <span>Part {p.part} {p.part <= 4 ? '(Listening)' : '(Reading)'}</span>
                    </span>

                    <span
                      className={`font-pixel text-xs ${
                        isHigh ? 'text-rose-600' : isMedium ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      ผิด {p.wrong} / {p.total} ({formatDecimal(p.errorRate)}%)
                    </span>
                  </div>

                  {/* Animated Bar with Spring */}
                  <div className="w-full h-2.5 bg-white border border-slate-900 overflow-hidden">
                    <m.div
                      className={`h-full ${barColor}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        delay: 0.1 + idx * 0.05,
                        type: 'spring',
                        stiffness: 190,
                        damping: 20,
                      }}
                      style={{
                        width: `${Math.min(100, Math.max(5, p.errorRate))}%`,
                        transformOrigin: 'left',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
