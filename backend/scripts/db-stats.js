const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const flashcardCount = await prisma.flashcard.count();
  const questionCount = await prisma.question.count();
  const attemptCount = await prisma.examAttempt.count();
  const answerLogCount = await prisma.answerLog.count();
  const progressCount = await prisma.cardProgress.count();

  console.log({
    flashcards: flashcardCount,
    questions: questionCount,
    attempts: attemptCount,
    answerLogs: answerLogCount,
    progress: progressCount,
  });

  await prisma.$disconnect();
}

run();
