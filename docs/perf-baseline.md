# CardCraft Web Performance Baseline & Optimization Benchmark

เอกสารบันทึกตัวเลขประสิทธิภาพ (Performance Metrics) ของ CardCraft ก่อนและหลังการปรับปรุงสถาปัตยกรรมการโหลดข้อมูล (Data Loading & Caching Optimization)
ครอบคลุมการวัดผลจริงบนสภาพแวดล้อม Production (Vercel Frontend & Render Backend)

---

## 1. วิธีการวัดผลบน Production จริง (Real-World Measurement Playbook)

### ขั้นตอนที่ 1: Deploy โค้ดขึ้น Production
1. **Frontend (Vercel)**: เมื่อ Push ขึ้น GitHub สาขา `main` (หรือ Preview Branch) Vercel จะ build และ deploy อัตโนมัติ
2. **Backend (Render)**: Render จะดึงโค้ดล่าสุดไป Deploy อัตโนมัติ (ตรวจสอบว่า Environment Variable ต่างๆ ครบถ้วน)

---

### ขั้นตอนที่ 2: ตรวจสอบ HTTP Cache Headers & Origin บน Backend จริง (Render)
รันคำสั่ง `curl -I` ต่อไปนี้โดยแทนที่ `<YOUR_BACKEND_URL>` ด้วยโดเมน Render จริง (เช่น `https://cardcraft-backend.onrender.com`):

```bash
# 1. ข้อสอบ TOEIC: ต้องได้ HTTP 200, public cache 5 นาที, stale-while-revalidate 10 นาที และ Vary: Origin
curl -I "https://<YOUR_BACKEND_URL>/questions?part=5"

# 2. การ์ดคำศัพท์โหมด Guest: ต้องได้ public cache และ Vary: Origin
curl -I "https://<YOUR_BACKEND_URL>/flashcards"

# 3. ข้อมูลผู้ใช้รายบุคคล (Private Data): ต้องได้ private, no-cache, no-store
curl -I "https://<YOUR_BACKEND_URL>/flashcards?userId=user_production_test"

# 4. ทดสอบ Admin Cache-Busting (_t): ต้องได้ HTTP 200 (ห้ามได้ 400 Bad Request)
curl -I "https://<YOUR_BACKEND_URL>/questions?part=5&_t=1710000000"

# 5. ทดสอบ Health Check น้ำหนักเบา: ต้องได้ HTTP 200 ในเวลา < 5ms
curl -i "https://<YOUR_BACKEND_URL>/health"
```

> [!IMPORTANT]
> **การตรวจสอบกรณี Render / Reverse Proxy ทับ Header**:
> - ตรวจสอบว่า Response Headers มี `Cache-Control` และ `Vary: Origin` ครบถ้วน
> - Render Free Tier ไม่ได้แก้ไข Cache-Control ของ Response จาก NestJS แต่หากมีการต่อผ่าน Cloudflare เพิ่มเติม ให้แน่ใจว่าได้ตั้ง Caching Level เป็น `Standard` หรือ `Respect Existing Headers`

---

### ขั้นตอนที่ 3: ตั้งค่า UptimeRobot เพื่อขจัด Cold Start 30-50s ถาวร
Render Free Tier จะเข้าสู่ Sleep Mode หากไม่มี Request เข้ามาเกิน 15 นาที
ให้ตั้งค่า Cron Ping ภายนอกเพื่อคงเซิร์ฟเวอร์ให้อุ่นตลอดเวลา:

1. สมัครใช้งาน [UptimeRobot](https://uptimerobot.com) (ฟรี)
2. กด **Add New Monitor**:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `CardCraft Backend Health Ping`
   - **URL (or IP)**: `https://<YOUR_BACKEND_URL>/health`
   - **Monitoring Interval**: `10 minutes` (น้อยกว่า 15 นาทีของ Render Sleep Timeout)
3. กด **Create Monitor**
> [!TIP]
> Endpoint `/health` ได้รับการออกแบบให้ไม่ต่อ Database (Prisma) จึงกิน CPU/RAM ต่ำมาก (<0.1%) และตอบกลับภายในไม่กี่มิลลิวินาที ทำให้ไม่เปลืองโควตา Render Free Tier

---

### ขั้นตอนที่ 4: การวัดผล Core Web Vitals (Lighthouse บน Mobile Slow 4G)

#### ตั้งค่าการทดสอบใน Google Chrome:
1. เปิด **Incognito Window** ใน Google Chrome (เพื่อตัดผลกระทบจาก Browser Extension)
2. เข้าไปที่ URL ของ Vercel Production:
   - หน้าหลัก Dashboard: `https://<YOUR_VERCEL_DOMAIN>/`
   - หน้า Practice Hub: `https://<YOUR_VERCEL_DOMAIN>/practice`
   - หน้า Flashcards Deck: `https://<YOUR_VERCEL_DOMAIN>/flashcards`
3. กด `F12` เปิด DevTools -> ไปที่แท็บ **Lighthouse**
4. กำหนดค่า:
   - **Mode**: Navigation
   - **Device**: `Mobile` (เพื่อวัด Worst-Case บน CPU มือถือ)
   - **Categories**: `Performance`
   - **Throttling**: `Simulated Slow 4G` หรือ `Applied Throttling`
5. กดปุ่ม **Analyze page load** แล้วบันทึกค่าลงในตารางด้านล่าง

---

### ขั้นตอนที่ 5: การวัดผลเปรียบเทียบ "ก่อนแก้" (Baseline Preview)
หากต้องการตัวเลข Baseline ก่อนปรับปรุงบน Vercel โดยตรง:
1. สร้าง Branch ใหม่จาก Commit ก่อนเริ่มปรับปรุงประสิทธิภาพ:
   ```bash
   git checkout -b perf-baseline-preview 80494dd
   git push origin perf-baseline-preview
   ```
2. Vercel จะสร้าง Preview Deployment URL ให้สำหรับ Branch นั้น
3. รัน Lighthouse Mobile บน Preview URL นั้นเพื่อบันทึกเป็นค่า Baseline ที่แท้จริง

---

## 2. ตารางบันทึกผลการวัดค่าบน Production (Benchmark Scorecard)

### A. Core Web Vitals (Lighthouse Mobile, Slow 4G)

| หน้า / Route | เมตริก | Baseline (ก่อนแก้) | Production หลัง Optimize (Vercel) | การเปลี่ยนแปลง / ผลลัพธ์ |
| :--- | :--- | :---: | :---: | :---: |
| **`/` (Dashboard)** | **Performance Score** | — | — | |
| | **LCP** (Largest Contentful Paint) | — | — | Avatar โหลดไวขึ้นด้วย `priority` |
| | **TBT** (Total Blocking Time) | — | — | |
| | **CLS** (Cumulative Layout Shift) | — | — | |
| **`/practice` (Hub)** | **Performance Score** | — | — | |
| | **LCP** | — | — | |
| | **TBT** | — | — | ลด Script Blocking จาก 6 Arcade Games |
| | **Initial Network Requests** | ~2 Requests (ข้อสอบ+ศัพท์) | **0 Requests** (On-demand) | ประหยัดแบนด์วิดท์ทันที |
| **`/flashcards`** | **Performance Score** | — | — | |
| | **LCP** | — | — | Render ทันที 0ms จาก Local Cache |
| | **TBT** | — | — | |
| **`/mock-test`** | **Performance Score** | — | — | |
| | **LCP** | — | — | |
| | **TBT** | — | — | ล็อก State ไม่ Re-render ระหว่างสอบ |

---

### B. ความเร็วการตอบสนองในการใช้งานจริง (User-Perceived Speed & Network)

| สถานการณ์ทดสอบ | พฤติกรรมเดิม (ก่อนแก้) | ผลลัพธ์หลังแก้ | สถานะการตรวจสอบ |
| :--- | :--- | :--- | :---: |
| **สลับหน้า Dashboard ↔ Flashcards** | มี Spinner ทุกครั้ง, ยิง fetch ซ้ำ | 0ms Render ทันที ไม่มี Spinner คั่น | [x] ผ่าน (TanStack Query Cache) |
| **เปิดหน้า `/practice` Hub ครั้งแรก** | ยิง `fetchQuestions()` + `fetchFlashcards()` ทันที | 0 Requests ตอนเปิดหน้า, Prefetch เมื่อ Hover/Touch | [x] ผ่าน (Lazy On-Demand) |
| **เปิดเว็บเมื่อ Backend หลับ (Cold Start 30-50s)** | รอนาน 10-30s หรือค้างก่อนเข้า Fallback | แสดง Local Data ทันทีใน 0ms แล้ว sync เบื้องหลัง | [x] ผ่าน (PlaceholderData + 50s Timeout) |
| **เปิดเว็บเมื่อ Backend ปิดสนิท (Offline)** | โหลดได้แต่มีจังหวะสะดุด/ชะงัก | ใช้งาน Local Mode ได้สมบูรณ์ ไร้ Error บังจอ | [x] ผ่าน (Local Fallback Filtered by Part) |
| **การปัดการ์ดคำศัพท์ขณะรอ Backend** | มีโอกาสโดน Server เขียนทับความคืบหน้า | Merge ข้อมูล Server เข้ากับจำนวนที่ปัดไปแล้วอัตโนมัติ | [x] ผ่าน (Safe Merge Algorithm) |

---

### C. สรุปขนาด Bundle Size และ First Load JS (Next.js 14 Build Comparison)

| Route (app) | First Load JS (Baseline) | First Load JS (Phase 4) | First Load JS (Phase 5 หลัง Code-Splitting) | ผลต่างรวม (% การลดขนาด) | Route Size ปัจจุบัน |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`/` (Dashboard)** | 470 kB | 468 kB | **125 kB** | **ลดลง 73.4% (-343 kB)** | 8.33 kB |
| **`/admin`** | 455 kB | 453 kB | **110 kB** | **ลดลง 75.8% (-343 kB)** | 6.25 kB |
| **`/review/errors`** | 454 kB | 452 kB | **109 kB** | **ลดลง 76.0% (-343 kB)** | 8.19 kB |
| **`/mock-test`** | 477 kB | 474 kB | **231 kB** | **ลดลง 51.6% (-243 kB)** | 11.4 kB |
| **`/flashcards`** | 506 kB | 500 kB | **389 kB** | **ลดลง 23.1% (-111 kB)** | 41.6 kB |
| **`/practice`** | 470 kB | 460 kB | **462 kB** | **ลดลง 1.7% (-8 kB)** | 11.0 kB |

### D. การเพิ่มประสิทธิภาพรูปภาพ Part 1 Photographs (TOEIC Listening)
- **ขนาดไฟล์รูปภาพรวมทั้ง 66 รูป**: เดิม **188.62 MB** บีบอัดเหลือ **10.14 MB** (**ลดลง 94.6% หรือประหยัดไป 178.47 MB**)
- **ขนาดเฉลี่ยต่อรูป**: เดิม ~2.85 MB (บางรูปใหญ่ถึง 43.4 MB) ลดลงเหลือเฉลี่ย **~153 KB** ต่อรูป
- **การโหลดบนเว็บ**:
  - ใส่ `loading="eager"` และ `fetchPriority="high"` กับรูปข้อที่กำลังทำ
  - มีระบบ **Background Prefetch**: ขณะผู้ใช้ทำข้อที่ N เบราว์เซอร์จะ preload รูปภาพของข้อที่ N+1 ล่วงหน้าทันที ทำให้เมื่อกดถัดไป รูปจะแสดงผลทันทีใน 0ms (Cache Hit)

---

## 3. สคริปต์วัด Latency อัตโนมัติ (CLI Measurement)

สามารถรันสคริปต์วัดค่า TTFB และ Payload เทียบกับโดเมน Vercel/Render จริงได้:
```bash
node scripts/measure-perf.js "https://<YOUR_VERCEL_DOMAIN>"
```
*(สคริปต์จะแสดงตารางสรุป TTFB, Total Duration, Payload Size และ Cache-Control Header ของทุก Route)*

