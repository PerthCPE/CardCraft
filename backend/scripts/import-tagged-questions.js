// ============================================================================
// import-tagged-questions.js
// สคริปต์นำเข้าค่า errorTag และ vocabId เข้าตาราง Question ใน PostgreSQL
// (รอผู้ใช้งานตรวจทาน toeic-questions-tagged-draft.json และยืนยันก่อนรัน)
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const draftPath = path.join(__dirname, '../prisma/data/toeic-questions-tagged-draft.json');
  if (!fs.existsSync(draftPath)) {
    console.error('Draft file not found at:', draftPath);
    process.exit(1);
  }

  const taggedQuestions = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
  console.log(`Starting import for ${taggedQuestions.length} questions...`);

  let updatedCount = 0;
  for (const item of taggedQuestions) {
    await prisma.question.update({
      where: { id: item.id },
      data: {
        errorTag: item.errorTag,
        vocabId: item.vocabId || null,
      },
    });
    updatedCount++;
  }

  console.log(`Successfully imported errorTag & vocabId for ${updatedCount} questions!`);
}

main()
  .catch((err) => {
    console.error('Import error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
