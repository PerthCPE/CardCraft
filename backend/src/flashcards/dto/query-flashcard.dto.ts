// ============================================================================
// backend/src/flashcards/dto/query-flashcard.dto.ts
// DTO สำหรับ Query Parameters ในการดึงการ์ดคำศัพท์ (GET /flashcards)
// ============================================================================

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryFlashcardDto {
  @ApiPropertyOptional({
    description: 'หมวดหมู่คำศัพท์ (เช่น Contracts, Marketing, Finance, Logistics หรือ ALL)',
    example: 'Contracts',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'รหัสผู้ใช้เพื่อดึงความคืบหน้ารายบุคคล (เว้นว่างหรือ guest สำหรับโหมดทั่วไป)',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'ตัวกรองสถานะ: DUE | EXAM_WRONG | MASTERED | LEARNING | ALL',
    example: 'ALL',
  })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiPropertyOptional({
    description: 'Timestamp สำหรับ Cache-Busting (เฉพาะ Admin หรือการดึงข้อมูลสด)',
  })
  @IsOptional()
  @IsString()
  _t?: string;
}
