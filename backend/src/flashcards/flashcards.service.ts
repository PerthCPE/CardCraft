// ============================================================================
// flashcards.service.ts
// CardCraft Release v1.0: Flashcards & Spaced Repetition (CardProgress) Service
// ============================================================================

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { SwipeFlashcardDto } from './dto/swipe-flashcard.dto';

@Injectable()
export class FlashcardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * ดึงรายการการ์ดคำศัพท์ทั้งหมด พร้อมสถานะความจำ (CardProgress) และ Spaced Repetition (Task B)
   * รองรับตัวกรอง: 'DUE' (ถึงเวลาทบทวน), 'EXAM_WRONG' (เคยผิดจากข้อสอบ), 'MASTERED', 'LEARNING'
   */
  async findAll(category?: string, userId?: string, filter?: string) {
    const isGuest = !userId || userId === 'guest';
    const now = new Date();

    const cards = (await this.prisma.flashcard.findMany({
      where: category && category !== 'ALL' ? { category } : undefined,
      include: !isGuest
        ? {
            cardProgresses: {
              where: { userId },
            },
          }
        : undefined,
      orderBy: [{ manaCost: 'asc' }, { word: 'asc' }],
    })) as any[];

    const mapped = cards.map((card) => {
      const progress =
        !isGuest && card.cardProgresses && card.cardProgresses.length > 0
          ? card.cardProgresses[0]
          : null;

      const isDue = progress ? new Date(progress.dueAt) <= now : false;

      return {
        id: card.id,
        word: card.word,
        partOfSpeech: card.partOfSpeech,
        meaningTh: card.meaningTh,
        exampleEn: card.exampleEn,
        category: card.category,
        manaCost: card.manaCost,
        progress: progress
          ? {
              isKnown: progress.isKnown,
              swipeCount: progress.swipeCount,
              dueAt: progress.dueAt,
              intervalDays: progress.intervalDays,
              easeFactor: progress.easeFactor,
              correctCount: progress.correctCount,
              wrongCount: progress.wrongCount,
              lastWrongAt: progress.lastWrongAt,
              isDue,
            }
          : null,
      };
    });

    if (!filter || filter === 'ALL') {
      return mapped;
    }

    if (filter === 'DUE') {
      // คำที่ถึงเวลาทบทวน (dueAt <= now)
      return mapped.filter((c) => c.progress && c.progress.isDue);
    }

    if (filter === 'EXAM_WRONG') {
      // คำที่เคยทำผิดจากข้อสอบหรือปัดผิด (wrongCount > 0)
      return mapped.filter((c) => c.progress && c.progress.wrongCount > 0);
    }

    if (filter === 'MASTERED') {
      return mapped.filter((c) => c.progress && c.progress.isKnown);
    }

    if (filter === 'LEARNING') {
      return mapped.filter((c) => c.progress && !c.progress.isKnown);
    }

    return mapped;
  }

  async findOne(id: string) {
    const card = await this.prisma.flashcard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException(`Flashcard with ID "${id}" not found`);
    }

    return card;
  }

  async create(dto: CreateFlashcardDto) {
    return this.prisma.flashcard.create({
      data: {
        word: dto.word,
        partOfSpeech: dto.partOfSpeech,
        meaningTh: dto.meaningTh,
        exampleEn: dto.exampleEn,
        category: dto.category,
        manaCost: dto.manaCost ?? 3,
      },
    });
  }

  async update(id: string, dto: UpdateFlashcardDto) {
    await this.findOne(id);
    return this.prisma.flashcard.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.flashcard.delete({
      where: { id },
    });
  }

  /**
   * บันทึกผลการปัดการ์ดซ้าย/ขวา พร้อมคำนวณรอบทบทวน Spaced Repetition (Task B)
   * - ปัดขวา (isKnown=true): ขยาย intervalDays ตาม easeFactor, dueAt = วันนี้ + intervalDays
   * - ปัดซ้าย (isKnown=false): รีเซ็ต intervalDays = 1, dueAt = ตอนนี้, wrongCount + 1, lastWrongAt = ตอนนี้
   * ไม่กระทบ swipeCount, EXP, Combo เดิม
   */
  async recordSwipe(cardId: string, dto: SwipeFlashcardDto) {
    if (!dto.userId || dto.userId === 'guest') {
      throw new BadRequestException('กรุณาเข้าสู่ระบบก่อนบันทึกสถานะคำศัพท์');
    }

    const userId = dto.userId;
    await this.findOne(cardId);
    await this.usersService.getOrCreateUser(userId);

    const existing = await this.prisma.cardProgress.findUnique({
      where: {
        userId_cardId: {
          userId,
          cardId,
        },
      },
    });

    const now = new Date();
    let nextInterval = 1.0;
    let nextEase = existing?.easeFactor ?? 2.5;
    let dueAt = now;

    if (dto.isKnown) {
      // ปัดขวา: ขยายระยะเวลาตาม Spaced Repetition (SuperMemo-2 / Leitner)
      const currentInterval = existing?.intervalDays ?? 1.0;
      const currentCorrect = existing?.correctCount ?? 0;

      if (currentCorrect === 0) {
        nextInterval = 1.0;
      } else if (currentCorrect === 1) {
        nextInterval = 3.0;
      } else {
        nextInterval = Math.max(1.0, Math.round(currentInterval * nextEase));
      }

      nextEase = Math.min(3.0, nextEase + 0.1);
      dueAt = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);
    } else {
      // ปัดซ้าย: รีเซ็ต interval เป็น 1 วัน และกำหนด dueAt = ตอนนี้เพื่อให้ทบทวนทันที
      nextInterval = 1.0;
      nextEase = Math.max(1.3, nextEase - 0.2);
      dueAt = now;
    }

    const progress = await this.prisma.cardProgress.upsert({
      where: {
        userId_cardId: {
          userId,
          cardId,
        },
      },
      create: {
        userId,
        cardId,
        isKnown: dto.isKnown,
        swipeCount: 1,
        intervalDays: nextInterval,
        easeFactor: nextEase,
        dueAt,
        correctCount: dto.isKnown ? 1 : 0,
        wrongCount: dto.isKnown ? 0 : 1,
        lastWrongAt: dto.isKnown ? null : now,
      },
      update: {
        isKnown: dto.isKnown,
        swipeCount: {
          increment: 1,
        },
        intervalDays: nextInterval,
        easeFactor: nextEase,
        dueAt,
        correctCount: dto.isKnown ? { increment: 1 } : undefined,
        wrongCount: !dto.isKnown ? { increment: 1 } : undefined,
        lastWrongAt: !dto.isKnown ? now : undefined,
      },
    });

    return {
      message: dto.isKnown
        ? `บันทึกการ์ดคำศัพท์สำเร็จ! ทบทวนรอบถัดไปอีก ${Math.round(nextInterval)} วัน`
        : 'บันทึกการ์ดคำศัพท์เป็น "ต้องทบทวนทันที" สำเร็จ!',
      progress,
    };
  }
}
