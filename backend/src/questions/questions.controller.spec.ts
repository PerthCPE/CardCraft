// ============================================================================
// backend/src/questions/questions.controller.spec.ts
// Unit Tests สำหรับตรวจสอบ Validation ของ Query Parameters ใน /questions
// ============================================================================

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryQuestionDto } from './dto/query-question.dto';

describe('QueryQuestionDto Validation', () => {
  it('ควรผ่านการตรวจสอบเมื่อระบุ part เป็นจำนวนเต็ม 1 ถึง 7', async () => {
    for (let p = 1; p <= 7; p++) {
      const dto = plainToInstance(QueryQuestionDto, { part: String(p) });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.part).toBe(p);
    }
  });

  it('ควรล้มเหลว (เกิด Validation Error / HTTP 400) เมื่อ part=9 (เกินขอบเขต 7)', async () => {
    const dto = plainToInstance(QueryQuestionDto, { part: '9' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('max');
  });

  it('ควรล้มเหลว (เกิด Validation Error / HTTP 400) เมื่อ part=0 (ต่ำกว่าขอบเขต 1)', async () => {
    const dto = plainToInstance(QueryQuestionDto, { part: '0' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('ควรล้มเหลว (เกิด Validation Error / HTTP 400) เมื่อ part=abc (ไม่ใช่ตัวเลข)', async () => {
    const dto = plainToInstance(QueryQuestionDto, { part: 'abc' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('ควรผ่านการตรวจสอบเมื่อมี _t สำหรับ cache busting (เช่น ?part=5&_t=123)', async () => {
    const dto = plainToInstance(QueryQuestionDto, { part: '5', _t: '123' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.part).toBe(5);
    expect(dto._t).toBe('123');
  });

  it('ควรล้มเหลวเมื่อ section ไม่ใช่ LISTENING, READING หรือ ALL', async () => {
    const dto = plainToInstance(QueryQuestionDto, { section: 'SPEAKING' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });
});
