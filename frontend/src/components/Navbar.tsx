'use client';

// ============================================================================
// Navbar.tsx
// แถบเมนูนำทางหลัก — ปรับปรุงตามหลัก frontend-design + cardcraft-pixel-ui:
// - ตัดป้ายกำกับตัวพิมพ์ใหญ่ซ้อน 2 บรรทัดที่ดูรกตาออก ใช้ชื่อเมนูภาษาไทยที่กระชับเข้าใจง่ายทันที
// - คงเอกลักษณ์ไอคอน Pixel Art คมชัด ([image-rendering:pixelated]) และปุ่มกดแบบ Tactile Border
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  pixelIcon: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'หน้าหลักฮีโร่',
    pixelIcon: '/icons/icon-trophy-700.png',
  },
  {
    href: '/flashcards',
    label: 'การ์ดคำศัพท์',
    pixelIcon: '/icons/icon-deck.png',
  },
  {
    href: '/practice',
    label: 'ฝึกทำโจทย์แยกพาร์ท',
    pixelIcon: '/icons/icon-reading.png',
  },
  {
    href: '/mock-test',
    label: 'จำลองสอบจับเวลา',
    pixelIcon: '/icons/icon-boss-gate.png',
  },
  {
    href: '/admin',
    label: 'จัดการคลังข้อมูล',
    pixelIcon: '/icons/icon-hud-mana.png',
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-amber-50 border-b-2 border-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Identity */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 group focus:outline-none shrink-0"
        >
          <div className="w-10 h-10 bg-amber-400 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617] flex items-center justify-center p-1 group-hover:-translate-y-0.5 transition-transform">
            <img
              src="/icons/icon-logo.png"
              alt="CardCraft"
              className="w-7 h-7 object-contain [image-rendering:pixelated] select-none"
            />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-display font-bold text-xl tracking-tight text-white">
              CardCraft
            </span>
            <span className="hidden sm:inline-block font-pixel text-[10px] px-1.5 py-0.5 bg-emerald-500 text-slate-950 border border-slate-950">
              700+
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-display font-semibold border-2 border-slate-950 whitespace-nowrap transition-all duration-75 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_#020617]'
                    : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800 hover:text-white active:translate-y-[1px]'
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

        {/* User Account / Login Pill */}
        <div className="flex items-center shrink-0">
          {user ? (
            <button
              type="button"
              onClick={openAuthModal}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border-2 border-slate-950 font-display text-xs font-bold shadow-pixel-sm transition-all"
              title="คลิกเพื่อดูข้อมูลผู้เล่น / สลับบัญชี"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-pixel text-[10px]">
                {user.username ? user.username[0].toUpperCase() : 'H'}
              </div>
              <span className="max-w-[100px] truncate hidden md:inline">
                {user.name}
              </span>
              <span className="font-pixel text-[10px] bg-slate-900 px-1 py-0.5 text-emerald-400 rounded">
                {user.currentEstimatedScore}p
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-950 font-display text-xs font-bold shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
