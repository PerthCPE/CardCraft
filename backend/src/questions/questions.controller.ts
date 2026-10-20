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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QueryQuestionDto } from './dto/query-question.dto';

@ApiTags('Questions (TOEIC Bank & CRUD)')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({
    summary:
      'ดึงคลังข้อสอบ TOEIC ทั้งหมด หรือกรองตาม section (LISTENING/READING) และ part (1 ถึง 7)',
  })
  findAll(@Query() query: QueryQuestionDto) {
    return this.questionsService.findAll(query.section, query.part);
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
