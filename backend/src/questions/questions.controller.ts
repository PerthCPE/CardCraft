// ============================================================================
// questions.controller.ts
// Controller สำหรับจัดการคลังข้อสอบ TOEIC (Listening Part 1, 2 & Reading Part 5, 7)
// ============================================================================

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@ApiTags('Questions (TOEIC Bank & CRUD)')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({
    summary:
      'ดึงคลังข้อสอบ TOEIC ทั้งหมด หรือกรองตาม section (LISTENING/READING) และ part (1, 2, 5, 7)',
  })
  @ApiQuery({
    name: 'section',
    required: false,
    enum: ['LISTENING', 'READING'],
  })
  @ApiQuery({ name: 'part', required: false, example: 5 })
  findAll(@Query('section') section?: string, @Query('part') part?: string) {
    const parsedPart = part ? parseInt(part, 10) : undefined;
    return this.questionsService.findAll(section, parsedPart);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดึงข้อมูลข้อสอบรายข้อตาม ID' })
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'เพิ่มข้อสอบ TOEIC ใหม่ (Admin Guild CRUD)' })
  create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขข้อสอบ TOEIC (Admin Guild CRUD)' })
  update(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบข้อสอบ TOEIC (Admin Guild CRUD)' })
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
