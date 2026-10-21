import { test, expect } from '@playwright/test';

test.describe('CardCraft Full E2E & UI Quality Assurance Suite (CardCraft v2.0)', () => {
  // Test 1: Homepage, 7-Tier Evolution Roadmap, Target Goal Selection & TOEIC Readiness Forecast
  test('1. Homepage: Brand identity, Roadmap dynamic GOAL badge, Target selector, Readiness Forecast & AuthModal', async ({ page }) => {
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
    await expect(page.getByText(/ปลดล็อกรูปลักษณ์และฉายาใหม่ตามระดับคะแนนสอบจริง/i)).toBeVisible();
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

    // Verify Dedicated TOEIC Readiness Forecast Section (Module 1.6)
    await expect(page.getByText(/TOEIC READINESS FORECAST/i)).toBeVisible();
    await expect(page.getByText(/คะแนนคาดการณ์จากการฝึกซ้อมรายพาร์ท/i)).toBeVisible();
    await expect(page.getByText(/Part 1: Photographs/i)).toBeVisible();
    await expect(page.getByText(/Part 5: Incomplete Sentences/i)).toBeVisible();
    await expect(page.getByText(/Part 7: Reading Comprehension/i)).toBeVisible();

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
    await expect(page.getByText(/ฝึก 7 พาร์ท & Vocab Arcade/i)).toBeVisible();
    await expect(page.getByText(/สนามสอบจำลองทางการ \(7 Mock Exam Packages\)/i)).toBeVisible();

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

    await page.goto('/flashcards');

    // Verify Flashcards Hub Header
    await expect(page.getByText(/คลังการ์ดคำศัพท์และพจนานุกรมธุรกิจ/i)).toBeVisible({ timeout: 15000 });

    // 2.1 Test Flip Card (Clicking flip button or Space key)
    const flipBtn = page.getByRole('button', { name: /พลิกดูคำแปล/i }).first();
    await expect(flipBtn).toBeVisible();
    await flipBtn.click();
    // After flip, Thai meaning or sentence speech button should be visible
    await expect(page.getByText(/ความหมายภาษาไทย|ฟังประโยค/i).first()).toBeVisible({ timeout: 5000 });

    // 2.2 Test Audio Non-Flip Guarantee & No Drag-Holding Attachment
    // Clicking the audio icon button must speak audio, NOT flip the card, and NOT attach the card to cursor
    const audioBtn = page.locator('button:has(svg.lucide-volume2)').first();
    if (await audioBtn.isVisible()) {
      await audioBtn.click();
      // Card should still be showing the back
      await expect(page.getByText(/ความหมายภาษาไทย|ฟังประโยค/i).first()).toBeVisible();

      // Ensure card did NOT start dragging or get stuck to cursor
      const cardDragContainer = page.locator('div.perspective-1000 > div').first();
      await page.mouse.move(600, 300);
      const styleAfterMove = await cardDragContainer.getAttribute('style');
      expect(styleAfterMove).not.toContain('translateX');
    }

    // 2.3 Test Swipe Buttons (จำแม่นแล้ว / ทบทวนซ้ำ)
    const knownBtn = page.getByRole('button', { name: /จำแม่นแล้ว/i }).first();
    const reviewBtn = page.getByRole('button', { name: /ทบทวนซ้ำ/i }).first();
    await expect(knownBtn).toBeVisible();
    await expect(reviewBtn).toBeVisible();

    await knownBtn.click();
    // Verify toast or card transition
    await page.waitForTimeout(500);

    // 2.3b Test Mouse Click-and-Hold Drag-to-Swipe (Hold & Swipe Right)
    const cardEl = page.locator('div.perspective-1000').first();
    if (await cardEl.isVisible()) {
      await cardEl.scrollIntoViewIfNeeded();
      const wordHeader = page.locator('h2.font-sans').first();
      const initialWord = (await wordHeader.textContent())?.trim();
      const box = await cardEl.boundingBox();
      if (box) {
        const startX = box.x + box.width / 2;
        const startY = box.y + 60;
        // Hold and drag right past threshold (70px)
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        for (let i = 1; i <= 8; i++) {
          await page.mouse.move(startX + i * 18, startY);
          await page.waitForTimeout(15);
        }
        await page.mouse.up();
        await page.waitForTimeout(600);

        const nextWord = (await wordHeader.textContent())?.trim();
        expect(nextWord).not.toBe(initialWord);
        // Verify card did NOT accidentally flip to back face
        const isBackFlipped = await page.getByText(/ความหมายภาษาไทย/i).first().isVisible();
        expect(isBackFlipped).toBe(false);
      }
    }

    // 2.4 Test Custom Deck Builder Modal
    const customDeckBtn = page.getByRole('button', { name: /จัดชุดการ์ดคำศัพท์|สร้างสำรับ/i }).first();
    if (await customDeckBtn.isVisible()) {
      await customDeckBtn.click();
      // Verify modal opened
      await expect(page.getByText(/สร้างสำรับคำศัพท์เฉพาะคุณ|ตัวกรองสำรับ/i).first()).toBeVisible();
      // Close modal
      const closeDeckBtn = page.locator('div.fixed button:has(svg.lucide-x)').first();
      if (await closeDeckBtn.isVisible()) {
        await closeDeckBtn.click();
      }
    }

    expect(consoleErrors).toEqual([]);
  });

  // Test 3: Practice & Vocab Arcade Hub (CardCraft v2.0 - Hub First, Constraints & 6 Mini-Games)
  test('3. Practice Hub: Hub-first flow, 7-Part drills config with min-15 constraint, and Vocab Arcade', async ({ page }) => {
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

    // Authenticate user
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

    // 3.1 Verify Selection Hub Header (No instant auto-start!)
    await expect(page.getByText(/ลานฝึกซ้อมและอาร์เคดคำศัพท์|Practice & Vocab Arcade/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/เลือกฝึกโจทย์เจาะลึก 7 พาร์ท หรือประลองมินิเกมคำศัพท์/i)).toBeVisible();

    // 3.2 Verify 2 Main Tabs exist
    const tabParts = page.getByRole('button', { name: /ฝึกแยก 7 พาร์ท/i });
    const tabArcade = page.getByRole('button', { name: /มินิเกมคำศัพท์/i });
    await expect(tabParts).toBeVisible();
    await expect(tabArcade).toBeVisible();

    // 3.3 Verify 7 Parts Cards in Tab 1
    await expect(page.getByText('Part 1: Photographs')).toBeVisible();
    await expect(page.getByText('Part 2: Question-Response')).toBeVisible();
    await expect(page.getByText('Part 3: Conversations')).toBeVisible();
    await expect(page.getByText('Part 4: Short Talks')).toBeVisible();
    await expect(page.getByText('Part 5: Incomplete Sentences')).toBeVisible();
    await expect(page.getByText('Part 6: Text Completion')).toBeVisible();
    await expect(page.getByText('Part 7: Reading Comprehension')).toBeVisible();

    // 3.4 Open Pre-Game Configuration Modal for Part 5
    await page.getByRole('button', { name: /ตั้งค่าการฝึกซ้อม Part 5/i }).click();

    // Verify Pre-Game Configuration Modal opened
    await expect(page.getByText(/ตั้งค่าการฝึกซ้อม.*Part 5/i)).toBeVisible();
    await expect(page.getByText(/ขั้นต่ำ 15 ข้อ และ 5 นาที/i)).toBeVisible();

    // Verify min 15 constraint: '-' button is disabled when at default 15
    const decQBtn = page.locator('button:has-text("-")').first();
    await expect(decQBtn).toBeDisabled();
    await expect(page.getByText('15 ข้อ').first()).toBeVisible();

    // Launch Part 5 Drill
    await page.getByRole('button', { name: /เริ่มทำโจทย์ Part 5/i }).click();

    // Verify Active Drill Runner opened
    await expect(page.getByText(/ข้อที่ 1 จาก/i)).toBeVisible();
    await expect(page.getByText(/PART 5/i).first()).toBeVisible();
    // Verify Choices exist
    await expect(page.locator('button:has-text("A")').first()).toBeVisible();
    await expect(page.locator('button:has-text("D")').first()).toBeVisible();

    // Select Choice A
    await page.locator('div.space-y-3 button').first().click();

    // Leave Drill to return to Hub
    await page.locator('button[aria-label="กลับสู่ Selection Hub"]').click();
    await expect(page.getByText(/ลานฝึกซ้อมและอาร์เคดคำศัพท์|Practice & Vocab Arcade/i)).toBeVisible();

    // 3.5 Switch to Vocab Arcade Tab
    await tabArcade.click();

    // Verify 6 Mini-Games are present
    await expect(page.getByText(/Rune Match/i).first()).toBeVisible();
    await expect(page.getByText(/Bard's Echo/i).first()).toBeVisible();
    await expect(page.getByText(/Word Alchemist/i).first()).toBeVisible();
    await expect(page.getByText(/Twin Blades/i).first()).toBeVisible();
    await expect(page.getByText(/Context Cloze/i).first()).toBeVisible();
    await expect(page.getByText(/Anagram Forge/i).first()).toBeVisible();

    // 3.6 Launch Rune Match Game
    await page.getByRole('button', { name: /เริ่มเล่น Rune Match/i }).click();

    // Verify Config Modal with Category Filter
    await expect(page.getByText(/ตั้งค่า.*กระดานจับคู่ศิลาคำศัพท์/i).first()).toBeVisible();
    await expect(page.getByText(/เลือกหมวดหมู่คำศัพท์/i)).toBeVisible();
    await expect(page.getByText(/ทั้งหมด \/ คละหมวดหมู่/i)).toBeVisible();

    // Click "เริ่มเล่นมินิเกม"
    await page.getByRole('button', { name: /เริ่มเล่นมินิเกม/i }).click();

    // Verify Rune Match Game Board (12 Tiles)
    await expect(page.getByText(/คู่/i).first()).toBeVisible();
    const gameTiles = page.locator('div.grid.grid-cols-2.sm\\:grid-cols-3 button');
    await expect(gameTiles.first()).toBeVisible();

    // Exit Game back to Hub
    await page.getByRole('button', { name: /กลับสู่ Arcade Hub/i }).click();
    await expect(page.getByText(/ลานฝึกซ้อมและอาร์เคดคำศัพท์|Practice & Vocab Arcade/i)).toBeVisible();

    // 3.7 Test Part 1 Photograph Inspection Lightbox / Zoom Pop-up
    await page.getByRole('button', { name: /ฝึกแยก 7 พาร์ท/i }).click();
    await page.getByRole('button', { name: /ตั้งค่าการฝึกซ้อม Part 1/i }).click();
    await page.getByRole('button', { name: /เริ่มทำโจทย์ Part 1/i }).click();

    // Verify Part 1 Photograph is rendered and has zoom trigger
    const part1Img = page.locator('div[role="button"][aria-label*="คลิกเพื่อขยายดูรูปภาพ"]').first();
    await expect(part1Img).toBeVisible({ timeout: 10000 });
    await part1Img.click();

    // Verify ImageZoomModal / Pop-up opened
    const zoomDialog = page.locator('div[role="dialog"][aria-label*="ขยายรูปภาพ Part 1"]');
    await expect(zoomDialog).toBeVisible();
    await expect(page.getByText(/ภาพประกอบข้อสอบ Part 1: Photographs/i)).toBeVisible();
    await expect(page.getByText(/SCENE ZOOM/i)).toBeVisible();

    // Test Zoom 175% button toggle
    const zoomToggleBtn = page.getByRole('button', { name: /ซูมเจาะลึก 175%|ขนาดพอดีจอ/i });
    await expect(zoomToggleBtn).toBeVisible();
    await zoomToggleBtn.click();
    await expect(page.getByText(/ขนาดพอดีจอ/i)).toBeVisible();

    // Close modal via Escape key
    await page.keyboard.press('Escape');
    await expect(zoomDialog).not.toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  // Test 4: Mock Exam Lobby (CardCraft v2.0 - 7 Standard Packages, Confirmation & Submission)
  test('4. Mock Exam Lobby: 7 Packages, pre-exam confirmation, timed runner, shortcuts & ETS score results', async ({ page }) => {
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

    // 4.1 Guest prompt check on lobby
    await page.goto('/mock-test');
    await expect(page.getByText(/Mock Exam Lobby/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: '50 Questions Set', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /200 Questions Set/i })).toBeVisible();

    // Guest clicking "เข้าสู่สนามสอบ" should prompt AuthModal
    await page.getByRole('button', { name: /เข้าสู่สนามสอบ \(50 ข้อ\)/i }).click();
    await expect(page.getByText(/เข้าสู่ระบบ \(Hero Login\)|กรุณาเข้าสู่ระบบก่อน|เข้าสู่ระบบเพื่อเริ่มทำข้อสอบ/i).first()).toBeVisible();
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
    await expect(page.getByText(/Mock Exam Lobby/i).first()).toBeVisible({ timeout: 15000 });

    // 4.3 Click 50 Questions Package to open Pre-Exam Confirmation Modal
    await page.getByRole('button', { name: /เข้าสู่สนามสอบ \(50 ข้อ\)/i }).click();

    // Verify Pre-Exam Confirmation Modal
    await expect(page.getByText(/ยืนยันการเริ่มสอบ 50 Questions Set/i)).toBeVisible();
    await expect(page.getByText(/30 นาที/i).first()).toBeVisible();
    await expect(page.getByText(/กฎการสอบจำลองทางการ/i)).toBeVisible();

    // Click "เริ่มจับเวลาทำข้อสอบทันที"
    await page.getByRole('button', { name: /เริ่มจับเวลาทำข้อสอบทันที/i }).click();

    // 4.4 Verify Active Timed Exam Interface
    await expect(page.getByText(/50 Questions Set/i)).toBeVisible();
    await expect(page.getByText(/ข้อที่ 1 \/ 50/i)).toBeVisible();
    await expect(page.getByText(/เวลาที่เหลือ/i)).toBeVisible();

    // Test answering via clicking the second choice button
    await page.locator('div.grid.grid-cols-1.sm\\:grid-cols-2 button').nth(1).click();

    // Test flagging question via 'F' key
    await page.keyboard.press('KeyF');

    // Test navigation via ArrowRight
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText(/ข้อที่ 2 \/ 50/i)).toBeVisible();

    // Test keyboard shortcut 'A' on question 2
    await page.keyboard.press('KeyA');

    // Test question palette: jump directly to question 5
    const q5Btn = page.getByRole('button', { name: '5', exact: true });
    if (await q5Btn.isVisible()) {
      await q5Btn.click();
      await expect(page.getByText(/ข้อที่ 5 \/ 50/i).first()).toBeVisible();
    }

    // 4.5 Submit the exam
    const submitBtn = page.getByRole('button', { name: /ส่งกระดาษคำตอบ/i }).first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify Submit Confirmation Modal
    await expect(page.getByText(/ยืนยันการส่งกระดาษคำตอบ/i)).toBeVisible();
    await page.getByRole('button', { name: /ยืนยันการส่ง/i }).click();

    // 4.6 Verify Results View breakdown
    await expect(page.getByText(/สรุปผลคะแนนสอบทางการ|เลื่อนระดับคลาสฮีโร่สำเร็จ/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/\/ 990 คะแนน/i)).toBeVisible();
    await expect(page.getByText(/Listening \(การฟัง\):/i)).toBeVisible();
    await expect(page.getByText(/Reading \(การอ่าน\):/i)).toBeVisible();

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
    // Mock backend responses so Admin view initializes instantly with 0 console errors
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
    await expect(page.getByText(/ลานฝึกซ้อมและอาร์เคดคำศัพท์|Practice & Vocab Arcade/i)).toBeVisible({ timeout: 15000 });
    const isPracticeOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isPracticeOverflowing).toBe(false);

    // Mobile check on /mock-test
    await page.goto('/mock-test');
    await expect(page.getByText(/Mock Exam Lobby/i)).toBeVisible({ timeout: 15000 });
    const isMockOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isMockOverflowing).toBe(false);

    // 7.2 Tablet Viewport (iPad 820x1180)
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/practice');
    await expect(page.getByText(/ลานฝึกซ้อมและอาร์เคดคำศัพท์/i).first()).toBeVisible({ timeout: 15000 });

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
