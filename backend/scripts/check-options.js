const qs = require('../prisma/data/toeic-questions.json');
const missingD = qs.filter((q) => !q.optionD || q.optionD.trim() === '');
console.log('Total questions:', qs.length);
console.log('Missing optionD:', missingD.length);
const byPart = {};
for (const q of missingD) {
  byPart[q.part] = (byPart[q.part] || 0) + 1;
}
console.log('Missing optionD by Part:', byPart);
missingD.forEach((q) => {
  console.log(`[${q.id}] Part ${q.part}: ${q.questionText} | Options: A: ${q.optionA} | B: ${q.optionB} | C: ${q.optionC}`);
});
