// ============================================================================
// scripts/tag-questions-semi-auto.js
// สคริปต์วิเคราะห์และแท็ก errorTag และ vocabId สำหรับข้อสอบเดิม 56 ข้อ
// รันแบบ Semi-Auto เพื่อสร้างรายงานตรวจสอบก่อนนำเข้าสู่ฐานข้อมูลจริง
// ============================================================================

const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../prisma/data/toeic-questions.json');
const flashcardsPath = path.join(__dirname, '../prisma/data/toeic-1000-words.json');

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const flashcards = JSON.parse(fs.readFileSync(flashcardsPath, 'utf8'));

// สร้าง Flashcard Map สำหรับค้นหาแบบ Case-insensitive
const wordMap = new Map();
flashcards.forEach((card) => {
  const normalized = card.word.trim().toLowerCase();
  wordMap.set(normalized, card);
  // แยกกรณีคำประสมหรือคำพื้นฐาน
  const singleWords = normalized.split(/\s+/);
  if (singleWords.length > 1) {
    singleWords.forEach((sw) => {
      if (sw.length > 4 && !wordMap.has(sw)) {
        wordMap.set(sw, card);
      }
    });
  }
});

function determineErrorType(q) {
  const tag = (q.tag || '').toLowerCase();
  const expl = (q.explanationTh || '').toLowerCase();

  // 1. Listening Trap (Part 1, 2)
  if (q.part === 1 || q.part === 2) {
    return 'listening_trap';
  }

  // 2. Reading Part 7 (Detail Miss / Comprehension)
  if (q.part === 7) {
    return 'detail_miss';
  }

  // 3. Reading Part 5 (ไวยากรณ์และคำศัพท์)
  // ให้ความสำคัญกับ tag ก่อนเป็นอันดับ 1
  if (tag.includes('word family') || tag.includes('part of speech') || tag.includes('adverb') || tag.includes('adjective') || tag.includes('noun')) {
    return 'part_of_speech';
  }
  if (tag.includes('preposition')) {
    return 'preposition';
  }
  if (tag.includes('conjunction') || tag.includes('connector')) {
    return 'connector';
  }
  if (tag.includes('tense') || tag.includes('verb form') || tag.includes('passive')) {
    return 'tense';
  }
  if (tag.includes('agreement')) {
    return 'subject_verb_agreement';
  }
  if (tag.includes('pronoun')) {
    return 'pronoun';
  }
  if (tag.includes('vocabulary') || tag.includes('collocation')) {
    return 'vocabulary';
  }

  // หาก tag เป็นคำทั่วไป ให้ตรวจสอบจากคำอธิบาย explanationTh
  if (expl.includes('part of speech') || expl.includes('word family') || expl.includes('รูปคำ') || expl.includes('adverb') || expl.includes('adjective')) {
    return 'part_of_speech';
  }
  if (expl.includes('preposition') || expl.includes('บุพบท')) {
    return 'preposition';
  }
  if (expl.includes('คำเชื่อม') || expl.includes('conjunction') || expl.includes('connector')) {
    return 'connector';
  }
  if (expl.includes('tense') || expl.includes('กริยาแท้') || expl.includes('กริยาช่วย')) {
    return 'tense';
  }
  if (expl.includes('พจน์') || (expl.includes('ประธาน') && expl.includes('กริยา'))) {
    return 'subject_verb_agreement';
  }
  if (expl.includes('สรรพนาม') || expl.includes('pronoun')) {
    return 'pronoun';
  }

  return 'vocabulary';
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'under', 'from', 'that', 'this', 'have', 'been',
  'will', 'would', 'should', 'could', 'about', 'after', 'before', 'their', 'there',
  'which', 'when', 'where', 'while', 'into', 'over', 'more', 'most', 'some', 'any'
]);

function findMatchingVocab(q) {
  // ดึงข้อความโจทย์ ตัวเลือก และคำเฉลย
  const correctOptKey = 'option' + q.correctOption;
  const correctOptText = (q[correctOptKey] || '').trim().toLowerCase();
  const tokens = (q.questionText + ' ' + correctOptText)
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’\[\]]/g, ' ')
    .split(/\s+/);

  // 1. ตรวจสอบช้อยส์ที่ถูกต้องก่อน (แม่นยำสูงสุดสำหรับข้อคำศัพท์ / Collocation)
  if (wordMap.has(correctOptText)) {
    const matched = wordMap.get(correctOptText);
    return { vocabId: matched.id, matchedWord: matched.word, matchSource: 'correctOption' };
  }

  // 2. ตรวจสอบคำในโจทย์ (กรอง stop words ออก และเลือกคำที่มีความหมายเฉพาะทางธุรกิจ)
  for (const token of tokens) {
    const cleanToken = token.trim().toLowerCase();
    if (cleanToken.length >= 4 && !STOP_WORDS.has(cleanToken) && wordMap.has(cleanToken)) {
      const matched = wordMap.get(cleanToken);
      return { vocabId: matched.id, matchedWord: matched.word, matchSource: 'questionStem' };
    }
  }

  return { vocabId: null, matchedWord: null, matchSource: 'none' };
}

const taggedQuestions = questions.map((q, idx) => {
  const errorTag = determineErrorType(q);
  const { vocabId, matchedWord, matchSource } = findMatchingVocab(q);

  return {
    index: idx + 1,
    id: q.id,
    part: q.part,
    tag: q.tag,
    errorTag,
    vocabId,
    matchedWord,
    matchSource,
    questionSummary: q.questionText.substring(0, 75) + '...',
  };
});

// บันทึกไฟล์ผลลัพธ์ JSON สำหรับตรวจทาน
const outputPath = path.join(__dirname, '../prisma/data/toeic-questions-tagged-draft.json');
fs.writeFileSync(outputPath, JSON.stringify(taggedQuestions, null, 2), 'utf8');

console.log(`Successfully analyzed and tagged ${taggedQuestions.length} questions.`);

// สรุปสถิติ errorTag
const errorCounts = {};
taggedQuestions.forEach((item) => {
  errorCounts[item.errorTag] = (errorCounts[item.errorTag] || 0) + 1;
});
console.log('\n--- ErrorType Distribution ---');
console.table(errorCounts);

// สรุปสถิติ vocabId linkage
const linkedCount = taggedQuestions.filter((item) => item.vocabId !== null).length;
console.log(`\nLinked to Flashcards: ${linkedCount} / ${taggedQuestions.length} (${Math.round((linkedCount / taggedQuestions.length) * 100)}%)`);
