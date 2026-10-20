// ============================================================================
// create-question.dto.ts
// DTO สำหรับสร้างข้อสอบ TOEIC ใหม่ (รองรับทั้ง Listening Part 1, 2 และ Reading Part 5, 7)
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    example: 'READING',
    enum: ['LISTENING', 'READING'],
    description: 'หมวดข้อสอบ: LISTENING หรือ READING',
  })
  @IsString()
  @IsIn(['LISTENING', 'READING'])
  section: string;

  @ApiProperty({
    example: 5,
    enum: [1, 2, 5, 7],
    description: 'หมายเลขพาร์ทของ TOEIC (1, 2, 5, หรือ 7)',
  })
  @IsInt()
  @IsIn([1, 2, 5, 7])
  part: number;

  @ApiPropertyOptional({
    example: '/audio/part2-q1.mp3',
    nullable: true,
    description: 'URL ไฟล์เสียงสำหรับพาร์ท Listening (Part 1, 2)',
  })
  @IsOptional()
  @IsString()
  audioUrl?: string | null;

  @ApiPropertyOptional({
    example: '/images/toeic/part1-boardroom.svg',
    nullable: true,
    description: 'URL รูปภาพสำหรับ Part 1 Photographs',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'MEMORANDUM\nTo: All Staff...',
    nullable: true,
    description: 'บทความ/อีเมลธุรกิจสำหรับ Part 7 Reading Comprehension',
  })
  @IsOptional()
  @IsString()
  passageText?: string | null;

  @ApiProperty({
    example:
      'All laboratory personnel are required to wear ------- protective gear.',
    description: 'โจทย์คำถาม หรือ Transcript สำหรับพาร์ทการฟัง',
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({ example: 'appropriateness' })
  @IsString()
  @IsNotEmpty()
  optionA: string;

  @ApiProperty({ example: 'appropriately' })
  @IsString()
  @IsNotEmpty()
  optionB: string;

  @ApiProperty({ example: 'appropriate' })
  @IsString()
  @IsNotEmpty()
  optionC: string;

  @ApiPropertyOptional({
    example: 'appropriated',
    nullable: true,
    description: 'ตัวเลือก D (เป็น null ได้สำหรับ TOEIC Part 2 ที่มีแค่ A, B, C)',
  })
  @IsOptional()
  @IsString()
  optionD?: string | null;

  @ApiProperty({
    example: 'C',
    enum: ['A', 'B', 'C', 'D'],
    description: 'คำตอบที่ถูกต้อง (A, B, C, หรือ D)',
  })
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  correctOption: string;

  @ApiProperty({
    example:
      'ช่องว่างอยู่หน้าคำนามวลี protective gear จึงต้องใช้ Adjective คือ (C) appropriate',
    description: 'คำอธิบายเฉลยภาษาไทยอย่างละเอียด',
  })
  @IsString()
  @IsNotEmpty()
  explanationTh: string;

  @ApiProperty({
    example: 'Part 5 - Word Family',
    description: 'ป้ายกำกับหัวข้อไวยากรณ์หรือประเภทโจทย์',
  })
  @IsString()
  @IsNotEmpty()
  tag: string;
}
