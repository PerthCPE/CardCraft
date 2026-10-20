// ============================================================================
// frontend/src/utils/card-sets.ts
// ระบบจัดการชุดคำศัพท์ (Card Sets & Random Deck Generator)
// รองรับการสุ่มการ์ดตามขนาด 30, 50, 70, 100, 200 คำ หรือทั้งหมด (1,230+ คำ)
// พร้อมกรองตามหมวดหมู่และสถานะความจำ (Unlearned, Need Review, Mastered)
// ============================================================================

import { FlashcardItem } from '@/data/toeic-dictionary';

export interface CardSet {
  id: string;
  name: string;
  description: string;
  size: number;
  category: string;
  filterMode:
    | 'ALL'
    | 'UNLEARNED'
    | 'NEED_REVIEW'
    | 'MASTERED'
    | 'DUE'
    | 'EXAM_WRONG';
  cardIds: string[];
  createdAt: string;
  isPreset?: boolean;
}

const STORAGE_ACTIVE_SET_KEY = 'cardcraft_active_deck_v1';
const STORAGE_CUSTOM_SETS_KEY = 'cardcraft_custom_decks_v1';

export const PRESET_DECK_SIZES = [15, 30, 50, 70, 100, 200] as const;

/**
 * Fisher-Yates Shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * ดึงคำศัพท์ที่ตรงกับเงื่อนไขหมวดหมู่และสถานะความจำ (รวม Spaced Repetition DUE และ EXAM_WRONG)
 */
export function getMatchingPool(
  allCards: FlashcardItem[],
  category: string = 'ALL',
  filterMode:
    | 'ALL'
    | 'UNLEARNED'
    | 'NEED_REVIEW'
    | 'MASTERED'
    | 'DUE'
    | 'EXAM_WRONG' = 'ALL',
): FlashcardItem[] {
  const now = new Date();
  return allCards.filter((c) => {
    if (category !== 'ALL' && c.category !== category) return false;
    if (filterMode === 'UNLEARNED' && c.progress !== null) return false;
    if (filterMode === 'NEED_REVIEW' && c.progress?.isKnown !== false) return false;
    if (filterMode === 'MASTERED' && c.progress?.isKnown !== true) return false;
    if (filterMode === 'DUE') {
      return (
        c.progress?.isDue === true ||
        (c.progress?.dueAt && new Date(c.progress.dueAt) <= now)
      );
    }
    if (filterMode === 'EXAM_WRONG') {
      return (c.progress?.wrongCount ?? 0) > 0;
    }
    return true;
  });
}

/**
 * สร้างชุดคำศัพท์แบบสุ่มตามเงื่อนไข (กำหนดจำนวนการ์ด หมวด และสถานะความจำได้)
 */
export function createRandomSet(
  allCards: FlashcardItem[],
  options: {
    size: number;
    category?: string;
    filterMode?:
      | 'ALL'
      | 'UNLEARNED'
      | 'NEED_REVIEW'
      | 'MASTERED'
      | 'DUE'
      | 'EXAM_WRONG';
    customName?: string;
    customDescription?: string;
  },
): CardSet {
  const {
    size,
    category = 'ALL',
    filterMode = 'ALL',
    customName,
    customDescription,
  } = options;

  let pool = getMatchingPool(allCards, category, filterMode);

  // หาก pool มีน้อยกว่า size ให้ดึงคำในหมวดเดียวกันหรือคำทั้งหมดมาเสริม
  if (pool.length < size) {
    const extraPool = allCards.filter((c) => !pool.some((p) => p.id === c.id));
    pool = [...pool, ...shuffleArray(extraPool)];
  }

  const shuffled = shuffleArray(pool);
  const targetCount = Math.max(1, Math.min(size, allCards.length));
  const selectedCards = shuffled.slice(0, targetCount);
  const cardIds = selectedCards.map((c) => c.id);

  const defaultTitle =
    customName?.trim() ||
    `ชุดสุ่ม ${selectedCards.length} คำ (${category === 'ALL' ? 'คละทุกหมวด' : category})`;

  const defaultDesc =
    customDescription?.trim() ||
    `ชุดคำศัพท์ ${selectedCards.length} คำสำหรับการท่องจำและทดสอบความจำ (สร้างเมื่อ ${new Date().toLocaleDateString('th-TH')})`;

  return {
    id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: defaultTitle,
    description: defaultDesc,
    size: selectedCards.length,
    category,
    filterMode,
    cardIds,
    createdAt: new Date().toISOString(),
    isPreset: false,
  };
}

/**
 * สร้างชุดคำศัพท์ตั้งต้น (Presets)
 */
export function getBuiltInPresetSets(allCards: FlashcardItem[]): CardSet[] {
  return [
    {
      id: 'preset-quick-30',
      name: 'ชุดสุ่มด่วน 30 คำ (Quick Scout)',
      description: 'เหมาะสำหรับวอร์มอัพ 5 นาที ทบทวนคำศัพท์สำคัญ 30 คำ',
      size: 30,
      category: 'ALL',
      filterMode: 'ALL',
      cardIds: allCards.slice(0, 30).map((c) => c.id),
      createdAt: '2026-01-01T00:00:00.000Z',
      isPreset: true,
    },
    {
      id: 'preset-daily-50',
      name: 'ชุดประจำวัน 50 คำ (Daily Drill)',
      description: 'ชุดคำศัพท์มาตรฐาน 50 คำ เสริมความจำสำหรับข้อสอบ Part 5 และ 7',
      size: 50,
      category: 'ALL',
      filterMode: 'ALL',
      cardIds: allCards.slice(0, 50).map((c) => c.id),
      createdAt: '2026-01-01T00:00:00.000Z',
      isPreset: true,
    },
    {
      id: 'preset-challenge-70',
      name: 'ชุดท้าทาย 70 คำ (Rune Challenger)',
      description: 'คำศัพท์ระดับ 700+ ครอบคลุมสัญญา การเงิน และการตลาด',
      size: 70,
      category: 'ALL',
      filterMode: 'ALL',
      cardIds: allCards.slice(0, 70).map((c) => c.id),
      createdAt: '2026-01-01T00:00:00.000Z',
      isPreset: true,
    },
    {
      id: 'preset-century-100',
      name: 'ชุด 100 คำ (Paladin Century)',
      description: 'คำศัพท์ความเข้มข้นสูง 100 คำ สำหรับผู้ตั้งเป้าหมาย 700-800+ คะแนน',
      size: 100,
      category: 'ALL',
      filterMode: 'ALL',
      cardIds: allCards.slice(0, 100).map((c) => c.id),
      createdAt: '2026-01-01T00:00:00.000Z',
      isPreset: true,
    },
    {
      id: 'preset-master-200',
      name: 'ชุด 200 คำ (Archmage Mastery)',
      description: 'การฝึกขั้นสูง 200 คำ เจาะลึกศัพท์เฉพาะทางธุรกิจและคำแปลไทย',
      size: 200,
      category: 'ALL',
      filterMode: 'ALL',
      cardIds: allCards.slice(0, 200).map((c) => c.id),
      createdAt: '2026-01-01T00:00:00.000Z',
      isPreset: true,
    },
    {
      id: 'preset-all-archive',
      name: 'คลังศัพท์ทั้งหมด (Grand Deity Archive)',
      description: 'คำศัพท์ทั้งหมดในระบบ 1,230+ คำ แบ่งตาม 12 หมวดธุรกิจ',
      size: allCards.length,
      category: 'ALL',
      filterMode: 'ALL',
      cardIds: allCards.map((c) => c.id),
      createdAt: '2026-01-01T00:00:00.000Z',
      isPreset: true,
    },
  ];
}

/**
 * ดึงชุดคำศัพท์ที่กำลังใช้งานอยู่ (Active Set) จาก LocalStorage
 */
export function getStoredActiveSet(allCards: FlashcardItem[]): CardSet {
  if (typeof window === 'undefined') {
    const presets = getBuiltInPresetSets(allCards);
    return presets[1] || presets[0]; // ค่าเริ่มต้น 50 คำ
  }

  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_SET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CardSet;
      // ตรวจสอบว่ายังมี cardIds อยู่จริง
      if (parsed.cardIds && parsed.cardIds.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading active card set from localStorage:', e);
  }

  // Fallback เป็นชุด 50 คำ
  const presets = getBuiltInPresetSets(allCards);
  const defaultSet = presets[1] || presets[0];
  saveActiveSet(defaultSet);
  return defaultSet;
}

/**
 * บันทึกชุดคำศัพท์ที่ใช้งานอยู่ (Active Set)
 */
export function saveActiveSet(set: CardSet): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ACTIVE_SET_KEY, JSON.stringify(set));
  } catch (e) {
    console.error('Error saving active card set to localStorage:', e);
  }
}

/**
 * ดึงรายการ Custom Sets ที่ผู้ใช้เคยบันทึกไว้
 */
export function getSavedCustomSets(): CardSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_SETS_KEY);
    if (raw) {
      return JSON.parse(raw) as CardSet[];
    }
  } catch (e) {
    console.error('Error reading custom sets from localStorage:', e);
  }
  return [];
}

/**
 * บันทึก Custom Set เพิ่มเติม
 */
export function saveCustomSet(newSet: CardSet): CardSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedCustomSets().filter((s) => s.id !== newSet.id);
    const updated = [newSet, ...existing];
    localStorage.setItem(STORAGE_CUSTOM_SETS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving custom set to localStorage:', e);
    return [];
  }
}

/**
 * ลบ Custom Set
 */
export function deleteCustomSet(setId: string, allCards?: FlashcardItem[]): CardSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const updated = getSavedCustomSets().filter((s) => s.id !== setId);
    localStorage.setItem(STORAGE_CUSTOM_SETS_KEY, JSON.stringify(updated));

    // หากชุดที่ลบเป็นชุดที่กำลัง Active อยู่ ให้สลับกลับไปใช้ Preset มาตรฐาน
    const rawActive = localStorage.getItem(STORAGE_ACTIVE_SET_KEY);
    if (rawActive) {
      try {
        const active = JSON.parse(rawActive) as CardSet;
        if (active.id === setId && allCards && allCards.length > 0) {
          const defaultSet = getBuiltInPresetSets(allCards)[0];
          saveActiveSet(defaultSet);
        }
      } catch (err) {
        // ignore parse error
      }
    }
    return updated;
  } catch (e) {
    console.error('Error deleting custom set from localStorage:', e);
    return [];
  }
}
