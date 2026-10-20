// ============================================================================
// exams.service.spec.ts
// ชุดทดสอบ Unit Tests ด้วย Jest สำหรับระบบคำนวณคะแนน TOEIC (10-990)
// และระบบวิวัฒนาการตัวละคร 7-Tier Character Evolution
//
// เปรียบเทียบกับ Go (`testing` + `testify/mock`):
// - `describe(...)` และ `it(...)` เทียบเท่ากับ `func TestExamsService(t *testing.T)` และ `t.Run(...)`
// - `it.each([...])` คือ Table-Driven Tests เหมือนการวนลูป `for _, tc := range testCases` ใน Go!
// - `Test.createTestingModule` + `jest.fn()` ช่วยจำลอง (Mock) `PrismaService`
//   ทำให้รันเทสต์ได้ทันทีโดยไม่ต้องต่อ PostgreSQL จริง (เหมือนการส่ง Mock Repository Interface ใน Go)
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

describe('ExamsService & 7-Tier Character Evolution Unit Tests', () => {
  let service: ExamsService;

  const mockPrismaService = {
    examAttempt: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };

  const mockUsersService = {
    getOrCreateUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
  });

  // --------------------------------------------------------------------------
  // 1. ทดสอบขอบเขตคะแนนทั้ง 7 Tiers (0, 250, 400, 600, 700, 800, 900)
  // --------------------------------------------------------------------------
  describe('7-Tier Hero Evolution Boundary Tests', () => {
    const boundaryCases: Array<{
      score: number;
      expectedTier: number;
      expectedTitle: string;
      expectedSprite: string;
      expectedPassed700: boolean;
      expectedPointsToNext: number;
    }> = [
      // Tier 1: 0 - 245 pts ("Novice Villager")
      {
        score: 0,
        expectedTier: 1,
        expectedTitle: 'Novice Villager',
        expectedSprite: '/sprites/tier-1-novice.png',
        expectedPassed700: false,
        expectedPointsToNext: 250,
      },
      {
        score: 245,
        expectedTier: 1,
        expectedTitle: 'Novice Villager',
        expectedSprite: '/sprites/tier-1-novice.png',
        expectedPassed700: false,
        expectedPointsToNext: 5,
      },
      // Tier 2: 250 - 395 pts | +150 range ("Word Scout")
      {
        score: 250,
        expectedTier: 2,
        expectedTitle: 'Word Scout',
        expectedSprite: '/sprites/tier-2-scout.png',
        expectedPassed700: false,
        expectedPointsToNext: 150,
      },
      {
        score: 395,
        expectedTier: 2,
        expectedTitle: 'Word Scout',
        expectedSprite: '/sprites/tier-2-scout.png',
        expectedPassed700: false,
        expectedPointsToNext: 5,
      },
      // Tier 3: 400 - 595 pts | +200 range ("Spell Squire")
      {
        score: 400,
        expectedTier: 3,
        expectedTitle: 'Spell Squire',
        expectedSprite: '/sprites/tier-3-squire.png',
        expectedPassed700: false,
        expectedPointsToNext: 200,
      },
      {
        score: 595,
        expectedTier: 3,
        expectedTitle: 'Spell Squire',
        expectedSprite: '/sprites/tier-3-squire.png',
        expectedPassed700: false,
        expectedPointsToNext: 5,
      },
      // Tier 4: 600 - 695 pts | +100 range ("Rune Knight" — Pre-700 Challenger)
      {
        score: 600,
        expectedTier: 4,
        expectedTitle: 'Rune Knight',
        expectedSprite: '/sprites/tier-4-knight.png',
        expectedPassed700: false,
        expectedPointsToNext: 100,
      },
      {
        score: 695,
        expectedTier: 4,
        expectedTitle: 'Rune Knight',
        expectedSprite: '/sprites/tier-4-knight.png',
        expectedPassed700: false,
        expectedPointsToNext: 5,
      },
      // Tier 5: 700 - 795 pts | +100 range ("High Paladin" — 700+ GOAL UNLOCKED!)
      {
        score: 700,
        expectedTier: 5,
        expectedTitle: 'High Paladin',
        expectedSprite: '/sprites/tier-5-paladin.png',
        expectedPassed700: true,
        expectedPointsToNext: 100,
      },
      {
        score: 795,
        expectedTier: 5,
        expectedTitle: 'High Paladin',
        expectedSprite: '/sprites/tier-5-paladin.png',
        expectedPassed700: true,
        expectedPointsToNext: 5,
      },
      // Tier 6: 800 - 895 pts | +100 range ("Grand Archmage")
      {
        score: 800,
        expectedTier: 6,
        expectedTitle: 'Grand Archmage',
        expectedSprite: '/sprites/tier-6-archmage.png',
        expectedPassed700: true,
        expectedPointsToNext: 100,
      },
      {
        score: 895,
        expectedTier: 6,
        expectedTitle: 'Grand Archmage',
        expectedSprite: '/sprites/tier-6-archmage.png',
        expectedPassed700: true,
        expectedPointsToNext: 5,
      },
      // Tier 7: 900 - 990 pts | +100 range | MAX ("CardCraft Deity")
      {
        score: 900,
        expectedTier: 7,
        expectedTitle: 'CardCraft Deity',
        expectedSprite: '/sprites/tier-7-deity.png',
        expectedPassed700: true,
        expectedPointsToNext: 0,
      },
      {
        score: 990,
        expectedTier: 7,
        expectedTitle: 'CardCraft Deity',
        expectedSprite: '/sprites/tier-7-deity.png',
        expectedPassed700: true,
        expectedPointsToNext: 0,
      },
    ];

    it.each(boundaryCases)(
      'should map score $score pts -> Tier $expectedTier ($expectedTitle) with passed700=$expectedPassed700',
      ({
        score,
        expectedTier,
        expectedTitle,
        expectedSprite,
        expectedPassed700,
        expectedPointsToNext,
      }) => {
        const result = service.evaluateScoreTier(score, 700);

        expect(result.unlockedTier).toBe(expectedTier);
        expect(result.classTitle).toBe(expectedTitle);
        expect(result.spritePath).toBe(expectedSprite);
        expect(result.isPassedTarget).toBe(expectedPassed700);
        expect(result.pointsToNextTier).toBe(expectedPointsToNext);
        expect(result.roadmap).toHaveLength(7);

        // ตรวจสอบว่าจำนวนด่านใน Roadmap ที่ถูกปลดล็อกตรงกับหมายเลข Tier พอดี
        const unlockedCount = result.roadmap.filter((r) => r.isUnlocked).length;
        expect(unlockedCount).toBe(expectedTier);
      },
    );

    it('should clamp out-of-range scores (< 0 or > 990) safely', () => {
      const negativeResult = service.evaluateScoreTier(-50);
      expect(negativeResult.estimatedScore).toBe(0);
      expect(negativeResult.unlockedTier).toBe(1);

      const overflowResult = service.evaluateScoreTier(1250);
      expect(overflowResult.estimatedScore).toBe(990);
      expect(overflowResult.unlockedTier).toBe(7);
      expect(overflowResult.classTitle).toBe('CardCraft Deity');
    });
  });

  // --------------------------------------------------------------------------
  // 2. ทดสอบการแปลงคะแนนดิบเป็นคะแนนสเกล TOEIC (10 - 990)
  // --------------------------------------------------------------------------
  describe('TOEIC Scaled Score Conversion (10 - 990)', () => {
    it('should return minimum scaled score of 10 (5 Listening + 5 Reading) when 0 answers are correct', () => {
      const { scoreBreakdown, evolution } = service.calculateExamEvaluation(
        0,
        7,
        0,
        8,
      );

      expect(scoreBreakdown.listeningScaled).toBe(5);
      expect(scoreBreakdown.readingScaled).toBe(5);
      expect(scoreBreakdown.estimatedScore).toBe(10);
      expect(evolution.unlockedTier).toBe(1);
      expect(evolution.isPassedTarget).toBe(false);
    });

    it('should return maximum scaled score of 990 (495 Listening + 495 Reading) when all answers are correct', () => {
      const { scoreBreakdown, evolution } = service.calculateExamEvaluation(
        7,
        7,
        8,
        8,
      );

      expect(scoreBreakdown.listeningScaled).toBe(495);
      expect(scoreBreakdown.readingScaled).toBe(495);
      expect(scoreBreakdown.estimatedScore).toBe(990);
      expect(evolution.unlockedTier).toBe(7);
      expect(evolution.classTitle).toBe('CardCraft Deity');
      expect(evolution.isPassedTarget).toBe(true);
    });

    it('should unlock Tier 5 (High Paladin, >= 700) when achieving ~75% accuracy', () => {
      const { scoreBreakdown, evolution } = service.calculateExamEvaluation(
        75,
        100,
        75,
        100,
      );

      expect(scoreBreakdown.estimatedScore).toBeGreaterThanOrEqual(700);
      expect(scoreBreakdown.estimatedScore).toBeLessThan(800);
      expect(evolution.unlockedTier).toBe(5);
      expect(evolution.classTitle).toBe('High Paladin');
      expect(evolution.isPassedTarget).toBe(true);
      expect(evolution.pointsToTarget700).toBe(0);
    });

    it('should always produce scores in multiples of 5', () => {
      const { scoreBreakdown } = service.calculateExamEvaluation(5, 7, 5, 8);
      expect(scoreBreakdown.listeningScaled % 5).toBe(0);
      expect(scoreBreakdown.readingScaled % 5).toBe(0);
      expect(scoreBreakdown.estimatedScore % 5).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // 3. ทดสอบการส่งข้อสอบ POST /exams/submit และการบันทึกผ่าน PrismaService
  // --------------------------------------------------------------------------
  describe('submitExam (Persistence & Class Evolution Detection)', () => {
    it('should persist ExamAttempt, update User score, and detect class evolution from Tier 4 to Tier 5', async () => {
      mockUsersService.getOrCreateUser.mockResolvedValue({
        id: 'demo-hero-1',
        email: 'hero@cardcraft.dev',
        name: 'Alden the Rune Challenger',
        targetScore: 700,
        currentEstimatedScore: 625, // เดิมอยู่ Tier 4 (Rune Knight)
      });

      mockPrismaService.examAttempt.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'attempt-001',
          ...data,
          createdAt: new Date('2026-10-20T00:00:00Z'),
        }),
      );

      mockPrismaService.user.update.mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'demo-hero-1',
          email: 'hero@cardcraft.dev',
          name: 'Alden the Rune Challenger',
          targetScore: 700,
          currentEstimatedScore: data.currentEstimatedScore,
        }),
      );

      // ทำข้อสอบได้ Listening 5/7 (355 pts) และ Reading 6/8 (375 pts) -> รวม 730 คะแนน = Tier 5 High Paladin
      const response = await service.submitExam({
        userId: 'demo-hero-1',
        mode: 'MINI_MOCK',
        listeningCorrect: 5,
        listeningTotal: 7,
        readingCorrect: 6,
        readingTotal: 8,
        timeSpentSeconds: 610,
      });

      expect(response.scoreBreakdown.estimatedScore).toBe(730);
      expect(response.previousTier.tier).toBe(4);
      expect(response.evolution.unlockedTier).toBe(5);
      expect(response.evolution.classTitle).toBe('High Paladin');
      expect(response.hasEvolved).toBe(true);
      expect(response.evolution.isPassedTarget).toBe(true);
      expect(mockPrismaService.examAttempt.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'demo-hero-1' },
        data: { currentEstimatedScore: response.scoreBreakdown.estimatedScore },
      });
    });
  });
});
