// ============================================================================
// users.service.ts
// CardCraft Release v1.0: Service Layer สำหรับจัดการข้อมูล Hero Profile & Dashboard
// รองรับ Guest Mode เริ่มต้น (ไม่มีข้อมูลค้าง) และคำนวณสถิติตามผู้ใช้งานจริง
// ============================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getCharacterEvolution } from '../common/utils/character-evolution.util';
import { UpdateUserDto } from './dto/update-user.dto';

export const DEFAULT_DEMO_USER_ID = 'demo-hero-1';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ดึงข้อมูลผู้เล่นตาม ID
   */
  async getUser(userId?: string) {
    if (!userId || userId === 'guest') {
      return null;
    }
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * ดึงข้อมูลผู้เล่น หากไม่พบจะโยน NotFoundException (ไม่สร้างผู้ใช้จำลองอัตโนมัติ)
   */
  async getOrCreateUser(userId?: string) {
    if (!userId || userId === 'guest') {
      throw new NotFoundException('กรุณาเข้าสู่ระบบก่อนทำรายการ');
    }

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new NotFoundException(`ไม่พบบัญชีผู้เล่น (User ID: ${userId})`);
    }

    return existing;
  }

  /**
   * ดึงข้อมูล Dashboard ครบวงจร:
   * - หากเป็น Guest (ไม่มี userId หรือ userId === 'guest'): สรุปคลังข้อมูลทั้งหมดในสถานะเริ่มต้น
   * - หากเป็นสมาชิกที่เข้าสู่ระบบแล้ว: ดึงความคืบหน้าการ์ด, Tier Evolution และประวัติการสอบจริง
   */
  async getDashboardSummary(userId?: string) {
    const user =
      userId && userId !== 'guest' ? await this.getUser(userId) : null;

    const [totalFlashcards, totalQuestions] = await Promise.all([
      this.prisma.flashcard.count(),
      this.prisma.question.count(),
    ]);

    // โหมด Guest เริ่มต้น
    if (!user) {
      const guestEvolution = getCharacterEvolution(10, 700);
      return {
        user: null,
        isGuest: true,
        evolution: guestEvolution,
        stats: {
          totalFlashcards,
          masteredCards: 0,
          learningCards: 0,
          unseenCards: totalFlashcards,
          totalQuestions,
          totalExamsCompleted: 0,
        },
        recentAttempts: [],
      };
    }

    // ผู้เล่นจริงที่เข้าสู่ระบบ
    const [cardProgresses, recentAttempts] = await Promise.all([
      this.prisma.cardProgress.findMany({
        where: { userId: user.id },
      }),
      this.prisma.examAttempt.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const evolution = getCharacterEvolution(
      user.currentEstimatedScore,
      user.targetScore,
    );

    const masteredCards = cardProgresses.filter((cp) => cp.isKnown).length;
    const learningCards = cardProgresses.filter((cp) => !cp.isKnown).length;
    const unseenCards = Math.max(
      0,
      totalFlashcards - masteredCards - learningCards,
    );

    return {
      user,
      isGuest: false,
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
   * อัปเดตข้อมูลโปรไฟล์ เป้าหมายคะแนน หรือคะแนนประเมินของผู้เล่นจริง
   */
  async updateProfile(userId: string | undefined, dto: UpdateUserDto) {
    const user = await this.getOrCreateUser(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
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
