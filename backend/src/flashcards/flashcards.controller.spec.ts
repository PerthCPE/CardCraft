// ============================================================================
// backend/src/flashcards/flashcards.controller.spec.ts
// Unit Tests สำหรับตรวจสอบ Cache-Control Header ของ GET /flashcards
// ============================================================================

import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { Response } from 'express';

describe('FlashcardsController Cache-Control', () => {
  let controller: FlashcardsController;
  let service: Partial<FlashcardsService>;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
    };
    controller = new FlashcardsController(service as FlashcardsService);
  });

  it('ควรตั้งค่า Cache-Control เป็น public เมื่อไม่มี userId (โหมดทั่วไป/Guest)', async () => {
    const mockRes = {
      setHeader: jest.fn(),
    } as unknown as Response;

    await controller.findAll(mockRes, {});

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600',
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith('Vary', 'Origin');
  });

  it('ควรตั้งค่า Cache-Control เป็น public เมื่อ userId="guest"', async () => {
    const mockRes = {
      setHeader: jest.fn(),
    } as unknown as Response;

    await controller.findAll(mockRes, { userId: 'guest' });

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600',
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith('Vary', 'Origin');
  });

  it('ควรตั้งค่า Cache-Control เป็น private, no-store เมื่อระบุ userId ของผู้ใช้จริง (ห้ามแคชข้อมูลรายบุคคล)', async () => {
    const mockRes = {
      setHeader: jest.fn(),
    } as unknown as Response;

    await controller.findAll(mockRes, { userId: 'user-uuid-123' });

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate',
    );
  });

  it('ควรผ่านการตรวจสอบและตอบ 200 เมื่อส่ง _t สำหรับ cache-busting (เช่น /flashcards?_t=123)', async () => {
    const mockRes = {
      setHeader: jest.fn(),
    } as unknown as Response;

    const result = await controller.findAll(mockRes, { _t: '123' });
    expect(result).toBeDefined();
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600',
    );
  });
});
