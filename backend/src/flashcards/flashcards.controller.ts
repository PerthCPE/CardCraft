// ============================================================================
// flashcards.controller.ts
// เปรียบเทียบกับ Go (Gin):
// - `@Get()`        -> `r.GET("/flashcards", ...)`
// - `@Get(':id')`   -> `r.GET("/flashcards/:id", ...)`
// - `@Post()`       -> `r.POST("/flashcards", ...)`
// - `@Patch(':id')` -> `r.PATCH("/flashcards/:id", ...)`
// - `@Delete(':id')`-> `r.DELETE("/flashcards/:id", ...)`
// - `@Post(':id/swipe')` -> `r.POST("/flashcards/:id/swipe", ...)`
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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { SwipeFlashcardDto } from './dto/swipe-flashcard.dto';
import { QueryFlashcardDto } from './dto/query-flashcard.dto';

@ApiTags('Flashcards (Spell Deck & CRUD)')
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Get()
  @ApiOperation({
    summary: 'ดึงการ์ดคำศัพท์ทั้งหมด พร้อมสถานะ Mastered/Learning และ Spaced Repetition',
  })
  findAll(
    @Res({ passthrough: true }) res: Response,
    @Query() query: QueryFlashcardDto,
  ) {
    res.setHeader('Vary', 'Origin');
    if (!query.userId || query.userId === 'guest') {
      res.setHeader(
        'Cache-Control',
        'public, max-age=300, stale-while-revalidate=600',
      );
    } else {
      res.setHeader(
        'Cache-Control',
        'private, no-cache, no-store, must-revalidate',
      );
    }
    return this.flashcardsService.findAll(query.category, query.userId, query.filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดึงข้อมูลการ์ดคำศัพท์รายใบตาม ID' })
  findOne(@Param('id') id: string) {
    return this.flashcardsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'สร้างการ์ดคำศัพท์ใหม่ (Admin Guild CRUD)' })
  create(@Body() dto: CreateFlashcardDto) {
    return this.flashcardsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขข้อมูลการ์ดคำศัพท์ (Admin Guild CRUD)' })
  update(@Param('id') id: string, @Body() dto: UpdateFlashcardDto) {
    return this.flashcardsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบการ์ดคำศัพท์ (Admin Guild CRUD)' })
  remove(@Param('id') id: string) {
    return this.flashcardsService.remove(id);
  }

  @Post(':id/swipe')
  @ApiOperation({
    summary:
      'บันทึกผลการปัดการ์ดคำศัพท์ (Right Swipe = Mastered, Left Swipe = Still Learning)',
  })
  recordSwipe(@Param('id') id: string, @Body() dto: SwipeFlashcardDto) {
    return this.flashcardsService.recordSwipe(id, dto);
  }
}
