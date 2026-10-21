'use client';

// ============================================================================
// frontend/src/components/Part1ImageZoom.tsx
// ระบบขยายรูปภาพ TOEIC Part 1 (Photographs Inspection Lightbox)
// ออกแบบตามหลัก /frontend-design และ /cardcraft-pixel-ui:
// - คลิกที่รูปภาพเพื่อเปิดหน้าต่าง Pop-up ขยายดูรายละเอียดฉาก วัตถุ และการกระทำ
// - รองรับการกดปุ่ม Zoom เพื่อซูมเจาะลึก 175% (Inspect Detail) หรือขนาดพอดีจอ (Fit Screen)
// - มีทริคการสังเกตข้อสอบ Part 1 เชิงกลยุทธ์ (Actions, Locations, Trap awareness)
// - รองรับการกด ESC หรือคลิกพื้นที่ภายนอกเพื่อปิดได้อย่างรวดเร็ว
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Maximize2, Minimize2, X, ZoomIn, ZoomOut, Eye } from 'lucide-react';

interface Part1ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
  caption?: string;
}

export function Part1ImagePreview({
  src,
  alt = 'Part 1 Photograph',
  className = '',
  caption,
}: Part1ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-label="คลิกเพื่อขยายดูรูปภาพขนาดเต็ม"
        className={`relative group cursor-zoom-in border-2 border-slate-900 bg-white p-2 shadow-arcade-sm hover:shadow-arcade hover:border-slate-950 transition-all select-none ${className}`}
      >
        <div className="relative overflow-hidden bg-slate-950 flex items-center justify-center">
          <img
            src={src}
            alt={alt}
            loading="eager"
            fetchPriority="high"
            className="w-full h-auto aspect-video object-contain group-hover:scale-[1.02] transition-transform duration-200"
          />

          {/* Subtle Hover Lens Badge */}
          <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/25 transition-colors flex items-center justify-center pointer-events-none">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-slate-900/90 text-amber-300 font-display font-bold text-xs border border-amber-400/60 shadow-[2px_2px_0px_0px_#020617] inline-flex items-center gap-1.5">
              <ZoomIn className="w-4 h-4 text-amber-400" />
              คลิกเพื่อขยายดูรายละเอียดภาพ
            </span>
          </div>
        </div>

        {/* Bottom Corner Tag */}
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600 px-1">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
            <Camera className="w-3.5 h-3.5 text-slate-700" />
            ภาพข้อสอบ Part 1
          </span>
          <span className="text-[10px] font-mono text-slate-500 group-hover:text-amber-800 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            กดเพื่อซูม
          </span>
        </div>
      </div>

      {isOpen && (
        <Part1ImageModal
          src={src}
          alt={alt}
          caption={caption}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

interface Part1ImageModalProps {
  src: string;
  alt?: string;
  caption?: string;
  onClose: () => void;
}

export function Part1ImageModal({
  src,
  alt = 'Part 1 Photograph',
  caption,
  onClose,
}: Part1ImageModalProps) {
  const [isMagnified, setIsMagnified] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="หน้าต่างขยายรูปภาพ Part 1"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-3 sm:p-6 animate-fade-in backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFFDF7] border-3 border-slate-950 shadow-[8px_8px_0px_0px_#020617] max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-amber-50 px-4 sm:px-6 py-3.5 border-b-2 border-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-400 border border-slate-950 flex items-center justify-center text-slate-950 shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm sm:text-base text-white">
                  ภาพประกอบข้อสอบ Part 1: Photographs
                </h3>
                <span className="font-pixel text-[9px] px-1.5 py-0.5 bg-sky-400 text-slate-950 font-bold border border-slate-900">
                  SCENE ZOOM
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans hidden sm:block">
                สังเกตอิริยาบถ บุคคล วัตถุฉากหลัง และสภาพแวดล้อมเพื่อตัดช้อยส์หลอก
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom 175% Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMagnified((prev) => !prev)}
              className={`px-3 py-1.5 font-display font-bold text-xs border border-slate-700 flex items-center gap-1.5 active:translate-y-[1px] transition-all cursor-pointer ${
                isMagnified
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[2px_2px_0px_0px_#020617]'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-750'
              }`}
              title={isMagnified ? 'ปรับขนาดพอดีกรอบ' : 'ซูมเจาะลึก 175%'}
            >
              {isMagnified ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ขนาดพอดีจอ</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ซูมเจาะลึก 175%</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่างขยายภาพ"
              className="p-1.5 bg-slate-800 hover:bg-rose-600 text-white border border-slate-700 hover:border-slate-900 active:translate-y-[1px] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Stage Viewport */}
        <div className="flex-1 overflow-auto bg-slate-950 p-3 sm:p-6 flex items-center justify-center min-h-[300px] max-h-[64vh]">
          <div
            onClick={() => setIsMagnified((prev) => !prev)}
            className={`transition-all duration-200 flex items-center justify-center ${
              isMagnified
                ? 'cursor-zoom-out w-auto'
                : 'cursor-zoom-in w-full h-full max-h-[60vh]'
            }`}
            title="คลิกที่ภาพเพื่อสลับโหมดซูม"
          >
            <img
              src={src}
              alt={alt}
              className={`select-none transition-all duration-200 ${
                isMagnified
                  ? 'max-w-none w-[160%] sm:w-[175%] h-auto shadow-2xl'
                  : 'max-w-full max-h-[58vh] object-contain shadow-lg'
              }`}
            />
          </div>
        </div>

        {/* Footer Guidance Bar */}
        <div className="bg-[#FFFDF7] px-4 sm:px-6 py-3 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              กลยุทธ์การตรวจจับรายละเอียด TOEIC Part 1:
            </span>
            <p className="text-[11px] sm:text-xs text-slate-600 font-sans max-w-2xl leading-relaxed">
              ระวังประธานผิดคน, กริยาที่กำลังทำ (Active) เทียบกับสภาพของวัตถุที่วางอยู่แล้ว (Passive/State), และตำแหน่งสิ่งของด้านหลัง
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-xs border-2 border-slate-950 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              ปิดหน้าต่าง (ESC)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
