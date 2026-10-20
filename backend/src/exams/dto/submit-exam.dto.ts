// ============================================================================
// submit-exam.dto.ts
// DTO สำหรับส่งกระดาษคำตอบ Boss Battle (Mini Mock Test) หรือ Practice Drills
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

  @ApiProperty({ example: 'B', enum: ['A', 'B', 'C', 'D'] })
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  selectedOption: string;
}

export class SubmitExamDto {
  @ApiPropertyOptional({
    example: 'demo-hero-1',
    description: 'รหัสผู้เล่น (ค่าเริ่มต้นคือ demo-hero-1)',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    example: 'MINI_MOCK',
    enum: ['MINI_MOCK', 'LISTENING_DRILL', 'READING_DRILL'],
    description: 'โหมดการสอบ',
  })
  @IsString()
  @IsIn(['MINI_MOCK', 'LISTENING_DRILL', 'READING_DRILL'])
  mode: 'MINI_MOCK' | 'LISTENING_DRILL' | 'READING_DRILL';

  @ApiProperty({
    example: 6,
    minimum: 0,
    description: 'จำนวนข้อพาร์ท Listening ที่ตอบถูก',
  })
  @IsInt()
  @Min(0)
  listeningCorrect: number;

  @ApiPropertyOptional({
    example: 7,
    minimum: 0,
    description: 'จำนวนข้อพาร์ท Listening ทั้งหมดในชุดข้อสอบ',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  listeningTotal?: number;

  @ApiProperty({
    example: 6,
    minimum: 0,
    description: 'จำนวนข้อพาร์ท Reading ที่ตอบถูก',
  })
  @IsInt()
  @Min(0)
  readingCorrect: number;

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
    description: 'รายการคำตอบรายข้อ (ตัวเลือกเสริมสำหรับตรวจเฉลยละเอียด)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamAnswerItemDto)
  answers?: ExamAnswerItemDto[];
}
