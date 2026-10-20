// ============================================================================
// update-flashcard.dto.ts
// PartialType จาก @nestjs/swagger ช่วยแปลงทุกฟิลด์ใน CreateFlashcardDto ให้เป็น Optional
// เปรียบเทียบกับ Go: ไม่ต้องประกาศ Struct แยกใหม่ที่มี Pointer (*string, *int) ซ้ำซ้อน
// ============================================================================

import { PartialType } from '@nestjs/swagger';
import { CreateFlashcardDto } from './create-flashcard.dto';

export class UpdateFlashcardDto extends PartialType(CreateFlashcardDto) {}
