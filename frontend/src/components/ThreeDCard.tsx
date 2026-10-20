'use client';

// ============================================================================
// frontend/src/components/ThreeDCard.tsx
// 3D Trading Card Flip Component (Yu-Gi-Oh / Magic Spell Style)
// ปรับปรุงระบบ Gesture และ Design ตามหลัก frontend-design & cardcraft-pixel-ui:
// 1. การปัดการ์ด (Swipe): สำหรับเลือกซ้าย (ทบทวน) / ขวา (จำแม่นแล้ว) ในทุก device
//    - การปัดขยับ (เคลื่อนที่ > 6px) ห้ามทำให้การ์ดพลิกโดยเด็ดขาด 100%
//    - มี Swipe Active Shield (400ms) ป้องกันไม่ให้การปล่อยนิ้วหลังปัดไปทริกเกอร์การพลิก
// 2. การกดปุ่มออกเสียงข้อความ (Audio Button):
//    - Shield ทุก Pointer/Touch/Click Event และ closest('button') ห้ามทำให้การ์ดพลิกโดยเด็ดขาด
// 3. การพลิกการ์ด (Flip):
//    - เกิดขึ้นเฉพาะการแตะ/คลิกอยู่กับที่ (เคลื่อนที่ไม่เกิน 6px) หรือปุ่ม Space / พลิกดูคำแปล
// 4. แก้ปัญหาหน้า-หลังทับซ้อนกันบนมือถือ (Mobile 3D Overlap):
//    - สลับการเรนเดอร์ด้วย display: none / flex ที่มุม 90 องศา (200ms)
//    - translateZ(1px) แยกมิติความลึก ป้องกัน WebKit Composite Bleed-through
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Volume2, RotateCcw } from 'lucide-react';
import type { FlashcardItem } from '@/data/toeic-types';

// Mapping 12 Category Illustration Arts
export const CATEGORY_CARD_ARTS: Record<string, string> = {
  'Human Resources': '/cards/card-art-hr.png',
  Contracts: '/cards/card-art-contracts.png',
  Finance: '/cards/card-art-finance.png',
  Marketing: '/cards/card-art-marketing.png',
  Corporate: '/cards/card-art-corporate.png',
  Logistics: '/cards/card-art-logistics.png',
  Manufacturing: '/cards/card-art-manufacturing.png',
  Technology: '/cards/card-art-technology.png',
  'Customer Relations': '/cards/card-art-customer.png',
  Facilities: '/cards/card-art-facilities.png',
  Hospitality: '/cards/card-art-hospitality.png',
  'Safety & Health': '/cards/card-art-safety.png',
};

// Category theme colors
export const CATEGORY_THEMES: Record<
  string,
  { border: string; glow: string; ribbon: string; badge: string }
> = {
  'Human Resources': {
    border: 'border-amber-400',
    glow: 'from-amber-500/20 via-orange-500/10 to-transparent',
    ribbon: 'bg-amber-400 text-slate-950',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  Contracts: {
    border: 'border-rose-400',
    glow: 'from-rose-500/20 via-red-500/10 to-transparent',
    ribbon: 'bg-rose-400 text-slate-950',
    badge: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  Finance: {
    border: 'border-emerald-400',
    glow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    ribbon: 'bg-emerald-400 text-slate-950',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  Marketing: {
    border: 'border-purple-400',
    glow: 'from-purple-500/20 via-pink-500/10 to-transparent',
    ribbon: 'bg-purple-400 text-slate-950',
    badge: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  Technology: {
    border: 'border-cyan-400',
    glow: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    ribbon: 'bg-cyan-400 text-slate-950',
    badge: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  },
  Hospitality: {
    border: 'border-amber-300',
    glow: 'from-amber-400/20 via-yellow-500/10 to-transparent',
    ribbon: 'bg-amber-300 text-slate-950',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  'Safety & Health': {
    border: 'border-emerald-500',
    glow: 'from-emerald-400/25 via-green-500/15 to-transparent',
    ribbon: 'bg-emerald-500 text-slate-950',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
};

const DEFAULT_THEME = {
  border: 'border-amber-300',
  glow: 'from-amber-400/20 via-yellow-500/10 to-transparent',
  ribbon: 'bg-amber-300 text-slate-950',
  badge: 'bg-amber-100 text-amber-900 border-amber-300',
};

interface ThreeDCardProps {
  card: FlashcardItem;
  isFlipped: boolean;
  onFlip: () => void;
  onSpeak: (text: string, e?: React.MouseEvent) => void;
  dragX?: any;
  rotateZ?: any;
  onDragEnd?: (event: any, info: any) => void;
  rightBadgeOpacity?: any;
  leftBadgeOpacity?: any;
}

export default function ThreeDCard({
  card,
  isFlipped,
  onFlip,
  onSpeak,
  dragX,
  rotateZ,
  onDragEnd,
  rightBadgeOpacity,
  leftBadgeOpacity,
}: ThreeDCardProps) {
  // Check if device supports true hover (Desktop PC with mouse, not touch devices)
  const [canHover, setCanHover] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
      setCanHover(mq.matches);
      const listener = (e: MediaQueryListEvent) => setCanHover(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    damping: 20,
    stiffness: 250,
  });
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    damping: 20,
    stiffness: 250,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!canHover) return;
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const theme = CATEGORY_THEMES[card.category] || DEFAULT_THEME;
  const cardArtSrc = CATEGORY_CARD_ARTS[card.category] || '/icons/card-back.png';

  // Toggle front/back face rendering at the 90-degree flip edge (200ms)
  // This completely solves the mobile WebKit/Android bug where front and back overlap
  const [showBackFace, setShowBackFace] = useState(isFlipped);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBackFace(isFlipped);
    }, 200);
    return () => clearTimeout(timer);
  }, [isFlipped]);

  // =========================================================================
  // GESTURE ISOLATION ENGINE (STRICT SEPARATION OF SWIPE VS FLIP VS AUDIO):
  // =========================================================================
  const pointerStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isSwipeActiveRef = useRef(false);
  const lastFlipTimeRef = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };
    isSwipeActiveRef.current = false;
  };

  const handleDragStart = () => {
    isSwipeActiveRef.current = true;
  };

  const handleDrag = () => {
    isSwipeActiveRef.current = true;
  };

  const handleCustomDragEnd = (event: any, info: any) => {
    const dx = Math.abs(info.offset.x);
    const dy = Math.abs(info.offset.y);
    const wasRealDrag = dx > 8 || dy > 8;

    if (wasRealDrag) {
      isSwipeActiveRef.current = true;
      if (onDragEnd) {
        onDragEnd(event, info);
      }
    }

    // Keep isSwipeActiveRef = true for 400ms to block any synthetic click/tap after a drag
    setTimeout(() => {
      isSwipeActiveRef.current = false;
    }, 400);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. If clicked inside any button (e.g. sound button), NEVER FLIP!
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    // 2. If a drag/swipe gesture is active or recently occurred, NEVER FLIP!
    if (isSwipeActiveRef.current) {
      return;
    }

    // 3. If pointer moved > 6px since pointerdown, it was a drag, NEVER FLIP!
    if (pointerStartPosRef.current) {
      const dx = Math.abs(e.clientX - pointerStartPosRef.current.x);
      const dy = Math.abs(e.clientY - pointerStartPosRef.current.y);
      if (dx > 6 || dy > 6) {
        return;
      }
    }

    // 4. Debounce to prevent rapid double-clicks
    const now = Date.now();
    if (now - lastFlipTimeRef.current < 250) {
      return;
    }
    lastFlipTimeRef.current = now;

    onFlip();
  };

  return (
    <div
      className="relative perspective-1000 w-full h-[430px] sm:h-[460px] touch-pan-y"
      style={{ perspective: 1000, WebkitPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        if (canHover) setIsHovered(true);
      }}
      onMouseLeave={handleMouseLeave}
    >
      <m.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleCustomDragEnd}
        onPointerDown={handlePointerDown}
        onClick={handleCardClick}
        style={{
          x: dragX,
          rotateZ: rotateZ || 0,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      >
        {/* Swipe Feedback Badges */}
        {rightBadgeOpacity && (
          <m.div
            style={{ opacity: rightBadgeOpacity }}
            className="pointer-events-none absolute top-4 right-4 z-30 px-3 py-1 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm flex items-center gap-1.5"
          >
            <img
              src="/icons/icon-swipe-known.png"
              alt=""
              className="w-4 h-4 [image-rendering:pixelated]"
            />
            จำแม่นแล้ว
          </m.div>
        )}

        {leftBadgeOpacity && (
          <m.div
            style={{ opacity: leftBadgeOpacity }}
            className="pointer-events-none absolute top-4 left-4 z-30 px-3 py-1 bg-rose-500 text-white font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm flex items-center gap-1.5"
          >
            <img
              src="/icons/icon-swipe-learning.png"
              alt=""
              className="w-4 h-4 [image-rendering:pixelated]"
            />
            ทบทวนซ้ำ
          </m.div>
        )}

        {/* 3D Flipping Card Container */}
        <m.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            rotateX: canHover && isHovered ? rotateXSpring : 0,
            rotateY: canHover && isHovered ? rotateYSpring : 0,
          }}
          className="relative w-full h-full preserve-3d"
        >
          {/* ========================================================================= */}
          {/* FRONT OF 3D TRADING CARD */}
          {/* ========================================================================= */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg) translateZ(1px)',
              WebkitTransform: 'rotateY(0deg) translateZ(1px)',
              display: showBackFace ? 'none' : 'flex',
            }}
            className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-b from-[#2a1b40] via-[#161226] to-[#0c0914] p-3 sm:p-3.5 border-4 border-amber-400 shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_0_2px_#020617,inset_0_0_12px_rgba(251,191,36,0.3)] flex-col justify-between select-none"
          >
            {/* Holographic Sheen Overlay on Hover (Desktop only) */}
            {canHover && isHovered && (
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/10 to-amber-200/20 mix-blend-overlay transition-opacity" />
            )}

            {/* Top Bar: Category Banner & Mana Cost */}
            <div className="relative z-10 flex items-center justify-between bg-slate-950/80 border-2 border-amber-400/60 px-3 py-1.5 rounded shadow-sm">
              <span
                className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide border border-slate-900 ${theme.ribbon}`}
              >
                {card.category}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: card.manaCost }).map((_, i) => (
                  <img
                    key={i}
                    src="/icons/icon-hud-mana.png"
                    alt=""
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 [image-rendering:pixelated] drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]"
                  />
                ))}
              </div>
            </div>

            {/* Middle: 3D Pixel Illustration Frame */}
            <div className="relative my-2 flex-1 rounded-lg border-2 border-amber-300/70 bg-gradient-to-b from-slate-900/90 to-slate-950 p-2.5 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-b ${theme.glow} opacity-60`} />

              {/* 3D Illustration Pixel Art Frame */}
              <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-slate-950/80 border-2 border-amber-400 p-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.7),inset_0_0_8px_rgba(251,191,36,0.4)] flex items-center justify-center transform transition-transform group-hover:scale-105">
                <img
                  src={cardArtSrc}
                  alt={card.category}
                  className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Word & Part of Speech */}
              <div className="relative z-10 mt-2 text-center">
                <div className="flex items-baseline justify-center gap-2">
                  <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-amber-200 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {card.word}
                  </h2>
                  <span className="text-xs font-mono font-semibold text-amber-400/80">
                    {card.partOfSpeech}
                  </span>
                </div>
              </div>

              {/* Pronunciation Button (Shielded against card flip) */}
              <div className="relative z-10 mt-2">
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSpeak(card.word, e);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded border border-sky-300 shadow-[0_2px_4px_rgba(0,0,0,0.5)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  ฟังเสียงอ่าน
                </button>
              </div>
            </div>

            {/* Bottom Card Footer: Explicit flip signpost */}
            <div className="relative z-10 bg-slate-950/90 border border-amber-400/40 rounded px-2.5 py-1.5 flex items-center justify-between text-xs text-amber-200/80 cursor-pointer hover:bg-slate-900 transition-colors">
              <span className="inline-flex items-center gap-1.5 text-[11px]">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                แตะหรือคลิกเพื่อพลิกดูคำแปล
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-400 text-slate-950 rounded border border-amber-200 shadow-sm">
                SPACE
              </kbd>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BACK OF 3D TRADING CARD (Rotated 180deg) */}
          {/* ========================================================================= */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)',
              WebkitTransform: 'rotateY(180deg) translateZ(1px)',
              display: showBackFace ? 'flex' : 'none',
            }}
            className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-b from-[#1c132b] via-[#100d1c] to-[#08050e] p-3 sm:p-3.5 border-4 border-amber-400 shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_0_2px_#020617,inset_0_0_12px_rgba(251,191,36,0.3)] flex-col justify-between select-none"
          >
            {/* Top Bar: Word Header & Speech Button (Shielded against card flip) */}
            <div className="flex items-center justify-between bg-slate-950/80 border-2 border-amber-400/60 px-3 py-1.5 rounded shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-lg sm:text-xl font-bold text-amber-300">
                  {card.word}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {card.partOfSpeech}
                </span>
              </div>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSpeak(`${card.word}. ${card.exampleEn}`, e);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-amber-300 text-xs font-bold rounded border border-amber-400/40 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                ฟังประโยค
              </button>
            </div>

            {/* Middle: Thai Meaning & TOEIC Sentence Context */}
            <div className="my-auto space-y-3 px-2 py-1">
              <div className="bg-slate-900/80 border-2 border-amber-300/40 rounded-lg p-3 sm:p-4 text-center shadow-inner">
                <div className="text-[11px] text-amber-300 font-medium mb-1">
                  ความหมายภาษาไทย
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {card.meaningTh}
                </p>
              </div>

              <div className="bg-slate-900/60 border-l-4 border-amber-400 rounded-r-lg p-3 text-slate-200 text-xs sm:text-sm leading-relaxed italic shadow-sm">
                &ldquo;{card.exampleEn}&rdquo;
              </div>
            </div>

            {/* Bottom: Swipe Guidance & Flip Signpost */}
            <div className="bg-slate-950/90 border border-amber-400/40 rounded px-2.5 py-1.5 flex items-center justify-between text-xs text-slate-400 cursor-pointer hover:bg-slate-900 transition-colors">
              <span className="text-[11px] text-amber-200/90">
                ปัดขวาเมื่อจำได้ หรือปัดซ้ายเพื่อทบทวน
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-amber-300 rounded border border-slate-700">
                SPACE
              </kbd>
            </div>
          </div>
        </m.div>
      </m.div>
    </div>
  );
}
