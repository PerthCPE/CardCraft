// ============================================================================
// questions.service.ts
// Service สำหรับจัดการคลังข้อสอบ TOEIC (Listening Part 1, 2 & Reading Part 5, 7)
// รองรับการกรองตาม section ("LISTENING" | "READING") และหมายเลข part (1, 2, 5, 7)
// รวมถึง CRUD เต็มรูปแบบสำหรับหน้า Admin Guild Manager
// ============================================================================

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ดึงรายการข้อสอบทั้งหมด หรือกรองตาม section และ part
   */
  async findAll(section?: string, part?: number) {
    return this.prisma.question.findMany({
      where: {
        ...(section && section !== 'ALL'
          ? { section: section.toUpperCase() }
          : {}),
        ...(part && !Number.isNaN(part) ? { part } : {}),
      },
      orderBy: [{ part: 'asc' }, { id: 'asc' }],
    });
  }

  /**
   * ดึงข้อสอบรายข้อตาม ID
   */
  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    return question;
  }

  /**
   * สร้างข้อสอบใหม่ พร้อมตรวจสอบเงื่อนไขของ TOEIC Part 2 (ที่มีเฉพาะตัวเลือก A, B, C)
   */
  async create(dto: CreateQuestionDto) {
    if (dto.part === 2 && dto.correctOption === 'D') {
      throw new BadRequestException(
        'TOEIC Part 2 (Question-Response) only allows options A, B, or C',
      );
    }

    return this.prisma.question.create({
      data: {
        section: dto.section,
        part: dto.part,
        audioUrl: dto.audioUrl ?? null,
        imageUrl: dto.imageUrl ?? null,
        passageText: dto.passageText ?? null,
        questionText: dto.questionText,
        optionA: dto.optionA,
        optionB: dto.optionB,
        optionC: dto.optionC,
        optionD: dto.part === 2 ? null : (dto.optionD ?? null),
        correctOption: dto.correctOption,
        explanationTh: dto.explanationTh,
        tag: dto.tag,
      },
    });
  }

  /**
   * แก้ไขข้อสอบตาม ID (Update)
   */
  async update(id: string, dto: UpdateQuestionDto) {
    const existing = await this.findOne(id);
    const targetPart = dto.part ?? existing.part;
    const targetCorrect = dto.correctOption ?? existing.correctOption;

    if (targetPart === 2 && targetCorrect === 'D') {
      throw new BadRequestException(
        'TOEIC Part 2 (Question-Response) only allows options A, B, or C',
      );
    }

    return this.prisma.question.update({
      where: { id },
      data: {
        ...dto,
        ...(targetPart === 2 ? { optionD: null } : {}),
      },
    });
  }

  /**
   * ลบข้อสอบตาม ID (Delete)
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.question.delete({
      where: { id },
    });
  }
}
