// ============================================================================
// prisma.module.ts
// เปรียบเทียบกับ Go:
// การติด `@Global()` ทำให้ทุก Module อื่นๆ (เช่น FlashcardsModule, QuestionsModule, ExamsModule)
// สามารถขอรับ `PrismaService` ผ่าน Constructor ได้เลย โดยไม่ต้องคอย import PrismaModule ซ้ำทุกไฟล์
// ============================================================================

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
