// ============================================================================
// exams.controller.ts
// Controller สำหรับส่งผลสอบ Boss Battle (POST /exams/submit) และดึงประวัติการสอบ
// ============================================================================

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { LogAnswerDto, SubmitExamDto } from './dto/submit-exam.dto';
import { SubmitPracticePartDto } from './dto/submit-practice.dto';

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

  @Post('submit-practice')
  @ApiOperation({
    summary:
      'ส่งผลการฝึกซ้อมรายพาร์ท (TOEIC 7-Part Drills) เพื่อประเมินคะแนนแยกพาร์ทและให้กำลังใจ 5 ระดับ (ไม่กระทบ Hero Level)',
  })
  submitPracticePart(@Body() dto: SubmitPracticePartDto) {
    return this.examsService.submitPracticePart(dto);
  }

  @Get('part-estimates')
  @ApiOperation({
    summary:
      'ดึงคะแนนคาดการณ์ความพร้อมแยก 7 พาร์ท (Readiness Forecast) และผลรวมคะแนนคาดการณ์สำหรับหน้าแรก',
  })
  @ApiQuery({ name: 'userId', required: true })
  getPartEstimates(@Query('userId') userId?: string) {
    return this.examsService.getPartSkillEstimates(userId);
  }

  @Post('log-answer')
  @ApiOperation({
    summary:
      'บันทึกคำตอบรายข้อจาก Practice Drill, Boss Gauntlet, Collocation Rush เข้า AnswerLog',
  })
  logAnswer(@Body() dto: LogAnswerDto) {
    return this.examsService.logAnswer(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'ดึงประวัติการทำข้อสอบทั้งหมดของผู้เล่น' })
  @ApiQuery({ name: 'userId', required: false })
  getHistory(@Query('userId') userId?: string) {
    return this.examsService.getExamHistory(userId);
  }

  @Get('error-logs')
  @ApiOperation({ summary: 'ดึงประวัติข้อสอบที่ผู้เล่นเคยทำผิดสำหรับหน้า /review/errors' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'part', required: false, type: Number })
  @ApiQuery({ name: 'errorType', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getErrorLogs(
    @Query('userId') userId?: string,
    @Query('part') part?: string,
    @Query('errorType') errorType?: string,
    @Query('limit') limit?: string,
  ) {
    return this.examsService.getErrorLogs(
      userId,
      part ? parseInt(part, 10) : undefined,
      errorType,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('weakness-analytics')
  @ApiOperation({ summary: 'ดึงสถิติภาพรวมจุดอ่อน Weakness Dashboard (% ผิดแยกตามประเภทและพาร์ท, Top 5 จุดอ่อน)' })
  @ApiQuery({ name: 'userId', required: true })
  getWeaknessAnalytics(@Query('userId') userId?: string) {
    return this.examsService.getWeaknessAnalytics(userId);
  }
}
