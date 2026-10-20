// ============================================================================
// backend/src/app.controller.spec.ts
// Unit Tests สำหรับตรวจสอบ Health Check & Warm-up Endpoint (GET /health)
// ============================================================================

import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  describe('getHealth', () => {
    it('ควรส่งคืน status: ok พร้อม uptime และ timestamp โดยไม่เรียก Database', () => {
      const res = controller.getHealth();
      expect(res.status).toBe('ok');
      expect(typeof res.uptime).toBe('number');
      expect(res.uptime).toBeGreaterThanOrEqual(0);
      expect(typeof res.timestamp).toBe('string');
      expect(new Date(res.timestamp).getTime()).not.toBeNaN();
    });
  });
});
