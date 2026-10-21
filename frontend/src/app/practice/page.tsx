'use client';

// ============================================================================
// frontend/src/app/practice/page.tsx
// CardCraft v2.0: Practice & Vocab Arcade Hub
// - Hub-First Flow: เริ่มต้นที่หน้าเลือกโหมดเสมอ (ไม่มีการ Auto-start)
// - ส่วนที่ 1: TOEIC 7-Part Skill Drills (Parts 1 to 7) พร้อม Pre-game Config (min 15 Qs, min 5 mins)
// - ส่วนที่ 2: Vocab Arcade Mini-Games (6 เกมคำศัพท์แยกเฉพาะ ไม่ซ้ำกับ /flashcards)
// - Post-Practice: คำนวณ Estimated Part Score ตามน้ำหนักข้อสอบจริง พร้อม Supportive 5-Tier Feedback
// - STRICT RULE: ไม่แก้ไข Hero Official Level หรือ currentEstimatedScore
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Dices,
  FileText,
  Flame,
  Gamepad2,
  Hammer,
  Headphones,
  HelpCircle,
  Layers,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Swords,
  Volume2,
  Wrench,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import type { FlashcardItem, QuestionItem } from '@/data/toeic-types';
import { TOEIC_CATEGORIES } from '@/data/toeic-types';
import { submitPracticePart } from '@/lib/api';
import { useQuestions } from '@/hooks/useQuestionsQuery';
import { useFlashcards } from '@/hooks/useFlashcardsQuery';
import { useCardCraftQueryHelpers } from '@/hooks/useDashboardQueries';
import { useAuth } from '@/context/AuthContext';
import {
  buildShuffledQuestionsMap,
  ShuffledQuestionWrapper,
} from '@/utils/question-shuffle.util';
import {
  calculateEstimatedPartScore,
  SupportivePerformanceTier,
  TOEIC_PART_WEIGHTS,
} from '@/utils/character-evolution.util';
import { formatDecimal, formatAccuracyPercent } from '@/utils/number-format.util';
import { speakEnglish, cancelSpeech } from '@/utils/speech-synthesis.util';
import { Part1ImagePreview } from '@/components/Part1ImageZoom';

import dynamic from 'next/dynamic';

const ArcadeGameSkeleton = () => (
  <div className="min-h-[500px] w-full bg-slate-900 border-2 border-slate-950 p-8 flex flex-col items-center justify-center text-center space-y-4">
    <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
    <p className="font-pixel text-amber-300 text-sm animate-pulse">
      กำลังเชื่อมต่อลานประลองอาร์เคด...
    </p>
  </div>
);

// 6 Brand-New Vocab Arcade Mini-Games (Dynamic Code-Splitting)
const RuneMatchGame = dynamic(
  () => import('@/components/vocab-arcade/RuneMatchGame'),
  { ssr: false, loading: () => <ArcadeGameSkeleton /> },
);
const BardsEchoGame = dynamic(
  () => import('@/components/vocab-arcade/BardsEchoGame'),
  { ssr: false, loading: () => <ArcadeGameSkeleton /> },
);
const WordAlchemistGame = dynamic(
  () => import('@/components/vocab-arcade/WordAlchemistGame'),
  { ssr: false, loading: () => <ArcadeGameSkeleton /> },
);
const TwinBladesGame = dynamic(
  () => import('@/components/vocab-arcade/TwinBladesGame'),
  { ssr: false, loading: () => <ArcadeGameSkeleton /> },
);
const ContextClozeGame = dynamic(
  () => import('@/components/vocab-arcade/ContextClozeGame'),
  { ssr: false, loading: () => <ArcadeGameSkeleton /> },
);
const AnagramForgeGame = dynamic(
  () => import('@/components/vocab-arcade/AnagramForgeGame'),
  { ssr: false, loading: () => <ArcadeGameSkeleton /> },
);

type HubTab = 'PARTS' | 'VOCAB_ARCADE';
type VocabGameMode =
  | 'RUNE_MATCH'
  | 'BARDS_ECHO'
  | 'WORD_ALCHEMIST'
  | 'TWIN_BLADES'
  | 'CONTEXT_CLOZE'
  | 'ANAGRAM_FORGE';

interface PartMetadata {
  part: number;
  title: string;
  section: 'LISTENING' | 'READING';
  formatTh: string;
  badgeTh: string;
  maxScore: number;
  weightDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TOEIC_PARTS_META: PartMetadata[] = [
  {
    part: 1,
    title: 'Part 1: Photographs',
    section: 'LISTENING',
    formatTh: 'ดูรูปภาพ ฟังเสียง 4 ตัวเลือก แล้วเลือกข้อที่บรรยายถูกต้องที่สุด',
    badgeTh: '4 ตัวเลือก • รูปภาพ',
    maxScore: 30,
    weightDesc: 'น้ำหนัก ~6% ของพาร์ทฟัง (คะแนนเต็ม 30)',
    icon: Headphones,
  },
  {
    part: 2,
    title: 'Part 2: Question-Response',
    section: 'LISTENING',
    formatTh: 'ฟังคำถามหรือบทพูด แล้วเลือกประโยคตอบรับที่เหมาะสม (3 ตัวเลือก)',
    badgeTh: '3 ตัวเลือก A-C • เสียงล้วน',
    maxScore: 125,
    weightDesc: 'น้ำหนัก ~25% ของพาร์ทฟัง (คะแนนเต็ม 125)',
    icon: Volume2,
  },
  {
    part: 3,
    title: 'Part 3: Conversations',
    section: 'LISTENING',
    formatTh: 'ฟังบทสนทนาระหว่าง 2-3 คน แล้วตอบคำถามแบบชุด',
    badgeTh: '4 ตัวเลือก • บทสนทนา',
    maxScore: 190,
    weightDesc: 'น้ำหนัก ~39% ของพาร์ทฟัง (คะแนนเต็ม 190)',
    icon: Headphones,
  },
  {
    part: 4,
    title: 'Part 4: Short Talks',
    section: 'LISTENING',
    formatTh: 'ฟังคำประกาศ บรรยาย หรือข้อความเสียงจากผู้พูดคนเดียว',
    badgeTh: '4 ตัวเลือก • ประกาศสั้น',
    maxScore: 150,
    weightDesc: 'น้ำหนัก ~30% ของพาร์ทฟัง (คะแนนเต็ม 150)',
    icon: Volume2,
  },
  {
    part: 5,
    title: 'Part 5: Incomplete Sentences',
    section: 'READING',
    formatTh: 'เติมคำในช่องว่างประโยคเดี่ยว ทดสอบไวยากรณ์และคำศัพท์ธุรกิจ',
    badgeTh: '4 ตัวเลือก • ไวยากรณ์/คำศัพท์',
    maxScore: 150,
    weightDesc: 'น้ำหนัก ~30% ของพาร์ทอ่าน (คะแนนเต็ม 150)',
    icon: BookOpen,
  },
  {
    part: 6,
    title: 'Part 6: Text Completion',
    section: 'READING',
    formatTh: 'เติมคำและประโยคในบทความ จดหมาย หรืออีเมลธุรกิจที่มี 4 ช่องว่าง',
    badgeTh: '4 ตัวเลือก • บทความสั้น',
    maxScore: 80,
    weightDesc: 'น้ำหนัก ~16% ของพาร์ทอ่าน (คะแนนเต็ม 80)',
    icon: FileText,
  },
  {
    part: 7,
    title: 'Part 7: Reading Comprehension',
    section: 'READING',
    formatTh: 'อ่านจับใจความบทความ อีเมล ประกาศ และตารางธุรกิจแบบ Split-Screen',
    badgeTh: '4 ตัวเลือก • บทความยาว',
    maxScore: 265,
    weightDesc: 'น้ำหนัก ~54% ของพาร์ทอ่าน (คะแนนเต็ม 265)',
    icon: BookOpen,
  },
];

interface VocabGameMetadata {
  id: VocabGameMode;
  title: string;
  titleTh: string;
  descriptionTh: string;
  badgeTh: string;
  icon: React.ComponentType<{ className?: string }>;
}

const VOCAB_GAMES_META: VocabGameMetadata[] = [
  {
    id: 'RUNE_MATCH',
    title: 'Rune Match',
    titleTh: 'กระดานจับคู่ศิลาคำศัพท์',
    descriptionTh: 'แตะจับคู่คำศัพท์ภาษาอังกฤษกับความหมายภาษาไทยบนกระดานศิลา 12 แผ่นแข่งกับเวลา',
    badgeTh: 'ความจำ & ความเร็ว',
    icon: Sparkles,
  },
  {
    id: 'BARDS_ECHO',
    title: "Bard's Echo",
    titleTh: 'เสียงสะท้อนแห่งกวี (Audio Dictation)',
    descriptionTh: 'ฟังเสียงอ่านออกเสียงคำศัพท์ที่ซ่อนตัวสะกด แล้วเลือกคำที่ได้ยินจากตัวลวงที่เสียงคล้ายกัน',
    badgeTh: 'ทักษะการฟัง',
    icon: Volume2,
  },
  {
    id: 'WORD_ALCHEMIST',
    title: 'Word Alchemist',
    titleTh: 'แปรธาตุชนิดของคำ (Part of Speech Drill)',
    descriptionTh: 'วิเคราะห์โครงสร้างประโยคไวยากรณ์ แล้วเลือกรูปคำ (Noun, Verb, Adj, Adv) ที่ถูกต้อง',
    badgeTh: 'ไวยากรณ์ & Word Family',
    icon: Zap,
  },
  {
    id: 'TWIN_BLADES',
    title: 'Twin Blades',
    titleTh: 'ศึกดวลคำพ้องความหมาย (Synonym Strike)',
    descriptionTh: 'ฟันดาบเลือกคำพ้องความหมาย (Synonym) ที่ใกล้เคียงที่สุดอย่างรวดเร็วเพื่อสะสมคอมโบ',
    badgeTh: 'ความเร็ว & คำพ้อง',
    icon: Swords,
  },
  {
    id: 'CONTEXT_CLOZE',
    title: 'Context Cloze Strike',
    titleTh: 'เติมคำตามบริบทประโยคธุรกิจ',
    descriptionTh: 'อ่านประโยคตัวอย่างข้อสอบธุรกิจที่มีช่องว่าง แล้วเลือกคำศัพท์ที่ถูกต้องตรงตามความหมาย',
    badgeTh: 'จับใจความบริบท',
    icon: FileText,
  },
  {
    id: 'ANAGRAM_FORGE',
    title: 'Anagram Forge',
    titleTh: 'ตีดาบเรียงตัวอักษรสะกดคำ',
    descriptionTh: 'คลิกแผ่นศิลาหรือกดแป้นพิมพ์เพื่อตีเรียงตัวสะกดคำศัพท์ภาษาอังกฤษให้ถูกต้องตามคำแปล',
    badgeTh: 'การสะกดคำ & คีย์บอร์ด',
    icon: Hammer,
  },
];

export default function PracticeHubPage() {
  const { user } = useAuth();
  const { invalidateDashboard, prefetchQuestions, prefetchFlashcards } = useCardCraftQueryHelpers();
  const [activeTab, setActiveTab] = useState<HubTab>('PARTS');

  // Navigation View State
  const [viewState, setViewState] = useState<
    'HUB' | 'CONFIG_PART' | 'CONFIG_GAME' | 'DRILL_ACTIVE' | 'DRILL_RESULT' | 'GAME_ACTIVE'
  >('HUB');

  // Selected Part for Drill
  const [configuredPart, setConfiguredPart] = useState<number>(1);
  const [partQuestionCount, setPartQuestionCount] = useState<number>(15);
  const [partTimeLimitMinutes, setPartTimeLimitMinutes] = useState<number>(15);

  // Selected Vocab Game
  const [configuredGame, setConfiguredGame] = useState<VocabGameMode>('RUNE_MATCH');
  const [gameWordCount, setGameWordCount] = useState<number>(12);
  const [gameTimeLimitSeconds, setGameTimeLimitSeconds] = useState<number>(180);
  const [gameCategory, setGameCategory] = useState<string>('ALL');

  // Drill Runner State
  const [drillQuestions, setDrillQuestions] = useState<QuestionItem[]>([]);
  const [shuffledMap, setShuffledMap] = useState<Map<string, ShuffledQuestionWrapper>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [drillTimeLeft, setDrillTimeLeft] = useState<number>(900);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  // Drill Result State
  const [drillResult, setDrillResult] = useState<{
    part: number;
    total: number;
    correct: number;
    accuracyPercent: number;
    estimatedPartScore: number;
    maxPartScore: number;
    supportiveTier: SupportivePerformanceTier;
    timeSpentSeconds: number;
  } | null>(null);

  // Lazy & On-Demand Data Loading:
  // 1. คำถาม: ไม่โหลดตอนเปิดหน้า Hub เด็ดขาด! จะโหลดเฉพาะ Part ที่เลือกเมื่อเข้าสู่ Config หรือเริ่มฝึก
  const isPartDrillActive =
    viewState === 'CONFIG_PART' ||
    viewState === 'DRILL_ACTIVE' ||
    viewState === 'DRILL_RESULT';

  const { data: partQuestionsData } = useQuestions(configuredPart, undefined, {
    enabled: isPartDrillActive,
  });

  // 2. คำศัพท์: ไม่โหลดตอนเปิดหน้า Hub แต่จะโหลดเมื่อสลับมาแท็บ Vocab Arcade หรือเริ่มเล่นเกม
  const isVocabGameActive =
    activeTab === 'VOCAB_ARCADE' ||
    viewState === 'CONFIG_GAME' ||
    viewState === 'GAME_ACTIVE';

  const { data: flashcardsData } = useFlashcards(
    undefined,
    undefined,
    undefined,
    { enabled: isVocabGameActive },
  );

  const allCards = flashcardsData || [];

  // Prefetch next Part 1 photograph in background for 0ms transition
  useEffect(() => {
    if (viewState === 'DRILL_ACTIVE') {
      const nextQ = drillQuestions[currentQuestionIndex + 1];
      if (nextQ?.imageUrl && typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = nextQ.imageUrl;
      }
    }
  }, [viewState, currentQuestionIndex, drillQuestions]);

  // --------------------------------------------------------------------------
  // Pre-Game Configuration Handlers
  // --------------------------------------------------------------------------
  const openPartConfig = (part: number) => {
    setConfiguredPart(part);
    setPartQuestionCount(15); // Default: 15 questions (min bound: 15)
    setPartTimeLimitMinutes(15); // Default: 15 minutes (min bound: 5)
    setViewState('CONFIG_PART');
  };

  const openGameConfig = (gameId: VocabGameMode) => {
    setConfiguredGame(gameId);
    setGameWordCount(12);
    setGameTimeLimitSeconds(180);
    setGameCategory('ALL');
    setViewState('CONFIG_GAME');
  };

  const startPartDrill = () => {
    // ดึงคลังข้อสอบเฉพาะ Part ที่เลือก (On-Demand) พร้อม Fallback อัตโนมัติจาก TanStack Query
    const pool = (partQuestionsData || []).filter((q) => q.part === configuredPart);
    if (pool.length === 0) return;

    // Shuffle pool and slice unique questions for the drill
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const chosen: QuestionItem[] = [];
    if (partQuestionCount <= shuffled.length) {
      chosen.push(...shuffled.slice(0, partQuestionCount));
    } else {
      for (let i = 0; i < partQuestionCount; i++) {
        const item = shuffled[i % shuffled.length];
        chosen.push({
          ...item,
          id: i >= shuffled.length ? `${item.id}-drill-${i}` : item.id,
        });
      }
    }

    setDrillQuestions(chosen);
    setShuffledMap(buildShuffledQuestionsMap(chosen));
    setCurrentQuestionIndex(0);
    setShowTranscript(false);
    setSelectedAnswers({});
    setDrillTimeLeft(partTimeLimitMinutes * 60);
    setViewState('DRILL_ACTIVE');
  };

  // Timer for active drill
  useEffect(() => {
    if (viewState !== 'DRILL_ACTIVE' || drillTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setDrillTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinishDrill();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [viewState, drillTimeLeft]);

  // Audio Playback for Listening
  const handlePlayAudio = (q: QuestionItem) => {
    if (isPlayingAudio) {
      cancelSpeech();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);

    let textToSpeak = q.questionText;
    if (q.part === 2) {
      textToSpeak = `${q.questionText}. Choice A: ${q.optionA}. Choice B: ${q.optionB}. Choice C: ${q.optionC}.`;
    } else if (q.part === 3 || q.part === 4) {
      const cleanDialogue = q.passageText
        ? q.passageText.replace(/\[Audio.*?\]/gi, '').trim()
        : '';
      textToSpeak = `${cleanDialogue}. Question: ${q.questionText}`;
    }

    speakEnglish(textToSpeak, {
      rate: 0.85,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  // Answer selection in drill
  const handleSelectAnswer = (qId: string, choiceLetter: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: choiceLetter }));
  };

  // Finish Drill & Calculate Part Score
  const handleFinishDrill = async () => {
    cancelSpeech();
    setIsPlayingAudio(false);

    let correctCount = 0;
    drillQuestions.forEach((q) => {
      const wrapper = shuffledMap.get(q.id);
      const chosenLetter = selectedAnswers[q.id];
      if (chosenLetter && wrapper) {
        const origChoice = wrapper.displayToOriginalMap[chosenLetter];
        if (origChoice === q.correctOption) {
          correctCount++;
        }
      }
    });

    const total = drillQuestions.length;
    const partEval = calculateEstimatedPartScore(configuredPart, correctCount, total);
    const timeSpent = partTimeLimitMinutes * 60 - drillTimeLeft;

    setDrillResult({
      part: configuredPart,
      total,
      correct: correctCount,
      accuracyPercent: partEval.accuracyPercent,
      estimatedPartScore: partEval.estimatedPartScore,
      maxPartScore: partEval.maxPartScore,
      supportiveTier: partEval.supportiveTier,
      timeSpentSeconds: timeSpent,
    });

    // Save to backend / localStorage without modifying User.currentEstimatedScore
    await submitPracticePart({
      userId: user?.id || 'guest',
      part: configuredPart,
      totalQuestions: total,
      correctAnswers: correctCount,
      timeLimitSeconds: partTimeLimitMinutes * 60,
      timeSpentSeconds: timeSpent,
    });
    invalidateDashboard(user?.id);

    setViewState('DRILL_RESULT');
  };

  // ==========================================================================
  // RENDER 1: SELECTION HUB (Hub-First Navigation)
  // ==========================================================================
  if (viewState === 'HUB') {
    return (
      <div className="space-y-6">
        {/* Hub Header */}
        <section className="bg-slate-900 text-amber-50 border-2 border-slate-950 shadow-arcade p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-400 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#020617] flex items-center justify-center shrink-0">
              <Gamepad2 className="w-6 h-6 text-slate-950" strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-thai text-white">
                ลานฝึกซ้อมและอาร์เคดคำศัพท์ (Practice & Vocab Arcade)
              </h1>
              <p className="text-sm text-slate-300 mt-0.5">
                เลือกฝึกโจทย์เจาะลึก 7 พาร์ท หรือประลองมินิเกมคำศัพท์ธุรกิจ 3,000+ คำ
              </p>
            </div>
          </div>

          {/* Section Switcher Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('PARTS')}
              className={`inline-flex items-center gap-2 px-4 py-2 font-display font-bold text-sm border-2 border-slate-950 transition-all ${
                activeTab === 'PARTS'
                  ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_#020617]'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              ฝึกแยก 7 พาร์ท
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('VOCAB_ARCADE')}
              onMouseEnter={() => prefetchFlashcards()}
              onFocus={() => prefetchFlashcards()}
              onTouchStart={() => prefetchFlashcards()}
              className={`inline-flex items-center gap-2 px-4 py-2 font-display font-bold text-sm border-2 border-slate-950 transition-all ${
                activeTab === 'VOCAB_ARCADE'
                  ? 'bg-sky-400 text-slate-950 shadow-[2px_2px_0px_0px_#020617]'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              มินิเกมคำศัพท์ (6 เกม)
            </button>
          </div>
        </section>

        {/* Tab 1: TOEIC 7-Part Skill Drills */}
        {activeTab === 'PARTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-thai text-slate-900">
                  แบบฝึกหัดข้อสอบแยก 7 พาร์ท (TOEIC Skill Drills)
                </h2>
                <p className="text-xs text-slate-600">
                  แตะเลือกพาร์ทที่ต้องการเพื่อตั้งค่าจำนวนข้อและเวลาทำโจทย์ (ขั้นต่ำ 15 ข้อ และ 5 นาที)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOEIC_PARTS_META.map((meta) => {
                const Icon = meta.icon;
                return (
                  <div
                    key={meta.part}
                    onMouseEnter={() => prefetchQuestions(meta.part)}
                    onFocus={() => prefetchQuestions(meta.part)}
                    onTouchStart={() => prefetchQuestions(meta.part)}
                    className="bg-[#FFFDF7] border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] p-5 flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 text-xs font-pixel font-bold border border-slate-900 ${
                            meta.section === 'LISTENING'
                              ? 'bg-amber-100 text-amber-950'
                              : 'bg-sky-100 text-sky-950'
                          }`}
                        >
                          {meta.section}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-500">
                          เต็ม {formatDecimal(meta.maxScore)} คะแนน
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 border-2 border-slate-900 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-slate-900" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base text-slate-900">
                            {meta.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {meta.formatTh}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#F8F5EC] border border-slate-300 p-2 text-xs text-slate-600 rounded">
                        {meta.weightDesc}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 mt-4">
                      <button
                        type="button"
                        onClick={() => openPartConfig(meta.part)}
                        onMouseEnter={() => prefetchQuestions(meta.part)}
                        onFocus={() => prefetchQuestions(meta.part)}
                        onTouchStart={() => prefetchQuestions(meta.part)}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        ตั้งค่าการฝึกซ้อม Part {meta.part}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Vocab Arcade 6 Mini-Games */}
        {activeTab === 'VOCAB_ARCADE' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-thai text-slate-900">
                  มินิเกมคำศัพท์ธุรกิจ 6 รูปแบบ (Vocab Arcade)
                </h2>
                <p className="text-xs text-slate-600">
                  ฝึกฝนคลังคำศัพท์กว่า 3,000+ คำ ผ่านเกมจำแนกความหมาย เสียงอ่าน ตัวสะกด และบริบทประโยค
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {VOCAB_GAMES_META.map((game) => {
                const Icon = game.icon;
                return (
                  <div
                    key={game.id}
                    className="bg-[#FFFDF7] border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] p-5 flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-950 border border-slate-900 text-xs font-pixel font-bold">
                          {game.badgeTh}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          3,000+ คำศัพท์
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-100 border-2 border-slate-900 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-amber-800" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base text-slate-900">
                            {game.titleTh}
                          </h3>
                          <span className="text-xs font-mono text-slate-500 block">
                            {game.title}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {game.descriptionTh}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 mt-4">
                      <button
                        type="button"
                        onClick={() => openGameConfig(game.id)}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Play className="w-3.5 h-3.5" />
                        เริ่มเล่น {game.title}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // RENDER 2: PRE-GAME CONFIGURATION MODAL (Part Drill: Min 15 Qs, Min 5 Mins)
  // ==========================================================================
  if (viewState === 'CONFIG_PART') {
    const meta = TOEIC_PARTS_META.find((p) => p.part === configuredPart);
    const isMinQuestions = partQuestionCount <= 15;
    const isMinTime = partTimeLimitMinutes <= 5;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 animate-fade-in">
        <div className="bg-[#FFFDF7] border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] max-w-lg w-full p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
            <div>
              <span className="text-xs font-pixel text-amber-600 font-bold">
                PART {configuredPart} CONFIGURATION
              </span>
              <h2 className="text-xl font-bold font-thai text-slate-900">
                ตั้งค่าการฝึกซ้อม {meta?.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setViewState('HUB')}
              className="p-1 hover:bg-slate-200 border border-slate-900"
            >
              <X className="w-5 h-5 text-slate-900" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Question Count Stepper (Strict Min: 15) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 font-thai">
                  จำนวนข้อสอบ (Question Count)
                </label>
                <span className="font-pixel text-base font-bold text-amber-600">
                  {partQuestionCount} ข้อ
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isMinQuestions}
                  onClick={() => setPartQuestionCount((prev) => Math.max(15, prev - 5))}
                  className="w-10 h-10 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-900 font-bold text-lg border-2 border-slate-900 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  -
                </button>
                <div className="flex-1 bg-white border-2 border-slate-900 py-2 text-center font-pixel text-sm">
                  {partQuestionCount} ข้อ
                </div>
                <button
                  type="button"
                  onClick={() => setPartQuestionCount((prev) => Math.min(50, prev + 5))}
                  className="w-10 h-10 bg-white hover:bg-slate-100 text-slate-900 font-bold text-lg border-2 border-slate-900 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  +
                </button>
              </div>

              {isMinQuestions && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-300 p-2 rounded leading-relaxed">
                  ขั้นต่ำ 15 ข้อ และ 5 นาที เพื่อความแม่นยำในการคาดการณ์คะแนน
                </p>
              )}
            </div>

            {/* Time Limit Stepper (Strict Min: 5 Mins) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 font-thai">
                  เวลาจำกัด (Time Limit)
                </label>
                <span className="font-pixel text-base font-bold text-sky-600">
                  {partTimeLimitMinutes} นาที
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isMinTime}
                  onClick={() => setPartTimeLimitMinutes((prev) => Math.max(5, prev - 5))}
                  className="w-10 h-10 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-900 font-bold text-lg border-2 border-slate-900 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  -
                </button>
                <div className="flex-1 bg-white border-2 border-slate-900 py-2 text-center font-pixel text-sm">
                  {partTimeLimitMinutes} นาที
                </div>
                <button
                  type="button"
                  onClick={() => setPartTimeLimitMinutes((prev) => Math.min(60, prev + 5))}
                  className="w-10 h-10 bg-white hover:bg-slate-100 text-slate-900 font-bold text-lg border-2 border-slate-900 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  +
                </button>
              </div>

              {isMinTime && (
                <p className="text-xs text-sky-900 bg-sky-50 border border-sky-300 p-2 rounded leading-relaxed">
                  ขั้นต่ำ 15 ข้อ และ 5 นาที เพื่อความแม่นยำในการคาดการณ์คะแนน
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button
              type="button"
              onClick={() => setViewState('HUB')}
              className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold border-2 border-slate-900"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={startPartDrill}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Play className="w-3.5 h-3.5" />
              เริ่มทำโจทย์ Part {configuredPart}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER 3: PRE-GAME CONFIGURATION MODAL (Vocab Arcade: Categories & Bounds)
  // ==========================================================================
  if (viewState === 'CONFIG_GAME') {
    const meta = VOCAB_GAMES_META.find((g) => g.id === configuredGame);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 animate-fade-in">
        <div className="bg-[#FFFDF7] border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] max-w-lg w-full p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
            <div>
              <span className="text-xs font-pixel text-sky-700 font-bold">
                ตั้งค่ามินิเกมคำศัพท์
              </span>
              <h2 className="text-xl font-bold font-thai text-slate-900">
                ตั้งค่า {meta?.titleTh}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setViewState('HUB')}
              className="p-1 hover:bg-slate-200 border border-slate-900"
            >
              <X className="w-5 h-5 text-slate-900" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Category Selector Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 font-thai block">
                เลือกหมวดหมู่คำศัพท์ (Category Filter):
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setGameCategory('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold border-2 border-slate-900 transition-all ${
                    gameCategory === 'ALL'
                      ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ทั้งหมด / คละหมวดหมู่
                </button>
                {TOEIC_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setGameCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-bold border-2 border-slate-900 transition-all ${
                      gameCategory === cat
                        ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Word Count Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 font-thai block">
                จำนวนคำศัพท์:
              </label>
              <div className="flex items-center gap-2">
                {[12, 20, 30, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGameWordCount(num)}
                    className={`flex-1 py-1.5 text-xs font-pixel font-bold border-2 border-slate-900 ${
                      gameWordCount === num
                        ? 'bg-sky-400 text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num} คำ
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 font-thai block">
                เวลาจำกัด:
              </label>
              <div className="flex items-center gap-2">
                {[
                  { sec: 120, label: '2 นาที' },
                  { sec: 180, label: '3 นาที' },
                  { sec: 300, label: '5 นาที' },
                ].map((t) => (
                  <button
                    key={t.sec}
                    type="button"
                    onClick={() => setGameTimeLimitSeconds(t.sec)}
                    className={`flex-1 py-1.5 text-xs font-pixel font-bold border-2 border-slate-900 ${
                      gameTimeLimitSeconds === t.sec
                        ? 'bg-sky-400 text-slate-950 shadow-[2px_2px_0px_0px_#0f172a]'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-900">
            <button
              type="button"
              onClick={() => setViewState('HUB')}
              className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold border-2 border-slate-900"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => setViewState('GAME_ACTIVE')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Play className="w-3.5 h-3.5" />
              เริ่มเล่นมินิเกม
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER 4: ACTIVE VOCAB MINI-GAME RUNNER (6 Games)
  // ==========================================================================
  if (viewState === 'GAME_ACTIVE') {
    const handleGameExit = () => setViewState('HUB');

    switch (configuredGame) {
      case 'RUNE_MATCH':
        return (
          <RuneMatchGame
            cards={allCards}
            timeLimitSeconds={gameTimeLimitSeconds}
            wordCount={gameWordCount}
            category={gameCategory}
            onExit={handleGameExit}
          />
        );
      case 'BARDS_ECHO':
        return (
          <BardsEchoGame
            cards={allCards}
            timeLimitSeconds={gameTimeLimitSeconds}
            wordCount={gameWordCount}
            category={gameCategory}
            onExit={handleGameExit}
          />
        );
      case 'WORD_ALCHEMIST':
        return (
          <WordAlchemistGame
            cards={allCards}
            timeLimitSeconds={gameTimeLimitSeconds}
            wordCount={gameWordCount}
            category={gameCategory}
            onExit={handleGameExit}
          />
        );
      case 'TWIN_BLADES':
        return (
          <TwinBladesGame
            cards={allCards}
            timeLimitSeconds={gameTimeLimitSeconds}
            wordCount={gameWordCount}
            category={gameCategory}
            onExit={handleGameExit}
          />
        );
      case 'CONTEXT_CLOZE':
        return (
          <ContextClozeGame
            cards={allCards}
            timeLimitSeconds={gameTimeLimitSeconds}
            wordCount={gameWordCount}
            category={gameCategory}
            onExit={handleGameExit}
          />
        );
      case 'ANAGRAM_FORGE':
        return (
          <AnagramForgeGame
            cards={allCards}
            timeLimitSeconds={gameTimeLimitSeconds}
            wordCount={gameWordCount}
            category={gameCategory}
            onExit={handleGameExit}
          />
        );
      default:
        return null;
    }
  }

  // ==========================================================================
  // RENDER 5: ACTIVE 7-PART DRILL RUNNER
  // ==========================================================================
  if (viewState === 'DRILL_ACTIVE') {
    const currentQ = drillQuestions[currentQuestionIndex];
    const wrapper = currentQ ? shuffledMap.get(currentQ.id) : null;
    const answeredCount = Object.keys(selectedAnswers).length;
    const minutes = Math.floor(drillTimeLeft / 60);
    const seconds = drillTimeLeft % 60;
    const isLast = currentQuestionIndex === drillQuestions.length - 1;

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Runner Header */}
        <div className="bg-slate-900 text-amber-50 border-2 border-slate-950 p-4 shadow-arcade flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="กลับสู่ Selection Hub"
              onClick={() => {
                cancelSpeech();
                setViewState('HUB');
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-xs font-pixel text-amber-400">
                PART {configuredPart} DRILL
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white font-thai">
                ข้อที่ {currentQuestionIndex + 1} จาก {drillQuestions.length}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="font-pixel text-xs bg-slate-800 px-3 py-1 border border-slate-700">
              ตอบแล้ว {answeredCount}/{drillQuestions.length}
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 font-pixel text-xs border border-slate-700 ${
                drillTimeLeft <= 180
                  ? 'bg-rose-950 text-rose-300 animate-pulse'
                  : 'bg-slate-800 text-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
          </div>
        </div>

        {/* Question Canvas */}
        {currentQ && wrapper && (
          <div className="bg-[#FFFDF7] border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] p-6 space-y-6">
            {/* Part 1: Image View with Lightbox Inspection Pop-up */}
            {currentQ.part === 1 && currentQ.imageUrl && (
              <div className="max-w-md mx-auto">
                <Part1ImagePreview
                  src={currentQ.imageUrl}
                  alt={`Part 1 Photograph - ${currentQ.questionText}`}
                />
              </div>
            )}

            {/* Listening Audio Controls (Part 1 to 4) */}
            {currentQ.part <= 4 && (
              <div className="p-3 bg-amber-50 border-2 border-slate-900 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-amber-700" />
                    <span className="text-xs font-bold text-slate-800">
                      {currentQ.part === 1 && 'ฟังเสียงตัวเลือกรูปภาพ'}
                      {currentQ.part === 2 && 'ฟังคำถามและตัวเลือก A, B, C'}
                      {currentQ.part === 3 && 'ฟังบทสนทนา (Conversation Dialogue)'}
                      {currentQ.part === 4 && 'ฟังบทประกาศหรือบรรยาย (Short Talk)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(currentQ)}
                    className={`px-3 py-1.5 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm flex items-center gap-1.5 ${
                      isPlayingAudio
                        ? 'bg-rose-400 text-slate-950 animate-pulse'
                        : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {isPlayingAudio ? 'กำลังเล่นเสียง...' : 'ฟังเสียงข้อสอบ'}
                  </button>
                </div>

                {/* Optional Transcript toggle for Part 3 & 4 (listening practice) */}
                {(currentQ.part === 3 || currentQ.part === 4) && currentQ.passageText && (
                  <div className="pt-2 border-t border-amber-200 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowTranscript((prev) => !prev)}
                      className="self-start text-[11px] font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                      {showTranscript ? 'ซ่อนบทสนทนา (Hide Transcript)' : 'ดูบทสนทนาสำหรับทบทวน (View Transcript)'}
                    </button>
                    {showTranscript && (
                      <div className="bg-white border border-amber-300 p-3 rounded text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-line">
                        {currentQ.passageText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reading Passages (Part 6 & 7) */}
            {currentQ.part >= 6 && currentQ.passageText && (
              <div className="bg-[#F8F5EC] border-2 border-slate-900 p-5 rounded font-sans text-sm sm:text-base text-slate-900 leading-relaxed max-w-[70ch] whitespace-pre-line shadow-arcade-sm">
                <div className="text-xs font-mono font-bold text-slate-600 mb-2 pb-1 border-b border-slate-300">
                  {currentQ.part === 6 ? 'PART 6 • TEXT COMPLETION PASSAGE' : 'PART 7 • READING PASSAGE'}
                </div>
                {currentQ.passageText}
              </div>
            )}

            {/* Question Stem */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                QUESTION STEM
              </span>
              <p className="text-base sm:text-lg font-bold font-sans text-slate-900 leading-relaxed">
                {currentQ.questionText}
              </p>
            </div>

            {/* Choices Grid (Part 2 strictly 3 choices, others 4 choices) */}
            <div className="space-y-3 pt-2">
              {wrapper.choices.map((choice) => {
                const isSelected = selectedAnswers[currentQ.id] === choice.displayKey;

                return (
                  <button
                    key={choice.displayKey}
                    type="button"
                    onClick={() => handleSelectAnswer(currentQ.id, choice.displayKey)}
                    className={`w-full p-4 border-2 font-sans font-medium text-sm sm:text-base flex items-start gap-3 text-left transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                      isSelected
                        ? 'bg-amber-300 text-slate-950 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded border-2 border-slate-900 flex items-center justify-center font-pixel text-xs shrink-0 ${
                        isSelected
                          ? 'bg-slate-900 text-amber-300'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      {choice.displayKey}
                    </span>
                    <span className="pt-0.5">{choice.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t-2 border-slate-900">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  cancelSpeech();
                  setIsPlayingAudio(false);
                  setShowTranscript(false);
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold border-2 border-slate-900 active:translate-x-[1px] active:translate-y-[1px]"
              >
                <ArrowLeft className="w-4 h-4" />
                ข้อก่อนหน้า
              </button>

              {isLast ? (
                <button
                  type="button"
                  onClick={handleFinishDrill}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  ส่งกระดาษคำตอบ Part {configuredPart}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    cancelSpeech();
                    setIsPlayingAudio(false);
                    setShowTranscript(false);
                    setCurrentQuestionIndex((prev) =>
                      Math.min(drillQuestions.length - 1, prev + 1),
                    );
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px]"
                >
                  ข้อถัดไป
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // RENDER 6: POST-PRACTICE RESULT (Estimated Part Score & Supportive 5-Tier)
  // ==========================================================================
  if (viewState === 'DRILL_RESULT' && drillResult) {
    const tier = drillResult.supportiveTier;

    return (
      <div className="bg-[#FFFDF7] border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] p-6 sm:p-8 space-y-6 max-w-2xl mx-auto animate-fade-in">
        <div className="text-center space-y-2 pb-4 border-b-2 border-slate-900">
          <div className="inline-block px-3 py-1 bg-sky-100 text-sky-950 border-2 border-slate-900 font-pixel text-xs">
            PRACTICE DRILL COMPLETED • PART {drillResult.part}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-thai text-slate-900">
            ผลการประเมินคะแนน Part {drillResult.part}
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            คะแนนคาดการณ์จากการฝึกซ้อมรายพาร์ท (ไม่ถูกนำไปคิดเลเวลตัวละคร จนกว่าจะลงสนาม Mock Exam จริง)
          </p>
        </div>

        {/* Projected Part Score Card */}
        <div className="bg-slate-900 text-amber-50 border-2 border-slate-950 p-6 rounded text-center space-y-3 shadow-arcade-sm">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            ESTIMATED PART SCORE PROJECTION
          </span>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold font-pixel text-amber-400">
              {formatDecimal(drillResult.estimatedPartScore)}
            </span>
            <span className="text-slate-400 font-pixel text-lg">
              / {formatDecimal(drillResult.maxPartScore)} คะแนน
            </span>
          </div>

          <div className="text-xs text-slate-300 font-sans">
            ความแม่นยำในการทำโจทย์: {drillResult.correct} จาก {drillResult.total} ข้อ ({formatAccuracyPercent(drillResult.accuracyPercent)}%)
          </div>
        </div>

        {/* Supportive 5-Band Performance Range Card */}
        <div className="bg-[#F8F5EC] border-2 border-slate-900 p-5 rounded space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 text-xs font-bold font-thai border border-slate-900 rounded ${
                tier.colorName === 'emerald'
                  ? 'bg-emerald-100 text-emerald-950'
                  : tier.colorName === 'indigo'
                  ? 'bg-indigo-100 text-indigo-950'
                  : tier.colorName === 'sky'
                  ? 'bg-sky-100 text-sky-950'
                  : tier.colorName === 'amber'
                  ? 'bg-amber-100 text-amber-950'
                  : 'bg-stone-200 text-stone-900'
              }`}
            >
              {tier.stageNameTh}
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-sans">
            {tier.descriptionTh}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t-2 border-slate-900">
          <button
            type="button"
            onClick={() => openPartConfig(drillResult.part)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            ฝึก Part {drillResult.part} อีกครั้ง
          </button>

          <button
            type="button"
            onClick={() => setViewState('HUB')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-xs border-2 border-slate-900 shadow-arcade-sm active:translate-x-[1px] active:translate-y-[1px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            กลับสู่ Selection Hub
          </button>
        </div>
      </div>
    );
  }

  return null;
}
