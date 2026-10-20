// ============================================================================
// migrate-card-progress-sr.js
// Migration สำหรับปรับปรุงข้อมูล CardProgress เดิมเข้าสู่ระบบ Spaced Repetition (Task B)
// - คำที่ isKnown=true: ตั้ง intervalDays เริ่มต้นสมเหตุสมผล (เช่น 3 วัน) และ dueAt = วันนี้ + 3 วัน
// - คำที่ isKnown=false: ตั้ง intervalDays = 1, dueAt = ตอนนี้ (เพื่อให้พร้อมทบทวนทันที)
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allProgress = await prisma.cardProgress.findMany();
  console.log(`Found ${allProgress.length} existing CardProgress records.`);

  const now = new Date();
  let migratedCount = 0;

  for (const prog of allProgress) {
    if (prog.isKnown) {
      // สำหรับคำที่จำได้แล้ว (Mastered) ให้ interval = 3 วัน และ dueAt = 3 วันข้างหน้า
      const due = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      await prisma.cardProgress.update({
        where: { id: prog.id },
        data: {
          intervalDays: 3.0,
          dueAt: due,
          easeFactor: 2.5,
          correctCount: Math.max(1, prog.swipeCount),
          wrongCount: 0,
        },
      });
    } else {
      // สำหรับคำที่ยังจำไม่ได้ (Still Learning) ให้ dueAt = ตอนนี้ เพื่อให้อยู่ในคิวทบทวนทันที
      await prisma.cardProgress.update({
        where: { id: prog.id },
        data: {
          intervalDays: 1.0,
          dueAt: now,
          easeFactor: 2.3,
          correctCount: 0,
          wrongCount: Math.max(1, prog.swipeCount),
          lastWrongAt: now,
        },
      });
    }
    migratedCount++;
  }

  console.log(`Successfully migrated ${migratedCount} CardProgress records to Spaced Repetition!`);
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
