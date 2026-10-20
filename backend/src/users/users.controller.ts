// ============================================================================
// users.controller.ts
// เปรียบเทียบกับ Go (Gin):
// - `@Controller('users')` เทียบเท่ากับ `usersGroup := router.Group("/users")`
// - `@Get('dashboard')` เทียบเท่ากับ `usersGroup.GET("/dashboard", handler.GetDashboard)`
// - `@Query('userId')` เทียบเท่ากับ `c.DefaultQuery("userId", "demo-hero-1")`
// ============================================================================

import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DEFAULT_DEMO_USER_ID, UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users & Hero Dashboard')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  @ApiOperation({
    summary:
      'ดึงข้อมูล Hero HUD, 7-Stage Evolution Roadmap, สถิติการ์ดคำศัพท์ และประวัติการสอบ',
  })
  @ApiQuery({ name: 'userId', required: false, example: DEFAULT_DEMO_USER_ID })
  async getDashboard(@Query('userId') userId?: string) {
    return this.usersService.getDashboardSummary(
      userId || DEFAULT_DEMO_USER_ID,
    );
  }

  @Patch('profile')
  @ApiOperation({
    summary:
      'อัปเดตชื่อ Hero, เป้าหมายคะแนน (Target Score) หรือจำลองปรับคะแนนประเมิน (Current Score)',
  })
  @ApiQuery({ name: 'userId', required: false, example: DEFAULT_DEMO_USER_ID })
  async updateProfile(
    @Query('userId') userId: string | undefined,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId || DEFAULT_DEMO_USER_ID, dto);
  }
}
