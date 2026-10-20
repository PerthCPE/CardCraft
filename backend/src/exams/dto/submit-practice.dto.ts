// ============================================================================
// submit-practice.dto.ts
// DTO สำหรับส่งผลการฝึกซ้อมรายพาร์ท (TOEIC 7-Part Drills)
// บังคับ Validation Constraint:
// - questionCount ขั้นต่ำ 15 ข้อ (@Min(15))
// - timeLimitSeconds ขั้นต่ำ 5 นาที หรือ 300 วินาที (@Min(300))
// - ไม่กระทบ official currentEstimatedScore หรือ Character Evolution
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ExamAnswerItemDto } from './submit-exam.dto';

export class PracticeConfigDto {
  @ApiProperty({ example: 1, description: 'พาร์ทข้อสอบ 1 ถึง 7' })
  @IsInt()
  @Min(1)
  @Max(7)
  part: number;

  @ApiProperty({
    example: 15,
    description: 'จำนวนข้อสอบที่ต้องการฝึก (ขั้นต่ำ 15 ข้อ)',
    minimum: 15,
  })
  @IsInt()
  @Min(15, { message: 'จำนวนข้อสอบในการฝึกรายพาร์ทต้องไม่ต่ำกว่า 15 ข้อ (min = 15)' })
  questionCount: number;

  @ApiProperty({
    example: 900,
    description: 'เวลาจำกัดในการทำโจทย์ (วินาที, ขั้นต่ำ 5 นาที = 300 วินาที)',
    minimum: 300,
  })
  @IsInt()
  @Min(300, { message: 'เวลาในการฝึกรายพาร์ทต้องไม่ต่ำกว่า 5 นาที หรือ 300 วินาที (min = 300)' })
  timeLimitSeconds: number;
}

export class SubmitPracticePartDto {
  @ApiProperty({ example: 'user-uuid', description: 'รหัสประจำตัวผู้เล่น' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 5, description: 'พาร์ทข้อสอบ 1 ถึง 7' })
  @IsInt()
  @Min(1)
  @Max(7)
  part: number;

  @ApiProperty({
    example: 15,
    description: 'จำนวนข้อทั้งหมดในการฝึกซ้อมรอบนี้ (ขั้นต่ำ 15 ข้อ)',
    minimum: 15,
  })
  @IsInt()
  @Min(15, { message: 'จำนวนข้อสอบในการฝึกรายพาร์ทต้องไม่ต่ำกว่า 15 ข้อ (min = 15)' })
  totalQuestions: number;

  @ApiProperty({
    example: 12,
    description: 'จำนวนข้อที่ตอบถูกต้อง',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  correctAnswers: number;

  @ApiProperty({
    example: 900,
    description: 'เวลาที่ตั้งไว้จำกัด (วินาที, ขั้นต่ำ 5 นาที = 300 วินาที)',
    minimum: 300,
  })
  @IsInt()
  @Min(300, { message: 'เวลาในการฝึกรายพาร์ทต้องไม่ต่ำกว่า 5 นาที หรือ 300 วินาที (min = 300)' })
  timeLimitSeconds: number;

  @ApiProperty({
    example: 450,
    description: 'เวลาจริงที่ใช้ในการฝึกทำโจทย์ (วินาที)',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  timeSpentSeconds: number;

  @ApiPropertyOptional({
    type: [ExamAnswerItemDto],
    description: 'รายการคำตอบรายข้อเพื่อจัดเก็บใน AnswerLog',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamAnswerItemDto)
  answers?: ExamAnswerItemDto[];
}
