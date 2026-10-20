'use client';

// ============================================================================
// PixelCharacterAvatar.tsx
// คอมโพเนนต์แสดงผลตัวละคร Pixel Sprite สำหรับทั้ง 7 Tiers
// - บังคับใช้ `[image-rendering:pixelated]` เพื่อให้ขอบพิกเซลคมชัดระดับ 16-bit RPG
// - โหลดไฟล์ภาพจริงจาก `/sprites/tier-1-novice.png` ถึง `/sprites/tier-7-deity.png`
// - มีระบบ Fallback เป็น SVG Pixel Art อัตโนมัติหากไฟล์รูปไม่พร้อมใช้งาน
// - รองรับโหมดเงาดำปริศนา (`isLocked = true` -> `brightness-0 opacity-40`) สำหรับ Roadmap
// ============================================================================

import React, { useState } from 'react';
import { CHARACTER_TIERS } from '@/utils/character-evolution.util';

interface PixelCharacterAvatarProps {
  tier: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLocked?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PixelCharacterAvatarProps['size']>, string> = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
  xl: 'w-36 h-36',
};

const TIER_PALETTES: Record<
  number,
  { armor: string; cape: string; weapon: string; aura: string }
> = {
  1: { armor: '#94a3b8', cape: '#64748b', weapon: '#a16207', aura: 'transparent' },
  2: { armor: '#22c55e', cape: '#15803d', weapon: '#ca8a04', aura: 'transparent' },
  3: { armor: '#38bdf8', cape: '#0369a1', weapon: '#e2e8f0', aura: '#bae6fd' },
  4: { armor: '#6366f1', cape: '#312e81', weapon: '#38bdf8', aura: '#c7d2fe' },
  5: { armor: '#fbbf24', cape: '#059669', weapon: '#fde047', aura: '#6ee7b7' },
  6: { armor: '#f97316', cape: '#9a3412', weapon: '#38bdf8', aura: '#fed7aa' },
  7: { armor: '#facc15', cape: '#e11d48', weapon: '#fef08a', aura: '#fef08a' },
};

export function PixelCharacterAvatar({
  tier,
  size = 'md',
  isLocked = false,
  className = '',
}: PixelCharacterAvatarProps) {
  const safeTier = Math.min(7, Math.max(1, tier));
  const tierMeta = CHARACTER_TIERS[safeTier - 1];
  const [imgError, setImgError] = useState(false);
  const [triedAltPath, setTriedAltPath] = useState(false);

  const currentSrc = !triedAltPath
    ? tierMeta.spritePath
    : tierMeta.altSpritePath;

  const palette = TIER_PALETTES[safeTier] || TIER_PALETTES[1];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${SIZE_CLASSES[size]} ${className}`}
    >
      {!imgError ? (
        <img
          src={currentSrc}
          alt={`Tier ${safeTier} - ${tierMeta.title}`}
          onError={() => {
            if (!triedAltPath) {
              setTriedAltPath(true);
            } else {
              setImgError(true);
            }
          }}
          className={`w-full h-full object-contain [image-rendering:pixelated] select-none transition-transform duration-200 ${
            isLocked ? 'brightness-0 opacity-40 contrast-200' : ''
          }`}
        />
      ) : (
        /* Built-in Crisp 16x16 SVG Pixel Fallback Avatar */
        <svg
          viewBox="0 0 16 16"
          shapeRendering="crispEdges"
          className={`w-full h-full [image-rendering:pixelated] ${
            isLocked ? 'brightness-0 opacity-40 contrast-200' : ''
          }`}
          aria-label={`Tier ${safeTier} Pixel Avatar`}
        >
          {palette.aura !== 'transparent' && (
            <rect x="2" y="1" width="12" height="14" fill={palette.aura} opacity="0.35" />
          )}
          {/* Helmet / Hair */}
          <rect x="5" y="2" width="6" height="2" fill={palette.armor} />
          {/* Face */}
          <rect x="5" y="4" width="6" height="3" fill="#fde68a" />
          <rect x="6" y="5" width="1" height="1" fill="#0f172a" />
          <rect x="9" y="5" width="1" height="1" fill="#0f172a" />
          {/* Cape & Armor */}
          <rect x="3" y="7" width="10" height="5" fill={palette.cape} />
          <rect x="5" y="7" width="6" height="5" fill={palette.armor} />
          {/* Weapon / Sword */}
          <rect x="13" y="4" width="1" height="6" fill={palette.weapon} />
          <rect x="12" y="8" width="3" height="1" fill="#0f172a" />
          {/* Boots */}
          <rect x="5" y="12" width="2" height="3" fill="#0f172a" />
          <rect x="9" y="12" width="2" height="3" fill="#0f172a" />
        </svg>
      )}
    </div>
  );
}
