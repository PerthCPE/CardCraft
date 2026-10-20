// ============================================================================
// frontend/src/utils/questions-fallback.spec.ts
// Unit Tests สำหรับตรวจสอบการกรองคำถามข้อสอบรายพาร์ทเมื่อ Backend Offline
// ============================================================================

import { fetchQuestions } from '@/lib/api';
import { TOEIC_INITIAL_QUESTIONS } from '@/data/toeic-dictionary';

describe('fetchQuestions Fallback by Part', () => {
  it('ควรส่งคืนเฉพาะข้อสอบ Part 5 เมื่อ Backend Offline หรือเกิดข้อผิดพลาด', async () => {
    const part5Questions = await fetchQuestions(undefined, 5);
    expect(part5Questions.length).toBeGreaterThan(0);
    part5Questions.forEach((q) => {
      expect(q.part).toBe(5);
      expect(q.section).toBe('READING');
    });
  });

  it('ควรส่งคืนเฉพาะข้อสอบ Part 7 เมื่อ Backend Offline หรือเกิดข้อผิดพลาด', async () => {
    const part7Questions = await fetchQuestions(undefined, 7);
    expect(part7Questions.length).toBeGreaterThan(0);
    part7Questions.forEach((q) => {
      expect(q.part).toBe(7);
      expect(q.section).toBe('READING');
    });
  });

  it('ควรส่งคืนเฉพาะข้อสอบ Part 1 และ Section LISTENING เมื่อระบุเจาะจง', async () => {
    const part1Questions = await fetchQuestions('LISTENING', 1);
    expect(part1Questions.length).toBeGreaterThan(0);
    part1Questions.forEach((q) => {
      expect(q.part).toBe(1);
      expect(q.section).toBe('LISTENING');
    });
  });
});
