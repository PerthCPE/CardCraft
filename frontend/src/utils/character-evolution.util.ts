// ============================================================================
// frontend/src/utils/character-evolution.util.ts
// Pure Utility Function สำหรับคำนวณระบบ 7-Tier Character Evolution (Intervals: 100, 150, 200 pts)
// ใช้ร่วมกันระหว่าง Dashboard HUD, 7-Stage Evolution Roadmap และหน้าสรุปผลสอบ Boss Battle
// ============================================================================

export interface CharacterTierInfo {
  tier: number;
  title: string;
  titleTh: string;
  minScore: number;
  maxScore: number;
  nextTierScore: number | null;
  intervalSpan: number;
  spritePath: string;
  altSpritePath: string;
  badgeText: string;
  isTargetGoalTier: boolean;
  descriptionTh: string;
}

export interface RoadmapStage extends CharacterTierInfo {
  isUnlocked: boolean;
  isCurrent: boolean;
  lockBadgeLabel: string;
}

export interface CharacterEvolutionStatus {
  estimatedScore: number;
  unlockedTier: number;
  classTitle: string;
  classTitleTh: string;
  spritePath: string;
  currentTier: CharacterTierInfo;
  nextTier: CharacterTierInfo | null;
  tierExpPercentage: number;
  pointsToNextTier: number;
  pointsToTarget700: number;
  isPassedTarget: boolean;
  roadmap: RoadmapStage[];
}

export interface ScaledScoreBreakdown {
  listeningScaled: number;
  readingScaled: number;
  estimatedScore: number;
}

export const CHARACTER_TIERS: readonly CharacterTierInfo[] = [
  {
    tier: 1,
    title: 'Novice Villager',
    titleTh: 'ชาวบ้านฝึกหัด',
    minScore: 0,
    maxScore: 245,
    nextTierScore: 250,
    intervalSpan: 250,
    spritePath: '/sprites/tier-1-novice.png',
    altSpritePath: '/sprites/tier-1.png',
    badgeText: 'TIER 1 • BASE',
    isTargetGoalTier: false,
    descriptionTh: 'จุดเริ่มต้นของการผจญภัย ปูพื้นฐานคำศัพท์และโครงสร้างประโยคเบื้องต้น',
  },
  {
    tier: 2,
    title: 'Word Scout',
    titleTh: 'นักสำรวจคลังคำ',
    minScore: 250,
    maxScore: 395,
    nextTierScore: 400,
    intervalSpan: 150,
    spritePath: '/sprites/tier-2-scout.png',
    altSpritePath: '/sprites/tier-2.png',
    badgeText: 'TIER 2 • +150 RANGE',
    isTargetGoalTier: false,
    descriptionTh: 'เริ่มจับใจความการฟัง Part 1-2 และรู้คำศัพท์ธุรกิจระดับต้น',
  },
  {
    tier: 3,
    title: 'Spell Squire',
    titleTh: 'อัศวินฝึกหัดมนตรา',
    minScore: 400,
    maxScore: 595,
    nextTierScore: 600,
    intervalSpan: 200,
    spritePath: '/sprites/tier-3-squire.png',
    altSpritePath: '/sprites/tier-3.png',
    badgeText: 'TIER 3 • +200 RANGE',
    isTargetGoalTier: false,
    descriptionTh: 'เชี่ยวชาญโครงสร้าง Part 5 Word Family และอ่านอีเมลสั้นๆ ได้แม่นยำ',
  },
  {
    tier: 4,
    title: 'Rune Knight',
    titleTh: 'อัศวินรูนผู้ท้าชิง',
    minScore: 600,
    maxScore: 695,
    nextTierScore: 700,
    intervalSpan: 100,
    spritePath: '/sprites/tier-4-knight.png',
    altSpritePath: '/sprites/tier-4.png',
    badgeText: 'TIER 4 • PRE-700 CHALLENGER',
    isTargetGoalTier: false,
    descriptionTh: 'ด่านสุดท้ายก่อนทะลุเป้าหมาย 700+ เน้นบริหารเวลาและกวาดคะแนน Part 7',
  },
  {
    tier: 5,
    title: 'High Paladin',
    titleTh: 'พาราดินศักดิ์สิทธิ์ (700+ Goal!)',
    minScore: 700,
    maxScore: 795,
    nextTierScore: 800,
    intervalSpan: 100,
    spritePath: '/sprites/tier-5-paladin.png',
    altSpritePath: '/sprites/tier-5.png',
    badgeText: 'TIER 5 • 700+ GOAL UNLOCKED',
    isTargetGoalTier: true,
    descriptionTh: 'ปลดล็อกเป้าหมาย TOEIC 700+ สำเร็จ! พร้อมใช้ยื่นสมัครงานบริษัทชั้นนำ',
  },
  {
    tier: 6,
    title: 'Grand Archmage',
    titleTh: 'จอมเวทสูงสุด',
    minScore: 800,
    maxScore: 895,
    nextTierScore: 900,
    intervalSpan: 100,
    spritePath: '/sprites/tier-6-archmage.png',
    altSpritePath: '/sprites/tier-6.png',
    badgeText: 'TIER 6 • +100 RANGE',
    isTargetGoalTier: false,
    descriptionTh: 'เข้าใจความหมายแฝง (Inference) และจับหลุมพรางข้อสอบระดับสูงได้ทั้งหมด',
  },
  {
    tier: 7,
    title: 'CardCraft Deity',
    titleTh: 'เทพเจ้าแห่ง CardCraft',
    minScore: 900,
    maxScore: 990,
    nextTierScore: null,
    intervalSpan: 90,
    spritePath: '/sprites/tier-7-deity.png',
    altSpritePath: '/sprites/tier-7.png',
    badgeText: 'TIER 7 • MAX LEVEL',
    isTargetGoalTier: false,
    descriptionTh: 'ระดับสูงสุดแห่งตำนาน เชี่ยวชาญภาษาอังกฤษเชิงธุรกิจระดับ 900-990 คะแนนเต็ม',
  },
] as const;

export function clampToeicScore(score: number): number {
  if (!Number.isFinite(score) || score < 0) return 0;
  if (score > 990) return 990;
  return Math.round(score);
}

export function getTierByScore(rawScore: number): CharacterTierInfo {
  const score = clampToeicScore(rawScore);

  if (score >= 900) return CHARACTER_TIERS[6];
  if (score >= 800) return CHARACTER_TIERS[5];
  if (score >= 700) return CHARACTER_TIERS[4];
  if (score >= 600) return CHARACTER_TIERS[3];
  if (score >= 400) return CHARACTER_TIERS[2];
  if (score >= 250) return CHARACTER_TIERS[1];
  return CHARACTER_TIERS[0];
}

export function getCharacterEvolution(
  rawScore: number,
  targetScore = 700,
): CharacterEvolutionStatus {
  const estimatedScore = clampToeicScore(rawScore);
  const currentTier = getTierByScore(estimatedScore);
  const nextTier =
    currentTier.tier < 7 ? CHARACTER_TIERS[currentTier.tier] : null;

  let tierExpPercentage = 100;
  if (nextTier) {
    const span = nextTier.minScore - currentTier.minScore;
    const earnedInTier = Math.max(0, estimatedScore - currentTier.minScore);
    tierExpPercentage = Math.min(
      100,
      Math.max(0, Math.round((earnedInTier / span) * 100)),
    );
  } else {
    const earnedInMaxTier = Math.max(0, estimatedScore - 900);
    tierExpPercentage = Math.min(
      100,
      Math.max(0, Math.round((earnedInMaxTier / 90) * 100)),
    );
  }

  const pointsToNextTier = nextTier
    ? Math.max(0, nextTier.minScore - estimatedScore)
    : 0;

  const pointsToTarget700 = Math.max(0, targetScore - estimatedScore);
  const isPassedTarget = estimatedScore >= targetScore;

  const roadmap: RoadmapStage[] = CHARACTER_TIERS.map((stage) => {
    const isUnlocked = estimatedScore >= stage.minScore;
    const isCurrent = stage.tier === currentTier.tier;
    const lockBadgeLabel =
      stage.tier === 1
        ? 'START'
        : stage.isTargetGoalTier
          ? `${stage.minScore} GOAL`
          : `${stage.minScore}`;

    return {
      ...stage,
      isUnlocked,
      isCurrent,
      lockBadgeLabel,
    };
  });

  return {
    estimatedScore,
    unlockedTier: currentTier.tier,
    classTitle: currentTier.title,
    classTitleTh: currentTier.titleTh,
    spritePath: currentTier.spritePath,
    currentTier,
    nextTier,
    tierExpPercentage,
    pointsToNextTier,
    pointsToTarget700,
    isPassedTarget,
    roadmap,
  };
}

/**
 * ปัดเศษคะแนนให้เป็นทวีคูณของ 5 (ตามมาตรฐานคะแนนสอบ TOEIC จริง)
 */
export function roundToNearestFive(value: number, min: number, max: number): number {
  const rounded = Math.round(value / 5) * 5;
  return Math.min(max, Math.max(min, rounded));
}

/**
 * สัดส่วนน้ำหนักคะแนนเต็มของข้อสอบ TOEIC 7 พาร์ท (Listening 495 + Reading 495 = 990)
 */
export const TOEIC_PART_WEIGHTS: Record<
  number,
  { name: string; section: 'LISTENING' | 'READING'; maxScore: number; ratioPercent: number }
> = {
  1: { name: 'Part 1: Photographs', section: 'LISTENING', maxScore: 30, ratioPercent: 6 },
  2: { name: 'Part 2: Question-Response', section: 'LISTENING', maxScore: 125, ratioPercent: 25 },
  3: { name: 'Part 3: Conversations', section: 'LISTENING', maxScore: 190, ratioPercent: 39 },
  4: { name: 'Part 4: Short Talks', section: 'LISTENING', maxScore: 150, ratioPercent: 30 },
  5: { name: 'Part 5: Incomplete Sentences', section: 'READING', maxScore: 150, ratioPercent: 30 },
  6: { name: 'Part 6: Text Completion', section: 'READING', maxScore: 80, ratioPercent: 16 },
  7: { name: 'Part 7: Reading Comprehension', section: 'READING', maxScore: 265, ratioPercent: 54 },
};

/**
 * 5 ระดับข้อความให้กำลังใจเชิงบวก (Supportive Performance Ranges) สำหรับการฝึกซ้อมรายพาร์ท
 * ไม่ใช้คำเชิงลบ เช่น "แย่" เพื่อเสริมสร้าง Growth Mindset ตามหลัก RPG EdTech
 */
export interface SupportivePerformanceTier {
  tier: number;
  stageName: string;
  stageNameTh: string;
  minPercent: number;
  maxPercent: number;
  descriptionTh: string;
  colorName: 'stone' | 'amber' | 'sky' | 'indigo' | 'emerald';
}

export const SUPPORTIVE_PERFORMANCE_TIERS: readonly SupportivePerformanceTier[] = [
  {
    tier: 1,
    stageName: 'Seedling Stage',
    stageNameTh: 'ระดับปูรากฐาน (Seedling Stage)',
    minPercent: 0,
    maxPercent: 35,
    descriptionTh:
      'ก้าวแรกเริ่มต้นแล้ว! ค่อยๆ สะสมคลังคำศัพท์และจับจุดโครงสร้างประโยคอีกนิด คะแนนพาร์ทนี้จะพุ่งขึ้นไวมาก',
    colorName: 'stone',
  },
  {
    tier: 2,
    stageName: 'Awakening Stage',
    stageNameTh: 'ระดับเริ่มจับจังหวะได้ (Awakening Stage)',
    minPercent: 36,
    maxPercent: 50,
    descriptionTh:
      'เริ่มเห็นแนวทางข้อสอบแล้ว! ลองทบทวนจุดที่พลาดในเฉลยด้านล่างเพื่อเปลี่ยนจุดอ่อนเป็นคะแนน',
    colorName: 'amber',
  },
  {
    tier: 3,
    stageName: 'Steady Adventurer',
    stageNameTh: 'ระดับมาตรฐานนักผจญภัย (Steady Adventurer)',
    minPercent: 51,
    maxPercent: 68,
    descriptionTh:
      'พื้นฐานแน่นขึ้นมาก! คุณมาถูกทางแล้ว ขยับความแม่นยำอีกนิดจะทะลุโซนเป้าหมาย 700+ ทันที',
    colorName: 'sky',
  },
  {
    tier: 4,
    stageName: 'High Challenger',
    stageNameTh: 'ระดับผู้ท้าชิงที่แข็งแกร่ง (High Challenger)',
    minPercent: 69,
    maxPercent: 84,
    descriptionTh:
      'ยอดเยี่ยม! ฟอร์มการทำโจทย์พาร์ทนี้อยู่ในเกณฑ์ทำคะแนนทะลุ 700+ ได้สบาย รักษาความเร็วนี้ไว้',
    colorName: 'indigo',
  },
  {
    tier: 5,
    stageName: 'Grand Master',
    stageNameTh: 'ระดับปรมาจารย์ไร้เทียมทาน (Grand Master)',
    minPercent: 85,
    maxPercent: 100,
    descriptionTh:
      'สมบูรณ์แบบ! พาร์ทนี้คือขุมพลังทำคะแนนหลักของคุณ พร้อมลุยสนามสอบจริงเต็มร้อย',
    colorName: 'emerald',
  },
] as const;

export function getSupportivePerformanceTier(
  accuracyPercentage: number,
): SupportivePerformanceTier {
  const percent = Math.min(100, Math.max(0, Math.round(accuracyPercentage)));
  if (percent >= 85) return SUPPORTIVE_PERFORMANCE_TIERS[4];
  if (percent >= 69) return SUPPORTIVE_PERFORMANCE_TIERS[3];
  if (percent >= 51) return SUPPORTIVE_PERFORMANCE_TIERS[2];
  if (percent >= 36) return SUPPORTIVE_PERFORMANCE_TIERS[1];
  return SUPPORTIVE_PERFORMANCE_TIERS[0];
}

/**
 * คำนวณคะแนนคาดการณ์เฉพาะพาร์ท (Estimated Part Score) จากผลการฝึกซ้อมรายพาร์ท (/practice)
 * estimatedPartScore = Math.round((accuracyRatio * maxPartWeightScore) / 5) * 5
 */
export function calculateEstimatedPartScore(
  part: number,
  correct: number,
  total: number,
): {
  part: number;
  accuracy: number;
  accuracyPercent: number;
  estimatedPartScore: number;
  maxPartScore: number;
  supportiveTier: SupportivePerformanceTier;
} {
  const safeTotal = Math.max(1, total);
  const safeCorrect = Math.min(safeTotal, Math.max(0, correct));
  const rawAccuracy = safeCorrect / safeTotal;
  const accuracy = Number(rawAccuracy.toFixed(3));
  const accuracyPercent = Number((rawAccuracy * 100).toFixed(3));

  const weightInfo = TOEIC_PART_WEIGHTS[part] || { maxScore: 100 };
  const maxPartScore = weightInfo.maxScore;
  const rawScore = (safeCorrect / safeTotal) * maxPartScore;
  const estimatedPartScore = Math.min(
    maxPartScore,
    Math.max(0, Math.round(rawScore / 5) * 5),
  );
  const supportiveTier = getSupportivePerformanceTier(accuracyPercent);

  return {
    part,
    accuracy,
    accuracyPercent,
    estimatedPartScore,
    maxPartScore,
    supportiveTier,
  };
}

/**
 * ตารางแปลงคะแนน Authentic ETS-Calibrated Piecewise Nonlinear Conversion Table
 * แปลงคะแนนดิบ Normalized 0-100 สู่สเกล Listening (5 - 495)
 */
export function convertRawListeningToScaled(raw100: number): number {
  const r = Math.min(100, Math.max(0, raw100));
  if (r <= 0) return 5;
  if (r >= 93) return 495;

  let scaled = 5;
  if (r >= 1 && r <= 15) {
    // Raw 1–15 -> 5–35 pts
    scaled = 5 + ((r - 1) / (15 - 1)) * (35 - 5);
  } else if (r >= 16 && r <= 30) {
    // Raw 16–30 -> 40–110 pts
    scaled = 40 + ((r - 16) / (30 - 16)) * (110 - 40);
  } else if (r >= 31 && r <= 50) {
    // Raw 31–50 -> 115–245 pts
    scaled = 115 + ((r - 31) / (50 - 31)) * (245 - 115);
  } else if (r >= 51 && r <= 70) {
    // Raw 51–70 -> 250–370 pts
    scaled = 250 + ((r - 51) / (70 - 51)) * (370 - 250);
  } else if (r >= 71 && r <= 85) {
    // Raw 71–85 -> 375–455 pts
    scaled = 375 + ((r - 71) / (85 - 71)) * (455 - 375);
  } else if (r >= 86 && r <= 92) {
    // Raw 86–92 -> 460–490 pts
    scaled = 460 + ((r - 86) / (92 - 86)) * (490 - 460);
  }

  return roundToNearestFive(scaled, 5, 495);
}

/**
 * ตารางแปลงคะแนน Authentic ETS-Calibrated Piecewise Nonlinear Conversion Table
 * แปลงคะแนนดิบ Normalized 0-100 สู่สเกล Reading (5 - 495)
 */
export function convertRawReadingToScaled(raw100: number): number {
  const r = Math.min(100, Math.max(0, raw100));
  if (r <= 0) return 5;
  if (r >= 97) {
    // Raw 97–100 -> 490–495 pts
    const scaled = 490 + ((r - 97) / (100 - 97)) * (495 - 490);
    return roundToNearestFive(scaled, 490, 495);
  }

  let scaled = 5;
  if (r >= 1 && r <= 15) {
    // Raw 0–15 -> 5–20 pts
    scaled = 5 + (r / 15) * (20 - 5);
  } else if (r >= 16 && r <= 30) {
    // Raw 16–30 -> 25–85 pts
    scaled = 25 + ((r - 16) / (30 - 16)) * (85 - 25);
  } else if (r >= 31 && r <= 50) {
    // Raw 31–50 -> 90–210 pts
    scaled = 90 + ((r - 31) / (50 - 31)) * (210 - 90);
  } else if (r >= 51 && r <= 70) {
    // Raw 51–70 -> 215–335 pts
    scaled = 215 + ((r - 51) / (70 - 51)) * (335 - 215);
  } else if (r >= 71 && r <= 85) {
    // Raw 71–85 -> 340–425 pts
    scaled = 340 + ((r - 71) / (85 - 71)) * (425 - 340);
  } else if (r >= 86 && r <= 96) {
    // Raw 86–96 -> 430–485 pts
    scaled = 430 + ((r - 86) / (96 - 86)) * (485 - 430);
  }

  return roundToNearestFive(scaled, 5, 495);
}

/**
 * คำนวณคะแนนสเกล TOEIC (10 - 990) จากจำนวนข้อที่ทำถูกในพาร์ท Listening และ Reading
 * โดยใช้โมเดล Authentic ETS-Calibrated Piecewise Nonlinear Conversion
 * - พาร์ท Listening: สเกล 5 ถึง 495 คะแนน (ทีละ 5 คะแนน)
 * - พาร์ท Reading: สเกล 5 ถึง 495 คะแนน (ทีละ 5 คะแนน)
 * - คะแนนรวม: 10 ถึง 990 คะแนน (ทีละ 5 คะแนน)
 */
export function calculateScaledToeicScore(
  listeningCorrect: number,
  listeningTotal: number,
  readingCorrect: number,
  readingTotal: number,
): ScaledScoreBreakdown {
  const safeListeningTotal = Math.max(0, listeningTotal);
  const safeReadingTotal = Math.max(0, readingTotal);

  const clampedListeningCorrect = Math.min(
    safeListeningTotal,
    Math.max(0, listeningCorrect),
  );
  const clampedReadingCorrect = Math.min(
    safeReadingTotal,
    Math.max(0, readingCorrect),
  );

  // กรณีไม่ได้ส่งจำนวนข้อรวมมาเลย ให้คืนค่าต่ำสุดของสเกล TOEIC คือ 10 (5 + 5)
  if (safeListeningTotal === 0 && safeReadingTotal === 0) {
    return {
      listeningScaled: 5,
      readingScaled: 5,
      estimatedScore: 10,
    };
  }

  const listeningRaw100 =
    safeListeningTotal > 0
      ? (clampedListeningCorrect / safeListeningTotal) * 100
      : (clampedReadingCorrect / safeReadingTotal) * 100;

  const readingRaw100 =
    safeReadingTotal > 0
      ? (clampedReadingCorrect / safeReadingTotal) * 100
      : (clampedListeningCorrect / safeListeningTotal) * 100;

  const listeningScaled = convertRawListeningToScaled(listeningRaw100);
  const readingScaled = convertRawReadingToScaled(readingRaw100);
  const estimatedScore = listeningScaled + readingScaled;

  return {
    listeningScaled,
    readingScaled,
    estimatedScore,
  };
}
