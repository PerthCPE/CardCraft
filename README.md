# CardCraft — Gamified Pixel-Art RPG TOEIC 700+ Web Application

**CardCraft** คือเว็บแอปพลิเคชันเตรียมสอบ **TOEIC เป้าหมาย 700+ คะแนน** ในรูปแบบ **Hybrid Pixel-Art RPG & Neo-Brutalist EdTech** พัฒนาสำหรับรายวิชา **Software Engineering (SE)** ด้วยสถาปัตยกรรม Monorepo แยกฝั่ง Backend และ Frontend อย่างเป็นระบบ

---

## 1. โครงสร้างโปรเจกต์ (Monorepo Architecture)

```text
CardCraft/
├── .agents/skills/cardcraft-pixel-ui/SKILL.md   # กฎการออกแบบ Pixel-RPG & Anti-AI Slop UI/UX
├── .github/workflows/ci.yml                     # GitHub Actions CI (Lint + Jest Tests + Build)
├── docker-compose.yml                           # PostgreSQL 16 สำหรับ Local Development
├── backend/                                     # NestJS + Prisma ORM + Swagger + Jest Unit Tests
│   ├── prisma/
│   │   ├── schema.prisma                        # 5 Models: User, Flashcard, CardProgress, Question, ExamAttempt
│   │   └── seed.ts                              # Seed: 1 Demo Hero + 60 TOEIC 700+ Words + 15 Questions
│   └── src/
│       ├── common/utils/character-evolution.util.ts # ระบบคำนวณ 7-Tier Evolution & TOEIC Scaled Score
│       ├── prisma/                              # Global PrismaService (DI Singleton)
│       ├── users/                               # Hero Profile & Dashboard Summary API
│       ├── flashcards/                          # Full CRUD + Card Swipe Progress Upsert API
│       ├── questions/                           # Full CRUD + TOEIC Section/Part Filtering API
│       └── exams/                               # Boss Battle Submit API + Jest Unit Tests (20/20 Pass)
└── frontend/                                    # Next.js 14 (App Router) + Tailwind CSS + Framer Motion
    ├── public/
    │   ├── icons/                               # Pixel Art UI Icons (Deck, Mana, Timer, Boss Gate, Trophy)
    │   ├── sprites/                             # 7-Tier Character Sprites (tier-1-novice .. tier-7-deity)
    │   └── images/toeic/                        # TOEIC Part 1 Scene Illustrations
    └── src/
        ├── app/
        │   ├── page.tsx                         # Hero HUD + 7-Stage Evolution Roadmap + Battle Log
        │   ├── flashcards/page.tsx              # 3D Flip & Swipe Spell Cards + 60-Word TOEIC Dictionary
        │   ├── practice/page.tsx                # Listening (Parts 1-2 Audio) & Reading (Part 5 20s / Part 7 Split)
        │   ├── mock-test/page.tsx               # Boss Battle Timed Mock Test + Class Evolution Result
        │   └── admin/page.tsx                   # Admin Guild Full CRUD Manager (Flashcards & Questions)
        ├── components/                          # Navbar, PixelCharacterAvatar (with SVG Fallback)
        ├── data/toeic-dictionary.ts             # คลังคำศัพท์ออกสอบบ่อย TOEIC 700+ (60 คำ 8 หมวดธุรกิจ)
        └── lib/api.ts                           # Hybrid API Client (NestJS REST + Auto LocalStorage Fallback)
```

---

## 2. วิธีรันโปรเจกต์ (Quick Start)

### ขั้นตอนที่ 1: รันฐานข้อมูล PostgreSQL (ทางเลือก — หากไม่เปิด Docker ตัว Frontend จะสลับเป็นโหมด Local Sync อัตโนมัติ)
```bash
docker compose up -d
```

### ขั้นตอนที่ 2: รันฝั่ง Backend (NestJS + Prisma)
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run start:dev
```
- Backend API: `http://localhost:4000`
- Swagger OpenAPI Docs: `http://localhost:4000/api/docs`

### ขั้นตอนที่ 3: รันฝั่ง Frontend (Next.js App Router)
```bash
cd frontend
npm install
npm run dev
```
- เปิดเว็บที่: `http://localhost:3000`

---

## 3. การรันชุดทดสอบ Unit Tests (Jest)

```bash
# ทดสอบฝั่ง Backend (20 Test Cases ครอบคลุมทุกขอบเขต 7 Tiers และสเกลคะแนน TOEIC 10-990)
cd backend
npm test

# ทดสอบฝั่ง Frontend
cd ../frontend
npm test
```
