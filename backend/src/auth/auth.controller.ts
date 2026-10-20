// ============================================================================
// auth.controller.ts
// Endpoints สำหรับ Register และ Login (Username + Password)
// ============================================================================

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication (Simple Login/Register)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'สมัครสมาชิกผู้เล่นใหม่ (แยกสถิติและ Progress เฉพาะตัว)',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'เข้าสู่ระบบด้วย Username และ Password',
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiOperation({
    summary: 'ดึงข้อมูลผู้เล่นปัจจุบันตาม ID',
  })
  @ApiQuery({ name: 'userId', required: true, example: 'demo-hero-1' })
  async getMe(@Query('userId') userId: string) {
    return this.authService.getMe(userId);
  }
}
