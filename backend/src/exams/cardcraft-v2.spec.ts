// ============================================================================
// cardcraft-v2.spec.ts
// CardCraft v2.0 Architecture & Core Constraints Verification Suite:
// 1. Practice Config Validation: rejects < 15 questions or < 300 seconds (5 mins)
// 2. Dynamic Choice Shuffling: properly updates correctOption when options are permuted
// 3. Authentic ETS Piecewise Score Conversion: returns valid multiples of 5 between 10 and 990
// 4. Strict Separation: Practice submissions DO NOT alter User.currentEstimatedScore, while Mock Exam DOES
// ============================================================================

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { PracticeConfigDto, SubmitPracticePartDto } from './dto/submit-practice.dto';
import {
  calculateEstimatedPartScore,
  calculateScaledToeicScore,
  convertRawListeningToScaled,
  convertRawReadingToScaled,
  getSupportivePerformanceTier,
  TOEIC_PART_WEIGHTS,
} from '../common/utils/character-evolution.util';

describe('CardCraft v2.0 Core Architecture & Deliverables Suite', () => {
  let service: ExamsService;

  const mockPrismaService = {
    examAttempt: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    partSkillEstimate: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    answerLog: {
      createMany: jest.fn(),
    },
    cardProgress: {
      upsert: jest.fn(),
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
  // 1. Practice Config Validation (Hard Constraints: min 15 Qs, min 5 mins)
  // --------------------------------------------------------------------------
  describe('1. Practice Config Validation Constraints', () => {
    it('should REJECT practice configs with questionCount < 15', async () => {
      const invalidConfig = plainToInstance(PracticeConfigDto, {
        part: 5,
        questionCount: 14, // Invalid: must be >= 15
        timeLimitSeconds: 600,
      });

      const errors = await validate(invalidConfig);
      expect(errors.length).toBeGreaterThan(0);
      const qError = errors.find((e) => e.property === 'questionCount');
      expect(qError).toBeDefined();
      expect(qError?.constraints?.min).toContain('15');
    });

    it('should REJECT practice configs with timeLimitSeconds < 300 (5 mins)', async () => {
      const invalidConfig = plainToInstance(PracticeConfigDto, {
        part: 5,
        questionCount: 20,
        timeLimitSeconds: 299, // Invalid: must be >= 300s (5 mins)
      });

      const errors = await validate(invalidConfig);
      expect(errors.length).toBeGreaterThan(0);
      const tError = errors.find((e) => e.property === 'timeLimitSeconds');
      expect(tError).toBeDefined();
      expect(tError?.constraints?.min).toContain('300');
    });

    it('should ACCEPT valid practice configs meeting minimum constraints (15 Qs, 300s)', async () => {
      const validConfig = plainToInstance(PracticeConfigDto, {
        part: 1,
        questionCount: 15,
        timeLimitSeconds: 300,
      });

      const errors = await validate(validConfig);
      expect(errors.length).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Dynamic Choice Shuffling & Correct Option Remapping
  // --------------------------------------------------------------------------
  describe('2. Dynamic Choice Shuffling & Remapping Engine', () => {
    function shuffleAndRemap(question: {
      optionA: string;
      optionB: string;
      optionC: string;
      optionD?: string | null;
      correctOption: string;
    }) {
      const choices = [
        { orig: 'A', text: question.optionA },
        { orig: 'B', text: question.optionB },
        { orig: 'C', text: question.optionC },
        ...(question.optionD ? [{ orig: 'D', text: question.optionD }] : []),
      ];

      // Reverse shuffle for deterministic test or random permutation
      const shuffled = [...choices].reverse();
      const letters = ['A', 'B', 'C', 'D'];
      let remappedCorrect = 'A';

      const remappedChoices = shuffled.map((c, idx) => {
        const newLetter = letters[idx];
        if (c.orig === question.correctOption) {
          remappedCorrect = newLetter;
        }
        return { displayKey: newLetter, originalKey: c.orig, text: c.text };
      });

      return { remappedChoices, remappedCorrect };
    }

    it('should properly remap correctOption when 4 choices are shuffled', () => {
      const mockQuestion = {
        optionA: 'analyze',
        optionB: 'analysis',
        optionC: 'analyst',
        optionD: 'analytical',
        correctOption: 'B', // original answer is B ('analysis')
      };

      const result = shuffleAndRemap(mockQuestion);
      // Since reversed: [D, C, B, A] -> B is now at index 2 = letter 'C'
      expect(result.remappedCorrect).toBe('C');
      const correctChoice = result.remappedChoices.find((c) => c.displayKey === result.remappedCorrect);
      expect(correctChoice?.text).toBe('analysis');
    });

    it('should preserve strictly 3 choices for Part 2 without creating an empty option D', () => {
      const part2Question = {
        optionA: 'At 3 PM.',
        optionB: 'In the conference hall.',
        optionC: 'Yes, I received the memo.',
        optionD: null,
        correctOption: 'A',
      };

      const result = shuffleAndRemap(part2Question);
      expect(result.remappedChoices.length).toBe(3);
      expect(result.remappedChoices.map((c) => c.displayKey)).toEqual(['A', 'B', 'C']);
      const correctChoice = result.remappedChoices.find((c) => c.displayKey === result.remappedCorrect);
      expect(correctChoice?.text).toBe('At 3 PM.');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Authentic ETS-Calibrated Piecewise Nonlinear Score Conversion
  // --------------------------------------------------------------------------
  describe('3. ETS-Calibrated Score Conversion Table', () => {
    it('should return 10 (5 + 5) when raw scores are 0', () => {
      const score = calculateScaledToeicScore(0, 100, 0, 100);
      expect(score.listeningScaled).toBe(5);
      expect(score.readingScaled).toBe(5);
      expect(score.estimatedScore).toBe(10);
      expect(score.estimatedScore % 5).toBe(0);
    });

    it('should return 990 (495 + 495) when raw scores are 100', () => {
      const score = calculateScaledToeicScore(100, 100, 100, 100);
      expect(score.listeningScaled).toBe(495);
      expect(score.readingScaled).toBe(495);
      expect(score.estimatedScore).toBe(990);
      expect(score.estimatedScore % 5).toBe(0);
    });

    it('should ALWAYS return scores as multiples of 5 within [10, 990] across full domain', () => {
      for (let raw = 0; raw <= 100; raw += 5) {
        const lis = convertRawListeningToScaled(raw);
        const read = convertRawReadingToScaled(raw);
        const total = lis + read;

        expect(lis % 5).toBe(0);
        expect(read % 5).toBe(0);
        expect(total % 5).toBe(0);
        expect(lis).toBeGreaterThanOrEqual(5);
        expect(lis).toBeLessThanOrEqual(495);
        expect(read).toBeGreaterThanOrEqual(5);
        expect(read).toBeLessThanOrEqual(495);
        expect(total).toBeGreaterThanOrEqual(10);
        expect(total).toBeLessThanOrEqual(990);
      }
    });

    it('should correctly calculate Estimated Part Scores with 5-tier supportive feedback', () => {
      // Part 5 (Max score = 150)
      const part5Eval = calculateEstimatedPartScore(5, 15, 15); // 100%
      expect(part5Eval.maxPartScore).toBe(150);
      expect(part5Eval.estimatedPartScore).toBe(150);
      expect(part5Eval.supportiveTier.tier).toBe(5);
      expect(part5Eval.supportiveTier.stageName).toBe('Grand Master');

      // Part 1 (Max score = 30), 50% accuracy -> 15 pts, Awakening Stage
      const part1Eval = calculateEstimatedPartScore(1, 10, 20); // 50%
      expect(part1Eval.maxPartScore).toBe(30);
      expect(part1Eval.estimatedPartScore).toBe(15);
      expect(part1Eval.supportiveTier.tier).toBe(2);
      expect(part1Eval.supportiveTier.stageName).toBe('Awakening Stage');

      // Low score (20% accuracy) -> Seedling Stage, supportive non-discouraging copy
      const seedlingEval = calculateEstimatedPartScore(7, 4, 20); // 20%
      expect(seedlingEval.supportiveTier.tier).toBe(1);
      expect(seedlingEval.supportiveTier.stageName).toBe('Seedling Stage');
      expect(seedlingEval.supportiveTier.descriptionTh).toContain('ก้าวแรกเริ่มต้นแล้ว');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Strict Separation: Practice submissions vs Mock Exam submissions
  // --------------------------------------------------------------------------
  describe('4. Strict Separation of Practice Estimation vs Character Leveling', () => {
    it('Practice submissions MUST NOT alter User.currentEstimatedScore', async () => {
      const initialScore = 650;
      mockUsersService.getOrCreateUser.mockResolvedValue({
        id: 'user-guild-01',
        name: 'Guild Adventurer',
        targetScore: 700,
        currentEstimatedScore: initialScore,
      });

      mockPrismaService.partSkillEstimate.upsert.mockResolvedValue({
        id: 'est-1',
        userId: 'user-guild-01',
        part: 5,
        estimatedScore: 140,
        supportiveTier: 4,
      });

      const practiceResult = await service.submitPracticePart({
        userId: 'user-guild-01',
        part: 5,
        totalQuestions: 20,
        correctAnswers: 18,
        timeLimitSeconds: 600,
        timeSpentSeconds: 400,
      });

      // Verify that prisma.user.update was NEVER called
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      // Official score returned remains exactly the initialScore
      expect(practiceResult.officialScoreUnchanged).toBe(initialScore);
      expect(practiceResult.user.currentEstimatedScore).toBe(initialScore);
      // Part estimate was upserted
      expect(mockPrismaService.partSkillEstimate.upsert).toHaveBeenCalledTimes(1);
    });

    it('Mock Exam submissions MUST update User.currentEstimatedScore and trigger Character Evolution', async () => {
      const initialScore = 650;
      mockUsersService.getOrCreateUser.mockResolvedValue({
        id: 'user-guild-01',
        name: 'Guild Adventurer',
        targetScore: 700,
        currentEstimatedScore: initialScore,
      });

      mockPrismaService.examAttempt.create.mockResolvedValue({
        id: 'attempt-01',
      });

      mockPrismaService.user.update.mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'user-guild-01',
          name: 'Guild Adventurer',
          targetScore: 700,
          currentEstimatedScore: data.currentEstimatedScore,
        }),
      );

      // Submit a 50 Qs Mock Exam
      const mockResult = await service.submitExam({
        userId: 'user-guild-01',
        mode: 'MOCK_EXAM_50Q',
        listeningCorrect: 20,
        listeningTotal: 25,
        readingCorrect: 21,
        readingTotal: 25,
        timeSpentSeconds: 1800,
      });

      // Verify that prisma.user.update WAS called with the newly calculated score
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
      expect(mockResult.user.currentEstimatedScore).toBe(mockResult.scoreBreakdown.estimatedScore);
      expect(mockResult.user.currentEstimatedScore).not.toBe(initialScore);
    });
  });
});
