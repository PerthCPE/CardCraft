// ============================================================================
// exams.service.ts
// เปรียบเทียบกับ Go:
// Service นี้คือหัวใจหลักของ Business Logic ("Usecase Layer" ใน Clean Architecture)
// ทำหน้าที่:
// 1. คำนวณคะแนนสเกล TOEIC (10 - 990) จากผลสอบ Listening & Reading
// 2. ประเมินระดับคลาสตัวละคร 7-Tier Character Evolution และตรวจสอบเป้าหมาย 700+
// 3. บันทึกประวัติการสอบ (ExamAttempt) และอัปเดตคะแนนปัจจุบันของผู้เล่นในฐานข้อมูล
// ============================================================================

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  calculateEstimatedPartScore,
  calculateScaledToeicScore,
  CharacterEvolutionStatus,
  getCharacterEvolution,
  ScaledScoreBreakdown,
} from '../common/utils/character-evolution.util';
import { LogAnswerDto, SubmitExamDto } from './dto/submit-exam.dto';
import { SubmitPracticePartDto } from './dto/submit-practice.dto';

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
   * รองรับทั้งการส่งแบบเดิม (Backward Compatibility) และการส่ง answers[] รายข้อ (Task A)
   */
  async submitExam(dto: SubmitExamDto) {
    if (!dto.userId || dto.userId === 'guest') {
      throw new BadRequestException(
        'กรุณาเข้าสู่ระบบก่อนส่งผลการสอบ เพื่อบันทึกคะแนนและวิวัฒนาการฮีโร่',
      );
    }
    const userId = dto.userId;
    const user = await this.usersService.getOrCreateUser(userId);

    const previousScore = user.currentEstimatedScore;
    const previousEvolution = getCharacterEvolution(
      previousScore,
      user.targetScore,
    );

    let listeningCorrect = dto.listeningCorrect ?? 0;
    let readingCorrect = dto.readingCorrect ?? 0;
    let listeningTotal = dto.listeningTotal;
    let readingTotal = dto.readingTotal;

    const answerLogsData: Array<{
      userId: string;
      questionId: string;
      part: number;
      mode: string;
      selectedOption: string;
      correctOption: string;
      isCorrect: boolean;
      errorType: any;
      vocabId: string | null;
      timeSpentMs: number;
    }> = [];

    // หากมีการส่ง answers[] มาจาก Client (Task A) ให้คำนวณคะแนนและบันทึก AnswerLog จาก DB โดยตรง
    if (dto.answers && dto.answers.length > 0) {
      const questionIds = dto.answers.map((a) => a.questionId);
      const questions = await this.prisma.question.findMany({
        where: { id: { in: questionIds } },
      });
      const questionMap = new Map(questions.map((q) => [q.id, q]));

      let evaluatedListeningCorrect = 0;
      let evaluatedReadingCorrect = 0;
      let evaluatedListeningTotal = 0;
      let evaluatedReadingTotal = 0;

      for (const ans of dto.answers) {
        const question = questionMap.get(ans.questionId);
        const part = ans.part ?? question?.part ?? 5;
        const isListening = question
          ? question.section === 'LISTENING'
          : part <= 4;

        if (isListening) {
          evaluatedListeningTotal++;
        } else {
          evaluatedReadingTotal++;
        }

        const correctOption = question?.correctOption ?? '';
        const isCorrect =
          Boolean(correctOption) &&
          ans.selectedOption.trim().toUpperCase() ===
            correctOption.trim().toUpperCase();

        if (isCorrect) {
          if (isListening) {
            evaluatedListeningCorrect++;
          } else {
            evaluatedReadingCorrect++;
          }
        }

        const errorType = isCorrect
          ? null
          : (question?.errorTag ?? 'other');
        const vocabId = question?.vocabId ?? null;

        answerLogsData.push({
          userId: user.id,
          questionId: ans.questionId,
          part,
          mode: dto.mode,
          selectedOption: ans.selectedOption.toUpperCase(),
          correctOption: correctOption || ans.selectedOption.toUpperCase(),
          isCorrect,
          errorType: errorType as any,
          vocabId,
          timeSpentMs: ans.timeSpentMs ?? 0,
        });
      }

      listeningCorrect = evaluatedListeningCorrect;
      readingCorrect = evaluatedReadingCorrect;
      if (listeningTotal === undefined) {
        listeningTotal = evaluatedListeningTotal;
      }
      if (readingTotal === undefined) {
        readingTotal = evaluatedReadingTotal;
      }
    }

    // กำหนดจำนวนข้อเต็มของแต่ละพาร์ทตามโหมดการสอบหากไม่ได้ส่งมาโดยตรง
    const isFullScaleInput = listeningCorrect > 15 || readingCorrect > 15;

    if (listeningTotal === undefined) {
      if (dto.mode === 'READING_DRILL') {
        listeningTotal = 0;
      } else {
        listeningTotal = isFullScaleInput
          ? 100
          : Math.max(7, listeningCorrect);
      }
    }

    if (readingTotal === undefined) {
      if (dto.mode === 'LISTENING_DRILL') {
        readingTotal = 0;
      } else {
        readingTotal = isFullScaleInput ? 100 : Math.max(8, readingCorrect);
      }
    }

    const { scoreBreakdown, evolution } = this.calculateExamEvaluation(
      listeningCorrect,
      listeningTotal,
      readingCorrect,
      readingTotal,
      user.targetScore,
    );

    const scoreMin = Math.max(10, scoreBreakdown.estimatedScore - 25);
    const scoreMax = Math.min(990, scoreBreakdown.estimatedScore + 25);

    // บันทึกประวัติการทำข้อสอบลงตาราง ExamAttempt
    const attempt = await this.prisma.examAttempt.create({
      data: {
        userId: user.id,
        mode: dto.mode,
        listeningCorrect,
        readingCorrect,
        estimatedScore: scoreBreakdown.estimatedScore,
        scoreMin,
        scoreMax,
        listeningScore: scoreBreakdown.listeningScaled,
        readingScore: scoreBreakdown.readingScaled,
        unlockedTier: evolution.unlockedTier,
        isPassedTarget: evolution.isPassedTarget,
        timeSpentSeconds: dto.timeSpentSeconds,
      },
    });

    // บันทึก AnswerLog รายข้อเชื่อมโยงกับ attemptId
    if (answerLogsData.length > 0) {
      await this.prisma.answerLog.createMany({
        data: answerLogsData.map((log) => ({
          ...log,
          attemptId: attempt.id,
        })),
      });

      // Task C: หากตอบผิดข้อที่มี vocabId ให้ส่งเข้าคิว Spaced Repetition ใน CardProgress อัตโนมัติ
      const wrongVocabs = answerLogsData.filter(
        (log) => !log.isCorrect && Boolean(log.vocabId),
      );
      for (const w of wrongVocabs) {
        if (!w.vocabId) continue;
        await this.prisma.cardProgress.upsert({
          where: {
            userId_cardId: {
              userId: user.id,
              cardId: w.vocabId,
            },
          },
          create: {
            userId: user.id,
            cardId: w.vocabId,
            isKnown: false,
            swipeCount: 1,
            wrongCount: 1,
            dueAt: new Date(),
            intervalDays: 1.0,
            lastWrongAt: new Date(),
          },
          update: {
            isKnown: false,
            wrongCount: { increment: 1 },
            dueAt: new Date(),
            intervalDays: 1.0,
            lastWrongAt: new Date(),
          },
        });
      }
    }

    // กฎเหล็ก CardCraft v2.0 (Strict Separation of Practice vs Mock Exam):
    // เฉพาะการสอบจำลอง Mock Exam (เช่น MINI_MOCK, FULL_MOCK, BOSS_RAID, MOCK_SET_*) เท่านั้น
    // ที่มีสิทธิ์อัปเดต Official currentEstimatedScore และวิวัฒนาการตัวละคร
    // หากเป็นการฝึกซ้อม (Practice Drills / Games) จะไม่อนุญาตให้อัปเดต Hero Level
    const isMockExam =
      dto.mode === 'MINI_MOCK' ||
      dto.mode === 'FULL_MOCK' ||
      dto.mode === 'BOSS_RAID' ||
      dto.mode.startsWith('MOCK_') ||
      dto.mode.includes('MOCK');

    let updatedUser = user;
    if (isMockExam) {
      updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          currentEstimatedScore: scoreBreakdown.estimatedScore,
        },
      });
    }

    const hasEvolved = isMockExam && evolution.unlockedTier > previousEvolution.unlockedTier;
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
   * บันทึกผลการฝึกซ้อมรายพาร์ท (TOEIC 7-Part Drills) POST /exams/submit-practice
   * - คำนวณ Estimated Part Score และ Supportive Performance Tier (1-5)
   * - อัปเดตตาราง PartSkillEstimate สำหรับแสดงผลในหน้า Dashboard (Readiness Forecast Panel)
   * - STRICT RULE: ห้ามอัปเดต User.currentEstimatedScore หรือ Character Evolution Tier โดยเด็ดขาด!
   */
  async submitPracticePart(dto: SubmitPracticePartDto) {
    if (!dto.userId || dto.userId === 'guest') {
      throw new BadRequestException(
        'กรุณาเข้าสู่ระบบเพื่อบันทึกประวัติการฝึกซ้อมรายพาร์ท',
      );
    }
    const user = await this.usersService.getOrCreateUser(dto.userId);

    const partEvaluation = calculateEstimatedPartScore(
      dto.part,
      dto.correctAnswers,
      dto.totalQuestions,
    );

    const estimate = await this.prisma.partSkillEstimate.upsert({
      where: {
        userId_part: {
          userId: user.id,
          part: dto.part,
        },
      },
      create: {
        userId: user.id,
        part: dto.part,
        accuracy: partEvaluation.accuracy,
        totalQuestions: dto.totalQuestions,
        correctAnswers: dto.correctAnswers,
        estimatedScore: partEvaluation.estimatedPartScore,
        maxPartScore: partEvaluation.maxPartScore,
        supportiveTier: partEvaluation.supportiveTier.tier,
        lastPracticedAt: new Date(),
      },
      update: {
        accuracy: partEvaluation.accuracy,
        totalQuestions: dto.totalQuestions,
        correctAnswers: dto.correctAnswers,
        estimatedScore: partEvaluation.estimatedPartScore,
        maxPartScore: partEvaluation.maxPartScore,
        supportiveTier: partEvaluation.supportiveTier.tier,
        lastPracticedAt: new Date(),
      },
    });

    // บันทึก AnswerLogs ถ้าระบุ answers[] มา
    if (dto.answers && dto.answers.length > 0) {
      await this.prisma.answerLog.createMany({
        data: dto.answers.map((ans) => ({
          userId: user.id,
          questionId: ans.questionId,
          part: dto.part,
          mode: `PRACTICE_PART_${dto.part}`,
          selectedOption: ans.selectedOption.toUpperCase(),
          correctOption: ans.selectedOption.toUpperCase(),
          isCorrect: true,
          errorType: null,
          vocabId: null,
          timeSpentMs: ans.timeSpentMs ?? 0,
        })),
      });
    }

    return {
      estimate,
      partEvaluation,
      officialScoreUnchanged: user.currentEstimatedScore,
      user,
    };
  }

  /**
   * ดึงข้อมูลการคาดการณ์ความพร้อมรายพาร์ท (PartSkillEstimates) ทั้ง 7 พาร์ทของผู้เล่น
   * สำหรับนำไปแสดงผลที่ "TOEIC Readiness Forecast (คาดการณ์คะแนนแยก 7 พาร์ท)" บนหน้าแรก
   */
  async getPartSkillEstimates(userId?: string) {
    if (!userId || userId === 'guest') {
      return {
        estimates: [],
        forecastListeningTotal: 0,
        forecastReadingTotal: 0,
        totalForecastScore: 0,
      };
    }

    const estimates = await this.prisma.partSkillEstimate.findMany({
      where: { userId },
      orderBy: { part: 'asc' },
    });

    let forecastListeningTotal = 0;
    let forecastReadingTotal = 0;

    for (const est of estimates) {
      if (est.part <= 4) {
        forecastListeningTotal += est.estimatedScore;
      } else {
        forecastReadingTotal += est.estimatedScore;
      }
    }

    const totalForecastScore = forecastListeningTotal + forecastReadingTotal;

    return {
      estimates,
      forecastListeningTotal,
      forecastReadingTotal,
      totalForecastScore,
    };
  }

  /**
   * บันทึกคำตอบรายข้อสำหรับโหมดฝึกฝน Practice Drills, Boss Gauntlet, Collocation Rush
   */
  async logAnswer(dto: LogAnswerDto) {
    if (!dto.userId || dto.userId === 'guest') {
      return { logged: false, reason: 'Guest user answers are not logged' };
    }

    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
    });

    if (!question) {
      throw new BadRequestException(
        `Question with ID ${dto.questionId} not found`,
      );
    }

    const isCorrect =
      dto.selectedOption.trim().toUpperCase() ===
      question.correctOption.trim().toUpperCase();
    const errorType = isCorrect ? null : (question.errorTag ?? 'other');
    const vocabId = question.vocabId ?? null;

    const log = await this.prisma.answerLog.create({
      data: {
        userId: dto.userId,
        questionId: dto.questionId,
        part: dto.part,
        mode: dto.mode,
        selectedOption: dto.selectedOption.toUpperCase(),
        correctOption: question.correctOption,
        isCorrect,
        errorType: errorType as any,
        vocabId,
        timeSpentMs: dto.timeSpentMs ?? 0,
      },
    });

    // Task C: หากตอบผิดข้อที่มี vocabId ให้ส่งเข้าคิว Spaced Repetition อัตโนมัติ
    if (!isCorrect && vocabId) {
      await this.prisma.cardProgress.upsert({
        where: {
          userId_cardId: {
            userId: dto.userId,
            cardId: vocabId,
          },
        },
        create: {
          userId: dto.userId,
          cardId: vocabId,
          isKnown: false,
          swipeCount: 1,
          wrongCount: 1,
          dueAt: new Date(),
          intervalDays: 1.0,
          lastWrongAt: new Date(),
        },
        update: {
          isKnown: false,
          wrongCount: { increment: 1 },
          dueAt: new Date(),
          intervalDays: 1.0,
          lastWrongAt: new Date(),
        },
      });
    }

    return {
      logged: true,
      logId: log.id,
      isCorrect,
      correctOption: question.correctOption,
      explanationTh: question.explanationTh,
      errorType,
      vocabId,
    };
  }

  /**
   * ดึงรายการประวัติข้อที่ทำผิด (Error Review) สำหรับหน้า /review/errors (Task C)
   */
  async getErrorLogs(
    userId?: string,
    part?: number,
    errorType?: string,
    limit = 50,
  ) {
    if (!userId || userId === 'guest') {
      return [];
    }

    return this.prisma.answerLog.findMany({
      where: {
        userId,
        isCorrect: false,
        ...(part ? { part } : {}),
        ...(errorType && errorType !== 'ALL'
          ? { errorType: errorType as any }
          : {}),
      },
      include: {
        question: true,
        vocab: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * วิเคราะห์จุดอ่อน Weakness Dashboard (% ผิดแยก errorType & part, Top 5 จุดอ่อน) (Task C)
   */
  async getWeaknessAnalytics(userId?: string) {
    if (!userId || userId === 'guest') {
      return {
        totalAnswers: 0,
        totalCorrect: 0,
        totalWrong: 0,
        accuracyRate: 0,
        byErrorType: [],
        byPart: [],
        topWeaknesses: [],
      };
    }

    const logs = await this.prisma.answerLog.findMany({
      where: { userId },
      select: {
        isCorrect: true,
        part: true,
        errorType: true,
      },
    });

    const totalAnswers = logs.length;
    const totalCorrect = logs.filter((l) => l.isCorrect).length;
    const totalWrong = totalAnswers - totalCorrect;
    const accuracyRate =
      totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

    // คำนวณ % ผิดแยกตาม errorType
    const errorTypeCounts: Record<string, number> = {};
    const partWrongCounts: Record<number, number> = {};
    const partTotalCounts: Record<number, number> = {};

    logs.forEach((log) => {
      partTotalCounts[log.part] = (partTotalCounts[log.part] || 0) + 1;
      if (!log.isCorrect) {
        partWrongCounts[log.part] = (partWrongCounts[log.part] || 0) + 1;
        const eType = log.errorType || 'other';
        errorTypeCounts[eType] = (errorTypeCounts[eType] || 0) + 1;
      }
    });

    const byErrorType = Object.entries(errorTypeCounts)
      .map(([type, count]) => ({
        errorType: type,
        count,
        percentage:
          totalWrong > 0 ? Math.round((count / totalWrong) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const byPart = Object.keys(partTotalCounts)
      .map((pStr) => {
        const part = Number(pStr);
        const total = partTotalCounts[part] || 0;
        const wrong = partWrongCounts[part] || 0;
        const correct = total - wrong;
        return {
          part,
          total,
          correct,
          wrong,
          errorRate: total > 0 ? Math.round((wrong / total) * 100) : 0,
        };
      })
      .sort((a, b) => a.part - b.part);

    const topWeaknesses = byErrorType.slice(0, 5);

    return {
      totalAnswers,
      totalCorrect,
      totalWrong,
      accuracyRate,
      byErrorType,
      byPart,
      topWeaknesses,
    };
  }

  /**
   * ดึงประวัติการทำข้อสอบทั้งหมดของผู้เล่น
   */
  async getExamHistory(userId?: string) {
    if (!userId || userId === 'guest') {
      return [];
    }
    return this.prisma.examAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
