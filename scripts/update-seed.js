const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'backend', 'prisma', 'seed.ts');
let content = fs.readFileSync(seedPath, 'utf-8');

const startMarker = '  // --------------------------------------------------------------------------\r\n  // 2. สร้างคลังพจนานุกรมคำศัพท์ TOEIC 700+';
const altStartMarker = '  // --------------------------------------------------------------------------\n  // 2. สร้างคลังพจนานุกรมคำศัพท์ TOEIC 700+';
const endMarker = '  console.log(`Seeded ${flashcardsData.length} TOEIC 700+ Dictionary Flashcards.`);';

let startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  startIndex = content.indexOf(altStartMarker);
}
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! Start:', startIndex, 'End:', endIndex);
  process.exit(1);
}

const replacement = `  // --------------------------------------------------------------------------
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

  console.log(\`Seeded \${flashcardsData.length} TOEIC 700+ Dictionary Flashcards.\`);`;

const newContent = content.slice(0, startIndex) + replacement + content.slice(endIndex + endMarker.length);
fs.writeFileSync(seedPath, newContent, 'utf-8');
console.log('Successfully updated backend/prisma/seed.ts with 1,230 words!');
