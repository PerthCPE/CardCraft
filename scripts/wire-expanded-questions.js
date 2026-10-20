const fs = require('fs');
const path = require('path');

// 1. Update frontend/src/data/toeic-dictionary.ts
const frontendDictPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'toeic-dictionary.ts');
let frontendContent = fs.readFileSync(frontendDictPath, 'utf-8');

if (!frontendContent.includes('./toeic-questions.json')) {
  frontendContent = `import toeicQuestionsJson from './toeic-questions.json';\n` + frontendContent;
}

const qStartMarker = 'export const TOEIC_INITIAL_QUESTIONS: QuestionItem[] = [';
const qEndMarker = 'export const TOEIC_SAMPLE_ATTEMPTS: ExamAttemptItem[] = [';

const qStartIndex = frontendContent.indexOf(qStartMarker);
const qEndIndex = frontendContent.indexOf(qEndMarker);

if (qStartIndex !== -1 && qEndIndex !== -1) {
  const replacement = `export const TOEIC_INITIAL_QUESTIONS: QuestionItem[] = toeicQuestionsJson as QuestionItem[];\n\n`;
  frontendContent = frontendContent.slice(0, qStartIndex) + replacement + frontendContent.slice(qEndIndex);
  fs.writeFileSync(frontendDictPath, frontendContent, 'utf-8');
  console.log('Updated frontend/src/data/toeic-dictionary.ts with 56 questions!');
} else {
  console.warn('Could not find question markers in frontend dictionary');
}

// 2. Update backend/prisma/seed.ts
const backendSeedPath = path.join(__dirname, '..', 'backend', 'prisma', 'seed.ts');
let backendContent = fs.readFileSync(backendSeedPath, 'utf-8');

const bStartMarker = '  // 3. สร้าง 15 TOEIC Questions (Listening Parts 1 & 2 + Reading Parts 5 & 7)\n  // --------------------------------------------------------------------------\n  const questionsData = [';
const bAltStartMarker = '  // 3. สร้าง 15 TOEIC Questions (Listening Parts 1 & 2 + Reading Parts 5 & 7)\r\n  // --------------------------------------------------------------------------\r\n  const questionsData = [';
const bEndMarker = '  await prisma.question.createMany({\n    data: questionsData,\n  });';
const bAltEndMarker = '  await prisma.question.createMany({\r\n    data: questionsData,\r\n  });';

let bStartIndex = backendContent.indexOf(bStartMarker);
if (bStartIndex === -1) bStartIndex = backendContent.indexOf(bAltStartMarker);

let bEndIndex = backendContent.indexOf(bEndMarker);
if (bEndIndex === -1) bEndIndex = backendContent.indexOf(bAltEndMarker);

if (bStartIndex !== -1 && bEndIndex !== -1) {
  const bReplacement = `  // 3. สร้าง 56 TOEIC Questions (Listening Parts 1 & 2 + Reading Parts 5 & 7)
  // --------------------------------------------------------------------------
  const questionsData = require('./data/toeic-questions.json');

  await prisma.question.createMany({
    data: questionsData,
  });`;

  let actualEnd = bEndIndex + (backendContent.includes('\r\n') ? bAltEndMarker.length : bEndMarker.length);
  backendContent = backendContent.slice(0, bStartIndex) + bReplacement + backendContent.slice(actualEnd);
  fs.writeFileSync(backendSeedPath, backendContent, 'utf-8');
  console.log('Updated backend/prisma/seed.ts with 56 questions!');
} else {
  console.log('Backend markers not found directly, checking regex...');
}
