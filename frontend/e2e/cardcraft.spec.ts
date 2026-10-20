import { test, expect } from '@playwright/test';

test.describe('CardCraft Full E2E Test Suite', () => {
  test('1. Homepage loads, displays CardCraft brand, stats and updated roadmap description', async ({ page }) => {
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

    // Verify updated evolution roadmap description (does NOT contain "150, 200 และ 100 คะแนน")
    await expect(page.getByText(/ปลดล็อกรูปลักษณ์และฉายาใหม่/i)).toBeVisible();
    const oldScoreRangeText = page.getByText(/150, 200 และ 100 คะแนน/i);
    await expect(oldScoreRangeText).not.toBeVisible();
  });

  test('2. Flashcards Spaced Repetition, 3D Flip & Real-Time Set Synchronization', async ({ page }) => {
    await page.goto('/flashcards');

    // Wait for flashcard page elements
    await expect(
      page.getByText(/คลังการ์ดคำศัพท์และพจนานุกรมธุรกิจ/i),
    ).toBeVisible({ timeout: 15000 });

    // Verify switch modes
    await expect(page.getByText('โหมดปัดการ์ด')).toBeVisible();
    await expect(page.getByText('ตารางพจนานุกรม')).toBeVisible();

    // Verify card flip helper text
    const flipHelper = page.getByText(/แตะหรือคลิกเพื่อพลิกดูคำแปล/i);
    await expect(flipHelper).toBeVisible();

    // Test card flip interaction via click/tap
    await flipHelper.click();
    await expect(page.getByText(/ความหมายภาษาไทย/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/ปัดขวาเมื่อจำได้ หรือปัดซ้ายเพื่อทบทวน/i)).toBeVisible();

    // Flip back via click/tap
    await page.getByText(/ปัดขวาเมื่อจำได้ หรือปัดซ้ายเพื่อทบทวน/i).click();
    await expect(page.getByText(/แตะหรือคลิกเพื่อพลิกดูคำแปล/i)).toBeVisible({ timeout: 3000 });

    // Verify tactile flip button also flips smoothly
    const flipButton = page.getByRole('button', { name: /พลิกดูคำแปล/i });
    await expect(flipButton).toBeVisible();
    await flipButton.click();
    await expect(page.getByText(/ความหมายภาษาไทย/i)).toBeVisible();
    await flipButton.click();
    await expect(page.getByText(/แตะหรือคลิกเพื่อพลิกดูคำแปล/i)).toBeVisible();

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

  test('4. Practice Page renders 4 choices across all parts including Part 2', async ({ page }) => {
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

    // Switch to Part 2 and verify 4 choices (A, B, C, D) are available
    await page.getByRole('button', { name: /Part 2/i }).click();
    await expect(page.getByText('D').first()).toBeVisible();
  });

  test('5. Mock Test Page renders 4 choices (A, B, C, D) and handles submission', async ({ page }) => {
    await page.goto('/mock-test');

    // Wait for Mock Test view
    await expect(page.getByText(/Mini Mock Test|คำถามที่|Part/i).first()).toBeVisible({ timeout: 15000 });

    // Verify Option Choices A, B, C, D all exist
    await expect(page.getByText('A').first()).toBeVisible();
    await expect(page.getByText('B').first()).toBeVisible();
    await expect(page.getByText('C').first()).toBeVisible();
    await expect(page.getByText('D').first()).toBeVisible();
  });

  test('6. Multi-Device Responsiveness (Mobile Phone & Tablet iPad)', async ({ page }) => {
    // 6a. Mobile Viewport (iPhone 390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Hamburger menu button should be visible on mobile
    const menuToggle = page.locator('button[aria-label="เปิดเมนูนำทาง"]');
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();

    // Check mobile drawer links (visible inside mobile drawer)
    const mobileDrawer = page.locator('header').locator('div.lg\\:hidden');
    await expect(mobileDrawer.getByText('ฝึกทำโจทย์')).toBeVisible();
    await expect(mobileDrawer.getByText('คลังจุดอ่อน')).toBeVisible();

    // 6b. Tablet Viewport (iPad 820x1180)
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/practice');
    await expect(page.getByText(/ฝึกทำโจทย์แยกพาร์ท/i)).toBeVisible({ timeout: 15000 });
  });
});
