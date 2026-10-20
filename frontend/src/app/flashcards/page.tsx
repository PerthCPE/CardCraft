'use client';

// ============================================================================
// frontend/src/app/flashcards/page.tsx
// โมดูลการ์ดคำศัพท์ 3D Flip & พจนานุกรมคำศัพท์ออกสอบบ่อย TOEIC 700+ (60 คำ)
// ปรับปรุงด้วยหลักการของ frontend-design + cardcraft-pixel-ui:
// - ตัดป้ายกำกับ ALL-CAPS เหนือหัวข้อ (เช่น "THAI MEANING:", "TOEIC BUSINESS CONTEXT:")
//   ใช้ขนาดฟอนต์ น้ำหนักตัวอักษร และเส้นขอบซ้าย (Blockquote) แยกความหมายกับประโยคตัวอย่างอย่างเป็นธรรมชาติ
// - รองรับปุ่มลัดคีย์บอร์ด: Space (พลิกการ์ด), ArrowLeft (ยังจำไม่ได้), ArrowRight (จำแม่นแล้ว)
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AnimatePresence,
  motion,
  PanInfo,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Dices,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  FlashcardItem,
  TOEIC_CATEGORIES,
} from '@/data/toeic-dictionary';
import { fetchFlashcards, recordCardSwipe } from '@/lib/api';
import CardSetSelectorModal from '@/components/CardSetSelectorModal';
import VocabBlitzGame from '@/components/VocabBlitzGame';
import { CardSet, getStoredActiveSet } from '@/utils/card-sets';

export default function FlashcardsPage() {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [activeSet, setActiveSet] = useState<CardSet | null>(null);
  const [isSetModalOpen, setIsSetModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'CREATE' | 'SAVED' | 'PRESETS'>('CREATE');
  const [isBlitzGameOpen, setIsBlitzGameOpen] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'LEARNING' | 'MASTERED'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'SWIPE_DECK' | 'DICTIONARY'>(
    'SWIPE_DECK',
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [swipeFeedback, setSwipeFeedback] = useState<{
    type: 'MASTERED' | 'LEARNING';
    word: string;
  } | null>(null);

  const dragX = useMotionValue(0);
  const rotateZ = useTransform(dragX, [-240, 0, 240], [-10, 0, 10]);
  const rightBadgeOpacity = useTransform(dragX, [25, 110], [0, 1]);
  const leftBadgeOpacity = useTransform(dragX, [-110, -25], [1, 0]);

  useEffect(() => {
    fetchFlashcards().then((data) => {
      setCards(data);
      const stored = getStoredActiveSet(data);
      setActiveSet(stored);
      setCurrentIndex(0);
    });
  }, []);

  const filteredCards = useMemo(() => {
    // หากอยู่ในโหมด SWIPE_DECK และมี activeSet ให้คงลำดับการ์ดตาม cardIds ของชุดนั้น
    if (
      viewMode === 'SWIPE_DECK' &&
      activeSet &&
      selectedCategory === 'ALL' &&
      !searchQuery
    ) {
      const cardMap = new Map(cards.map((c) => [c.id, c]));
      const list: FlashcardItem[] = [];
      for (const id of activeSet.cardIds) {
        const c = cardMap.get(id);
        if (c) {
          const matchStatus =
            statusFilter === 'ALL'
              ? true
              : statusFilter === 'MASTERED'
                ? c.progress?.isKnown === true
                : c.progress?.isKnown !== true;
          if (matchStatus) {
            list.push(c);
          }
        }
      }
      return list;
    }

    return cards.filter((card) => {
      const matchCategory =
        selectedCategory === 'ALL' || card.category === selectedCategory;

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'MASTERED'
            ? card.progress?.isKnown === true
            : card.progress?.isKnown !== true;

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        card.word.toLowerCase().includes(q) ||
        card.meaningTh.toLowerCase().includes(q) ||
        card.category.toLowerCase().includes(q) ||
        card.exampleEn.toLowerCase().includes(q);

      return matchCategory && matchStatus && matchSearch;
    });
  }, [cards, activeSet, viewMode, selectedCategory, statusFilter, searchQuery]);

  const isDeckCompleted =
    viewMode === 'SWIPE_DECK' &&
    filteredCards.length > 0 &&
    currentIndex >= filteredCards.length;

  const activeCard =
    filteredCards.length > 0 && !isDeckCompleted
      ? filteredCards[currentIndex]
      : null;

  const speakText = useCallback((text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleSwipe = useCallback(
    async (isKnown: boolean) => {
      if (!activeCard) return;
      const swipedCard = activeCard;

      setSwipeFeedback({
        type: isKnown ? 'MASTERED' : 'LEARNING',
        word: swipedCard.word,
      });
      setIsFlipped(false);
      dragX.set(0);

      setCards((prev) =>
        prev.map((c) =>
          c.id === swipedCard.id
            ? {
                ...c,
                progress: {
                  isKnown,
                  swipeCount: (c.progress?.swipeCount ?? 0) + 1,
                },
              }
            : c,
        ),
      );

      setCurrentIndex((prev) => prev + 1);
      await recordCardSwipe(swipedCard.id, isKnown);

      setTimeout(() => {
        setSwipeFeedback(null);
      }, 1000);
    },
    [activeCard, dragX],
  );

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const threshold = 95;
    if (info.offset.x > threshold) {
      handleSwipe(true);
    } else if (info.offset.x < -threshold) {
      handleSwipe(false);
    } else {
      dragX.set(0);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'SWIPE_DECK') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSwipe(true);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode, handleSwipe]);

  const masteredTotal = cards.filter((c) => c.progress?.isKnown === true).length;

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER & VIEW SWITCHER */}
      <section className="bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-400 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617] flex items-center justify-center shrink-0">
            <img
              src="/icons/icon-deck.png"
              alt=""
              className="w-8 h-8 object-contain [image-rendering:pixelated]"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              คลังการ์ดคำศัพท์และพจนานุกรมธุรกิจ ({cards.length} คำ)
            </h1>
            <p className="text-sm text-slate-300 mt-0.5">
              จำแม่นแล้ว {masteredTotal} คำ จากทั้งหมด {cards.length} คำ ใน 8 หมวดข้อสอบ TOEIC 700+
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('SWIPE_DECK')}
            className={`inline-flex items-center gap-2 px-4 py-2 font-display font-bold text-sm border-2 border-slate-950 transition-all ${
              viewMode === 'SWIPE_DECK'
                ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_#020617]'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            โหมดปัดการ์ด
          </button>

          <button
            type="button"
            onClick={() => setViewMode('DICTIONARY')}
            className={`inline-flex items-center gap-2 px-4 py-2 font-display font-bold text-sm border-2 border-slate-950 transition-all ${
              viewMode === 'DICTIONARY'
                ? 'bg-emerald-400 text-slate-950 shadow-[2px_2px_0px_0px_#020617]'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            ตารางพจนานุกรม
          </button>
        </div>
      </section>

      {/* 1.5 ACTIVE DECK & RANDOM SET MANAGER BANNER */}
      {activeSet && (
        <section className="bg-amber-300 border-2 border-slate-900 shadow-arcade p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded border-2 border-slate-900 bg-white flex items-center justify-center shadow-pixel-sm shrink-0">
                <Dices className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-pixel font-bold bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded">
                    ชุดคำศัพท์ปัจจุบัน ({activeSet.cardIds.length} คำ)
                  </span>
                  <span className="text-xs text-slate-800 font-medium hidden sm:inline">
                    หมวด: {activeSet.category === 'ALL' ? 'คละ 12 หมวด' : activeSet.category}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold font-display text-slate-950 mt-0.5">
                  {activeSet.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setModalTab('CREATE');
                  setIsSetModalOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                สร้างชุดใหม่ (เลือกจำนวนคำ)
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalTab('SAVED');
                  setIsSetModalOpen(true);
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] inline-flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                จัดการชุดการ์ด / ชุดที่บันทึก
              </button>

              <button
                type="button"
                onClick={() => setIsBlitzGameOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] inline-flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                ทดสอบจำศัพท์ 5 นาที (Vocab Blitz)
              </button>
            </div>
          </div>

          {/* Progress bar inside the active deck */}
          {viewMode === 'SWIPE_DECK' && filteredCards.length > 0 && (
            <div className="pt-2 border-t border-slate-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <span>ความคืบหน้าการปัดการ์ด:</span>
                <span className="font-mono font-bold text-slate-950">
                  {Math.min(currentIndex, filteredCards.length)} / {filteredCards.length} คำ
                </span>
                <span className="text-[11px] text-slate-600">
                  ({Math.round((Math.min(currentIndex, filteredCards.length) / filteredCards.length) * 100)}%)
                </span>
              </div>
              <div className="w-full sm:w-48 h-2.5 bg-white/70 border border-slate-900 rounded-none overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (Math.min(currentIndex, filteredCards.length) / filteredCards.length) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* 2. SEARCH & CATEGORY BAR */}
      <section className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder="ค้นหาคำศัพท์ภาษาอังกฤษ, ความหมายไทย หรือตัวอย่างประโยค..."
              className="w-full pl-9 pr-4 py-2 bg-white border-2 border-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: `ทั้งหมด (${cards.length})` },
                {
                  id: 'LEARNING',
                  label: `กำลังฝึก (${cards.length - masteredTotal})`,
                },
                { id: 'MASTERED', label: `จำแม่นแล้ว (${masteredTotal})` },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStatusFilter(st.id);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 text-xs font-semibold border-2 border-slate-900 transition-colors ${
                  statusFilter === st.id
                    ? 'bg-slate-900 text-amber-300'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TOEIC_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 text-xs font-medium border border-slate-900 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-[2px_2px_0px_0px_#0f172a]'
                    : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                }`}
              >
                {category === 'ALL' ? 'ทุกหมวดหมู่' : category}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3A. SWIPE SPELL CARD DECK */}
      {viewMode === 'SWIPE_DECK' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 flex flex-col items-center">
            {isDeckCompleted ? (
              <div className="w-full max-w-md bg-white border-2 border-slate-900 shadow-arcade-lg p-6 text-center space-y-5 animate-fade-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-300 border-2 border-slate-900 flex items-center justify-center shadow-pixel">
                  <CheckCircle2 className="w-8 h-8 text-slate-950" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-bold font-display text-slate-950">
                    จบชุดคำศัพท์แล้ว!
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    คุณปัดการ์ดครบทั้ง {filteredCards.length} คำ ในชุด &quot;{activeSet?.name}&quot; เรียบร้อยแล้ว
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border-2 border-slate-900 text-center">
                  <div className="p-2 bg-emerald-50 border border-emerald-300">
                    <div className="text-[11px] font-bold text-emerald-800">คำศัพท์ในชุด</div>
                    <div className="text-xl font-bold font-pixel text-emerald-700">{filteredCards.length}</div>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-300">
                    <div className="text-[11px] font-bold text-amber-800">หมวดหมู่</div>
                    <div className="text-xs font-semibold text-amber-900 mt-1 truncate">
                      {activeSet?.category === 'ALL' ? 'คละ 12 หมวด' : activeSet?.category}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(0)}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 font-display font-bold text-sm shadow-pixel active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2"
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
                    className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    สร้างชุดคำศัพท์ใหม่ (Create New Deck)
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBlitzGameOpen(true)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-amber-300" />
                    ทดสอบจำศัพท์ 5 นาที (Vocab Blitz)
                  </button>
                </div>
              </div>
            ) : activeCard ? (
              <div className="w-full max-w-md space-y-4">
                {/* Subtle Counter & Mana Readout */}
                <div className="flex items-center justify-between px-1 text-xs text-slate-600">
                  <span>
                    ใบที่{' '}
                    <strong className="font-pixel text-slate-900">
                      {(currentIndex % filteredCards.length) + 1}
                    </strong>{' '}
                    จาก{' '}
                    <strong className="font-pixel text-slate-900">
                      {filteredCards.length}
                    </strong>
                  </span>

                  <AnimatePresence mode="wait">
                    {swipeFeedback ? (
                      <motion.span
                        key={swipeFeedback.word + swipeFeedback.type}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`px-2 py-0.5 border border-slate-900 font-semibold ${
                          swipeFeedback.type === 'MASTERED'
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-amber-300 text-slate-950'
                        }`}
                      >
                        {swipeFeedback.word}:{' '}
                        {swipeFeedback.type === 'MASTERED'
                          ? 'บันทึกว่าจำแม่นแล้ว'
                          : 'เก็บไว้ทบทวนซ้ำ'}
                      </motion.span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <img
                          src="/icons/icon-hud-mana.png"
                          alt=""
                          className="w-3.5 h-3.5 [image-rendering:pixelated]"
                        />
                        <span>ระดับความยาก</span>
                        <strong className="font-pixel text-slate-900">
                          {activeCard.manaCost}/5
                        </strong>
                      </span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Draggable 3D Spell Card */}
                <div className="relative perspective-1000 w-full h-[380px]">
                  <motion.div
                    key={activeCard.id + '-' + currentIndex}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    style={{ x: dragX, rotate: rotateZ }}
                    onDragEnd={handleDragEnd}
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                  >
                    <motion.div
                      style={{ opacity: rightBadgeOpacity }}
                      className="pointer-events-none absolute top-4 right-4 z-20 px-3 py-1 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm flex items-center gap-1.5"
                    >
                      <img
                        src="/icons/icon-swipe-known.png"
                        alt=""
                        className="w-4 h-4 [image-rendering:pixelated]"
                      />
                      จำแม่นแล้ว
                    </motion.div>

                    <motion.div
                      style={{ opacity: leftBadgeOpacity }}
                      className="pointer-events-none absolute top-4 left-4 z-20 px-3 py-1 bg-rose-500 text-white font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm flex items-center gap-1.5"
                    >
                      <img
                        src="/icons/icon-swipe-learning.png"
                        alt=""
                        className="w-4 h-4 [image-rendering:pixelated]"
                      />
                      ทบทวนซ้ำ
                    </motion.div>

                    {!isFlipped ? (
                      /* FRONT OF CARD */
                      <div className="w-full h-full bg-[#fffdf7] border-2 border-slate-900 shadow-arcade-lg p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <span className="px-2.5 py-0.5 bg-amber-300 text-slate-950 text-xs font-semibold border border-slate-900">
                            {activeCard.category}
                          </span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: activeCard.manaCost }).map(
                              (_, i) => (
                                <img
                                  key={i}
                                  src="/icons/icon-hud-mana.png"
                                  alt=""
                                  className="w-4 h-4 [image-rendering:pixelated]"
                                />
                              ),
                            )}
                          </div>
                        </div>

                        <div className="my-auto text-center space-y-3 py-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 border-2 border-slate-950 shadow-arcade-sm mx-auto">
                            <img
                              src="/icons/card-back.png"
                              alt=""
                              className="w-8 h-8 object-contain [image-rendering:pixelated]"
                            />
                          </div>
                          <div className="flex items-baseline justify-center gap-2.5">
                            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                              {activeCard.word}
                            </h2>
                            <span className="text-sm font-mono font-semibold text-slate-500">
                              {activeCard.partOfSpeech}
                            </span>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={(e) => speakText(activeCard.word, e)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-400 text-slate-950 text-xs font-semibold border border-slate-900 shadow-arcade-sm hover:bg-sky-300"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              ฟังเสียงอ่าน
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <img
                              src="/icons/icon-action-flip.png"
                              alt=""
                              className="w-4 h-4 [image-rendering:pixelated]"
                            />
                            คลิกที่การ์ดเพื่อดูความหมายและตัวอย่างประโยค
                          </span>
                          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-900">
                            SPACE
                          </kbd>
                        </div>
                      </div>
                    ) : (
                      /* BACK OF CARD */
                      <div className="w-full h-full bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade-lg p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-baseline gap-2">
                            <span className="font-sans text-xl font-bold text-amber-400">
                              {activeCard.word}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              {activeCard.partOfSpeech}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) =>
                              speakText(
                                `${activeCard.word}. ${activeCard.exampleEn}`,
                                e,
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-amber-300 text-xs border border-slate-700 hover:bg-slate-700"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            ฟังประโยค
                          </button>
                        </div>

                        <div className="my-auto space-y-5 py-2">
                          <p className="text-xl sm:text-2xl font-bold text-white leading-snug">
                            {activeCard.meaningTh}
                          </p>

                          <blockquote className="border-l-4 border-amber-400 pl-4 py-1 text-sm sm:text-base text-slate-200 leading-relaxed">
                            &ldquo;{activeCard.exampleEn}&rdquo;
                          </blockquote>
                        </div>

                        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
                          <span>ปัดขวาเมื่อจำได้แล้ว หรือปัดซ้ายเพื่อทบทวนซ้ำ</span>
                          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-amber-300 border border-slate-700">
                            SPACE
                          </kbd>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Tactile Controls */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSwipe(false)}
                    className="py-2.5 px-3 bg-white text-slate-900 border-2 border-slate-900 shadow-arcade hover:bg-rose-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-arcade-sm transition-all flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-1.5 font-display font-bold text-xs text-rose-700">
                      <ArrowLeft className="w-4 h-4" />
                      ทบทวนซ้ำ
                    </span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 border border-slate-900">
                      ←
                    </kbd>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="py-2.5 px-3 bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-arcade active:translate-x-[2px] active:translate-y-[2px] active:shadow-arcade-sm transition-all flex items-center justify-between"
                  >
                    <span className="font-display font-bold text-xs">
                      พลิกดูคำแปล
                    </span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-900">
                      SPACE
                    </kbd>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwipe(true)}
                    className="py-2.5 px-3 bg-emerald-400 text-slate-950 border-2 border-slate-900 shadow-arcade active:translate-x-[2px] active:translate-y-[2px] active:shadow-arcade-sm transition-all flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-1.5 font-display font-bold text-xs">
                      จำแม่นแล้ว
                      <ArrowRight className="w-4 h-4" />
                    </span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-900">
                      →
                    </kbd>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-8 text-center w-full">
                <p className="text-base font-semibold text-slate-800">
                  ไม่พบคำศัพท์ที่ตรงกับเงื่อนไขการค้นหา
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setStatusFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
                >
                  แสดงคำศัพท์ทั้งหมด
                </button>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Word List in Active Filter */}
          <div className="lg:col-span-5 bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  รายการคำศัพท์ในหมวดนี้ ({filteredCards.length} คำ)
                </h3>
                <p className="text-xs text-slate-500">
                  คลิกที่คำศัพท์เพื่อเปิดดูการ์ดใบนั้นทันที
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('DICTIONARY')}
                className="text-xs font-semibold text-slate-700 underline hover:text-slate-950"
              >
                ดูตารางเต็ม
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-200 pr-1">
              {filteredCards.map((item, idx) => {
                const isCurrent = activeCard && item.id === activeCard.id;
                const isMastered = item.progress?.isKnown === true;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsFlipped(false);
                    }}
                    className={`w-full text-left py-2.5 px-3 flex items-center justify-between gap-2 transition-colors ${
                      isCurrent ? 'bg-amber-100/90' : 'hover:bg-slate-50'
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

                    <div className="shrink-0">
                      {isMastered ? (
                        <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 font-pixel text-[9px] border border-slate-900">
                          Mastered
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3B. FULL TOEIC 60-WORD DICTIONARY VIEW */}
      {viewMode === 'DICTIONARY' && (
        <section className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">
              พจนานุกรมคำศัพท์ธุรกิจ TOEIC ({filteredCards.length} คำ)
            </h2>
            <p className="text-sm text-slate-600">
              กดที่ไอคอนลำโพงเพื่อฟังการออกเสียง หรือสลับสถานะความจำของแต่ละคำได้โดยตรง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card, idx) => {
              const isMastered = card.progress?.isKnown === true;
              return (
                <div
                  key={card.id}
                  className="bg-white border-2 border-slate-900 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-sans text-lg font-bold text-slate-900">
                          {card.word}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {card.partOfSpeech}
                        </span>
                        <button
                          type="button"
                          onClick={() => speakText(card.word)}
                          className="p-1 bg-slate-100 text-slate-800 border border-slate-900 hover:bg-sky-200"
                          title="ฟังเสียงอ่าน"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="px-2 py-0.5 bg-amber-100 text-slate-800 text-xs font-medium border border-slate-900">
                        {card.category}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800">
                      {card.meaningTh}
                    </p>

                    <p className="text-xs text-slate-600 border-l-2 border-slate-300 pl-2.5 leading-relaxed">
                      &ldquo;{card.exampleEn}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsFlipped(false);
                        setViewMode('SWIPE_DECK');
                      }}
                      className="text-slate-600 hover:text-slate-950 underline"
                    >
                      เปิดในโหมดการ์ด 3D
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const nextState = !isMastered;
                        setCards((prev) =>
                          prev.map((c) =>
                            c.id === card.id
                              ? {
                                  ...c,
                                  progress: {
                                    isKnown: nextState,
                                    swipeCount:
                                      (c.progress?.swipeCount ?? 0) + 1,
                                  },
                                }
                              : c,
                          ),
                        );
                        await recordCardSwipe(card.id, nextState);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 font-medium border border-slate-900 ${
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
            setActiveSet(newSet);
            setCurrentIndex(0);
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
  );
}
