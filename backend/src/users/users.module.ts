// ============================================================================
// users.module.ts
// เปรียบเทียบกับ Go:
// เทียบเท่ากับการ Wire Dependency ของ UserHandler และ UserService เข้าด้วยกันในแพ็กเกจ `users`
// และ `exports: [UsersService]` เพื่อให้ Module อื่น (เช่น ExamsModule) เรียกใช้งานได้
// ============================================================================

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
