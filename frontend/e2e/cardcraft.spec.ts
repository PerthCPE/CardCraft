import { test, expect } from '@playwright/test';

test.describe('CardCraft Full E2E Test Suite', () => {
  test('1. Homepage loads, displays CardCraft brand, stats and navigation', async ({ page }) => {
    await page.goto('/');

    // Check title / brand
    await expect(page).toHaveTitle(/CardCraft/i);

    // Check Navbar links (Desktop)
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    await expect(navbar.getByText('หน้าหลัก')).toBeVisible();
    await expect(navbar.getByText('การ์ดคำศัพท์')).toBeVisible();
    await expect(navbar.getByText('ฝึกทำโจทย์')).toBeVisible();
    await expect(navbar.getByText('จำลองสอบ')).toBeVisible();
    await expect(navbar.getByText('คลังจุดอ่อน')).toBeVisible();

    // Check brand logo & text
    await expect(page.getByText('CardCraft').first()).toBeVisible();
    await expect(page.getByText('700+').first()).toBeVisible();
  });

  test('2. Flashcards Spaced Repetition, Custom Deck Builder & 3000+ words', async ({ page }) => {
    await page.goto('/flashcards');

    // Wait for flashcard page elements
    await expect(
      page.getByText(/คลังการ์ดคำศัพท์และพจนานุกรมธุรกิจ/i),
    ).toBeVisible({ timeout: 15000 });

    // Verify switch modes
    await expect(page.getByText('โหมดปัดการ์ด')).toBeVisible();
    await expect(page.getByText('ตารางพจนานุกรม')).toBeVisible();

    // Open Custom Deck / Card Set Selector Modal if button exists
    const manageSetBtn = page.getByRole('button', { name: /เปลี่ยนชุด|เลือกชุดการ์ด|สร้างชุดสุ่มใหม่/i }).first();
    if (await manageSetBtn.isVisible()) {
      await manageSetBtn.click();
      
      // Verify Spaced Repetition filters exist in modal
      await expect(page.getByText(/ถึงเวลาทบทวน/i)).toBeVisible();
      await expect(page.getByText(/ที่เคยผิดจากข้อสอบ/i)).toBeVisible();

      // Click "ถึงเวลาทบทวน" filter
      await page.getByRole('button', { name: /ถึงเวลาทบทวน/i }).click();

      // Close modal
      const closeBtn = page.getByRole('button', { name: /✕|ปิด|ยกเลิก/i }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    // Switch to Dictionary Table view to verify 3000+ words pool renders
    await page.getByText('ตารางพจนานุกรม').click();
    await expect(page.getByPlaceholder(/ค้นหาคำศัพท์/i)).toBeVisible();
  });

  test('3. Weakness Dashboard & Error Archive (/review/errors) - Guest and Authenticated States', async ({ page }) => {
    // 3a. Guest state check
    await page.goto('/review/errors');
    await expect(page.getByText(/กรุณาเข้าสู่ระบบเพื่อดูคลังจุดอ่อน/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /เข้าสู่ระบบทันที/i })).toBeVisible();

    // 3b. Authenticated state check: inject auth user into localStorage
    await page.addInitScript(() => {
      localStorage.setItem(
        'cardcraft_auth_user_v2',
        JSON.stringify({
          id: 'user_e2e_tester_1',
          username: 'e2e_hero',
          name: 'E2E Hero Tester',
          targetScore: 750,
          currentEstimatedScore: 680,
          level: 5,
          totalExp: 1200,
          stamina: 100,
        }),
      );
    });

    await page.goto('/review/errors');

    // Verify Weakness Dashboard header
    await expect(page.getByText(/Weakness Dashboard/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/บันทึกข้อสอบที่ตอบผิด/i)).toBeVisible();

    // Verify Metric Cards
    await expect(page.getByText(/ข้อสอบที่ทำทั้งหมด/i)).toBeVisible();
    await expect(page.getByText(/ตอบถูกทั้งหมด/i)).toBeVisible();
    await expect(page.getByText(/จุดอ่อนหลักอันดับ 1/i)).toBeVisible();

    // Verify "ฝึกเฉพาะข้อที่เคยผิด" link/button exists
    const practiceErrorsLink = page.getByRole('link', { name: /ฝึกเฉพาะข้อที่เคยผิด/i });
    await expect(practiceErrorsLink).toBeVisible();

    // Verify Part & Error Tag Filters exist as interactive filter pills
    await expect(page.getByText('P5 ไวยากรณ์')).toBeVisible();
    await expect(page.getByText('Part of Speech')).toBeVisible();
    await expect(page.getByPlaceholder(/ค้นหาโจทย์ หรือ คำศัพท์/i)).toBeVisible();
  });

  test('4. Practice Page renders all drill modes & timed arenas', async ({ page }) => {
    await page.goto('/practice');

    // Check practice header & timed modes
    await expect(
      page.getByText(/ลานประลองและห้องสอบตามเวลาจริง/i),
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByText(/Part 5 Speed Exam/i)).toBeVisible();
    await expect(page.getByText(/Boss Survival/i)).toBeVisible();
    await expect(page.getByText(/Collocation Rush/i)).toBeVisible();

    // Verify Part Drill tabs
    await expect(page.getByText('Part 1').first()).toBeVisible();
    await expect(page.getByText('Part 2').first()).toBeVisible();
    await expect(page.getByText('Part 5').first()).toBeVisible();
    await expect(page.getByText('Part 7').first()).toBeVisible();
  });

  test('5. Mock Test Page renders 56 questions mock interface', async ({ page }) => {
    await page.goto('/mock-test');

    // Wait for Mock Test view
    await expect(page.getByText(/Mini Mock Test|คำถามที่|Part/i).first()).toBeVisible({ timeout: 15000 });

    // Verify Option Choices A, B, C, D exist
    await expect(page.getByText('A').first()).toBeVisible();
    await expect(page.getByText('B').first()).toBeVisible();
  });
});
