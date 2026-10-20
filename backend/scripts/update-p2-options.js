const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const p2OptionDMap = {
  'q-list-p2-01': 'The board members had a productive conference.',
  'q-list-p2-02': 'A rental shuttle was arranged for tomorrow.',
  'q-list-p2-03': 'The wireless router is located in the breakroom.',
  'q-list-p2-04': 'My department head approved the relocation.',
  'q-list-p2-05': 'We purchased three new office workstations.',
  'q-list-p2-06': 'The quarterly budget meeting was postponed.',
  'q-list-p2-07': 'The keynote presentation starts at nine o’clock.',
  'q-list-p2-08': 'Our marketing team launched the campaign last spring.',
};

async function main() {
  console.log('--- Updating Part 2 Option D (Completing 4-Option Test Bank) ---');

  // 1. Update toeic-questions.json
  const qPath = path.join(__dirname, '../prisma/data/toeic-questions.json');
  const questions = JSON.parse(fs.readFileSync(qPath, 'utf8'));
  for (const q of questions) {
    if (p2OptionDMap[q.id]) {
      q.optionD = p2OptionDMap[q.id];
    }
  }
  fs.writeFileSync(qPath, JSON.stringify(questions, null, 2), 'utf8');
  console.log('Updated toeic-questions.json');

  // 2. Update toeic-questions-tagged-draft.json if exists
  const taggedPath = path.join(__dirname, '../prisma/data/toeic-questions-tagged-draft.json');
  if (fs.existsSync(taggedPath)) {
    const tagged = JSON.parse(fs.readFileSync(taggedPath, 'utf8'));
    for (const q of tagged) {
      if (p2OptionDMap[q.id]) {
        q.optionD = p2OptionDMap[q.id];
      }
    }
    fs.writeFileSync(taggedPath, JSON.stringify(tagged, null, 2), 'utf8');
    console.log('Updated toeic-questions-tagged-draft.json');
  }

  // 3. Update PostgreSQL Supabase Database
  for (const [id, optD] of Object.entries(p2OptionDMap)) {
    await prisma.question.update({
      where: { id },
      data: { optionD: optD },
    });
    console.log(`Updated in DB: ${id} -> Option D added`);
  }

  console.log('All 8 Part 2 questions now have 4 complete options (A, B, C, D)!');
}

main()
  .catch((e) => {
    console.error('Error updating P2 options:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
