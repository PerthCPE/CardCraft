// ============================================================================
// users.controller.ts
// CardCraft Release v1.0: Endpoints สำหรับ Hero Dashboard & Profile
// ============================================================================

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users & Hero Dashboard')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  @ApiOperation({
    summary:
      'ดึงข้อมูล Hero HUD, 7-Stage Evolution Roadmap, สถิติการ์ดคำศัพท์ และประวัติการสอบ (รองรับ Guest)',
  })
  @ApiQuery({ name: 'userId', required: false })
  async getDashboard(@Query('userId') userId?: string) {
    return this.usersService.getDashboardSummary(userId);
  }

  @Patch('profile')
  @ApiOperation({
    summary:
      'อัปเดตชื่อ Hero, เป้าหมายคะแนน (Target Score) หรือปรับคะแนนประเมิน (Current Score)',
  })
  @ApiQuery({ name: 'userId', required: true })
  async updateProfile(
    @Query('userId') userId: string | undefined,
    @Body() dto: UpdateUserDto,
  ) {
    if (!userId) {
      throw new BadRequestException('ต้องระบุ userId เพื่ออัปเดตโปรไฟล์');
    }
    return this.usersService.updateProfile(userId, dto);
  }
}
