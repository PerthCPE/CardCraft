// ============================================================================
// backend/src/questions/dto/query-question.dto.ts
// DTO สำหรับ Query Parameters ในการดึงคลังข้อสอบ (GET /questions)
// ============================================================================

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryQuestionDto {
  @ApiPropertyOptional({
    description: 'Timestamp สำหรับ Cache-Busting (เฉพาะ Admin หรือการดึงข้อมูลสด)',
  })
  @IsOptional()
  @IsString()
  _t?: string;

  @ApiPropertyOptional({
    description: 'กรองตาม Section ของข้อสอบ (LISTENING หรือ READING)',
    enum: ['LISTENING', 'READING', 'ALL'],
  })
  @IsOptional()
  @IsEnum(['LISTENING', 'READING', 'ALL'], {
    message: 'section ต้องเป็น LISTENING, READING หรือ ALL',
  })
  section?: string;

  @ApiPropertyOptional({
    description: 'กรองตามหมายเลข Part ของข้อสอบ TOEIC (1 ถึง 7)',
    minimum: 1,
    maximum: 7,
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'part ต้องเป็นจำนวนเต็มระหว่าง 1 ถึง 7' })
  @Min(1, { message: 'part ต้องมีค่าตั้งแต่ 1 ขึ้นไป' })
  @Max(7, { message: 'part ต้องมีค่าไม่เกิน 7' })
  part?: number;
}
