# คู่มือการ Deploy ระบบ CardCraft ขึ้น Cloud ฟรี 100%
(Frontend: Vercel | Backend: Render | Database: Supabase / Neon)

---

## สรุปภาพรวมสถาปัตยกรรม (Cloud Architecture)
```
  [ ผู้ใช้งาน (Browser) ]
            │
            ▼
┌───────────────────────────────┐
│     Vercel (Frontend)         │  Next.js (App Router, Tailwind CSS)
│  https://cardcraft.vercel.app │  มี Offline Fallback อัตโนมัติ
└───────────────┬───────────────┘
                │ REST API (NEXT_PUBLIC_API_URL)
                ▼
┌───────────────────────────────┐
│     Render (Backend API)      │  NestJS + Swagger (/api/docs)
│ https://cardcraft.onrender.com│  อ่าน render.yaml อัตโนมัติ
└───────────────┬───────────────┘
                │ Prisma ORM (DATABASE_URL)
                ▼
┌───────────────────────────────┐
│   Supabase / Neon (Postgres)  │  PostgreSQL Database (Free Tier)
│  (1,230 คำศัพท์ + 56 ข้อสอบ)   │
└───────────────────────────────┘
```

---

## ขั้นตอนที่ 1: Push โค้ดขึ้น GitHub ของคุณ

โปรเจกต์นี้ได้รับการทำ `git commit` ไว้ให้เรียบร้อยแล้ว รันคำสั่งต่อไปนี้ใน Terminal เพื่อส่งโค้ดขึ้น GitHub:

```bash
# 1. ตั้งชื่อ branch เป็น main
git branch -M main

# 2. เชื่อมโยงกับ GitHub Repository ของคุณ (สร้าง repo เปล่าบน github.com ก่อน)
git remote add origin https://github.com/<ชื่อผู้ใช้_GITHUB>/CardCraft.git

# 3. Push โค้ดทั้งหมดขึ้น GitHub
git push -u origin main
```

---

## ขั้นตอนที่ 2: สร้างฐานข้อมูล PostgreSQL ฟรี (Supabase หรือ Neon)

### ตัวเลือก A: Supabase (แนะนำ)
1. เข้าไปที่ [supabase.com](https://supabase.com) แล้ว Login / Sign Up ฟรี
2. กด **"New Project"**
   - ตั้งชื่อโปรเจกต์: `cardcraft-db`
   - ตั้ง Database Password (จดรหัสผ่านไว้)
   - เลือก Region: `Singapore` (ใกล้ไทย ตอบสนองเร็วที่สุด)
3. เมื่อสร้างเสร็จ ไปที่เมนู **Project Settings** -> **Database**
4. เลื่อนลงไปที่หัวข้อ **Connection string** -> เลือกแท็บ **URI**
5. คัดลอก URL จะได้รูปแบบดังนี้:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```
   *(อย่าลืมแทนที่ `[YOUR-PASSWORD]` ด้วยรหัสผ่านที่คุณตั้งไว้)*

---

## ขั้นตอนที่ 3: Deploy Backend บน Render (ฟรี)

โปรเจกต์นี้มีไฟล์ [`render.yaml`](file:///c:/Users/perth/Desktop/coding/Portfolio/CardCraft/render.yaml) เตรียมไว้แล้ว สามารถ Deploy ได้ทันที:

1. เข้าไปที่ [render.com](https://render.com) แล้ว Login ด้วย GitHub
2. กดปุ่ม **"New +"** ด้านบนขวา -> เลือก **"Blueprint"** (หรือ **"Web Service"**)
3. เลือก Repository `CardCraft` ที่คุณเพิ่ง Push ขึ้นไป
4. Render จะตรวจพบไฟล์ `render.yaml` และตั้งค่าให้อัตโนมัติ:
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma db push && npm run start:prod`
5. ในช่อง **DATABASE_URL**: ให้วาง Connection String จาก Supabase/Neon ที่ได้จากขั้นตอนที่ 2
6. กด **"Apply"** หรือ **"Create Web Service"**
7. รอประมาณ 2–3 นาที Render จะให้ URL มา เช่น:
   ```
   https://cardcraft-backend.onrender.com
   ```
8. ทดสอบเปิดดู Swagger API ได้ที่: `https://cardcraft-backend.onrender.com/api/docs`

> **Tip:** หากต้องการ Seed คำศัพท์ 1,230 คำ และข้อสอบ 56 ข้อลงฐานข้อมูล Cloud ให้รันคำสั่งนี้บนเครื่องคุณเพียงครั้งเดียว:
> ```bash
> cd backend
> # แก้ DATABASE_URL ในไฟล์ backend/.env ให้เป็น URL ของ Supabase ชั่วคราว แล้วรัน:
> npm run prisma:seed
> ```

---

## ขั้นตอนที่ 4: Deploy Frontend บน Vercel (ฟรี)

1. เข้าไปที่ [vercel.com](https://vercel.com) แล้ว Login ด้วย GitHub
2. กดปุ่ม **"Add New..."** -> เลือก **"Project"**
3. เลือก Repository `CardCraft` แล้วกด **"Import"**
4. ตั้งค่าโปรเจกต์ดังนี้:
   - **Root Directory**: กดปุ่ม **Edit** แล้วเลือกโฟลเดอร์ `frontend` *(สำคัญมาก!)*
   - **Framework Preset**: `Next.js` (จะขึ้นให้อัตโนมัติ)
5. เปิดหัวข้อ **Environment Variables** แล้วเพิ่มตัวแปร:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: วาง URL ของ Render Backend เช่น `https://cardcraft-backend.onrender.com` (ไม่ต้องมี slash `/` ต่อท้าย)
6. กดปุ่ม **"Deploy"**
7. รอประมาณ 1 นาที Vercel จะสร้าง URL เว็บไซต์ให้ทันที เช่น:
   ```
   https://cardcraft-xxx.vercel.app
   ```

---

## ฟีเจอร์ความทนทาน (Zero-Downtime Offline Fallback)
แม้ว่าเซิร์ฟเวอร์ Backend ฟรีบน Render จะติดโหมด Sleep เมื่อไม่มีคนใช้งาน ระบบ Frontend ของ CardCraft ได้ถูกออกแบบไว้ให้สลับมาใช้ **Local Storage + Offline Fallback** อัตโนมัติ ทำให้ผู้ใช้สามารถ:
* ปัดการ์ดคำศัพท์ สลับและสุ่มชุดการ์ด 30-200 คำ
* เล่นมินิเกมจำศัพท์ 5 นาที (Vocab Blitz)
* ทำข้อสอบ Mini Mock Test และคำนวณคะแนนสเกล 10-990 ได้อย่างลื่นไหล 100% ตลอดเวลา!
