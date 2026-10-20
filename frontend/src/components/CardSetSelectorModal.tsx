'use client';

// ============================================================================
// frontend/src/components/CardSetSelectorModal.tsx
// หน้าต่างสร้าง บันทึก ลบ และเลือกชุดคำศัพท์ (Deck Manager & Creator)
// รองรับ:
// 1. สร้างชุดคำศัพท์ใหม่ (Create Deck):
//    - กำหนดจำนวนการ์ดได้อิสระ (Presets: 15, 30, 50, 70, 100, 200 หรือกรอกตัวเลขเอง)
//    - กรองตามหมวดหมู่ธุรกิจ (12 หมวด) และสถานะความจำ (ยังไม่เคยท่อง, ต้องทบทวน, จำได้แล้ว)
//    - แสดง Live Preview คำศัพท์ที่เข้าเงื่อนไข
//    - ปุ่ม "บันทึกและเริ่มปัดทันที" และ "บันทึกเก็บไว้ในคลังชุด"
// 2. ชุดของฉันที่บันทึกไว้ (My Saved Decks):
//    - สลับใช้งานเป็น Active Deck ได้ทันที
//    - ลบชุดคำศัพท์ที่ไม่ต้องการออกได้
// 3. ชุดมาตรฐาน (Presets):
//    - ชุด 15, 30, 50, 70, 100, 200 คำ หรือคลังศัพท์ทั้งหมด 1,230+ คำ
// ============================================================================

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Dices,
  Flame,
  Layers,
  Plus,
  Sliders,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { FlashcardItem, TOEIC_CATEGORIES } from '@/data/toeic-dictionary';
import {
  CardSet,
  createRandomSet,
  deleteCustomSet,
  getBuiltInPresetSets,
  getMatchingPool,
  getSavedCustomSets,
  PRESET_DECK_SIZES,
  saveActiveSet,
  saveCustomSet,
} from '@/utils/card-sets';

interface CardSetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: FlashcardItem[];
  activeSet: CardSet;
  onSelectSet: (set: CardSet) => void;
  initialTab?: 'CREATE' | 'SAVED' | 'PRESETS';
}

export default function CardSetSelectorModal({
  isOpen,
  onClose,
  allCards,
  activeSet,
  onSelectSet,
  initialTab = 'CREATE',
}: CardSetSelectorModalProps) {
  const [tab, setTab] = useState<'CREATE' | 'SAVED' | 'PRESETS'>(initialTab);

  // Form states for creating a new deck
  const [sizeMode, setSizeMode] = useState<'PRESET' | 'CUSTOM'>('PRESET');
  const [presetSize, setPresetSize] = useState<number>(30);
  const [customSizeInput, setCustomSizeInput] = useState<string>('25');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFilter, setSelectedFilter] = useState<
    | 'ALL'
    | 'UNLEARNED'
    | 'NEED_REVIEW'
    | 'MASTERED'
    | 'DUE'
    | 'EXAM_WRONG'
  >('ALL');
  const [customName, setCustomName] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Saved custom sets list
  const [savedSets, setSavedSets] = useState<CardSet[]>(() =>
    getSavedCustomSets(),
  );

  // คำนวณจำนวนการ์ดจริงที่ผู้ใช้เลือก
  const effectiveSize = useMemo(() => {
    if (sizeMode === 'CUSTOM') {
      const parsed = parseInt(customSizeInput, 10);
      if (isNaN(parsed) || parsed < 1) return 10;
      return Math.min(parsed, allCards.length);
    }
    return presetSize;
  }, [sizeMode, presetSize, customSizeInput, allCards.length]);

  // คำนวณ Live Matching Pool ตามเงื่อนไขหมวดหมู่และสถานะความจำ
  const matchingPool = useMemo(() => {
    return getMatchingPool(allCards, selectedCategory, selectedFilter);
  }, [allCards, selectedCategory, selectedFilter]);

  if (!isOpen) return null;

  const presets = getBuiltInPresetSets(allCards);

  const handleChooseSet = (set: CardSet) => {
    saveActiveSet(set);
    onSelectSet(set);
    onClose();
  };

  // สร้างและบันทึกชุดใหม่
  const handleCreateDeck = (activateImmediately: boolean) => {
    const newSet = createRandomSet(allCards, {
      size: effectiveSize,
      category: selectedCategory,
      filterMode: selectedFilter,
      customName: customName.trim() || undefined,
    });

    // บันทึกลง Storage
    const updated = saveCustomSet(newSet);
    setSavedSets(updated);

    if (activateImmediately) {
      handleChooseSet(newSet);
    } else {
      setSaveSuccessMsg(`บันทึกชุด "${newSet.name}" สำเร็จแล้ว!`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
      setTab('SAVED');
    }
  };

  const handleDeleteSaved = (setId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteCustomSet(setId, allCards);
    setSavedSets(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] rounded-none overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-400 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded border-2 border-slate-900 bg-white flex items-center justify-center shadow-pixel-sm">
              <Layers className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-950">
                จัดการและสร้างชุดคำศัพท์ (Deck Manager)
              </h2>
              <p className="text-xs text-slate-800 font-medium">
                สร้างชุดการ์ดใหม่ กำหนดจำนวนการ์ดอิสระ และบันทึก/สลับชุดสำหรับปัดการ์ด
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-900 hover:bg-white border-2 border-transparent hover:border-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-slate-900 bg-slate-100 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setTab('CREATE')}
            className={`flex-1 py-3 px-3 text-center border-r-2 border-slate-900 transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'CREATE'
                ? 'bg-white text-slate-900 font-bold border-b-2 border-b-white -mb-[2px]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            สร้างชุดใหม่ (Create Deck)
          </button>

          <button
            onClick={() => setTab('SAVED')}
            className={`flex-1 py-3 px-3 text-center border-r-2 border-slate-900 transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'SAVED'
                ? 'bg-white text-slate-900 font-bold border-b-2 border-b-white -mb-[2px]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            ชุดที่บันทึกไว้ ({savedSets.length})
          </button>

          <button
            onClick={() => setTab('PRESETS')}
            className={`flex-1 py-3 px-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'PRESETS'
                ? 'bg-white text-slate-900 font-bold border-b-2 border-b-white -mb-[2px]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Dices className="w-4 h-4 text-amber-600" />
            ชุดมาตรฐาน (Presets)
          </button>
        </div>

        {/* Toast / Notification Banner */}
        {saveSuccessMsg && (
          <div className="px-6 py-2 bg-emerald-100 border-b-2 border-emerald-500 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            {saveSuccessMsg}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: CREATE NEW DECK */}
          {tab === 'CREATE' && (
            <div className="space-y-5">
              {/* 1. Choose Card Count */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    1. เลือกจำนวนการ์ดในชุดนี้:
                  </label>
                  <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    เลือกไว้: {effectiveSize} คำ
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
                  {PRESET_DECK_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSizeMode('PRESET');
                        setPresetSize(size);
                      }}
                      className={`py-2 px-2 text-center border-2 font-display text-xs sm:text-sm font-bold transition-all ${
                        sizeMode === 'PRESET' && presetSize === size
                          ? 'border-slate-900 bg-amber-300 text-slate-950 shadow-pixel-sm scale-102'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-800'
                      }`}
                    >
                      {size} คำ
                    </button>
                  ))}
                </div>

                {/* Custom Card Count Input */}
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border-2 border-dashed border-slate-300">
                  <span className="text-xs text-slate-700 font-medium">
                    หรือระบุจำนวนเอง:
                  </span>
                  <input
                    type="number"
                    min="5"
                    max={allCards.length}
                    value={customSizeInput}
                    onChange={(e) => {
                      setSizeMode('CUSTOM');
                      setCustomSizeInput(e.target.value);
                    }}
                    onFocus={() => setSizeMode('CUSTOM')}
                    placeholder="เช่น 25, 45, 80"
                    className={`w-24 px-2 py-1 text-sm font-mono font-bold border-2 focus:outline-none ${
                      sizeMode === 'CUSTOM'
                        ? 'border-indigo-600 bg-white text-indigo-900'
                        : 'border-slate-300 bg-white text-slate-700'
                    }`}
                  />
                  <span className="text-xs text-slate-600">
                    คำ (สูงสุด {allCards.length} คำในระบบ)
                  </span>
                </div>
              </div>

              {/* 2. Choose Category */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                  2. เลือกหมวดหมู่ธุรกิจ (TOEIC Business Context):
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-900 text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {TOEIC_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'ALL'
                        ? 'คละทุกหมวดธุรกิจ (All 12 Business Categories)'
                        : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Choose Memory Status */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                  3. กรองตามสถานะความจำในบัญชีของคุณ:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { key: 'ALL', label: 'ทั้งหมด (คละ)' },
                    { key: 'DUE', label: 'ถึงเวลาทบทวน (Due)' },
                    { key: 'EXAM_WRONG', label: 'ที่เคยผิดจากข้อสอบ' },
                    { key: 'UNLEARNED', label: 'ยังไม่เคยท่อง' },
                    { key: 'NEED_REVIEW', label: 'ยังจำไม่ได้' },
                    { key: 'MASTERED', label: 'จำแม่นแล้ว' },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() =>
                        setSelectedFilter(
                          filter.key as
                            | 'ALL'
                            | 'UNLEARNED'
                            | 'NEED_REVIEW'
                            | 'MASTERED'
                            | 'DUE'
                            | 'EXAM_WRONG',
                        )
                      }
                      className={`py-2 px-2 text-center border-2 font-medium transition-all ${
                        selectedFilter === filter.key
                          ? 'border-slate-900 bg-emerald-200 text-slate-950 font-bold shadow-pixel-sm'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Deck Name */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
                  4. ตั้งชื่อชุดคำศัพท์ (ไม่ระบุก็ได้ ระบบจะตั้งให้อัตโนมัติ):
                </label>
                <input
                  type="text"
                  placeholder={`เช่น ชุดท่องศัพท์ ${effectiveSize} คำ (${selectedCategory === 'ALL' ? 'คละหมวด' : selectedCategory})`}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-900 text-sm font-body focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* 5. Live Pool Status & Preview */}
              <div className="p-3.5 bg-slate-50 border-2 border-slate-900 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    พบคำศัพท์ที่ตรงเงื่อนไข:
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-amber-200 px-2 py-0.5 rounded border border-slate-400">
                    {matchingPool.length} คำ
                  </span>
                </div>

                {matchingPool.length < effectiveSize && (
                  <p className="text-[11px] text-amber-800 bg-amber-100 p-2 border border-amber-300 rounded flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                    คำศัพท์ตรงเงื่อนไขมีน้อยกว่าที่เลือก ({matchingPool.length} &lt; {effectiveSize}) ระบบจะสุ่มคำศัพท์เสริมจากหมวดอื่นให้ครบ {effectiveSize} คำ
                  </p>
                )}

                {matchingPool.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[11px] text-slate-500 mb-1">
                      ตัวอย่างคำศัพท์ในเงื่อนไขนี้:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchingPool.slice(0, 5).map((c) => (
                        <span
                          key={c.id}
                          className="text-[11px] font-mono px-2 py-0.5 bg-white border border-slate-300 text-slate-800 rounded"
                        >
                          {c.word} ({c.meaningTh})
                        </span>
                      ))}
                      {matchingPool.length > 5 && (
                        <span className="text-[11px] text-slate-500 px-1 py-0.5">
                          +{matchingPool.length - 5} คำ
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleCreateDeck(true)}
                  className="py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 font-display font-bold text-sm shadow-pixel active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  บันทึก &amp; เริ่มปัดการ์ดทันที
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateDeck(false)}
                  className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 font-display font-bold text-sm shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  บันทึกเก็บไว้ในชุดของฉัน
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SAVED CUSTOM SETS */}
          {tab === 'SAVED' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  ชุดคำศัพท์ที่คุณสร้างและบันทึกไว้ในเบราว์เซอร์นี้:
                </p>
                <button
                  type="button"
                  onClick={() => setTab('CREATE')}
                  className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> สร้างชุดใหม่เพิ่ม
                </button>
              </div>

              {savedSets.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-300 bg-slate-50 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center text-slate-600">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="text-slate-800 font-bold text-sm">
                    ยังไม่มีชุดคำศัพท์ที่บันทึกไว้
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    คุณสามารถกดปุ่ม &quot;สร้างชุดใหม่&quot; ด้านบนเพื่อกำหนดจำนวนการ์ด (15, 30, 50, 100 คำ หรือตามต้องการ) แล้วบันทึกไว้ท่องจำได้ครับ
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab('CREATE')}
                    className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    สร้างชุดแรกของคุณเลย
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedSets.map((set) => {
                    const isActive = activeSet.id === set.id;
                    return (
                      <div
                        key={set.id}
                        className={`p-4 border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isActive
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-pixel'
                            : 'border-slate-900 bg-white hover:bg-amber-50/50 shadow-pixel-sm'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-950 text-sm font-display">
                              {set.name}
                            </span>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-200 text-slate-900 border border-amber-400 rounded">
                              {set.size} คำ
                            </span>
                            <span className="text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 rounded">
                              หมวด: {set.category === 'ALL' ? 'คละ 12 หมวด' : set.category}
                            </span>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-400">
                                <Check className="w-3 h-3" /> กำลังใช้งาน
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">
                            {set.description}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            สร้างเมื่อ: {new Date(set.createdAt).toLocaleDateString('th-TH')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleChooseSet(set)}
                            className={`px-3 py-1.5 font-display text-xs font-bold border-2 transition-all flex items-center gap-1 ${
                              isActive
                                ? 'bg-indigo-600 text-white border-indigo-900'
                                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-slate-900 shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            {isActive ? 'ใช้งานอยู่' : 'เลือกปัดชุดนี้'}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteSaved(set.id, e)}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-400 rounded transition-colors"
                            title="ลบชุดนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BUILT-IN PRESETS */}
          {tab === 'PRESETS' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                เลือกชุดคำศัพท์มาตรฐานที่ระบบจัดสรรไว้ล่วงหน้า:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((set) => {
                  const isActive = activeSet.id === set.id;
                  return (
                    <div
                      key={set.id}
                      onClick={() => handleChooseSet(set)}
                      className={`p-4 border-2 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-600 bg-indigo-50 shadow-pixel'
                          : 'border-slate-900 bg-white hover:bg-amber-50 shadow-pixel-sm hover:translate-x-[1px] hover:translate-y-[1px]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-slate-950 text-sm font-display">
                          {set.name}
                        </div>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-400">
                            <Check className="w-3 h-3" /> ใช้งานอยู่
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                            {set.size} คำ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                        {set.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t-2 border-slate-900 flex items-center justify-between text-xs text-slate-700">
          <div>
            ชุดปัจจุบัน:{' '}
            <span className="font-bold text-slate-950 font-display">
              {activeSet.name}
            </span>{' '}
            <span className="font-mono font-bold text-indigo-700">
              ({activeSet.cardIds.length} คำ)
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-900 border-2 border-slate-900 font-display font-bold text-xs shadow-pixel-sm"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
