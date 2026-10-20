// ============================================================================
// users.service.ts
// เปรียบเทียบกับ Go:
// เทียบเท่ากับ Service Layer (`type UserService struct { db *gorm.DB }`)
// ทำหน้าที่ดึงข้อมูล Hero Profile, คำนวณสถานะ 7-Tier Evolution และสรุปสถิติสำหรับหน้า Dashboard
// ============================================================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getCharacterEvolution } from '../common/utils/character-evolution.util';
import { UpdateUserDto } from './dto/update-user.dto';

export const DEFAULT_DEMO_USER_ID = 'demo-hero-1';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ดึงข้อมูลผู้เล่นหลัก (หากยังไม่มีใน DB จะสร้าง Demo User ให้อัตโนมัติเพื่อกัน Error)
   */
  async getOrCreateUser(userId = DEFAULT_DEMO_USER_ID) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.user.upsert({
      where: { username: 'hero' },
      update: {},
      create: {
        id: userId,
        username: 'hero',
        password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // sha256 of '123456'
        email: 'hero@cardcraft.dev',
        name: 'Alden the Rune Challenger',
        targetScore: 700,
        currentEstimatedScore: 350,
      },
    });
  }

  /**
   * ดึงข้อมูล Dashboard ครบวงจร:
   * - ข้อมูลผู้เล่น (User)
   * - สถานะวิวัฒนาการ 7-Tier + Roadmap (CharacterEvolutionStatus)
   * - สถิติการปัดการ์ดคำศัพท์ (Mastered vs Still Learning)
   * - ประวัติการทำข้อสอบล่าสุด (Recent ExamAttempts)
   */
  async getDashboardSummary(userId = DEFAULT_DEMO_USER_ID) {
    const user = await this.getOrCreateUser(userId);
    const evolution = getCharacterEvolution(
      user.currentEstimatedScore,
      user.targetScore,
    );

    const [totalFlashcards, cardProgresses, totalQuestions, recentAttempts] =
      await Promise.all([
        this.prisma.flashcard.count(),
        this.prisma.cardProgress.findMany({
          where: { userId: user.id },
        }),
        this.prisma.question.count(),
        this.prisma.examAttempt.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    const masteredCards = cardProgresses.filter((cp) => cp.isKnown).length;
    const learningCards = cardProgresses.filter((cp) => !cp.isKnown).length;
    const unseenCards = Math.max(
      0,
      totalFlashcards - masteredCards - learningCards,
    );

    return {
      user,
      evolution,
      stats: {
        totalFlashcards,
        masteredCards,
        learningCards,
        unseenCards,
        totalQuestions,
        totalExamsCompleted: recentAttempts.length,
      },
      recentAttempts,
    };
  }

  /**
   * อัปเดตข้อมูลโปรไฟล์ เป้าหมายคะแนน หรือคะแนนประเมินของผู้เล่น
   */
  async updateProfile(userId = DEFAULT_DEMO_USER_ID, dto: UpdateUserDto) {
    await this.getOrCreateUser(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.targetScore !== undefined
          ? { targetScore: dto.targetScore }
          : {}),
        ...(dto.currentEstimatedScore !== undefined
          ? { currentEstimatedScore: dto.currentEstimatedScore }
          : {}),
      },
    });

    const evolution = getCharacterEvolution(
      updatedUser.currentEstimatedScore,
      updatedUser.targetScore,
    );

    return {
      user: updatedUser,
      evolution,
    };
  }
}
