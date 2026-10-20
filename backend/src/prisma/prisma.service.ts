// ============================================================================
// prisma.service.ts
// เปรียบเทียบกับ Go (Gin + GORM / sqlx):
// - ใน Go เรามักสร้างฟังก์ชัน `InitDB() *gorm.DB` ใน `main.go` แล้วทำ `defer sqlDB.Close()`
// - ใน NestJS เราห่อ `PrismaClient` ไว้ใน Class ที่ติด Decorator `@Injectable()`
//   เพื่อให้ระบบ Dependency Injection (DI Container) จัดการสร้าง Singleton Instance ให้โดยอัตโนมัติ
// - `OnModuleInit` เทียบเท่าการเรียก `db.Ping()` ตอนเริ่มรันเซิร์ฟเวอร์
// - `OnModuleDestroy` เทียบเท่า `defer db.Close()` ตอน Graceful Shutdown
// ============================================================================

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
