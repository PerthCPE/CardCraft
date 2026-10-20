// ============================================================================
// flashcards.service.ts
// เปรียบเทียบกับ Go (Gin + GORM):
// - เมธอด CRUD ที่นี่เทียบเท่ากับ Repository/Service methods ใน Go เช่น
//   `db.Where("category = ?", cat).Preload("CardProgresses").Find(&cards)`
// - ส่วน `recordSwipe` ใช้ `prisma.cardProgress.upsert()` ซึ่งเทียบเท่ากับ
//   `clause.OnConflict{Columns: []clause.Column{{Name: "user_id"}, {Name: "card_id"}}, DoUpdates: ...}` ใน GORM
// ============================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_DEMO_USER_ID, UsersService } from '../users/users.service';
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
   */
  async findAll(category?: string, userId = DEFAULT_DEMO_USER_ID) {
    const cards = await this.prisma.flashcard.findMany({
      where: category && category !== 'ALL' ? { category } : undefined,
      include: {
        cardProgresses: {
          where: { userId },
        },
      },
      orderBy: [{ manaCost: 'asc' }, { word: 'asc' }],
    });

    return cards.map((card) => {
      const progress = card.cardProgresses[0] ?? null;
      return {
        id: card.id,
        word: card.word,
        partOfSpeech: card.partOfSpeech,
        meaningTh: card.meaningTh,
        exampleEn: card.exampleEn,
        category: card.category,
        manaCost: card.manaCost,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        progress: progress
          ? {
              isKnown: progress.isKnown,
              swipeCount: progress.swipeCount,
              updatedAt: progress.updatedAt,
            }
          : null,
      };
    });
  }

  /**
   * ดึงข้อมูลการ์ดคำศัพท์รายใบตาม ID
   */
  async findOne(id: string) {
    const card = await this.prisma.flashcard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException(`Flashcard with ID "${id}" not found`);
    }

    return card;
  }

  /**
   * สร้างการ์ดคำศัพท์ใหม่ (Create)
   */
  async create(dto: CreateFlashcardDto) {
    return this.prisma.flashcard.create({
      data: dto,
    });
  }

  /**
   * แก้ไขข้อมูลการ์ดคำศัพท์ (Update)
   */
  async update(id: string, dto: UpdateFlashcardDto) {
    await this.findOne(id);
    return this.prisma.flashcard.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * ลบการ์ดคำศัพท์ (Delete)
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.flashcard.delete({
      where: { id },
    });
  }

  /**
   * บันทึกผลการปัดการ์ดซ้าย/ขวา (Upsert CardProgress)
   * - ปัดขวา (isKnown: true) = Mastered
   * - ปัดซ้าย (isKnown: false) = Still Learning
   */
  async recordSwipe(cardId: string, dto: SwipeFlashcardDto) {
    const userId = dto.userId || DEFAULT_DEMO_USER_ID;

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
        ? 'Spell Card Mastered! (+EXP)'
        : 'Marked as Still Learning (Returned to Training Deck)',
      progress,
    };
  }
}
