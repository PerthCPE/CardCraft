'use client';

// ============================================================================
// frontend/src/app/review/errors/page.tsx
// หน้าคลังทบทวนข้อผิดพลาด (Error Archive) และวิเคราะห์จุดอ่อน (Weakness Dashboard)
// ตามข้อกำหนด Task C:
// - กรองตาม part (1, 2, 5, 7), errorType (10 ประเภท), วันที่
// - ดูโจทย์ + ตัวเลือก + เฉลย + คำอธิบายภาษาไทย + การเชื่อมโยงคำศัพท์
// - Weakness Dashboard: % ผิดแยก errorType และ part, Top 5 จุดอ่อน
// - ปุ่ม "ฝึกเฉพาะข้อที่เคยผิด" เพื่อนำไปทำซ้ำในหน้า Practice
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Layers,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Sword,
  Target,
  Volume2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  ErrorLogItem,
  fetchErrorLogs,
  fetchWeaknessAnalytics,
  WeaknessAnalyticsResponse,
} from '@/lib/api';

const ERROR_TYPE_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  part_of_speech: {
    label: 'Part of Speech',
    desc: 'โครงสร้างรูปคำ (Noun / Adj / Adv)',
    color: 'bg-indigo-100 text-indigo-900 border-indigo-400',
  },
  tense: {
    label: 'Tense & Verb Form',
    desc: 'กาลและรูปคำกริยา',
    color: 'bg-blue-100 text-blue-900 border-blue-400',
  },
  preposition: {
    label: 'Preposition',
    desc: 'คำบุพบทและสำนวนคู่',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-400',
  },
  vocabulary: {
    label: 'Vocabulary',
    desc: 'คำศัพท์และความหมายทางธุรกิจ',
    color: 'bg-amber-100 text-amber-900 border-amber-400',
  },
  connector: {
    label: 'Connector',
    desc: 'คำเชื่อมและสันธาน',
    color: 'bg-teal-100 text-teal-900 border-teal-400',
  },
  subject_verb_agreement: {
    label: 'Subject-Verb Agreement',
    desc: 'ความสอดคล้องของประธานและกริยา',
    color: 'bg-purple-100 text-purple-900 border-purple-400',
  },
  pronoun: {
    label: 'Pronoun',
    desc: 'คำสรรพนามและการอ้างอิง',
    color: 'bg-pink-100 text-pink-900 border-pink-400',
  },
  listening_trap: {
    label: 'Listening Trap',
    desc: 'หลุมพรางเสียงและคำลวงในพาร์ทการฟัง',
    color: 'bg-rose-100 text-rose-900 border-rose-400',
  },
  detail_miss: {
    label: 'Detail Miss',
    desc: 'การอ่านจับใจความและรายละเอียดสำคัญ',
    color: 'bg-orange-100 text-orange-900 border-orange-400',
  },
  other: {
    label: 'Other',
    desc: 'จุดบกพร่องอื่นๆ',
    color: 'bg-slate-100 text-slate-900 border-slate-400',
  },
};

export default function ErrorReviewPage() {
  const { user, requireAuth } = useAuth();
  const router = useRouter();

  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>([]);
  const [analytics, setAnalytics] = useState<WeaknessAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedPart, setSelectedPart] = useState<number | 'ALL'>('ALL');
  const [selectedErrorType, setSelectedErrorType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.all([
      fetchErrorLogs(user.id, selectedPart === 'ALL' ? undefined : selectedPart, selectedErrorType),
      fetchWeaknessAnalytics(user.id),
    ])
      .then(([logs, anal]) => {
        setErrorLogs(logs);
        setAnalytics(anal);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user, selectedPart, selectedErrorType]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return errorLogs;

    return errorLogs.filter((log) => {
      const qText = log.question?.questionText?.toLowerCase() || '';
      const expl = log.question?.explanationTh?.toLowerCase() || '';
      const word = log.vocab?.word?.toLowerCase() || '';
      return qText.includes(q) || expl.includes(q) || word.includes(q);
    });
  }, [errorLogs, searchQuery]);

  const handlePlayAudio = (qText: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(qText);
    utter.lang = 'en-US';
    utter.rate = 0.92;
    window.speechSynthesis.speak(utter);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="bg-white border-2 border-slate-950 p-8 shadow-arcade-lg space-y-4">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold font-display text-slate-950">
            กรุณาเข้าสู่ระบบเพื่อดูคลังจุดอ่อน
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            ระบบบันทึกประวัติการตอบผิดรายข้อ (AnswerLog) และ Weakness Dashboard จะทำงานเฉพาะเมื่อคุณเข้าสู่ระบบเพื่อผูกสถิติกับตัวละครของคุณ
          </p>
          <button
            type="button"
            onClick={() => requireAuth()}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-sm border-2 border-slate-950 shadow-arcade-sm"
          >
            เข้าสู่ระบบทันที
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* 1. Header Banner */}
      <section className="bg-slate-900 text-white border-2 border-slate-950 p-6 sm:p-8 shadow-arcade-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white font-display font-bold text-xs border border-red-400">
            <ShieldAlert className="w-4 h-4" />
            คลังจุดอ่อนและการวิเคราะห์ข้อสอบ (Weakness Dashboard)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-amber-300">
            บันทึกข้อสอบที่ตอบผิด & กลยุทธ์แก้ไขจุดบกพร่อง
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            ข้อสอบที่คุณเคยตอบผิดจากทุกโหมด (Mini Mock, Full Mock, Single Drill, Boss Gauntlet) จะถูกวิเคราะห์จุดอ่อนตามประเภทไวยากรณ์และส่งคำศัพท์เข้าคิว Spaced Repetition อัตโนมัติ
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            href="/practice"
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs sm:text-sm border-2 border-slate-950 shadow-arcade-sm text-center inline-flex items-center justify-center gap-2"
          >
            <Sword className="w-4 h-4" />
            ฝึกเฉพาะข้อที่เคยผิด (Practice Weaknesses)
          </Link>
          <Link
            href="/flashcards"
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-display font-bold text-xs sm:text-sm border-2 border-slate-700 shadow-arcade-sm text-center inline-flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            คิวทบทวนคำศัพท์ Spaced Repetition
          </Link>
        </div>
      </section>

      {/* 2. Weakness Analytics Dashboard */}
      {analytics && (
        <section className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-slate-900 p-4 shadow-arcade-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                ข้อสอบที่ทำทั้งหมด
              </span>
              <div className="font-pixel text-2xl sm:text-3xl text-slate-900">
                {analytics.totalAnswers}
              </div>
              <span className="text-[11px] text-slate-500">จากทุกโหมดการสอบ</span>
            </div>

            <div className="bg-white border-2 border-slate-900 p-4 shadow-arcade-sm space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                ตอบถูกทั้งหมด
              </span>
              <div className="font-pixel text-2xl sm:text-3xl text-emerald-600">
                {analytics.totalCorrect}
              </div>
              <span className="text-[11px] text-slate-500">ความแม่นยำ {analytics.accuracyRate}%</span>
            </div>

            <div className="bg-white border-2 border-slate-900 p-4 shadow-arcade-sm space-y-1">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                ตอบผิดทั้งหมด
              </span>
              <div className="font-pixel text-2xl sm:text-3xl text-red-600">
                {analytics.totalWrong}
              </div>
              <span className="text-[11px] text-slate-500">บันทึกใน AnswerLog</span>
            </div>

            <div className="bg-white border-2 border-slate-900 p-4 shadow-arcade-sm space-y-1">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                จุดอ่อนหลักอันดับ 1
              </span>
              <div className="font-display font-bold text-base sm:text-lg text-indigo-900 truncate">
                {analytics.topWeaknesses[0]
                  ? ERROR_TYPE_LABELS[analytics.topWeaknesses[0].errorType]?.label || analytics.topWeaknesses[0].errorType
                  : 'ยังไม่มีข้อมูล'}
              </div>
              <span className="text-[11px] text-slate-500">
                {analytics.topWeaknesses[0]
                  ? `${analytics.topWeaknesses[0].percentage}% ของข้อผิดทั้งหมด`
                  : 'ตอบถูกครบถ้วน'}
              </span>
            </div>
          </div>

          {/* Top 5 จุดอ่อน + อัตราผิดแยกตาม Part */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Weaknesses */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-arcade-md space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-600" />
                  Top 5 จุดอ่อนที่ต้องระวังเป็นพิเศษ
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {analytics.topWeaknesses.length} หมวด
                </span>
              </div>

              {analytics.topWeaknesses.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  ยินดีด้วย! ยังไม่มีประวัติข้อสอบที่ตอบผิดในระบบ
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.topWeaknesses.map((item, idx) => {
                    const meta = ERROR_TYPE_LABELS[item.errorType] || {
                      label: item.errorType,
                      desc: '',
                      color: 'bg-slate-100 text-slate-900',
                    };
                    return (
                      <div key={item.errorType} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white inline-flex items-center justify-center font-pixel text-[10px]">
                              {idx + 1}
                            </span>
                            {meta.label}
                            <span className="font-normal text-slate-500">({meta.desc})</span>
                          </span>
                          <span className="text-red-600 font-pixel">
                            {item.count} ข้อ ({item.percentage}%)
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-slate-100 border border-slate-300 overflow-hidden">
                          <div
                            className="h-full bg-red-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error Distribution by Part */}
            <div className="bg-white border-2 border-slate-900 p-6 shadow-arcade-md space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  อัตราการตอบผิดแยกตาม Part
                </h3>
                <span className="text-xs font-bold text-slate-500">Listening & Reading</span>
              </div>

              {analytics.byPart.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  ยังไม่มีประวัติการทำข้อสอบ
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.byPart.map((p) => {
                    const isHigh = p.errorRate >= 50;
                    return (
                      <div key={p.part} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800">
                            Part {p.part} {p.part <= 4 ? '(Listening)' : '(Reading)'}
                          </span>
                          <span className={isHigh ? 'text-red-600 font-pixel' : 'text-slate-700 font-pixel'}>
                            ผิด {p.wrong} / {p.total} ข้อ (อัตราผิด {p.errorRate}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 border border-slate-300 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isHigh ? 'bg-red-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${Math.min(100, p.errorRate)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. Filters & Controls */}
      <section className="bg-white border-2 border-slate-900 p-4 sm:p-5 shadow-arcade-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Part Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 uppercase mr-1">Part:</span>
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 1, label: 'P1 รูปภาพ' },
              { id: 2, label: 'P2 ตอบคำถาม' },
              { id: 5, label: 'P5 ไวยากรณ์' },
              { id: 7, label: 'P7 อ่านบทความ' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPart(p.id as any)}
                className={`px-3 py-1.5 text-xs font-bold border-2 border-slate-900 transition-colors whitespace-nowrap ${
                  selectedPart === p.id
                    ? 'bg-slate-900 text-amber-300'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาโจทย์ หรือ คำศัพท์..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border-2 border-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* ErrorType Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase mr-1">Error Type:</span>
          <button
            type="button"
            onClick={() => setSelectedErrorType('ALL')}
            className={`px-2.5 py-1 text-xs font-bold border transition-colors ${
              selectedErrorType === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-800'
            }`}
          >
            ทั้งหมด
          </button>
          {Object.entries(ERROR_TYPE_LABELS).map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSelectedErrorType(k)}
              className={`px-2.5 py-1 text-xs font-bold border transition-colors ${
                selectedErrorType === k
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-800'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Error Logs List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-600" />
            รายการข้อที่เคยตอบผิด ({filteredLogs.length} ข้อ)
          </h2>
          <span className="text-xs text-slate-500">เรียงตามวันที่ทำล่าสุด</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500 bg-white border-2 border-slate-900 p-8 shadow-arcade-sm">
            กำลังโหลดข้อมูลประวัติข้อผิดพลาด...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white border-2 border-slate-900 p-12 text-center space-y-3 shadow-arcade-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-display font-bold text-lg text-slate-900">
              ไม่พบข้อผิดพลาดตามเงื่อนไขที่เลือก
            </h3>
            <p className="text-xs text-slate-500">
              คุณทำได้ยอดเยี่ยมมาก! หรือลองปรับตัวกรอง Part และ Error Type เพื่อค้นหา
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => {
              const q = log.question;
              const errorMeta =
                ERROR_TYPE_LABELS[log.errorType || 'other'] || ERROR_TYPE_LABELS.other;

              return (
                <div
                  key={log.id}
                  className="bg-white border-2 border-slate-900 p-5 sm:p-6 shadow-arcade-sm space-y-4 transition-all hover:shadow-arcade-md"
                >
                  {/* Top Badges & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-slate-900 text-amber-300 font-pixel text-xs">
                        Part {log.part}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-bold border ${errorMeta.color}`}>
                        {errorMeta.label}
                      </span>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 border border-slate-200">
                        Mode: {log.mode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-2">
                    {/* Part 1 Image preview if any */}
                    {q?.imageUrl && (
                      <div className="max-w-md border-2 border-slate-900 overflow-hidden mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={q.imageUrl}
                          alt="Part 1 Photograph"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    {/* Part 7 Passage preview if any */}
                    {q?.passageText && (
                      <div className="p-3 bg-slate-50 border-l-4 border-indigo-500 text-xs font-sans text-slate-700 max-h-40 overflow-y-auto mb-3 whitespace-pre-line leading-relaxed">
                        {q.passageText}
                      </div>
                    )}

                    {/* Question text with Audio Button */}
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {index + 1}. {q?.questionText || 'Question statement'}
                      </h4>

                      {log.part <= 2 && (
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(q?.questionText || '')}
                          className="shrink-0 p-1.5 bg-slate-100 hover:bg-amber-300 text-slate-900 border border-slate-900 transition-colors"
                          title="ฟังเสียงอ่าน"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Answer Choices Comparison */}
                  {q && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optText = q[`option${optKey}` as keyof typeof q] as string;
                        if (!optText) return null;

                        const isUserChoice = log.selectedOption.toUpperCase() === optKey;
                        const isCorrectChoice = log.correctOption.toUpperCase() === optKey;

                        let style = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isUserChoice && !isCorrectChoice) {
                          style = 'bg-red-100 border-red-500 text-red-950 font-bold';
                        } else if (isCorrectChoice) {
                          style = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                        }

                        return (
                          <div
                            key={optKey}
                            className={`p-2.5 border-2 flex items-start gap-2 ${style}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white border border-slate-400 text-slate-900 font-pixel text-[11px] inline-flex items-center justify-center shrink-0">
                              {optKey}
                            </span>
                            <div className="flex-1">
                              <span>{optText}</span>
                              {isUserChoice && (
                                <span className="block text-[10px] text-red-700 font-bold mt-0.5">
                                  คำตอบของคุณ (ตอบผิด)
                                </span>
                              )}
                              {isCorrectChoice && (
                                <span className="block text-[10px] text-emerald-700 font-bold mt-0.5">
                                  เฉลยที่ถูกต้อง
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Thai Explanation Box */}
                  {q?.explanationTh && (
                    <div className="p-3.5 bg-amber-50 border-2 border-amber-300 text-xs text-slate-900 space-y-1">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        คำอธิบายและเทคนิคการตัดช้อยส์:
                      </span>
                      <p className="leading-relaxed text-slate-800">{q.explanationTh}</p>
                    </div>
                  )}

                  {/* Linked Vocab Card (Spaced Repetition Link) */}
                  {log.vocab && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-600 text-white font-pixel text-[10px]">
                          VOCAB LINK
                        </span>
                        <span className="font-bold text-indigo-950">{log.vocab.word}</span>
                        <span className="text-slate-500 font-mono">({log.vocab.partOfSpeech})</span>
                        <span className="text-slate-700">- {log.vocab.meaningTh}</span>
                      </div>

                      <Link
                        href={`/flashcards?category=${encodeURIComponent(log.vocab.category)}`}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-400 font-bold text-[11px] inline-flex items-center gap-1 whitespace-nowrap"
                      >
                        ทบทวนการ์ดคำนี้ <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
