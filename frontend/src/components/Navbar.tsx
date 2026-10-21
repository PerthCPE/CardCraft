'use client';

// ============================================================================
// Navbar.tsx
// CardCraft Release v1.0: แถบเมนูนำทางหลักระดับ Studio-Grade
// ตามหลักเกณฑ์ frontend-design + cardcraft-pixel-ui:
// - ขยายพื้นที่แถบเมนูให้โปร่งสบาย (h-20, max-w-7xl) จัดเรียงอย่างประณีต
// - ขจัดแถบเลื่อนแนวนอน (Horizontal Scrollbar) ที่ไม่สวยงามออกอย่างถาวร
// - บน Desktop: เมนูเรียงเต็มพอดี สไตล์ปุ่มอาร์เคดขอบคม Tactile Feedback
// - บน Mobile: เมนูเบอร์เกอร์สไตล์เรโทรแบบเปิดถาดพับเก็บได้ ไหลลื่นและไม่กินพื้นที่
// - แสดงสถานะ Guest Mode พร้อมปุ่มเข้าสู่ระบบ / สมัครสมาชิก หรือแสดง Hero HUD เมื่อล็อกอิน
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User, UserPlus, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  pixelIcon: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'หน้าหลัก',
    pixelIcon: '/icons/icon-trophy-700.png',
  },
  {
    href: '/flashcards',
    label: 'การ์ดคำศัพท์',
    pixelIcon: '/icons/icon-deck.png',
  },
  {
    href: '/practice',
    label: 'ฝึกทำโจทย์',
    pixelIcon: '/icons/icon-reading.png',
  },
  {
    href: '/mock-test',
    label: 'จำลองสอบ',
    pixelIcon: '/icons/icon-boss-gate.png',
  },
  {
    href: '/review/errors',
    label: 'คลังจุดอ่อน',
    pixelIcon: '/icons/icon-reading.png',
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-amber-50 border-b-4 border-slate-950 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 group focus:outline-none shrink-0"
        >
          <div className="w-11 h-11 bg-amber-400 border-2 border-slate-950 shadow-[3px_3px_0px_0px_#020617] flex items-center justify-center p-1.5 group-hover:-translate-y-0.5 transition-transform">
            <img
              src="/icons/icon-logo.png"
              alt="CardCraft"
              className="w-8 h-8 object-contain [image-rendering:pixelated] select-none"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
                CardCraft
              </span>
              <span className="font-pixel text-[9px] px-1.5 py-0.5 bg-emerald-400 text-slate-950 border border-slate-950 font-bold">
                700+
              </span>
            </div>
            <span className="text-[11px] text-amber-200/80 font-body hidden sm:inline">
              TOEIC Hero RPG
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (No scrollbars, clean spacing) */}
        <nav className="hidden lg:flex items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-display font-semibold border-2 border-slate-950 transition-all duration-75 select-none ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-[3px_3px_0px_0px_#020617] -translate-y-0.5'
                    : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-800 active:translate-y-[1px]'
                }`}
              >
                <img
                  src={item.pixelIcon}
                  alt=""
                  className="w-4 h-4 object-contain [image-rendering:pixelated] select-none"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Guest / User CTA + Mobile Hamburger */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            /* Logged-in Hero Pill */
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="inline-flex items-center gap-2.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border-2 border-slate-950 font-display text-xs font-bold shadow-[2px_2px_0px_0px_#020617] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              title="คลิกเพื่อดูโปรไฟล์ฮีโร่ / ออกจากระบบ"
            >
              <div className="w-6 h-6 bg-amber-400 text-slate-950 border border-slate-950 flex items-center justify-center font-pixel text-xs font-bold">
                {user.username ? user.username[0].toUpperCase() : 'H'}
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-white text-xs max-w-[110px] truncate leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-amber-300/80 font-mono">
                  @{user.username}
                </span>
              </div>
              <span className="font-pixel text-[11px] bg-slate-950 text-emerald-400 px-2 py-0.5 border border-slate-800">
                {user.currentEstimatedScore}p
              </span>
            </button>
          ) : (
            /* Guest Mode: Prominent Login / Sign-up CTA */
            <div className="flex items-center gap-2">
              <span className="hidden xl:inline-block text-[11px] font-mono text-slate-400 px-2.5 py-1 bg-slate-800/60 border border-slate-700/80 rounded-none">
                โหมดผู้เยี่ยมชม (Guest)
              </span>
              <button
                type="button"
                onClick={() => openAuthModal('เข้าสู่ระบบหรือสร้างบัญชีใหม่ เพื่อบันทึกผลการเรียนรู้และเลเวลฮีโร่ของคุณ')}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-2 border-slate-950 font-display text-xs font-bold shadow-[2px_2px_0px_0px_#020617] sm:shadow-[3px_3px_0px_0px_#020617] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
                <span className="hidden sm:inline">เข้าสู่ระบบ / สมัคร</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle (Visible below lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="เปิดเมนูนำทาง"
            className="lg:hidden p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border-2 border-slate-950 shadow-pixel-sm active:translate-y-[1px] transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-amber-300" />
            ) : (
              <Menu className="w-5 h-5 text-amber-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Accessible on smaller screens, zero horizontal scroll issues) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t-2 border-slate-800 px-4 py-3 space-y-1.5 animate-fade-in shadow-xl">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-display font-bold border-2 border-slate-900 transition-colors ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-pixel-sm'
                    : 'bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.pixelIcon}
                    alt=""
                    className="w-4 h-4 object-contain [image-rendering:pixelated] select-none"
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-slate-950 border border-amber-300" />
                )}
              </Link>
            );
          })}

          {!user && (
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('เข้าสู่ระบบหรือสร้างบัญชีใหม่ เพื่อบันทึกผลการเรียนรู้และเลเวลฮีโร่ของคุณ');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-400 text-slate-950 font-display font-bold text-sm border-2 border-slate-900 shadow-pixel-sm active:translate-y-[1px]"
              >
                <User className="w-4 h-4 text-slate-950" />
                เข้าสู่ระบบ / สมัครสมาชิก
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
