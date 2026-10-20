// ============================================================================
// flashcards.service.spec.ts
// Unit Tests สำหรับระบบ Spaced Repetition (Task B)
// ============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { FlashcardsService } from './flashcards.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

describe('FlashcardsService & Spaced Repetition Unit Tests (Task B)', () => {
  let service: FlashcardsService;

  const mockPrismaService = {
    flashcard: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    cardProgress: {
      findUnique: jest.fn(),
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
        FlashcardsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<FlashcardsService>(FlashcardsService);
  });

  describe('recordSwipe (Spaced Repetition Algorithm)', () => {
    it('should reset interval to 1 day and set dueAt to now when swiping left (isKnown=false)', async () => {
      mockPrismaService.flashcard.findUnique.mockResolvedValue({ id: 'card-1', word: 'Stipulate' });
      mockUsersService.getOrCreateUser.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.cardProgress.findUnique.mockResolvedValue({
        id: 'prog-1',
        intervalDays: 5.0,
        easeFactor: 2.5,
        correctCount: 2,
        wrongCount: 0,
      });

      mockPrismaService.cardProgress.upsert.mockImplementation(({ create, update }) =>
        Promise.resolve({ id: 'prog-1', ...update }),
      );

      const result = await service.recordSwipe('card-1', {
        userId: 'user-1',
        isKnown: false,
      });

      expect(result.message).toContain('ต้องทบทวนทันที');
      expect(mockPrismaService.cardProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            isKnown: false,
            intervalDays: 1.0,
            wrongCount: { increment: 1 },
          }),
        }),
      );
    });

    it('should expand interval according to easeFactor when swiping right (isKnown=true)', async () => {
      mockPrismaService.flashcard.findUnique.mockResolvedValue({ id: 'card-1', word: 'Stipulate' });
      mockUsersService.getOrCreateUser.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.cardProgress.findUnique.mockResolvedValue({
        id: 'prog-1',
        intervalDays: 3.0,
        easeFactor: 2.5,
        correctCount: 2,
        wrongCount: 0,
      });

      mockPrismaService.cardProgress.upsert.mockImplementation(({ update }) =>
        Promise.resolve({ id: 'prog-1', ...update }),
      );

      const result = await service.recordSwipe('card-1', {
        userId: 'user-1',
        isKnown: true,
      });

      // 3.0 * 2.5 = 7.5 -> Math.round = 8
      expect(result.message).toContain('ทบทวนรอบถัดไปอีก 8 วัน');
      expect(mockPrismaService.cardProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            isKnown: true,
            intervalDays: 8,
            correctCount: { increment: 1 },
          }),
        }),
      );
    });
  });

  describe('findAll filters (DUE & EXAM_WRONG)', () => {
    it('should filter only DUE flashcards when filter=DUE', async () => {
      const pastDue = new Date(Date.now() - 3600000);
      const futureDue = new Date(Date.now() + 86400000);

      mockPrismaService.flashcard.findMany.mockResolvedValue([
        {
          id: 'c1',
          word: 'DueWord',
          manaCost: 3,
          cardProgresses: [{ dueAt: pastDue, isKnown: false, wrongCount: 1 }],
        },
        {
          id: 'c2',
          word: 'FutureWord',
          manaCost: 3,
          cardProgresses: [{ dueAt: futureDue, isKnown: true, wrongCount: 0 }],
        },
      ]);

      const results = await service.findAll('ALL', 'user-1', 'DUE');
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('DueWord');
    });

    it('should filter only cards with wrongCount > 0 when filter=EXAM_WRONG', async () => {
      mockPrismaService.flashcard.findMany.mockResolvedValue([
        {
          id: 'c1',
          word: 'WrongFromExam',
          manaCost: 3,
          cardProgresses: [{ dueAt: new Date(), isKnown: false, wrongCount: 2 }],
        },
        {
          id: 'c2',
          word: 'NeverWrong',
          manaCost: 3,
          cardProgresses: [{ dueAt: new Date(), isKnown: true, wrongCount: 0 }],
        },
      ]);

      const results = await service.findAll('ALL', 'user-1', 'EXAM_WRONG');
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('WrongFromExam');
    });
  });
});
