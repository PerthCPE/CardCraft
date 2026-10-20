import { test, expect } from '@playwright/test';

test.describe('CardCraft Full E2E & UI Quality Assurance Suite', () => {
  // Test 1: Homepage, 7-Tier Evolution Roadmap & Target Goal Selection
  test('1. Homepage: Brand identity, Roadmap dynamic GOAL badge, Target selector & AuthModal', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        msg.type() === 'error' &&
        !text.includes('speechSynthesis') &&
        !text.includes('ERR_CONNECTION_REFUSED')
      ) {
        consoleErrors.push(text);
      }
    });

    await page.goto('/');

    // Check brand & page title
    await expect(page).toHaveTitle(/CardCraft/i);
    await expect(page.getByText('CardCraft').first()).toBeVisible();
    await expect(page.getByText('700+').first()).toBeVisible();

    // Verify main navigation links in Navbar
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    await expect(navbar.getByText('หน้าหลัก')).toBeVisible();
    await expect(navbar.getByText('การ์ดคำศัพท์')).toBeVisible();
    await expect(navbar.getByText('ฝึกทำโจทย์')).toBeVisible();
    await expect(navbar.getByText('จำลองสอบ')).toBeVisible();
    await expect(navbar.getByText('คลังจุดอ่อน')).toBeVisible();

    // Verify Character Evolution Roadmap description
    await expect(page.getByText(/ปลดล็อกรูปลักษณ์และฉายาใหม่ตามระดับความเชี่ยวชาญ TOEIC/i)).toBeVisible();
    await expect(page.getByText(/150, 200 และ 100 คะแนน/i)).not.toBeVisible();

    // Test Dynamic Target Goal Selector (600, 700, 800, 900)
    // Default is 700: check that GOAL 700+ badge is visible
    await expect(page.getByText(/GOAL 700\+/i).first()).toBeVisible();

    // Switch target to 800+
    const btn800 = page.getByRole('button', { name: '800+' });
    await expect(btn800).toBeVisible();
    await btn800.click();
    await expect(page.getByText(/GOAL 800\+/i).first()).toBeVisible();
    await expect(page.getByText(/เป้าหมาย 800 คะแนน/i).first()).toBeVisible();

    // Switch target to 900+
    const btn900 = page.getByRole('button', { name: '900+' });
    await btn900.click();
    await expect(page.getByText(/GOAL 900\+/i).first()).toBeVisible();
    await expect(page.getByText(/เป้าหมาย 900 คะแนน/i).first()).toBeVisible();

    // Switch target to 600+
    const btn600 = page.getByRole('button', { name: '600+' });
    await btn600.click();
    await expect(page.getByText(/GOAL 600\+/i).first()).toBeVisible();
    await expect(page.getByText(/เป้าหมาย 600 คะแนน/i).first()).toBeVisible();

    // Reset back to 700+
    const btn700 = page.getByRole('button', { name: '700+' });
    await btn700.click();
    await expect(page.getByText(/GOAL 700\+/i).first()).toBeVisible();

    // Test Hero Dossier Auth CTA button opens AuthModal
    const authCtaBtn = page.getByRole('button', { name: /เข้าสู่ระบบ \/ สมัครสมาชิกเพื่อเริ่มเล่น/i });
    await expect(authCtaBtn).toBeVisible();
    await authCtaBtn.click();

    // Verify AuthModal opened
    const authModalHeader = page.getByText(/เข้าสู่ระบบ \(Hero Login\)|ข้อมูลผู้เล่นฮีโร่/i).first();
    await expect(authModalHeader).toBeVisible();
    await expect(page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /สร้างบัญชีใหม่|สมัครสมาชิก/i }).first()).toBeVisible();

    // Close AuthModal using X button
    const closeAuthBtn = page.locator('button:has(svg.lucide-x)').first();
    await closeAuthBtn.click();
    await expect(authModalHeader).not.toBeVisible();

    // Verify 3 Guild Training grounds cards exist
    await expect(page.getByText('สำรับการ์ดคำศัพท์ 3D Flip')).toBeVisible();
    await expect(page.getByText('ฝึกทำโจทย์แยกพาร์ท (Part 1, 2, 5 และ 7)')).toBeVisible();
    await expect(page.getByText('สนามสอบจำลองจับเวลา (Mini Mock Test)')).toBeVisible();

    // Assert 0 unexpected console errors
    expect(consoleErrors).toEqual([]);
  });

  // Test 2: Flashcards 3D Flip, Audio Non-Flip Guarantee, Swipe & Custom Deck Builder
  test('2. Flashcards: 3D flip card, audio non-flip, swipe gestures, custom deck modal & dictionary view', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        msg.type() === 'error' &&
        !text.includes('speechSynthesis') &&
        !text.includes('ERR_CONNECTION_REFUSED')
      ) {
        consoleErrors.push(text);
      }
    });

    // Authenticate user to access custom deck selector and features
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

    await page.goto('/flashcards');

    // Page header & active deck verification
    await expect(page.getByText(/คลังการ์ดคำศัพท์และพจนานุกรมธุรกิจ/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/ชุดคำศัพท์ปัจจุบัน/i)).toBeVisible();

    // 2.1 3D Flip Card: Front face initial state
    const flipHelper = page.getByText(/แตะหรือคลิกเพื่อพลิกดูคำแปล/i);
    await expect(flipHelper).toBeVisible();

    // Flip card to Back by clicking helper
    await flipHelper.click();
    await expect(page.getByText(/ความหมายภาษาไทย/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/ปัดขวาเมื่อจำได้ หรือปัดซ้ายเพื่อทบทวน/i)).toBeVisible();

    // Flip back to Front by clicking helper
    await page.getByText(/ปัดขวาเมื่อจำได้ หรือปัดซ้ายเพื่อทบทวน/i).click();
    await expect(page.getByText(/แตะหรือคลิกเพื่อพลิกดูคำแปล/i)).toBeVisible({ timeout: 3000 });

    // 2.2 Tactile flip button
    const flipButton = page.getByRole('button', { name: /พลิกดูคำแปล/i });
    await expect(flipButton).toBeVisible();
    await flipButton.click();
    await expect(page.getByText(/ความหมายภาษาไทย/i)).toBeVisible();
    await flipButton.click();
    await expect(page.getByText(/แตะหรือคลิกเพื่อพลิกดูคำแปล/i)).toBeVisible();

    // 2.3 Keyboard Space bar flips card
    await page.keyboard.press('Space');
    await expect(page.getByText(/ความหมายภาษาไทย/i)).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.getByText(/แตะหรือคลิกเพื่อพลิกดูคำแปล/i)).toBeVisible();

    // 2.4 Audio non-flip test on Front face
    const speakWordBtn = page.getByRole('button', { name: /ฟังเสียงอ่าน/i });
    await expect(speakWordBtn).toBeVisible();
    await speakWordBtn.click();
    // Card MUST remain on Front face
    await expect(page.getByText(/แตะหรือคลิกเพื่อพลิกดูคำแปล/i)).toBeVisible();
    await expect(page.getByText(/ความหมายภาษาไทย/i)).not.toBeVisible();

    // 2.5 Audio non-flip test on Back face
    await flipButton.click();
    await expect(page.getByText(/ความหมายภาษาไทย/i)).toBeVisible();
    const speakSentenceBtn = page.getByRole('button', { name: /ฟังประโยค/i });
    await expect(speakSentenceBtn).toBeVisible();
    await speakSentenceBtn.click();
    // Card MUST remain on Back face
    await expect(page.getByText(/ความหมายภาษาไทย/i)).toBeVisible();
    await flipButton.click(); // Return to front

    // 2.6 Swipe buttons test
    const swipeLeftBtn = page.getByRole('button', { name: /ทบทวนซ้ำ/i }).filter({ hasText: '←' });
    const swipeRightBtn = page.getByRole('button', { name: /จำแม่นแล้ว/i }).filter({ hasText: '→' });
    await expect(swipeLeftBtn).toBeVisible();
    await expect(swipeRightBtn).toBeVisible();

    // Click swipe right -> advance card
    await swipeRightBtn.click();
    // Click swipe left -> advance card
    await swipeLeftBtn.click();

    // 2.7 Keyboard ArrowRight / ArrowLeft shortcuts test
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');

    // 2.8 Custom Deck Selector Modal (CardSetSelectorModal)
    const manageSetBtn = page.getByRole('button', { name: /สร้างชุดใหม่ \(เลือกจำนวนคำ\)/i });
    await expect(manageSetBtn).toBeVisible();
    await manageSetBtn.click();

    // Verify Modal opened and tabs exist
    await expect(page.getByText(/จัดการและสร้างชุดคำศัพท์/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /สร้างชุดใหม่ \(Create Deck\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ชุดของฉัน/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ชุดมาตรฐาน/i })).toBeVisible();

    // Verify Spaced Repetition filters exist in modal
    await expect(page.locator('div.fixed').getByRole('button', { name: /ถึงเวลาทบทวน/i })).toBeVisible();
    await expect(page.locator('div.fixed').getByRole('button', { name: /ที่เคยผิดจากข้อสอบ/i })).toBeVisible();

    // Switch to Presets tab
    await page.getByRole('button', { name: /ชุดมาตรฐาน/i }).click();
    await expect(page.getByText(/30 คำ|Quick Scout|50 คำ/i).first()).toBeVisible();

    // Close Custom Deck modal
    const closeDeckModalBtn = page.locator('div.fixed button:has(svg.lucide-x)').first();
    await closeDeckModalBtn.click();
    await expect(page.getByText(/จัดการและสร้างชุดคำศัพท์/i)).not.toBeVisible();

    // 2.9 Switch to Dictionary Table view
    await page.getByText('ตารางพจนานุกรม').click();
    const searchInput = page.getByPlaceholder(/ค้นหาคำศัพท์/i);
    await expect(searchInput).toBeVisible();

    // Test search filter
    await searchInput.fill('negotiat');
    await expect(page.getByText(/negotiat/i).first()).toBeVisible();

    // Switch back to Swipe Deck mode
    await page.getByText('โหมดปัดการ์ด').click();
    await expect(page.getByText(/แตะหรือคลิกเพื่อพลิกดูคำแปล/i)).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  // Test 3: Practice Drills (Part 1, 2, 5, 7), Part 2 4 Choices, Part 7 sets, Real-Time Exam & Blitz modals
  test('3. Practice: Part 1-7 drills, Part 2 4 choices, Part 7 sets, Real-Time Exam & Blitz modals', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        msg.type() === 'error' &&
        !text.includes('speechSynthesis') &&
        !text.includes('ERR_CONNECTION_REFUSED')
      ) {
        consoleErrors.push(text);
      }
    });

    // Authenticate user to access interactive modals
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

    await page.goto('/practice');

    // Verify Page Header
    await expect(page.getByText(/ลานประลองและห้องสอบตามเวลาจริง/i)).toBeVisible({ timeout: 15000 });

    // Verify 4 Timed Mode cards exist
    await expect(page.getByText(/Part 5 Speed Exam \(30 ข้อ\)/i)).toBeVisible();
    await expect(page.getByText(/5-Min Vocab Blitz/i)).toBeVisible();
    await expect(page.getByText(/Boss Survival/i)).toBeVisible();
    await expect(page.getByText(/Collocation Rush/i)).toBeVisible();

    // 3.1 Part 1 Drill: Photographs & 4 Choices
    await page.getByRole('button', { name: /^Part 1/i }).click();
    await expect(page.getByText('A').first()).toBeVisible();
    await expect(page.getByText('B').first()).toBeVisible();
    await expect(page.getByText('C').first()).toBeVisible();
    await expect(page.getByText('D').first()).toBeVisible();

    // Select Option A and verify feedback appears
    await page.getByRole('button', { name: /เลือกตัวเลือก \(A\)/i }).first().click();
    await expect(page.getByText(/ตอบถูกต้อง|คำตอบที่ถูกต้องคือข้อ/i).first()).toBeVisible({ timeout: 3000 });

    // 3.2 Part 2 Drill: 4 Choices (A, B, C, D) Verification
    await page.getByRole('button', { name: /^Part 2/i }).click();
    await expect(page.getByText('A').first()).toBeVisible();
    await expect(page.getByText('B').first()).toBeVisible();
    await expect(page.getByText('C').first()).toBeVisible();
    await expect(page.getByText('D').first()).toBeVisible();

    // 3.3 Part 5 Drill: Incomplete Sentences & 20s Speed Timer
    await page.getByRole('button', { name: 'Part 5 เติมคำในช่องว่าง' }).click();
    await expect(page.getByText(/20s/i).first()).toBeVisible();
    await expect(page.getByText('A').first()).toBeVisible();
    await expect(page.getByText('D').first()).toBeVisible();

    // 3.4 Part 7 Drill: Reading Comprehension & Responsive Passage Set Buttons
    await page.getByRole('button', { name: /^Part 7/i }).click();
    await expect(page.getByText(/ชุดที่ 1/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /ถัดไป/i }).first()).toBeVisible();

    // Click "ชุดที่ 2" to verify set switching
    const set2Btn = page.getByRole('button', { name: /ชุดที่ 2/i }).first();
    if (await set2Btn.isVisible()) {
      await set2Btn.click();
      await expect(set2Btn).toBeVisible();
    }

    // 3.5 Real-Time Exam Modal (Part 5 Speed Exam)
    const startPart5Btn = page.getByRole('button', { name: /เริ่มสอบ Part 5 \(12 นาที\)/i });
    await expect(startPart5Btn).toBeVisible();
    await startPart5Btn.click();

    // Verify RealTimeExamModal opened
    await expect(page.getByText(/Part 5 Speed Exam \(30 ข้อ 12 นาที\)/i)).toBeVisible({ timeout: 5000 });
    // Check choices A-D in modal
    await expect(page.locator('div.fixed').getByText('A').first()).toBeVisible();
    await expect(page.locator('div.fixed').getByText('D').first()).toBeVisible();
    // Close modal
    const closeExamModalBtn = page.locator('div.fixed button[title="ปิด"]').first();
    await closeExamModalBtn.click();
    await expect(page.getByText(/Part 5 Speed Exam \(30 ข้อ 12 นาที\)/i)).not.toBeVisible();

    // 3.6 5-Minute Vocab Blitz Modal
    const startBlitzBtn = page.getByRole('button', { name: /เริ่มประลองความจำ 5 นาที/i });
    await expect(startBlitzBtn).toBeVisible();
    await startBlitzBtn.click();

    // Verify VocabBlitzGame Ready state
    await expect(page.getByText(/5-Minute Vocab Blitz/i)).toBeVisible();
    await expect(page.getByText(/พร้อมทดสอบความเร็วและความจำหรือยัง\?/i)).toBeVisible();
    // Close Blitz modal
    const closeBlitzBtn = page.locator('div.fixed button:has(svg.lucide-x)').first();
    await closeBlitzBtn.click();
    await expect(page.getByText(/พร้อมทดสอบความเร็วและความจำหรือยัง\?/i)).not.toBeVisible();

    // 3.7 Boss Survival Modal (3-HP Gauntlet)
    const startBossBtn = page.getByRole('button', { name: /ท้าทายบอส 3-HP/i });
    await expect(startBossBtn).toBeVisible();
    await startBossBtn.click();

    // Verify BossSurvivalModal
    await expect(page.getByText(/Boss Survival Gauntlet/i)).toBeVisible();
    await expect(page.getByText(/Void Wyrm of Distraction/i)).toBeVisible();
    // Close Boss modal
    const closeBossBtn = page.locator('div.fixed button:has(svg.lucide-x)').first();
    await closeBossBtn.click();
    await expect(page.getByText(/Boss Survival Gauntlet/i)).not.toBeVisible();

    // 3.8 Collocation Rush Modal (60s speed match)
    const startCollocationBtn = page.getByRole('button', { name: /เริ่มจับคู่สำนวน 60 วิ/i });
    await expect(startCollocationBtn).toBeVisible();
    await startCollocationBtn.click();

    // Verify CollocationRushModal
    await expect(page.locator('div.fixed').getByRole('heading', { name: /Collocation Rush/i })).toBeVisible();
    await expect(page.getByText(/60s/i).first()).toBeVisible();
    // Close Collocation modal
    const closeCollocationBtn = page.locator('div.fixed button:has(svg.lucide-x)').first();
    await closeCollocationBtn.click();
    await expect(page.locator('div.fixed').getByRole('heading', { name: /Collocation Rush/i })).not.toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  // Test 4: Mini Mock Test (Boss Battle) - Shortcuts, Drawer Palette & Exam Submission
  test('4. Mock Test: Keyboard shortcuts, palette jump, flag question, submission & score breakdown', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        msg.type() === 'error' &&
        !text.includes('speechSynthesis') &&
        !text.includes('ERR_CONNECTION_REFUSED')
      ) {
        consoleErrors.push(text);
      }
    });

    // 4.1 Guest prompt check
    await page.goto('/mock-test');
    await expect(page.getByText(/Mini Mock Test/i).first()).toBeVisible({ timeout: 15000 });

    // Guest clicking option choice button should prompt AuthModal
    await page.locator('div.grid.grid-cols-1.sm\\:grid-cols-2 button').first().click();
    await expect(page.getByText(/เข้าสู่ระบบ \(Hero Login\)|กรุณาเข้าสู่ระบบก่อน/i).first()).toBeVisible();
    const closeAuthBtn = page.locator('button:has(svg.lucide-x)').first();
    await closeAuthBtn.click();

    // 4.2 Authenticate user
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

    await page.goto('/mock-test');
    await expect(page.getByText(/Mini Mock Test/i).first()).toBeVisible({ timeout: 15000 });

    // Test answering via clicking the second choice button
    await page.locator('div.grid.grid-cols-1.sm\\:grid-cols-2 button').nth(1).click();

    // Test flagging question via 'F' key
    await page.keyboard.press('KeyF');

    // Test navigation via ArrowRight
    await page.keyboard.press('ArrowRight');

    // Test keyboard shortcut 'A' on question 2
    await page.keyboard.press('KeyA');

    // Test question palette: jump directly to question 5
    const q5Btn = page.getByRole('button', { name: '5', exact: true });
    if (await q5Btn.isVisible()) {
      await q5Btn.click();
      await expect(page.getByText(/ข้อที่ 5\s*\//i).first()).toBeVisible();
    }

    // Submit the exam
    const submitBtn = page.getByRole('button', { name: /ส่งกระดาษคำตอบ/i }).first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify Results View breakdown
    await expect(page.getByText(/สรุปผลการประเมินคะแนนสอบ|เลื่อนระดับคลาสฮีโร่สำเร็จ/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/\/ 990 คะแนน/i)).toBeVisible();
    await expect(page.getByText(/การฟัง:/i)).toBeVisible();
    await expect(page.getByText(/การอ่าน:/i)).toBeVisible();

    // Verify question review section and home link
    await expect(page.getByText(/เฉลยและคำอธิบายรายข้อ/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /กลับสู่หน้าหลัก/i })).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  // Test 5: Weakness Dashboard & Error Archive (/review/errors)
  test('5. Weakness Dashboard: Guest lock, Auth analytics, Filter pills, Search & Audio pronunciation', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        msg.type() === 'error' &&
        !text.includes('speechSynthesis') &&
        !text.includes('ERR_CONNECTION_REFUSED')
      ) {
        consoleErrors.push(text);
      }
    });

    // 5.1 Guest State Check
    await page.goto('/review/errors');
    await expect(page.getByText(/กรุณาเข้าสู่ระบบเพื่อดูคลังจุดอ่อน/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /เข้าสู่ระบบทันที/i })).toBeVisible();

    // 5.2 Authenticated State Check
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

    // Verify Weakness Dashboard Header & Metrics
    await expect(page.getByText(/Weakness Dashboard/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/ข้อสอบที่ทำทั้งหมด/i)).toBeVisible();
    await expect(page.getByText(/ตอบถูกทั้งหมด/i)).toBeVisible();
    await expect(page.getByText(/จุดอ่อนหลักอันดับ 1/i)).toBeVisible();

    // Verify Filter Pills
    await expect(page.getByText('P5 ไวยากรณ์')).toBeVisible();
    await expect(page.getByText('Part of Speech')).toBeVisible();
    await expect(page.getByText('Tense & Verb Form')).toBeVisible();

    // Click Part 5 Filter pill
    await page.getByText('P5 ไวยากรณ์').click();

    // Click Part of Speech error type pill
    await page.getByText('Part of Speech').click();

    // Test Search Box
    const searchBox = page.getByPlaceholder(/ค้นหาโจทย์ หรือ คำศัพท์/i);
    await expect(searchBox).toBeVisible();
    await searchBox.fill('contract');

    // Verify "ฝึกเฉพาะข้อที่เคยผิด" link exists and points to /practice
    const practiceErrorsLink = page.getByRole('link', { name: /ฝึกเฉพาะข้อที่เคยผิด/i });
    await expect(practiceErrorsLink).toBeVisible();
    await expect(practiceErrorsLink).toHaveAttribute('href', '/practice');

    expect(consoleErrors).toEqual([]);
  });

  // Test 6a: Admin Dashboard - Non-admin restricted area guard
  test('6a. Admin Dashboard: Non-admin restricted area guard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText(/ไม่มีสิทธิ์เข้าถึงหน้านี้ \(Admin Only\)/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/RESTRICTED AREA • ADMIN ONLY/i)).toBeVisible();
  });

  // Test 6b: Admin Dashboard - Authenticated admin CRUD management view
  test('6b. Admin Dashboard: Authenticated admin CRUD management view & modals', async ({ page }) => {
    // Fast mock backend responses so Admin view initializes instantly with 0 console errors
    await page.route('http://localhost:4000/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        msg.type() === 'error' &&
        !text.includes('speechSynthesis') &&
        !text.includes('ERR_CONNECTION_REFUSED') &&
        !text.includes('net::ERR_FAILED')
      ) {
        consoleErrors.push(text);
      }
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        'cardcraft_auth_user_v2',
        JSON.stringify({
          id: 'admin_user_01',
          username: 'admin',
          name: 'Guild Master Admin',
          targetScore: 990,
          currentEstimatedScore: 990,
          level: 7,
          totalExp: 99999,
          stamina: 100,
        }),
      );
    });

    await page.goto('/admin');

    // Verify Admin Header
    await expect(page.getByText(/จัดการคลังคำศัพท์และข้อสอบ \(CRUD Manager\)/i)).toBeVisible({ timeout: 15000 });

    // Verify Tabs: Flashcards and Questions
    const flashcardsTab = page.getByRole('button', { name: /^คำศัพท์ \(/i });
    const questionsTab = page.getByRole('button', { name: /^ข้อสอบ \(/i });
    await expect(flashcardsTab).toBeVisible();
    await expect(questionsTab).toBeVisible();

    // Verify "เพิ่มคำศัพท์ใหม่" button opens Create Card Modal
    const addCardBtn = page.getByRole('button', { name: /เพิ่มคำศัพท์ใหม่/i });
    await expect(addCardBtn).toBeVisible();
    await addCardBtn.click();
    await expect(page.locator('div.fixed').getByRole('heading', { name: 'เพิ่มคำศัพท์ใหม่' })).toBeVisible();
    // Close modal via Cancel button and verify backdrop unmounted
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(page.locator('div.fixed')).not.toBeVisible();

    // Switch to Questions tab and verify "เพิ่มข้อสอบใหม่" button opens Create Question Modal
    await questionsTab.click();
    const addQuestionBtn = page.getByRole('button', { name: /เพิ่มข้อสอบใหม่/i });
    await expect(addQuestionBtn).toBeVisible();
    await addQuestionBtn.click();
    await expect(page.locator('div.fixed').getByRole('heading', { name: 'เพิ่มข้อสอบใหม่' })).toBeVisible();
    // Close modal via Cancel button
    await page.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(page.locator('div.fixed')).not.toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  // Test 7: Multi-Device Responsiveness (Mobile iPhone, Tablet iPad & Desktop PC)
  test('7. Multi-Device Audit: Mobile 390px, Tablet 820px & Desktop 1280px without layout overflow', async ({ page }) => {
    // 7.1 Mobile Viewport (iPhone 390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Hamburger menu toggle check
    const menuToggle = page.locator('button[aria-label="เปิดเมนูนำทาง"]');
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();

    // Drawer links check
    const mobileDrawer = page.locator('header').locator('div.lg\\:hidden');
    await expect(mobileDrawer.getByText('หน้าหลัก')).toBeVisible();
    await expect(mobileDrawer.getByText('การ์ดคำศัพท์')).toBeVisible();
    await expect(mobileDrawer.getByText('ฝึกทำโจทย์')).toBeVisible();
    await expect(mobileDrawer.getByText('จำลองสอบ')).toBeVisible();
    await expect(mobileDrawer.getByText('คลังจุดอ่อน')).toBeVisible();

    // Check no horizontal scrollbar overflow on mobile home
    const isMobileOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isMobileOverflowing).toBe(false);

    // Mobile check on /flashcards
    await page.goto('/flashcards');
    await expect(page.getByText(/คลังการ์ดคำศัพท์และพจนานุกรมธุรกิจ/i)).toBeVisible({ timeout: 15000 });
    const isFlashcardsOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isFlashcardsOverflowing).toBe(false);

    // Mobile check on /practice
    await page.goto('/practice');
    await expect(page.getByText(/ลานประลองและห้องสอบตามเวลาจริง/i)).toBeVisible({ timeout: 15000 });
    const isPracticeOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isPracticeOverflowing).toBe(false);

    // 7.2 Tablet Viewport (iPad 820x1180)
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/practice');
    await expect(page.getByText(/ฝึกทำโจทย์แยกพาร์ท/i)).toBeVisible({ timeout: 15000 });

    const isTabletOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isTabletOverflowing).toBe(false);

    // 7.3 Desktop Viewport (1280x720)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });
});
