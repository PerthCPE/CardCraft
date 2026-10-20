// ============================================================================
// prisma/seed.ts
// สคริปต์เริ่มต้นข้อมูลจริง (Database Seeder) สำหรับ CardCraft Release v1.0
// ประกอบด้วย:
// - คลังพจนานุกรมคำศัพท์ TOEIC 700+ จำนวน 1,230 คำ (จัดตาม 8 หมวดธุรกิจ)
// - คลังข้อสอบ TOEIC เสมือนจริง 56 ข้อ (Part 1, 2, 5, 7)
// * ไม่มีการสร้าง Demo User หรือข้อมูลทดสอบจำลอง (Real Release Data Only) *
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting CardCraft Release v1.0 Database Seeding...');

  // ล้างเฉพาะตารางคำศัพท์และข้อสอบหลัก เพื่อให้พร้อมใช้งาน
  await prisma.cardProgress.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.question.deleteMany();

  // --------------------------------------------------------------------------
  // 1. นำเข้าคลังพจนานุกรมคำศัพท์ TOEIC 700+ (1,230 คำ)
  // --------------------------------------------------------------------------
  const flashcardsData = require('./data/toeic-1000-words.json');

  await prisma.flashcard.createMany({
    data: flashcardsData,
  });

  console.log(`Seeded ${flashcardsData.length} TOEIC 700+ Dictionary Flashcards.`);

  // --------------------------------------------------------------------------
  // 2. นำเข้าคลังข้อสอบ TOEIC 56 ข้อ (Listening Parts 1 & 2 + Reading Parts 5 & 7)
  // --------------------------------------------------------------------------
  const questionsData = require('./data/toeic-questions.json');

  await prisma.question.createMany({
    data: questionsData,
  });

  console.log(`Seeded ${questionsData.length} TOEIC Questions (Parts 1, 2, 5, 7).`);
  console.log('CardCraft Release v1.0 Database Seeding Completed Successfully! (No Mock User)');
}

main()
  .catch((e) => {
    console.error('Error seeding CardCraft database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
