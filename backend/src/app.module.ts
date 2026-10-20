// ============================================================================
// app.module.ts
// เปรียบเทียบกับ Go (Gin):
// - ใน Go เรามักเอาทุก Domain Package (users, flashcards, questions, exams)
//   มาผูกเข้าด้วยกันใน `main.go` หรือ `router.go`
// - ใน NestJS เราใช้ `AppModule` เป็น Root Module ที่รวม Feature Modules ย่อยทั้งหมดเข้าด้วยกัน
// ============================================================================

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { QuestionsModule } from './questions/questions.module';
import { ExamsModule } from './exams/exams.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    FlashcardsModule,
    QuestionsModule,
    ExamsModule,
    AuthModule,
  ],
})
export class AppModule {}
