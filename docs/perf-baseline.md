# CardCraft Web Performance Baseline & Optimization Benchmark

เอกสารบันทึกตัวเลขประสิทธิภาพ (Performance Metrics) ของ CardCraft ก่อนและหลังการปรับปรุงสถาปัตยกรรมการโหลดข้อมูล (Data Loading & Caching Optimization)

---

## 1. วิธีการวัดผล (Measurement Guidelines)

### วิธีที่ 1: Google Chrome DevTools (Lighthouse & Performance Tab) — แนะนำ
1. รัน Frontend ใน Production Mode (เพื่อผลลัพธ์ที่ตรงกับการใช้งานจริง):
   ```bash
   cd frontend
   npm run build
   npm run start
   ```
2. เปิด Google Chrome ในโหมดไม่ระบุตัวตน (Incognito Window) เข้าไปที่ `http://localhost:3000`
3. กด `F12` เพื่อเปิด DevTools -> ไปที่แท็บ **Lighthouse**
4. ตั้งค่า:
   * **Mode**: Navigation (Default)
   * **Device**: Desktop (หรือ Mobile เพื่อทดสอบ Worst-case)
   * **Categories**: Performance
5. กดปุ่ม **Analyze page load**
6. ทำซ้ำกับหน้า:
   * หน้าหลัก: `http://localhost:3000/`
   * หน้าแบบฝึกซ้อม: `http://localhost:3000/practice`
   * หน้าการ์ดคำศัพท์: `http://localhost:3000/flashcards`
   * หน้าจำลองสอบ: `http://localhost:3000/mock-test`

---

### วิธีที่ 2: วัดเวลาโหลดและการสลับหน้า (Network Tab & Tab Switching)
1. เปิดแท็บ **Network** ใน DevTools ติ๊กเลือก `Disable cache` (เพื่อวัด Cold Load) และทดสอบสลับหน้าโดยไม่ติ๊ก (เพื่อวัด Warm Load / Client Cache)
2. สังเกตตัวชี้วัด:
   * **Waterfall Requests**: จำนวน Requests ที่ถูกยิงเมื่อเปิดหน้า
   * **Transferred Size**: ปริมาณข้อมูลที่ดาวน์โหลด
   * **Page Switch Time**: เวลาที่ใช้ในการสลับระหว่างหน้า `/` -> `/flashcards` -> `/` ว่ามี Spinner แวบหรือไม่

---

### วิธีที่ 3: รันสคริปต์ตรวจวัดอัตโนมัติ (CLI Script)
สามารถรันสคริปต์ทดสอบ Response Time และ Payload ของหน้าต่างๆ ได้ด้วยคำสั่ง:
```bash
node scripts/measure-perf.js
```
*(รองรับการระบุ URL เป้าหมาย เช่น `node scripts/measure-perf.js http://localhost:3000`)*

---

## 2. ตารางบันทึกผลการวัดค่า (Benchmark Scorecard)

> **คำแนะนำ**: กรอกตัวเลขก่อนปรับปรุง (Baseline) และหลังการปรับปรุงแต่ละเฟสเพื่อเปรียบเทียบ

### A. Core Web Vitals (Lighthouse Performance)

| หน้า / Route | เมตริก | Baseline (ก่อนแก้) | Phase 1 (Client Cache) | Phase 2 (Lazy Loading) | Phase 3 (HTTP Cache) | ผลลัพธ์รวม |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **`/` (Dashboard)** | **Lighthouse Score** | | | | | |
| | **LCP** (Largest Contentful Paint) | | | | | |
| | **TBT** (Total Blocking Time) | | | | | |
| | **CLS** (Cumulative Layout Shift) | | | | | |
| **`/practice` (Hub)** | **Lighthouse Score** | | | | | |
| | **LCP** | | | | | |
| | **TBT** | | | | | |
| | **Initial Requests Count** | *(เดิม ~2 Requests ทันที)* | | | | |
| **`/flashcards`** | **Lighthouse Score** | | | | | |
| | **LCP** | | | | | |
| | **TBT** | | | | | |
| **`/mock-test`** | **Lighthouse Score** | | | | | |
| | **LCP** | | | | | |
| | **TBT** | | | | | |

---

### B. ความเร็วการตอบสนองในการใช้งานจริง (User-Perceived Speed & Network)

| สถานการณ์ทดสอบ | พฤติกรรมเดิม (ก่อนแก้) | ผลลัพธ์หลังแก้ | หมายเหตุ |
| :--- | :--- | :--- | :--- |
| **สลับหน้า Dashboard ↔ Flashcards** | มี Spinner ทุกครั้ง, ยิง fetch ซ้ำ | | คาดหวัง: 0ms Render ทันที ไม่มี Spinner |
| **เปิดหน้า `/practice` Hub ครั้งแรก** | ยิง `fetchQuestions()` + `fetchFlashcards()` ทันที | | คาดหวัง: ไม่ยิงข้อสอบจนกว่าจะกดเริ่มฝึก |
| **เปิดเว็บเมื่อ Backend หลับ (Cold Start 30-50s)** | รอนาน 10-30s หรือค้างก่อนจะเข้า Fallback | | คาดหวัง: แสดง Local Data ทันทีใน 0ms แล้ว sync เบื้องหลัง |
| **เปิดเว็บเมื่อ Backend ปิดสนิท (Offline)** | โหลดได้แต่มีจังหวะสะดุด/ชะงัก | | คาดหวัง: ใช้งาน Local Mode ได้สมบูรณ์ ไร้ Error บังจอ |

---

## 3. คำสั่งทดสอบ HTTP Cache Headers & Cold Start (Verification)

```bash
# 1. ทดสอบ Headers ข้อสอบ (ต้องได้ public, max-age=300, stale-while-revalidate=600 และ Vary: Origin)
curl -I "http://localhost:4000/questions?part=5"

# 2. ทดสอบ Headers คำศัพท์โหมด Guest (ต้องได้ public, max-age=300 และ Vary: Origin)
curl -I "http://localhost:4000/flashcards"

# 3. ทดสอบ Headers ข้อมูลผู้ใช้จริง (ต้องได้ private, no-cache, no-store, must-revalidate)
curl -I "http://localhost:4000/flashcards?userId=user-demo-123"

# 4. ทดสอบ Cache Busting ของ Admin (ต้องได้ HTTP 200 ไม่ใช่ 400)
curl "http://localhost:4000/questions?part=5&_t=123"

# 5. ทดสอบ Health Check น้ำหนักเบา
curl "http://localhost:4000/health"
```

> **คำแนะนำสำหรับ Cold Start ใน Production**:
> - Frontend มี In-App Warm-up Ping ไปยัง `/health` แบบ Fire-and-forget เมื่อเปิดเว็บ
> - สำหรับป้องกัน Cold Start ถาวรสำหรับผู้ใช้คนแรก แนะนำตั้งค่า External Cron เช่น [UptimeRobot](https://uptimerobot.com) หรือ [Cron-Job.org](https://cron-job.org) ให้ยิง `GET https://<backend>/health` ทุก 10 นาที (เซิร์ฟเวอร์ Render Free Tier จะไม่เข้าสู่ Sleep Mode)

---

## 4. บันทึกข้อสังเกตเพิ่มเติม (Engineering Notes)
*(สามารถจดบันทึกปัญหาที่พบ หรือพฤติกรรมเฉพาะของเบราว์เซอร์ได้ที่นี่)*

- วันที่เริ่มวัด: 
- สภาพแวดล้อม: Node.js v... / Chrome v... / OS: Windows
- หมายเหตุอื่นๆ:
