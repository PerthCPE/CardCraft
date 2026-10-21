'use client';

// ============================================================================
// frontend/src/app/admin/page.tsx
// หน้าจัดการคลังข้อมูลแบบ Full-Stack CRUD (Flashcards & Questions)
// ปรับปรุงด้วยหลักการของ frontend-design + cardcraft-pixel-ui:
// - ใช้คำกริยาตรงไปตรงมาและสอดคล้องกันทั้งโฟลว์ (เช่น ปุ่ม "บันทึกคำศัพท์" -> แจ้งเตือน "บันทึกคำศัพท์แล้ว")
// - ตารางข้อมูลอ่านง่ายด้วยฟอนต์ Plus Jakarta Sans + IBM Plex Sans Thai
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Edit3,
  Layers,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import type { FlashcardItem, QuestionItem } from '@/data/toeic-types';
import { TOEIC_CATEGORIES } from '@/data/toeic-types';
import {
  createFlashcard,
  createQuestion,
  deleteFlashcard,
  deleteQuestion,
  fetchFlashcards,
  fetchQuestions,
  updateFlashcard,
  updateQuestion,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCardCraftQueryHelpers } from '@/hooks/useDashboardQueries';

type AdminTab = 'FLASHCARDS' | 'QUESTIONS';

export default function AdminGuildCrudPage() {
  const { user, openAuthModal } = useAuth();
  const { invalidateFlashcards, invalidateQuestions } = useCardCraftQueryHelpers();
  const [activeTab, setActiveTab] = useState<AdminTab>('FLASHCARDS');
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<FlashcardItem | null>(null);
  const [cardForm, setCardForm] = useState({
    word: '',
    partOfSpeech: 'n.',
    meaningTh: '',
    exampleEn: '',
    category: 'Contracts',
    manaCost: 3,
  });

  const [isQuestionModalOpen, setIsQuestionModalOpen] =
    useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(
    null,
  );
  const [questionForm, setQuestionForm] = useState({
    section: 'READING' as 'LISTENING' | 'READING',
    part: 5 as 1 | 2 | 3 | 4 | 5 | 6 | 7,
    audioUrl: '',
    imageUrl: '',
    passageText: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A' as 'A' | 'B' | 'C' | 'D',
    explanationTh: '',
    tag: 'Part 5 - Business Vocabulary',
  });

  useEffect(() => {
    // Admin โหลดข้อมูลสดตรงจากเซิร์ฟเวอร์โดยข้าม HTTP Cache
    fetchFlashcards(undefined, undefined, undefined, { bypassHttpCache: true }).then(setFlashcards);
    fetchQuestions(undefined, undefined, { bypassHttpCache: true }).then(setQuestions);
  }, []);

  const showToast = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 3000);
  };

  const openCreateCardModal = () => {
    setEditingCard(null);
    setCardForm({
      word: '',
      partOfSpeech: 'v.',
      meaningTh: '',
      exampleEn: '',
      category: 'Contracts',
      manaCost: 3,
    });
    setIsCardModalOpen(true);
  };

  const openEditCardModal = (card: FlashcardItem) => {
    setEditingCard(card);
    setCardForm({
      word: card.word,
      partOfSpeech: card.partOfSpeech,
      meaningTh: card.meaningTh,
      exampleEn: card.exampleEn,
      category: card.category,
      manaCost: card.manaCost,
    });
    setIsCardModalOpen(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) {
      const updated = await updateFlashcard(editingCard.id, cardForm);
      setFlashcards((prev) =>
        prev.map((c) => (c.id === editingCard.id ? { ...c, ...updated } : c)),
      );
      showToast(`บันทึกการแก้ไขคำศัพท์ "${updated.word}" แล้ว`);
    } else {
      const created = await createFlashcard(cardForm);
      setFlashcards((prev) => [created, ...prev]);
      showToast(`เพิ่มคำศัพท์ "${created.word}" เข้าสู่คลังแล้ว`);
    }
    invalidateFlashcards();
    setIsCardModalOpen(false);
  };

  const handleDeleteCard = async (card: FlashcardItem) => {
    await deleteFlashcard(card.id);
    setFlashcards((prev) => prev.filter((c) => c.id !== card.id));
    invalidateFlashcards();
    showToast(`ลบคำศัพท์ "${card.word}" ออกจากคลังแล้ว`);
  };

  const openCreateQuestionModal = () => {
    setEditingQuestion(null);
    setQuestionForm({
      section: 'READING',
      part: 5,
      audioUrl: '',
      imageUrl: '',
      passageText: '',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      explanationTh: '',
      tag: 'Part 5 - Business Vocabulary',
    });
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setQuestionForm({
      section: q.section,
      part: q.part,
      audioUrl: q.audioUrl || '',
      imageUrl: q.imageUrl || '',
      passageText: q.passageText || '',
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD || '',
      correctOption: q.correctOption,
      explanationTh: q.explanationTh,
      tag: q.tag,
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Omit<QuestionItem, 'id'> = {
      section: questionForm.part <= 2 ? 'LISTENING' : 'READING',
      part: questionForm.part,
      audioUrl: questionForm.audioUrl || null,
      imageUrl: questionForm.imageUrl || null,
      passageText: questionForm.passageText || null,
      questionText: questionForm.questionText,
      optionA: questionForm.optionA,
      optionB: questionForm.optionB,
      optionC: questionForm.optionC,
      optionD: questionForm.part === 2 ? null : questionForm.optionD || null,
      correctOption:
        questionForm.part === 2 && questionForm.correctOption === 'D'
          ? 'A'
          : questionForm.correctOption,
      explanationTh: questionForm.explanationTh,
      tag: questionForm.tag,
    };

    if (editingQuestion) {
      const updated = await updateQuestion(editingQuestion.id, payload);
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestion.id ? updated : q)),
      );
      showToast(`บันทึกการแก้ไขข้อสอบเรียบร้อยแล้ว`);
    } else {
      const created = await createQuestion(payload);
      setQuestions((prev) => [created, ...prev]);
      showToast(`เพิ่มข้อสอบใหม่เข้าสู่คลังแล้ว`);
    }
    invalidateQuestions();
    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = async (q: QuestionItem) => {
    await deleteQuestion(q.id);
    setQuestions((prev) => prev.filter((item) => item.id !== q.id));
    invalidateQuestions();
    showToast(`ลบข้อสอบออกจากคลังแล้ว`);
  };

  const filteredFlashcards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return flashcards;
    return flashcards.filter(
      (c) =>
        c.word.toLowerCase().includes(q) ||
        c.meaningTh.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }, [flashcards, searchQuery]);

  const filteredQuestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (item) =>
        item.questionText.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.explanationTh.toLowerCase().includes(q),
    );
  }, [questions, searchQuery]);

  if (!user || (user.username !== 'admin' && !user.email?.includes('admin'))) {
    return (
      <div className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-10 max-w-xl mx-auto text-center space-y-4 my-12">
        <div className="w-12 h-12 bg-rose-500 border-2 border-slate-900 mx-auto flex items-center justify-center shadow-pixel-sm">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <div className="inline-block px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-300">
          พื้นที่สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Restricted Area • Admin Only)
        </div>
        <h1 className="text-xl font-bold font-display text-slate-900">
          ไม่มีสิทธิ์เข้าถึงหน้านี้ (Admin Only)
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          หน้าจัดการคลังคำศัพท์และข้อสอบ (CRUD Manager) สงวนสิทธิ์สำหรับบัญชีผู้ดูแลระบบ (Admin) เท่านั้น บัญชีผู้เล่นทั่วไปไม่สามารถเพิ่ม แก้ไข หรือลบข้อมูลหลักได้
        </p>
        <div className="pt-2">
          {!user ? (
            <button
              type="button"
              onClick={() =>
                openAuthModal('กรุณาเข้าสู่ระบบด้วยบัญชี Admin เพื่อจัดการข้อมูล')
              }
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-sm border-2 border-slate-900 shadow-pixel active:translate-x-[1px] active:translate-y-[1px]"
            >
              เข้าสู่ระบบด้วยบัญชี Admin
            </button>
          ) : (
            <a
              href="/"
              className="inline-block px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-sm border-2 border-slate-900 shadow-pixel active:translate-x-[1px] active:translate-y-[1px]"
            >
              กลับสู่หน้าหลัก
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. HEADER & TAB SWITCHER */}
      <section className="bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-400 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617] flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6 text-slate-950" strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              จัดการคลังคำศัพท์และข้อสอบ (CRUD Manager)
            </h1>
            <p className="text-sm text-slate-300 mt-0.5">
              เพิ่ม แก้ไข หรือลบข้อมูลผ่าน REST API ของระบบโดยตรง
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('FLASHCARDS')}
            className={`inline-flex items-center gap-2 px-4 py-2 font-display font-bold text-sm border-2 border-slate-950 transition-all ${
              activeTab === 'FLASHCARDS'
                ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_#020617]'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            คำศัพท์ ({flashcards.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('QUESTIONS')}
            className={`inline-flex items-center gap-2 px-4 py-2 font-display font-bold text-sm border-2 border-slate-950 transition-all ${
              activeTab === 'QUESTIONS'
                ? 'bg-emerald-400 text-slate-950 shadow-[2px_2px_0px_0px_#020617]'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            ข้อสอบ ({questions.length})
          </button>
        </div>
      </section>

      {statusBanner && (
        <div className="bg-emerald-400 text-slate-950 border-2 border-slate-900 shadow-arcade p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>{statusBanner}</span>
          </div>
          <button type="button" onClick={() => setStatusBanner(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Create Action Bar */}
      <section className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'FLASHCARDS'
                ? 'ค้นหาคำศัพท์, ความหมายภาษาไทย หรือหมวดหมู่...'
                : 'ค้นหาโจทย์ข้อสอบ, หัวข้อไวยากรณ์ หรือคำอธิบายเฉลย...'
            }
            className="w-full pl-9 pr-4 py-2 bg-white border-2 border-slate-900 text-sm focus:outline-none"
          />
        </div>

        {activeTab === 'FLASHCARDS' ? (
          <button
            type="button"
            onClick={openCreateCardModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
          >
            <Plus className="w-4 h-4" />
            เพิ่มคำศัพท์ใหม่
          </button>
        ) : (
          <button
            type="button"
            onClick={openCreateQuestionModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
          >
            <Plus className="w-4 h-4" />
            เพิ่มข้อสอบใหม่
          </button>
        )}
      </section>

      {/* TAB 1: FLASHCARDS TABLE */}
      {activeTab === 'FLASHCARDS' && (
        <section className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-amber-300 text-xs font-display border-b-2 border-slate-950">
                  <th className="py-3 px-4">คำศัพท์และตัวอย่างประโยค</th>
                  <th className="py-3 px-4">ความหมายภาษาไทย</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">ความยาก</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredFlashcards.map((card) => (
                  <tr key={card.id} className="hover:bg-amber-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-baseline gap-2">
                        <span className="font-sans font-bold text-slate-900">
                          {card.word}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {card.partOfSpeech}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {card.exampleEn}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {card.meaningTh}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-amber-100 text-slate-800 text-xs border border-slate-900">
                        {card.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-pixel text-xs text-slate-800">
                      {card.manaCost}/5
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditCardModal(card)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-slate-900 text-xs font-semibold border border-slate-900 hover:bg-sky-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(card)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500 text-white text-xs font-semibold border border-slate-900 hover:bg-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: QUESTIONS TABLE */}
      {activeTab === 'QUESTIONS' && (
        <section className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-emerald-300 text-xs font-display border-b-2 border-slate-950">
                  <th className="py-3 px-4">พาร์ท</th>
                  <th className="py-3 px-4">โจทย์คำถามและคำอธิบายเฉลย</th>
                  <th className="py-3 px-4">เฉลย</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-emerald-50/40">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-900 text-amber-300 font-pixel text-[10px]">
                        Part {q.part}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-sans font-bold text-slate-900 reading-measure">
                        {q.questionText}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 reading-measure">
                        {q.explanationTh}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-emerald-400 text-slate-950 font-pixel text-xs border border-slate-900">
                        {q.correctOption}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditQuestionModal(q)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-slate-900 text-xs font-semibold border border-slate-900 hover:bg-sky-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500 text-white text-xs font-semibold border border-slate-900 hover:bg-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* MODAL 1: CREATE / EDIT FLASHCARD */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade-lg w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingCard ? 'แก้ไขคำศัพท์' : 'เพิ่มคำศัพท์ใหม่'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="p-1 border border-slate-900 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">
                    คำศัพท์ภาษาอังกฤษ
                  </label>
                  <input
                    required
                    type="text"
                    value={cardForm.word}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, word: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                    placeholder="เช่น Arbitrate"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    ชนิดของคำ
                  </label>
                  <select
                    value={cardForm.partOfSpeech}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, partOfSpeech: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  >
                    <option value="n.">n.</option>
                    <option value="v.">v.</option>
                    <option value="adj.">adj.</option>
                    <option value="adv.">adv.</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  ความหมายภาษาไทย
                </label>
                <input
                  required
                  type="text"
                  value={cardForm.meaningTh}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, meaningTh: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  placeholder="เช่น ไกล่เกลี่ยข้อพิพาททางธุรกิจ"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  ประโยคตัวอย่างภาษาอังกฤษ
                </label>
                <textarea
                  required
                  rows={2}
                  value={cardForm.exampleEn}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, exampleEn: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    หมวดหมู่ธุรกิจ
                  </label>
                  <select
                    value={cardForm.category}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  >
                    {TOEIC_CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    ระดับความยาก (1–5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={cardForm.manaCost}
                    onChange={(e) =>
                      setCardForm({
                        ...cardForm,
                        manaCost: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-semibold border-2 border-slate-900"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
                >
                  บันทึกคำศัพท์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT QUESTION */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fffdf7] border-2 border-slate-900 shadow-arcade-lg w-full max-w-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingQuestion ? 'แก้ไขข้อสอบ' : 'เพิ่มข้อสอบใหม่'}
              </h2>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 border border-slate-900 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    พาร์ทของข้อสอบ
                  </label>
                  <select
                    value={questionForm.part}
                    onChange={(e) => {
                      const p = Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
                      setQuestionForm({
                        ...questionForm,
                        part: p,
                        section: p <= 4 ? 'LISTENING' : 'READING',
                      });
                    }}
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  >
                    <option value={1}>Part 1 (Photographs)</option>
                    <option value={2}>Part 2 (Question-Response)</option>
                    <option value={3}>Part 3 (Conversations)</option>
                    <option value={4}>Part 4 (Short Talks)</option>
                    <option value={5}>Part 5 (Incomplete Sentences)</option>
                    <option value={6}>Part 6 (Text Completion)</option>
                    <option value={7}>Part 7 (Reading Comprehension)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    ตัวเลือกที่ถูกต้อง
                  </label>
                  <select
                    value={questionForm.correctOption}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        correctOption: e.target.value as 'A' | 'B' | 'C' | 'D',
                      })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  >
                    <option value="A">ตัวเลือก A</option>
                    <option value="B">ตัวเลือก B</option>
                    <option value="C">ตัวเลือก C</option>
                    {questionForm.part !== 2 && (
                      <option value="D">ตัวเลือก D</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    หมวดหมู่โจทย์ (Tag)
                  </label>
                  <input
                    required
                    type="text"
                    value={questionForm.tag}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, tag: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  />
                </div>
              </div>

              {questionForm.part === 7 && (
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    เนื้อหาบทความหรืออีเมล (สำหรับ Part 7)
                  </label>
                  <textarea
                    rows={3}
                    value={questionForm.passageText}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        passageText: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">
                  โจทย์คำถาม
                </label>
                <textarea
                  required
                  rows={2}
                  value={questionForm.questionText}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      questionText: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    ตัวเลือก A
                  </label>
                  <input
                    required
                    type="text"
                    value={questionForm.optionA}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        optionA: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    ตัวเลือก B
                  </label>
                  <input
                    required
                    type="text"
                    value={questionForm.optionB}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        optionB: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    ตัวเลือก C
                  </label>
                  <input
                    required
                    type="text"
                    value={questionForm.optionC}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        optionC: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                  />
                </div>
                {questionForm.part !== 2 && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      ตัวเลือก D
                    </label>
                    <input
                      required
                      type="text"
                      value={questionForm.optionD}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          optionD: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  คำอธิบายเฉลยภาษาไทย
                </label>
                <textarea
                  required
                  rows={2}
                  value={questionForm.explanationTh}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      explanationTh: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border-2 border-slate-900 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-semibold border-2 border-slate-900"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-400 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm"
                >
                  บันทึกข้อสอบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
