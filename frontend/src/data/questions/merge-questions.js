const fs = require('fs');
const path = require('path');

const existingFePath = path.join(__dirname, '..', 'toeic-questions.json');
const backendPath = path.join(__dirname, '..', '..', '..', '..', 'backend', 'prisma', 'data', 'toeic-questions.json');

const existingQuestions = JSON.parse(fs.readFileSync(existingFePath, 'utf8'));
console.log(`Loaded ${existingQuestions.length} existing questions.`);

const extendedQuestions = [];
for (let p = 1; p <= 7; p++) {
  const filePath = path.join(__dirname, `part${p}-extended.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Loaded Part ${p}: ${data.length} questions`);
  extendedQuestions.push(...data);
}
console.log(`Loaded ${extendedQuestions.length} extended questions in total.`);

// Merge them
const mergedQuestions = [...existingQuestions, ...extendedQuestions];
console.log(`Total merged questions: ${mergedQuestions.length}`);

// Validation checks
const idSet = new Set();
const partCounts = {};

mergedQuestions.forEach(q => {
  if (idSet.has(q.id)) {
    throw new Error(`Duplicate ID found: ${q.id}`);
  }
  idSet.add(q.id);

  partCounts[q.part] = (partCounts[q.part] || 0) + 1;

  if (!q.questionText || !q.optionA || !q.optionB || !q.optionC) {
    throw new Error(`Incomplete question data for ${q.id}`);
  }
  if (q.part !== 2 && !q.optionD) {
    throw new Error(`Missing optionD for non-part2 question ${q.id}`);
  }
  if (!['A', 'B', 'C', 'D'].includes(q.correctOption)) {
    throw new Error(`Invalid correctOption for ${q.id}: ${q.correctOption}`);
  }
});

console.log('Part distribution:');
console.table(partCounts);

// Write to frontend
fs.writeFileSync(existingFePath, JSON.stringify(mergedQuestions, null, 2), 'utf8');
console.log(`Successfully written to ${existingFePath}`);

// Write to backend
fs.writeFileSync(backendPath, JSON.stringify(mergedQuestions, null, 2), 'utf8');
console.log(`Successfully written to ${backendPath}`);
