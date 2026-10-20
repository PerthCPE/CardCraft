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

function roundToNearestFive(value: number, min: number, max: number): number {
  const rounded = Math.round(value / 5) * 5;
  return Math.min(max, Math.max(min, rounded));
}

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

  if (safeListeningTotal === 0 && safeReadingTotal === 0) {
    return {
      listeningScaled: 5,
      readingScaled: 5,
      estimatedScore: 10,
    };
  }

  const listeningRatio =
    safeListeningTotal > 0
      ? clampedListeningCorrect / safeListeningTotal
      : clampedReadingCorrect / safeReadingTotal;

  const readingRatio =
    safeReadingTotal > 0
      ? clampedReadingCorrect / safeReadingTotal
      : clampedListeningCorrect / safeListeningTotal;

  const rawListening = 5 + listeningRatio * 490;
  const rawReading = 5 + readingRatio * 490;

  const listeningScaled = roundToNearestFive(rawListening, 5, 495);
  const readingScaled = roundToNearestFive(rawReading, 5, 495);
  const estimatedScore = listeningScaled + readingScaled;

  return {
    listeningScaled,
    readingScaled,
    estimatedScore,
  };
}
