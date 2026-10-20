// ============================================================================
// swipe-flashcard.dto.ts
// DTO สำหรับบันทึกผลการปัดการ์ดคำศัพท์ (Right Swipe = Mastered, Left Swipe = Still Learning)
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SwipeFlashcardDto {
  @ApiProperty({
    example: true,
    description:
      'true = ปัดขวา (จำได้แล้ว / Mastered), false = ปัดซ้าย (ยังจำไม่ได้ / Still Learning)',
  })
  @IsBoolean()
  isKnown: boolean;

  @ApiPropertyOptional({
    example: 'demo-hero-1',
    description: 'รหัสผู้เล่น (ค่าเริ่มต้นคือ demo-hero-1)',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
