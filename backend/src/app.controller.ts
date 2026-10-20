// ============================================================================
// backend/src/app.controller.ts
// Lightweight System & Health Controller
// - Endpoint GET /health ไม่แตะฐานข้อมูล ตอบกลับเร็วในระดับ <1ms
// - ใช้สำหรับ Warm-up Ping ปลุก Cold Start Backend บน Render/Free Tier
// ============================================================================

import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('System & Health')
@Controller()
export class AppController {
  @Get('health')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({
    summary: 'Lightweight Health Check & Warm-up Ping (ไม่แตะฐานข้อมูล)',
    description:
      'Endpoint น้ำหนักเบาพิเศษสำหรับตรวจสอบสถานะเซิร์ฟเวอร์ และใช้สำหรับ Warm-up ปลุก Backend จากสถานะ Sleep บน Free Tier โดยไม่โหลด Database',
  })
  @ApiResponse({
    status: 200,
    description: 'Server is healthy and ready',
    schema: {
      example: {
        status: 'ok',
        uptime: 12.34,
        timestamp: '2026-10-21T00:00:00.000Z',
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
