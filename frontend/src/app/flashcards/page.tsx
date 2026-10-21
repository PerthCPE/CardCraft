'use client';

// ============================================================================
// frontend/src/app/flashcards/page.tsx
// คลังการ์ดคำศัพท์ 3D Flip & พจนานุกรมคำศัพท์ธุรกิจ TOEIC 700+ (3,093 คำ)
// ปรับปรุงใหม่ตามหลัก frontend-design & cardcraft-pixel-ui:
// 1. ตรวจสอบและแสดงจำนวนคำที่แท้จริง: 3,093 คำ ใน 12 หมวดธุรกิจ TOEIC
// 2. จัดระเบียบหน้าจอ ขจัดความรก (Anti-Clutter):
//    - ยุบรวมแถบคำสั่งและหัวข้อหน้าเป็น Unified Command Hub หน้าตาคมชัด
//    - ลดจำนวนแถวปุ่มตัวกรองที่ทับซ้อน ปรับเป็นแถบค้นหาและตัวกรองชิปสัมผัสแนวนอน
//    - โหมดปัดการ์ด (Swipe Deck): วางการ์ด 3D เป็นพระเอกตรงกลาง เด่นชัด สบายตา
//    - แสดงคิวการ์ดถัดไปแบบจัดสรรหน้า (Pagination) ไม่โหลด DOM 3,000 ชิ้นให้หน่วง
//    - โหมดพจนานุกรม (Dictionary): จัดหน้า 24 คำต่อหน้า ค้นหาแบบเรียลไทม์ ฟังเสียงอ่านได้
// 3. รองรับปุ่มลัดคีย์บอร์ด: Space (พลิกการ์ด), ArrowLeft (ทบทวนซ้ำ), ArrowRight (จำแม่นแล้ว)
// 4. รองรับ Mobile Touch & Swipe โดยไม่มี Overflow
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AnimatePresence,
  LazyMotion,
  domMax,
  m,
  PanInfo,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dices,
  Filter,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import type { FlashcardItem } from '@/data/toeic-types';
import { TOEIC_CATEGORIES } from '@/data/toeic-types';
import dynamic from 'next/dynamic';
import { recordCardSwipe } from '@/lib/api';
import DeckMasteryVisualizer from '@/components/flashcards/DeckMasteryVisualizer';
import { formatDecimal } from '@/utils/number-format.util';
import { useFlashcards } from '@/hooks/useFlashcardsQuery';
import { useCardCraftQueryHelpers } from '@/hooks/useDashboardQueries';
import { CardSet, getStoredActiveSet, saveActiveSet } from '@/utils/card-sets';
import { mergeServerFlashcardsWithLocalSwipes } from '@/utils/flashcard-sync.util';
import { useAuth } from '@/context/AuthContext';
import ThreeDCard from '@/components/ThreeDCard';
import { speakEnglish } from '@/utils/speech-synthesis.util';

const CardSetSelectorModal = dynamic(
  () => import('@/components/CardSetSelectorModal'),
  { ssr: false, loading: () => null },
);
const VocabBlitzGame = dynamic(
  () => import('@/components/VocabBlitzGame'),
  { ssr: false, loading: () => null },
);

// ข้อมูลเมทาดาทาและคำแปลภาษาไทยของ 12 หมวดธุรกิจ TOEIC
const CATEGORY_LABELS_TH: Record<string, string> = {
  ALL: 'ทุกหมวดหมู่',
  Corporate: 'องค์กรและการบริหาร',
  Finance: 'การเงินและธนาคาร',
  Marketing: 'การตลาดและโฆษณา',
  'Human Resources': 'ทรัพยากรบุคคล',
  Technology: 'เทคโนโลยีและไอที',
  Contracts: 'สัญญาและข้อตกลง',
  Manufacturing: 'การผลิตและโรงงาน',
  Logistics: 'โลจิสติกส์และคลังสินค้า',
  Facilities: 'อาคารและสถานที่',
  'Safety & Health': 'ความปลอดภัยและสุขอนามัย',
  Hospitality: 'การบริการและการท่องเที่ยว',
  'Customer Relations': 'ลูกค้าสัมพันธ์',
};

const DICTIONARY_PAGE_SIZE = 24;
const QUEUE_PAGE_SIZE = 10;

export default function FlashcardsPage() {
  const { user: authUser, requireAuth } = useAuth();
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [activeSet, setActiveSet] = useState<CardSet | null>(null);
  const [isSetModalOpen, setIsSetModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'CREATE' | 'SAVED' | 'PRESETS'>('CREATE');
  const [isBlitzGameOpen, setIsBlitzGameOpen] = useState<boolean>(false);

  // ตัวเลือกมุมมองและตัวกรอง
  const [viewMode, setViewMode] = useState<'SWIPE_DECK' | 'DICTIONARY'>('SWIPE_DECK');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'DUE' | 'EXAM_WRONG' | 'LEARNING' | 'MASTERED'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [useActiveDeckOnly, setUseActiveDeckOnly] = useState<boolean>(true);

  // ตัวแปรลำดับการ์ดและการพลิก
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [swipeFeedback, setSwipeFeedback] = useState<{
    type: 'MASTERED' | 'LEARNING';
    word: string;
  } | null>(null);

  // การแบ่งหน้าสำหรับพจนานุกรมและคิวการ์ด
  const [dictPage, setDictPage] = useState<number>(1);
  const [queuePage, setQueuePage] = useState<number>(1);
  const [sessionSwipes, setSessionSwipes] = useState<boolean[]>([]);

  // บันทึกการ์ดที่ถูกปัดในเซสชันนี้ เพื่อป้องกัน race condition จากเซิร์ฟเวอร์
  const locallySwipedCardsRef = React.useRef<
    Map<string, { isKnown: boolean; swipeCount: number }>
  >(new Map());

  // Framer Motion Drag values (จำกัด range การปัด [-180, 180] เพื่อความลื่นไหลและเสถียรทุก Device)
  const dragX = useMotionValue(0);
  const rotateZ = useTransform(dragX, [-180, 0, 180], [-8, 0, 8]);
  const rightBadgeOpacity = useTransform(dragX, [15, 60], [0, 1]);
  const leftBadgeOpacity = useTransform(dragX, [-60, -15], [1, 0]);

  // Ref สำหรับบันทึก timestamp การปัดการ์ด เพื่อป้องกันไม่ให้การปัดกลายเป็นการพลิกการ์ด (Shield synthetic clicks)
  const lastSwipeTimeRef = React.useRef<number>(0);
  const isSwipingRef = React.useRef<boolean>(false);

  const { data: flashcardsData } = useFlashcards(undefined, authUser?.id);
  const { invalidateDashboard } = useCardCraftQueryHelpers();

  useEffect(() => {
    if (flashcardsData && flashcardsData.length > 0) {
      setCards((prev) => {
        if (prev.length === 0) {
          const stored = getStoredActiveSet(flashcardsData);
          setActiveSet(stored);
          return flashcardsData;
        }
        return mergeServerFlashcardsWithLocalSwipes(
          flashcardsData,
          prev,
          locallySwipedCardsRef.current,
        );
      });
    }
  }, [flashcardsData]);

  // ซิงค์ Active Set เมื่อมีการเปลี่ยนชุดจากโมดัลหรือแท็บอื่น
  useEffect(() => {
    const handleActiveSetChanged = (e: Event) => {
      const customEvent = e as CustomEvent<CardSet>;
      if (customEvent.detail) {
        setActiveSet(customEvent.detail);
        setCurrentIndex(0);
        setIsFlipped(false);
        setQueuePage(1);
      }
    };

    window.addEventListener('cardcraft:active-set-changed', handleActiveSetChanged);
    return () => {
      window.removeEventListener('cardcraft:active-set-changed', handleActiveSetChanged);
    };
  }, []);

  // คำนวณจำนวนคำตามหมวดหมู่แบบไดนามิก (ตรวจสอบ 3,093 คำ)
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { ALL: cards.length };
    for (const c of cards) {
      map[c.category] = (map[c.category] || 0) + 1;
    }
    return map;
  }, [cards]);

  // คำนวณจำนวนคำตามสถานะ
  const statusCounts = useMemo(() => {
    const now = new Date();
    let mastered = 0;
    let due = 0;
    let examWrong = 0;
    let learning = 0;

    for (const c of cards) {
      if (c.progress?.isKnown === true) {
        mastered++;
      } else {
        learning++;
      }
      if (
        c.progress?.isDue === true ||
        (c.progress?.dueAt && new Date(c.progress.dueAt) <= now)
      ) {
        due++;
      }
      if ((c.progress?.wrongCount ?? 0) > 0) {
        examWrong++;
      }
    }

    return {
      all: cards.length,
      mastered,
      learning,
      due,
      examWrong,
    };
  }, [cards]);

  // กรองการ์ดคำศัพท์ตามชุดปัจจุบัน หมวดหมู่ สถานะ และคำค้นหา
  const filteredCards = useMemo(() => {
    // โหมดปัดการ์ด: ถ้าเลือกใช้เฉพาะ Active Set และไม่มีการค้นหา/เลือกหมวดเฉพาะ
    if (
      viewMode === 'SWIPE_DECK' &&
      useActiveDeckOnly &&
      activeSet &&
      selectedCategory === 'ALL' &&
      statusFilter === 'ALL' &&
      !searchQuery.trim()
    ) {
      const cardMap = new Map(cards.map((c) => [c.id, c]));
      const list: FlashcardItem[] = [];
      for (const id of activeSet.cardIds) {
        const c = cardMap.get(id);
        if (c) list.push(c);
      }
      return list;
    }

    const now = new Date();
    const q = searchQuery.trim().toLowerCase();

    return cards.filter((card) => {
      const matchCategory =
        selectedCategory === 'ALL' || card.category === selectedCategory;

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'MASTERED'
            ? card.progress?.isKnown === true
            : statusFilter === 'DUE'
              ? card.progress?.isDue === true ||
                (card.progress?.dueAt && new Date(card.progress.dueAt) <= now)
              : statusFilter === 'EXAM_WRONG'
                ? (card.progress?.wrongCount ?? 0) > 0
                : card.progress?.isKnown !== true;

      const matchSearch =
        !q ||
        card.word.toLowerCase().includes(q) ||
        card.meaningTh.toLowerCase().includes(q) ||
        card.category.toLowerCase().includes(q) ||
        card.exampleEn.toLowerCase().includes(q);

      return matchCategory && matchStatus && matchSearch;
    });
  }, [
    cards,
    activeSet,
    viewMode,
    useActiveDeckOnly,
    selectedCategory,
    statusFilter,
    searchQuery,
  ]);

  // รีเซ็ตหน้าพจนานุกรมเมื่อเงื่อนไขกรองเปลี่ยน
  useEffect(() => {
    setDictPage(1);
    setQueuePage(1);
  }, [selectedCategory, statusFilter, searchQuery, viewMode]);

  const isDeckCompleted =
    viewMode === 'SWIPE_DECK' &&
    filteredCards.length > 0 &&
    currentIndex >= filteredCards.length;

  const activeCard =
    filteredCards.length > 0 && !isDeckCompleted
      ? filteredCards[currentIndex]
      : null;

  // อ่านออกเสียงภาษาอังกฤษ
  const speakText = useCallback((text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakEnglish(text, { rate: 0.85 });
  }, []);

  // ฟังก์ชันพลิกการ์ด (มี Shield ป้องกันไม่ให้การปัดกลายเป็นการพลิกการ์ดเด็ดขาด)
  const handleFlip = useCallback(() => {
    if (Date.now() - lastSwipeTimeRef.current < 600 || isSwipingRef.current) {
      return;
    }
    setIsFlipped((prev) => !prev);
  }, []);

  // แอนิเมชันปัดการ์ดบินออกนอกจอ (Fly-out) ทั้งซ้าย/ขวา อย่างลื่นไหล 60 FPS
  const triggerSwipeAnimation = useCallback(
    (isKnown: boolean) => {
      if (isSwipingRef.current || !activeCard) return;
      isSwipingRef.current = true;
      lastSwipeTimeRef.current = Date.now();

      const flyTargetX = isKnown ? 600 : -600;

      // แสดง Feedback Badge ทันที
      setSwipeFeedback({
        type: isKnown ? 'MASTERED' : 'LEARNING',
        word: activeCard.word,
      });

      // แอนิเมชันบินออกนอกจอ (220ms) พร้อม fade-out
      animate(dragX, flyTargetX, {
        duration: 0.22,
        ease: 'easeOut',
        onComplete: async () => {
          const swipedCard = activeCard;
          setIsFlipped(false);
          dragX.set(0);

          const nextSwipeCount = (swipedCard.progress?.swipeCount ?? 0) + 1;
          locallySwipedCardsRef.current.set(swipedCard.id, {
            isKnown,
            swipeCount: nextSwipeCount,
          });

          setCards((prev) =>
            prev.map((c) =>
              c.id === swipedCard.id
                ? {
                    ...c,
                    progress: {
                      ...c.progress,
                      isKnown,
                      swipeCount: nextSwipeCount,
                    },
                  }
                : c,
            ),
          );

          setCurrentIndex((prev) => prev + 1);
          setSessionSwipes((prev) => [...prev.slice(-14), isKnown]);
          isSwipingRef.current = false;
          lastSwipeTimeRef.current = Date.now();

          // บันทึกลงเซิร์ฟเวอร์ (Guest ใช้งานได้ทันที หากล็อกอินจะบันทึกขึ้น Cloud)
          await recordCardSwipe(swipedCard.id, isKnown, authUser?.id);
          if (authUser?.id) {
            invalidateDashboard(authUser.id);
          }

          setTimeout(() => {
            setSwipeFeedback(null);
          }, 800);
        },
      });
    },
    [activeCard, dragX, authUser, invalidateDashboard],
  );

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (isSwipingRef.current) return;

    const threshold = 70;
    const isSwipeRight =
      info.offset.x > threshold ||
      (info.offset.x > 45 && info.velocity.x > 450);
    const isSwipeLeft =
      info.offset.x < -threshold ||
      (info.offset.x < -45 && info.velocity.x < -450);

    // บันทึกเวลาเพื่อป้องกันไม่ให้ trailing click พลิกการ์ด
    lastSwipeTimeRef.current = Date.now();

    if (isSwipeRight) {
      triggerSwipeAnimation(true);
    } else if (isSwipeLeft) {
      triggerSwipeAnimation(false);
    } else {
      // ไม่ถึงระยะที่กำหนด ให้เด้งกลับตรงกลางอย่างนุ่มนวล
      animate(dragX, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  };

  // Keyboard Shortcuts: Space (พลิกการ์ด), ArrowLeft (ทบทวน), ArrowRight (จำได้)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'SWIPE_DECK') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        triggerSwipeAnimation(true);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        triggerSwipeAnimation(false);
      } else if (e.code === 'KeyZ' || e.code === 'Backspace') {
        if (currentIndex > 0) {
          e.preventDefault();
          setCurrentIndex((prev) => prev - 1);
          setIsFlipped(false);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode, handleFlip, triggerSwipeAnimation, currentIndex]);

  // การคำนวณ Pagination สำหรับพจนานุกรม
  const totalDictPages = Math.max(
    1,
    Math.ceil(filteredCards.length / DICTIONARY_PAGE_SIZE),
  );
  const paginatedDictCards = useMemo(() => {
    const start = (dictPage - 1) * DICTIONARY_PAGE_SIZE;
    return filteredCards.slice(start, start + DICTIONARY_PAGE_SIZE);
  }, [filteredCards, dictPage]);

  // การคำนวณ Pagination สำหรับคิวการ์ดในโหมดปัด
  const totalQueuePages = Math.max(
    1,
    Math.ceil(filteredCards.length / QUEUE_PAGE_SIZE),
  );
  const paginatedQueueCards = useMemo(() => {
    const start = (queuePage - 1) * QUEUE_PAGE_SIZE;
    return filteredCards.slice(start, start + QUEUE_PAGE_SIZE);
  }, [filteredCards, queuePage]);

  // อัปเดต queuePage อัตโนมัติเฉพาะเมื่อ currentIndex เปลี่ยนจริง (เช่น จากการปัดการ์ด)
  // เพื่อให้ผู้ใช้สามารถคลิกเปลี่ยนหน้าคิวการ์ดได้อย่างอิสระโดยไม่ถูกบังคับเด้งกลับ
  const prevQueueSyncIndexRef = React.useRef<number>(currentIndex);
  useEffect(() => {
    if (viewMode === 'SWIPE_DECK') {
      if (prevQueueSyncIndexRef.current !== currentIndex) {
        prevQueueSyncIndexRef.current = currentIndex;
        const targetPage = Math.floor(currentIndex / QUEUE_PAGE_SIZE) + 1;
        if (targetPage <= totalQueuePages) {
          setQueuePage(targetPage);
        }
      }
    }
  }, [currentIndex, viewMode, totalQueuePages]);

  const masteredTotal = statusCounts.mastered;
  const masteryPercentage =
    cards.length > 0 ? Math.round((masteredTotal / cards.length) * 100) : 0;

  return (
    <LazyMotion features={domMax}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* ==================================================================== */}
        {/* 1. UNIFIED COMMAND HUB: สะอาด ชัดเจน และตัดความรกออกทั้งหมด */}
        {/* ==================================================================== */}
        <header className="bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-4 sm:p-6 space-y-4">
          {/* Top Row: Title, Total Word Count & Mode Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 bg-amber-400 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] flex items-center justify-center shrink-0">
                <img
                  src="/icons/icon-deck.png"
                  alt=""
                  className="w-7 h-7 object-contain [image-rendering:pixelated]"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold font-thai text-slate-950 tracking-tight">
                    คลังการ์ดคำศัพท์และพจนานุกรมธุรกิจ
                  </h1>
                  <span className="font-pixel text-[11px] px-2 py-0.5 bg-slate-900 text-amber-300 border border-slate-900">
                    {cards.length.toLocaleString()} คำ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  ฐานข้อมูลคำศัพท์ออกสอบบ่อยใน 12 หมวดธุรกิจ TOEIC 700+ • จำแม่นแล้ว{' '}
                  <strong className="text-emerald-700 font-bold">
                    {masteredTotal.toLocaleString()}
                  </strong>{' '}
                  คำ ({formatDecimal(masteryPercentage)}%)
                </p>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('SWIPE_DECK')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 font-display font-bold text-xs sm:text-sm border-2 border-slate-900 transition-all ${
                  viewMode === 'SWIPE_DECK'
                    ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 text-slate-950" />
                โหมดปัดการ์ด (Swipe Deck)
              </button>

              <button
                type="button"
                onClick={() => setViewMode('DICTIONARY')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 font-display font-bold text-xs sm:text-sm border-2 border-slate-900 transition-all ${
                  viewMode === 'DICTIONARY'
                    ? 'bg-emerald-400 text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-slate-950" />
                ตารางพจนานุกรม ({cards.length})
              </button>
            </div>
          </div>

          {/* Sub Row: Active Deck Pill, Mastery Progress & Action Shortcuts */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {activeSet && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100/90 border border-slate-900 rounded-none text-slate-900">
                  <Dices className="w-3.5 h-3.5 text-slate-800" />
                  <span className="font-semibold">ชุดที่กำลังฝึก:</span>
                  <span className="font-bold text-slate-950">{activeSet.name}</span>
                  <span className="text-[11px] font-pixel text-slate-700">
                    ({activeSet.cardIds.length} คำ)
                  </span>
                </div>
              )}

              {/* Deck Scope Switcher: Switch between active set and all 3,093 words */}
              {viewMode === 'SWIPE_DECK' && activeSet && (
                <button
                  type="button"
                  onClick={() => {
                    setUseActiveDeckOnly((prev) => !prev);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-2.5 py-1.5 border border-slate-900 text-xs font-semibold transition-colors ${
                    useActiveDeckOnly
                      ? 'bg-white text-slate-800 hover:bg-slate-100'
                      : 'bg-slate-900 text-amber-300'
                  }`}
                >
                  {useActiveDeckOnly
                    ? `สลับไปปัดคำศัพท์ทั้งหมด (${cards.length} คำ)`
                    : `กลับมาปัดเฉพาะชุด ${activeSet.name} (${activeSet.cardIds.length} คำ)`}
                </button>
              )}
            </div>

            {/* Quick Actions (Deck Builder & Vocab Blitz) */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setModalTab('CREATE');
                  setIsSetModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                จัดชุดการ์ดคำศัพท์ / สร้างสำรับ
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!authUser) {
                    requireAuth(
                      undefined,
                      'กรุณาเข้าสู่ระบบก่อน เพื่อเริ่มเล่นเกม Vocab Blitz และสะสมคะแนนโบนัส',
                    );
                    return;
                  }
                  setIsBlitzGameOpen(true);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                Vocab Blitz 5 นาที
              </button>
            </div>
          </div>
        </header>

        {/* ==================================================================== */}
        {/* 2. STREAMLINED SEARCH & FILTER TOOLBAR: แถบค้นหาและตัวกรองที่สบายตา */}
        {/* ==================================================================== */}
        <section className="bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-4 space-y-3.5">
          {/* Row 1: Search Input + Status Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                placeholder="ค้นหาคำศัพท์ภาษาอังกฤษ, ความหมายไทย หรือตัวอย่างประโยค..."
                className="w-full pl-9 pr-9 py-2 bg-white border-2 border-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Segmented Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {(
                [
                  { id: 'ALL', label: 'ทั้งหมด', count: statusCounts.all },
                  { id: 'DUE', label: 'ถึงเวลาทบทวน', count: statusCounts.due },
                  { id: 'EXAM_WRONG', label: 'เคยผิดในข้อสอบ', count: statusCounts.examWrong },
                  { id: 'LEARNING', label: 'กำลังฝึก', count: statusCounts.learning },
                  { id: 'MASTERED', label: 'จำแม่นแล้ว', count: statusCounts.mastered },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st.id);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-semibold border-2 border-slate-900 whitespace-nowrap transition-all ${
                    statusFilter === st.id
                      ? 'bg-slate-900 text-amber-300 shadow-[2px_2px_0px_0px_#0f172a]'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{st.label}</span>
                  <span className="ml-1 text-[10px] font-mono opacity-80">
                    ({st.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: 12 Business Category Chips with Word Counts */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                หมวดหมู่ธุรกิจ TOEIC (12 หมวด):
              </span>
              {(selectedCategory !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setStatusFilter('ALL');
                    setSearchQuery('');
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {TOEIC_CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category;
                const count = categoryCounts[category] || 0;
                const labelTh = CATEGORY_LABELS_TH[category] || category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentIndex(0);
                      setIsFlipped(false);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium border border-slate-900 whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-[2px_2px_0px_0px_#0f172a]'
                        : 'bg-slate-50 text-slate-700 hover:bg-amber-100/60'
                    }`}
                  >
                    <span>{category === 'ALL' ? 'ทั้งหมด' : category}</span>
                    <span className="ml-1 text-[10px] font-mono opacity-80">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 3A. SWIPE_DECK MODE: การ์ด 3D เป็นพระเอกตรงกลาง + คิวการ์ดด้านข้าง */}
        {/* ==================================================================== */}
        {viewMode === 'SWIPE_DECK' && (
          <div className="space-y-6">
            {/* กราฟแอนิเมชันวัดสัดส่วนการจำคำศัพท์ & Sparkline จังหวะความแม่นยำ */}
            <DeckMasteryVisualizer
              totalCards={filteredCards.length > 0 ? filteredCards.length : cards.length}
              masteredCount={statusCounts.mastered}
              learningCount={statusCounts.learning + statusCounts.due}
              recentSwipes={sessionSwipes}
            />

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Center Stage: Hero 3D Card Deck (7 columns on desktop) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {isDeckCompleted ? (
                /* Celebration Completion Card */
                <div className="w-full max-w-md bg-white border-2 border-slate-900 shadow-arcade-lg p-6 sm:p-8 text-center space-y-5 animate-fade-in">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-300 border-2 border-slate-900 flex items-center justify-center shadow-pixel">
                    <CheckCircle2 className="w-8 h-8 text-slate-950" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-bold font-thai text-slate-950">
                      จบชุดคำศัพท์แล้ว!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600">
                      คุณปัดการ์ดครบทั้ง {filteredCards.length} คำ ในชุดนี้เรียบร้อยแล้ว
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border-2 border-slate-900 text-center">
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300">
                      <div className="text-[11px] font-bold text-emerald-800">
                        คำศัพท์ที่ฝึก
                      </div>
                      <div className="text-xl font-bold font-pixel text-emerald-700">
                        {filteredCards.length}
                      </div>
                    </div>
                    <div className="p-2.5 bg-amber-50 border border-amber-300">
                      <div className="text-[11px] font-bold text-amber-800">
                        หมวดหมู่
                      </div>
                      <div className="text-xs font-semibold text-amber-900 mt-1 truncate">
                        {selectedCategory === 'ALL'
                          ? activeSet?.name || 'คละ 12 หมวด'
                          : selectedCategory}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIndex(0);
                        setIsFlipped(false);
                      }}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 font-display font-bold text-sm shadow-pixel active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-950" />
                      วนซ้ำชุดนี้อีกรอบ (Repeat Deck)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setModalTab('CREATE');
                        setIsSetModalOpen(true);
                      }}
                      className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-slate-950" />
                      จัดชุดการ์ดคำศัพท์ / สร้างสำรับใหม่
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!authUser) {
                          requireAuth(
                            undefined,
                            'กรุณาเข้าสู่ระบบก่อน เพื่อเริ่มเล่นเกม Vocab Blitz และสะสมคะแนนโบนัส',
                          );
                          return;
                        }
                        setIsBlitzGameOpen(true);
                      }}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-amber-300" />
                      ทดสอบจำศัพท์ 5 นาที (Vocab Blitz)
                    </button>
                  </div>
                </div>
              ) : activeCard ? (
                /* The Active 3D Card Stage */
                <div className="w-full max-w-md space-y-4">
                  {/* Subtle Counter, Previous Card Button & Difficulty Readout */}
                  <div className="flex items-center justify-between px-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentIndex <= 0}
                        onClick={() => {
                          if (currentIndex > 0) {
                            setCurrentIndex((prev) => prev - 1);
                            setIsFlipped(false);
                          }
                        }}
                        className="px-2 py-1 bg-white hover:bg-amber-100 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-slate-900 text-[11px] font-bold text-slate-900 flex items-center gap-1 shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                        title="ย้อนกลับไปการ์ดใบก่อนหน้า (คีย์ลัด: Z หรือ Backspace)"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-800" />
                        <span>ย้อนใบก่อนหน้า</span>
                      </button>

                      <span className="font-medium">
                        ใบที่{' '}
                        <strong className="font-pixel text-slate-950 text-sm">
                          {(currentIndex % filteredCards.length) + 1}
                        </strong>{' '}
                        จาก{' '}
                        <strong className="font-pixel text-slate-950 text-sm">
                          {filteredCards.length.toLocaleString()}
                        </strong>
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      {swipeFeedback ? (
                        <m.span
                          key={swipeFeedback.word + swipeFeedback.type}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`px-2.5 py-0.5 border border-slate-900 font-semibold text-xs ${
                            swipeFeedback.type === 'MASTERED'
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-rose-400 text-slate-950'
                          }`}
                        >
                          {swipeFeedback.word}:{' '}
                          {swipeFeedback.type === 'MASTERED'
                            ? 'จำแม่นแล้ว'
                            : 'เก็บไว้ทบทวน'}
                        </m.span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <img
                            src="/icons/icon-hud-mana.png"
                            alt=""
                            className="w-3.5 h-3.5 [image-rendering:pixelated]"
                          />
                          <span>ความยาก</span>
                          <strong className="font-pixel text-slate-900">
                            {activeCard.manaCost}/5
                          </strong>
                        </span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3D Spell Card Wrapper */}
                  <div className="w-full">
                    <ThreeDCard
                      key={activeCard.id + '-' + currentIndex}
                      card={activeCard}
                      isFlipped={isFlipped}
                      onFlip={handleFlip}
                      onSpeak={speakText}
                      dragX={dragX}
                      rotateZ={rotateZ}
                      onDragEnd={handleDragEnd}
                      rightBadgeOpacity={rightBadgeOpacity}
                      leftBadgeOpacity={leftBadgeOpacity}
                    />
                  </div>

                  {/* Under Space: เว้นระยะห่างสบายตาและไม่ชิดเกินไปตามคำสั่งผู้ใช้ */}
                  <div className="pt-6 sm:pt-8 space-y-3.5">
                    {/* 3 Physical Tactile Control Buttons */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => triggerSwipeAnimation(false)}
                        className="min-h-[48px] py-3 px-2 sm:px-3.5 bg-white text-slate-900 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-rose-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#0f172a] transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 font-display font-bold text-[11px] sm:text-xs text-rose-700">
                          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          ทบทวนซ้ำ
                        </span>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 border border-slate-900">
                          ←
                        </kbd>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFlip()}
                        className="min-h-[48px] py-3 px-2 sm:px-3.5 bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-amber-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#0f172a] transition-all flex items-center justify-center sm:justify-between cursor-pointer"
                      >
                        <span className="font-display font-bold text-[11px] sm:text-xs truncate">
                          พลิกดูคำแปล
                        </span>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-900">
                          SPACE
                        </kbd>
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerSwipeAnimation(true)}
                        className="min-h-[48px] py-3 px-2 sm:px-3.5 bg-emerald-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] hover:bg-emerald-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#0f172a] transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 font-display font-bold text-[11px] sm:text-xs text-slate-950">
                          จำแม่นแล้ว
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        </span>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-900">
                          →
                        </kbd>
                      </button>
                    </div>

                    {/* Clean Keyboard Shortcuts Helper */}
                    <p className="text-center text-[11px] text-slate-500 font-sans">
                      กด <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-400 rounded text-[10px] font-mono">SPACE</kbd> เพื่อพลิกดูคำแปล • กดลูกศร <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-400 rounded text-[10px] font-mono">←</kbd> / <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-400 rounded text-[10px] font-mono">→</kbd> เพื่อปัดการ์ด • กด <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-400 rounded text-[10px] font-mono">Z</kbd> เพื่อย้อนใบก่อนหน้า
                    </p>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-8 text-center w-full max-w-md space-y-3">
                  <p className="text-base font-semibold text-slate-800">
                    ไม่พบคำศัพท์ที่ตรงกับเงื่อนไขการค้นหา
                  </p>
                  <p className="text-xs text-slate-500">
                    ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อฝึกต่อ
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setStatusFilter('ALL');
                      setSearchQuery('');
                      setCurrentIndex(0);
                    }}
                    className="mt-3 px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
                  >
                    แสดงคำศัพท์ทั้งหมด
                  </button>
                </div>
              )}
            </div>

            {/* Right Stage: Deck Queue Companion Drawer (5 columns on desktop) */}
            <div className="lg:col-span-5 bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    คิวการ์ดในชุดนี้ ({filteredCards.length.toLocaleString()} คำ)
                  </h3>
                  <p className="text-xs text-slate-500">
                    คลิกคำศัพท์เพื่อเปิดดูการ์ดใบนั้นทันที
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('DICTIONARY')}
                  className="text-xs font-semibold text-slate-700 underline hover:text-slate-950"
                >
                  เปิดพจนานุกรมเต็ม
                </button>
              </div>

              {/* Paginated list of cards in queue (avoids rendering 3,000 DOM elements) */}
              <div className="divide-y divide-slate-100 min-h-[380px]">
                {paginatedQueueCards.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    ไม่มีคำศัพท์ในเงื่อนไขนี้
                  </div>
                ) : (
                  paginatedQueueCards.map((item, localIdx) => {
                    const globalIdx = (queuePage - 1) * QUEUE_PAGE_SIZE + localIdx;
                    const isCurrent = activeCard && item.id === activeCard.id;
                    const isMastered = item.progress?.isKnown === true;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(globalIdx);
                          setIsFlipped(false);
                        }}
                        className={`w-full text-left py-2.5 px-3 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-100 border-l-4 border-amber-500 font-medium'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-sans font-bold text-sm text-slate-900">
                              {item.word}
                            </span>
                            <span className="font-mono text-xs text-slate-500">
                              {item.partOfSpeech}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate">
                            {item.meaningTh}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {isMastered ? (
                            <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 font-pixel text-[9px] border border-slate-900">
                              จำแม่น
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Queue Pagination Bar */}
              {totalQueuePages > 1 && (
                <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">
                      หน้า <strong className="font-pixel text-slate-900">{queuePage}</strong> / {totalQueuePages}
                    </span>
                    {queuePage !== Math.floor(currentIndex / QUEUE_PAGE_SIZE) + 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setQueuePage(Math.floor(currentIndex / QUEUE_PAGE_SIZE) + 1)
                        }
                        className="text-[11px] text-amber-700 hover:text-amber-950 underline font-semibold cursor-pointer"
                      >
                        (กลับไปหน้าการ์ดปัจจุบัน)
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={queuePage <= 1}
                      onClick={() => setQueuePage((p) => Math.max(1, p - 1))}
                      className="h-8 w-8 flex items-center justify-center border-2 border-slate-900 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                      title="หน้าก่อนหน้า (ย้อนกลับ)"
                      aria-label="ย้อนหน้าก่อนหน้า"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-900" />
                    </button>
                    <button
                      type="button"
                      disabled={queuePage >= totalQueuePages}
                      onClick={() =>
                        setQueuePage((p) => Math.min(totalQueuePages, p + 1))
                      }
                      className="h-8 w-8 flex items-center justify-center border-2 border-slate-900 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                      title="หน้าถัดไป (เปลี่ยนหน้า)"
                      aria-label="เปลี่ยนหน้าถัดไป"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-900" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

        {/* ==================================================================== */}
        {/* 3B. DICTIONARY MODE: พจนานุกรมคำศัพท์ธุรกิจ 3,093 คำ จัดหน้าละ 24 คำ */}
        {/* ==================================================================== */}
        {viewMode === 'DICTIONARY' && (
          <section className="bg-[#FFFDF7] border-2 border-slate-900 shadow-arcade p-4 sm:p-6 space-y-5">
            {/* Header Readout & Pagination Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-bold font-thai text-slate-900">
                  พจนานุกรมคำศัพท์ธุรกิจ TOEIC ({filteredCards.length.toLocaleString()} คำ)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  แสดงหน้า {dictPage} จาก {totalDictPages} (คำที่{' '}
                  {(dictPage - 1) * DICTIONARY_PAGE_SIZE + 1} -{' '}
                  {Math.min(dictPage * DICTIONARY_PAGE_SIZE, filteredCards.length)} จาก{' '}
                  {filteredCards.length.toLocaleString()} คำ)
                </p>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  disabled={dictPage <= 1}
                  onClick={() => setDictPage(1)}
                  className="px-2.5 py-1 border border-slate-900 bg-white disabled:opacity-30 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  หน้าแรก
                </button>
                <button
                  type="button"
                  disabled={dictPage <= 1}
                  onClick={() => setDictPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 border border-slate-900 bg-white disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                  title="ก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-pixel text-xs px-2 text-slate-900">
                  {dictPage} / {totalDictPages}
                </span>
                <button
                  type="button"
                  disabled={dictPage >= totalDictPages}
                  onClick={() => setDictPage((p) => Math.min(totalDictPages, p + 1))}
                  className="p-1.5 border border-slate-900 bg-white disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                  title="ถัดไป"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={dictPage >= totalDictPages}
                  onClick={() => setDictPage(totalDictPages)}
                  className="px-2.5 py-1 border border-slate-900 bg-white disabled:opacity-30 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  หน้าสุดท้าย
                </button>
              </div>
            </div>

            {/* Responsive Card Grid (24 cards per page) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedDictCards.map((card, localIdx) => {
                const globalIdx = (dictPage - 1) * DICTIONARY_PAGE_SIZE + localIdx;
                const isMastered = card.progress?.isKnown === true;

                return (
                  <div
                    key={card.id}
                    className="bg-white border-2 border-slate-900 p-4 shadow-[2px_2px_0px_0px_#0f172a] hover:shadow-[4px_4px_0px_0px_#0f172a] transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2.5">
                      {/* Top Bar: Word, Part of Speech, Audio & Category */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-sans text-lg font-bold text-slate-900">
                            {card.word}
                          </span>
                          <span className="font-mono text-xs text-slate-500">
                            {card.partOfSpeech}
                          </span>
                          <button
                            type="button"
                            onClick={() => speakText(card.word)}
                            className="p-1 bg-slate-100 text-slate-800 border border-slate-900 hover:bg-sky-200 transition-colors cursor-pointer"
                            title="ฟังเสียงอ่านคำศัพท์"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="px-2 py-0.5 bg-amber-100 text-slate-800 text-[11px] font-semibold border border-slate-900 shrink-0">
                          {card.category}
                        </span>
                      </div>

                      {/* Thai Translation */}
                      <p className="text-sm font-semibold text-slate-800 leading-snug">
                        {card.meaningTh}
                      </p>

                      {/* Example TOEIC Business Sentence */}
                      <p className="text-xs text-slate-600 border-l-2 border-slate-300 pl-2.5 leading-relaxed italic">
                        &ldquo;{card.exampleEn}&rdquo;
                      </p>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentIndex(globalIdx);
                          setIsFlipped(false);
                          setViewMode('SWIPE_DECK');
                        }}
                        className="text-slate-700 hover:text-slate-950 underline font-medium cursor-pointer"
                      >
                        เปิดดูในโหมดการ์ด 3D
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!authUser) {
                            requireAuth(
                              undefined,
                              'กรุณาเข้าสู่ระบบก่อน เพื่อบันทึกสถานะคำศัพท์ที่คุณจำได้แล้ว',
                            );
                            return;
                          }
                          const nextState = !isMastered;
                          setCards((prev) =>
                            prev.map((c) =>
                              c.id === card.id
                                ? {
                                    ...c,
                                    progress: {
                                      ...c.progress,
                                      isKnown: nextState,
                                      swipeCount:
                                        (c.progress?.swipeCount ?? 0) + 1,
                                    },
                                  }
                                : c,
                            ),
                          );
                          await recordCardSwipe(card.id, nextState, authUser?.id);
                          invalidateDashboard(authUser?.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 font-medium border border-slate-900 transition-colors cursor-pointer ${
                          isMastered
                            ? 'bg-emerald-400 text-slate-950 font-semibold'
                            : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                        }`}
                      >
                        {isMastered ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            จำแม่นแล้ว
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            ทำเครื่องหมายว่าจำได้
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Pagination Controls */}
            {totalDictPages > 1 && (
              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-slate-600">
                  แสดง {paginatedDictCards.length} คำ ในหน้านี้ • รวมทั้งหมด{' '}
                  {filteredCards.length.toLocaleString()} คำ
                </span>

                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                  <button
                    type="button"
                    disabled={dictPage <= 1}
                    onClick={() => {
                      setDictPage(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1.5 border border-slate-900 bg-white disabled:opacity-30 hover:bg-slate-100 font-medium cursor-pointer"
                  >
                    หน้าแรก
                  </button>
                  <button
                    type="button"
                    disabled={dictPage <= 1}
                    onClick={() => {
                      setDictPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 border border-slate-900 bg-white disabled:opacity-30 hover:bg-slate-100 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    ก่อนหน้า
                  </button>
                  <span className="font-pixel text-xs px-2 text-slate-900">
                    {dictPage} / {totalDictPages}
                  </span>
                  <button
                    type="button"
                    disabled={dictPage >= totalDictPages}
                    onClick={() => {
                      setDictPage((p) => Math.min(totalDictPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 border border-slate-900 bg-white disabled:opacity-30 hover:bg-slate-100 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    ถัดไป
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={dictPage >= totalDictPages}
                    onClick={() => {
                      setDictPage(totalDictPages);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1.5 border border-slate-900 bg-white disabled:opacity-30 hover:bg-slate-100 font-medium cursor-pointer"
                  >
                    หน้าสุดท้าย
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Deck Selector Modal */}
        {isSetModalOpen && activeSet && (
          <CardSetSelectorModal
            isOpen={isSetModalOpen}
            onClose={() => setIsSetModalOpen(false)}
            allCards={cards}
            activeSet={activeSet}
            initialTab={modalTab}
            onSelectSet={(newSet) => {
              saveActiveSet(newSet);
              setActiveSet(newSet);
              setSelectedCategory('ALL');
              setStatusFilter('ALL');
              setSearchQuery('');
              setCurrentIndex(0);
              setIsFlipped(false);
              setUseActiveDeckOnly(true);
            }}
          />
        )}

        {/* 5-Minute Vocab Blitz Game */}
        {isBlitzGameOpen && activeSet && (
          <VocabBlitzGame
            allCards={cards}
            activeSet={activeSet}
            onClose={() => setIsBlitzGameOpen(false)}
          />
        )}
      </div>
    </LazyMotion>
  );
}
