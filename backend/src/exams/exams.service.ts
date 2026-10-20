// ============================================================================
// exams.service.ts
// เปรียบเทียบกับ Go:
// Service นี้คือหัวใจหลักของ Business Logic ("Usecase Layer" ใน Clean Architecture)
// ทำหน้าที่:
// 1. คำนวณคะแนนสเกล TOEIC (10 - 990) จากผลสอบ Listening & Reading
// 2. ประเมินระดับคลาสตัวละคร 7-Tier Character Evolution และตรวจสอบเป้าหมาย 700+
// 3. บันทึกประวัติการสอบ (ExamAttempt) และอัปเดตคะแนนปัจจุบันของผู้เล่นในฐานข้อมูล
// ============================================================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_DEMO_USER_ID, UsersService } from '../users/users.service';
import {
  calculateScaledToeicScore,
  CharacterEvolutionStatus,
  getCharacterEvolution,
  ScaledScoreBreakdown,
} from '../common/utils/character-evolution.util';
import { SubmitExamDto } from './dto/submit-exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * ฟังก์ชันคำนวณคะแนนสเกล TOEIC (10-990) และระดับวิวัฒนาการตัวละคร (Tier 1-7)
   * แยกออกมาให้เรียกทดสอบใน Unit Test (exams.service.spec.ts) ได้โดยตรง
   */
  calculateExamEvaluation(
    listeningCorrect: number,
    listeningTotal: number,
    readingCorrect: number,
    readingTotal: number,
    targetScore = 700,
  ): {
    scoreBreakdown: ScaledScoreBreakdown;
    evolution: CharacterEvolutionStatus;
  } {
    const scoreBreakdown = calculateScaledToeicScore(
      listeningCorrect,
      listeningTotal,
      readingCorrect,
      readingTotal,
    );

    const evolution = getCharacterEvolution(
      scoreBreakdown.estimatedScore,
      targetScore,
    );

    return {
      scoreBreakdown,
      evolution,
    };
  }

  /**
   * ฟังก์ชันตรวจสอบ Tier จากคะแนนประเมินโดยตรง (0 - 990)
   */
  evaluateScoreTier(
    estimatedScore: number,
    targetScore = 700,
  ): CharacterEvolutionStatus {
    return getCharacterEvolution(estimatedScore, targetScore);
  }

  /**
   * ประมวลผลการส่งข้อสอบ POST /exams/submit
   */
  async submitExam(dto: SubmitExamDto) {
    const userId = dto.userId || DEFAULT_DEMO_USER_ID;
    const user = await this.usersService.getOrCreateUser(userId);

    const previousScore = user.currentEstimatedScore;
    const previousEvolution = getCharacterEvolution(
      previousScore,
      user.targetScore,
    );

    // กำหนดจำนวนข้อเต็มของแต่ละพาร์ทตามโหมดการสอบหากไม่ได้ส่งมาโดยตรง
    const isFullScaleInput =
      dto.listeningCorrect > 15 || dto.readingCorrect > 15;

    let listeningTotal = dto.listeningTotal;
    let readingTotal = dto.readingTotal;

    if (listeningTotal === undefined) {
      if (dto.mode === 'READING_DRILL') {
        listeningTotal = 0;
      } else {
        listeningTotal = isFullScaleInput
          ? 100
          : Math.max(7, dto.listeningCorrect);
      }
    }

    if (readingTotal === undefined) {
      if (dto.mode === 'LISTENING_DRILL') {
        readingTotal = 0;
      } else {
        readingTotal = isFullScaleInput ? 100 : Math.max(8, dto.readingCorrect);
      }
    }

    const { scoreBreakdown, evolution } = this.calculateExamEvaluation(
      dto.listeningCorrect,
      listeningTotal,
      dto.readingCorrect,
      readingTotal,
      user.targetScore,
    );

    // บันทึกประวัติการทำข้อสอบลงตาราง ExamAttempt
    const attempt = await this.prisma.examAttempt.create({
      data: {
        userId: user.id,
        mode: dto.mode,
        listeningCorrect: dto.listeningCorrect,
        readingCorrect: dto.readingCorrect,
        estimatedScore: scoreBreakdown.estimatedScore,
        unlockedTier: evolution.unlockedTier,
        isPassedTarget: evolution.isPassedTarget,
        timeSpentSeconds: dto.timeSpentSeconds,
      },
    });

    // อัปเดตคะแนนประเมินล่าสุดของ Hero ในตาราง User
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        currentEstimatedScore: scoreBreakdown.estimatedScore,
      },
    });

    const hasEvolved = evolution.unlockedTier > previousEvolution.unlockedTier;
    const scoreDelta = scoreBreakdown.estimatedScore - previousScore;

    return {
      attempt,
      user: updatedUser,
      scoreBreakdown,
      previousScore,
      scoreDelta,
      previousTier: previousEvolution.currentTier,
      evolution,
      hasEvolved,
      targetAnalysis: {
        targetScore: user.targetScore,
        isPassedTarget: evolution.isPassedTarget,
        pointsToTarget700: evolution.pointsToTarget700,
        pointsToNextTier: evolution.pointsToNextTier,
        headlineTh: evolution.isPassedTarget
          ? 'ภารกิจสำเร็จ! คุณทะลุเป้าหมาย TOEIC 700+ และปลดล็อกคลาสระดับสูงแล้ว!'
          : `อีกเพียง ${evolution.pointsToTarget700} คะแนน จะทะลุเป้าหมาย 700+ (High Paladin)!`,
      },
    };
  }

  /**
   * ดึงประวัติการทำข้อสอบทั้งหมดของผู้เล่น
   */
  async getExamHistory(userId = DEFAULT_DEMO_USER_ID) {
    return this.prisma.examAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
