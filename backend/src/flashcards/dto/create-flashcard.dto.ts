// ============================================================================
// create-flashcard.dto.ts
// DTO สำหรับสร้างการ์ดคำศัพท์ใหม่ (ใช้ในหน้า Admin Guild CRUD Manager)
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateFlashcardDto {
  @ApiProperty({ example: 'Stipulate', description: 'คำศัพท์ภาษาอังกฤษ' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({ example: 'v.', description: 'ชนิดของคำ (n., v., adj., adv.)' })
  @IsString()
  @IsNotEmpty()
  partOfSpeech: string;

  @ApiProperty({
    example: 'ระบุเงื่อนไขอย่างชัดเจน (ในสัญญาหรือข้อตกลง)',
    description: 'ความหมายภาษาไทย',
  })
  @IsString()
  @IsNotEmpty()
  meaningTh: string;

  @ApiProperty({
    example:
      'The service agreement clearly stipulates that all invoices must be settled within thirty days.',
    description: 'ประโยคตัวอย่างแนวข้อสอบ TOEIC',
  })
  @IsString()
  @IsNotEmpty()
  exampleEn: string;

  @ApiProperty({
    example: 'Contracts',
    description: 'หมวดหมู่คำศัพท์ธุรกิจ (Contracts, Marketing, Finance, ฯลฯ)',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 5,
    description: 'ระดับความยาก Mana Cost (1-5)',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  manaCost: number;
}
