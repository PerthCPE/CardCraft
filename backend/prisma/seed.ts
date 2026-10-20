// ============================================================================
// prisma/seed.ts
// สคริปต์เริ่มต้นข้อมูล (Database Seeder) สำหรับโปรเจกต์ CardCraft
// ประกอบด้วย:
// - 1 Demo User ("hero@cardcraft.dev")
// - 60 Flashcards รวมพจนานุกรมคำศัพท์ออกสอบบ่อย TOEIC 700-850+ แบ่งตาม 8 หมวดธุรกิจ
// - 15 Questions ข้อสอบ TOEIC ครบทั้ง Listening (Part 1, 2) และ Reading (Part 5, 7)
// ============================================================================

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

export const DEMO_USER_ID = 'demo-hero-1';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Starting CardCraft Database Seeding...');

  await prisma.cardProgress.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();

  // --------------------------------------------------------------------------
  // 1. สร้าง Demo User (Hero Profile)
  // --------------------------------------------------------------------------
  const demoUser = await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      username: 'hero',
      password: hashPassword('123456'),
      email: 'hero@cardcraft.dev',
      name: 'Alden the Rune Challenger',
      targetScore: 700,
      currentEstimatedScore: 625, // Tier 4: Rune Knight (Pre-700 Challenger)
    },
  });

  console.log(`Created Demo User: ${demoUser.name} (${demoUser.email})`);

  // --------------------------------------------------------------------------
  // 2. สร้างคลังพจนานุกรมคำศัพท์ TOEIC 700+ (> 1,000 คำ: 1,230 High-Frequency Business Words)
  // --------------------------------------------------------------------------
  const flashcardsData = require('./data/toeic-1000-words.json');

  await prisma.flashcard.createMany({
    data: flashcardsData,
  });

  await prisma.cardProgress.createMany({
    data: [
      { userId: DEMO_USER_ID, cardId: 'card-0001', isKnown: true, swipeCount: 2 },
      { userId: DEMO_USER_ID, cardId: 'card-0003', isKnown: true, swipeCount: 1 },
      { userId: DEMO_USER_ID, cardId: 'card-0009', isKnown: true, swipeCount: 1 },
      { userId: DEMO_USER_ID, cardId: 'card-0010', isKnown: false, swipeCount: 2 },
      { userId: DEMO_USER_ID, cardId: 'card-0017', isKnown: true, swipeCount: 1 },
      { userId: DEMO_USER_ID, cardId: 'card-0025', isKnown: false, swipeCount: 1 },
      { userId: DEMO_USER_ID, cardId: 'card-0033', isKnown: true, swipeCount: 3 },
      { userId: DEMO_USER_ID, cardId: 'card-0040', isKnown: true, swipeCount: 1 },
    ],
  });

  console.log(`Seeded ${flashcardsData.length} TOEIC 700+ Dictionary Flashcards.`);

  // --------------------------------------------------------------------------
  // 3. สร้าง 56 TOEIC Questions (Listening Parts 1 & 2 + Reading Parts 5 & 7)
  // --------------------------------------------------------------------------
  const questionsData = require('./data/toeic-questions.json');

  await prisma.question.createMany({
    data: questionsData,
  });

  console.log(`Seeded ${questionsData.length} TOEIC Questions (Parts 1, 2, 5, 7).`);

  // --------------------------------------------------------------------------
  // 4. สร้างประวัติการทำข้อสอบ (ExamAttempts)
  // --------------------------------------------------------------------------
  await prisma.examAttempt.createMany({
    data: [
      {
        userId: DEMO_USER_ID,
        mode: 'MINI_MOCK',
        listeningCorrect: 3,
        readingCorrect: 3,
        estimatedScore: 405,
        unlockedTier: 3, // Spell Squire
        isPassedTarget: false,
        timeSpentSeconds: 740,
      },
      {
        userId: DEMO_USER_ID,
        mode: 'READING_DRILL',
        listeningCorrect: 4,
        readingCorrect: 5,
        estimatedScore: 545,
        unlockedTier: 3, // Spell Squire
        isPassedTarget: false,
        timeSpentSeconds: 520,
      },
      {
        userId: DEMO_USER_ID,
        mode: 'MINI_MOCK',
        listeningCorrect: 5,
        readingCorrect: 5,
        estimatedScore: 625,
        unlockedTier: 4, // Rune Knight (Pre-700 Challenger)
        isPassedTarget: false,
        timeSpentSeconds: 685,
      },
    ],
  });

  console.log('Seeded 3 Historical ExamAttempts for Demo Hero.');
  console.log('CardCraft Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding CardCraft database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
