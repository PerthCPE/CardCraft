// ============================================================================
// submit-exam.dto.ts
// DTO สำหรับส่งกระดาษคำตอบ Boss Battle (Mini Mock / Full Mock) และ Practice Drills
// รองรับการส่งคำตอบรายข้อ answers[] (Task A) พร้อมคง Backward Compatibility
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ExamAnswerItemDto {
  @ApiProperty({ example: 'q-list-p1-01' })
  @IsString()
  questionId: string;

  @ApiPropertyOptional({ example: 1, description: 'พาร์ทของข้อสอบ 1, 2, 3, 4, 5, 6, 7' })
  @IsOptional()
  @IsInt()
  part?: number;

  @ApiProperty({ example: 'B', enum: ['A', 'B', 'C', 'D'] })
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  selectedOption: string;

  @ApiPropertyOptional({ example: false, description: 'สถานะการปักธงข้อนี้' })
  @IsOptional()
  flagged?: boolean;

  @ApiPropertyOptional({ example: 4500, description: 'เวลาที่ใช้ทำข้อนี้ (มิลลิวินาที)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentMs?: number;
}

export class SubmitExamDto {
  @ApiPropertyOptional({
    example: 'demo-hero-1',
    description: 'รหัสผู้เล่น',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    example: 'MINI_MOCK',
    description: 'โหมดการสอบ',
  })
  @IsString()
  mode: string;

  @ApiPropertyOptional({
    example: 6,
    minimum: 0,
    description: 'จำนวนข้อพาร์ท Listening ที่ตอบถูก (สำหรับ Backward Compatibility)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  listeningCorrect?: number;

  @ApiPropertyOptional({
    example: 7,
    minimum: 0,
    description: 'จำนวนข้อพาร์ท Listening ทั้งหมดในชุดข้อสอบ',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  listeningTotal?: number;

  @ApiPropertyOptional({
    example: 6,
    minimum: 0,
    description: 'จำนวนข้อพาร์ท Reading ที่ตอบถูก (สำหรับ Backward Compatibility)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readingCorrect?: number;

  @ApiPropertyOptional({
    example: 8,
    minimum: 0,
    description: 'จำนวนข้อพาร์ท Reading ทั้งหมดในชุดข้อสอบ',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readingTotal?: number;

  @ApiProperty({
    example: 640,
    minimum: 0,
    description: 'เวลาที่ใช้ทำข้อสอบทั้งหมด (วินาที)',
  })
  @IsInt()
  @Min(0)
  timeSpentSeconds: number;

  @ApiPropertyOptional({
    type: [ExamAnswerItemDto],
    description: 'รายการคำตอบรายข้อ ส่งให้ Backend ตรวจเองจากฐานข้อมูล (Task A)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamAnswerItemDto)
  answers?: ExamAnswerItemDto[];
}

export class LogAnswerDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'q-read-p5-01' })
  @IsString()
  questionId: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  part: number;

  @ApiProperty({ example: 'READING_DRILL' })
  @IsString()
  mode: string;

  @ApiProperty({ example: 'B', enum: ['A', 'B', 'C', 'D'] })
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  selectedOption: string;

  @ApiPropertyOptional({ example: 5000, description: 'เวลาที่ใช้ทำข้อนี้ (มิลลิวินาที)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentMs?: number;
}
