// ============================================================================
// exams.controller.ts
// Controller สำหรับส่งผลสอบ Boss Battle (POST /exams/submit) และดึงประวัติการสอบ
// ============================================================================

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { DEFAULT_DEMO_USER_ID } from '../users/users.service';

@ApiTags('Exams (Boss Battle & Score Evaluation)')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post('submit')
  @ApiOperation({
    summary:
      'ส่งผลสอบเพื่อคำนวณคะแนนสเกล TOEIC (10-990), อัปเดต Hero Tier (1-7) และวิเคราะห์เป้าหมาย 700+',
  })
  submitExam(@Body() dto: SubmitExamDto) {
    return this.examsService.submitExam(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'ดึงประวัติการทำข้อสอบทั้งหมดของผู้เล่น' })
  @ApiQuery({ name: 'userId', required: false, example: DEFAULT_DEMO_USER_ID })
  getHistory(@Query('userId') userId?: string) {
    return this.examsService.getExamHistory(userId || DEFAULT_DEMO_USER_ID);
  }
}
