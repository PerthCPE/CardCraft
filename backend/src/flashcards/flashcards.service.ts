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
   * ดึงรายการการ์ดคำศัพท์ทั้งหมด พร้อมสถานะความจำ (CardProgress) ของผู้เล่นปัจจุบัน
   * หากเป็น Guest (ไม่มี userId) จะคืนค่า progress เป็น null
   */
  async findAll(category?: string, userId?: string) {
    const isGuest = !userId || userId === 'guest';

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

    return cards.map((card) => {
      const progress =
        !isGuest && card.cardProgresses && card.cardProgresses.length > 0
          ? card.cardProgresses[0]
          : null;

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
            }
          : null,
      };
    });
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
   * บันทึกผลการปัดการ์ดซ้าย/ขวา (Upsert CardProgress)
   * ต้องเข้าสู่ระบบก่อนเสมอ
   */
  async recordSwipe(cardId: string, dto: SwipeFlashcardDto) {
    if (!dto.userId || dto.userId === 'guest') {
      throw new BadRequestException('กรุณาเข้าสู่ระบบก่อนบันทึกสถานะคำศัพท์');
    }

    const userId = dto.userId;
    await this.findOne(cardId);
    await this.usersService.getOrCreateUser(userId);

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
      },
      update: {
        isKnown: dto.isKnown,
        swipeCount: {
          increment: 1,
        },
      },
    });

    return {
      message: dto.isKnown
        ? 'บันทึกการ์ดคำศัพท์เป็น "จำแม่นแล้ว" สำเร็จ!'
        : 'บันทึกการ์ดคำศัพท์เป็น "ยังจำไม่ได้" สำเร็จ!',
      progress,
    };
  }
}
