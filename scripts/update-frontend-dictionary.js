const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'toeic-dictionary.ts');
let content = fs.readFileSync(targetPath, 'utf-8');

const importStatement = `import toeic1000Json from './toeic-1000-words.json';\n`;

// Add import if not present
if (!content.includes('./toeic-1000-words.json')) {
  content = importStatement + content;
}

// Update TOEIC_CATEGORIES
const oldCategories = `export const TOEIC_CATEGORIES = [
  'ALL',
  'Contracts',
  'Finance',
  'Marketing',
  'Human Resources',
  'Logistics',
  'Corporate',
  'Operations',
  'Technology',
  'Travel & Facilities',
] as const;`;

const newCategories = `export const TOEIC_CATEGORIES = [
  'ALL',
  'Contracts',
  'Finance',
  'Marketing',
  'Human Resources',
  'Corporate',
  'Logistics',
  'Manufacturing',
  'Technology',
  'Customer Relations',
  'Hospitality',
  'Facilities',
  'Safety & Health',
] as const;`;

content = content.replace(oldCategories, newCategories);

// Replace TOEIC_DICTIONARY_CARDS
const cardsStart = `export const TOEIC_DICTIONARY_CARDS: FlashcardItem[] = [`;
const cardsEnd = `export const TOEIC_INITIAL_QUESTIONS: QuestionItem[] = [`;

const startIndex = content.indexOf(cardsStart);
const endIndex = content.indexOf(cardsEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Cards boundaries not found!');
  process.exit(1);
}

const newCardsCode = `export const TOEIC_DICTIONARY_CARDS: FlashcardItem[] = (toeic1000Json as Array<{
  id: string;
  word: string;
  partOfSpeech: string;
  meaningTh: string;
  exampleEn: string;
  category: string;
  manaCost: number;
}>).map((item, index) => {
  // จำลอง progress เริ่มต้นสำหรับการ์ด 8 ใบแรกของ Demo User
  let progress: FlashcardItem['progress'] = null;
  if (index === 0) progress = { isKnown: true, swipeCount: 2 };
  else if (index === 2) progress = { isKnown: true, swipeCount: 1 };
  else if (index === 8) progress = { isKnown: true, swipeCount: 1 };
  else if (index === 9) progress = { isKnown: false, swipeCount: 2 };
  else if (index === 16) progress = { isKnown: true, swipeCount: 1 };
  else if (index === 24) progress = { isKnown: false, swipeCount: 1 };
  else if (index === 32) progress = { isKnown: true, swipeCount: 3 };
  else if (index === 39) progress = { isKnown: true, swipeCount: 1 };

  return {
    ...item,
    progress,
  };
});

`;

content = content.slice(0, startIndex) + newCardsCode + content.slice(endIndex);
fs.writeFileSync(targetPath, content, 'utf-8');
console.log('Successfully updated frontend/src/data/toeic-dictionary.ts with 1,230 words!');
