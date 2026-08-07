// Seeds the Microverse Automation LMS category x level curriculum.
//
// Source: Microverse_LMS_Category_Matrix.xlsx (11 categories x 4 levels = 44
// modules). Each module becomes one Course + one Quiz. Categories 1, 4 and 8
// ("Ready" in the workbook's Quiz Blueprint) ship with fully authored
// question banks; the remaining 8 categories are seeded as empty draft
// quizzes, exactly matching the workbook's own "To author" status — this is
// intentional, not a bug, and mirrors the source data honestly.
//
// Safe to re-run: courses/quizzes/questions are upserted by their stable
// keys (courseKey / quizKey / qId), so running this again after new
// categories are authored will only add what's new.
//
// Usage:  node src/seedAutomation.js

require('dotenv').config();
const mongoose = require('mongoose');
const Course   = require('./models/Course');
const Quiz     = require('./models/Quiz');
const Question = require('./models/Question');

const data = require('./data/automationLMS.json');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || 'smartquiz' });
  console.log('Connected to MongoDB');

  // ---- 1. Courses (modules) ----------------------------------------
  const courseIdByKey = {};
  for (const c of data.courses) {
    const doc = await Course.findOneAndUpdate(
      { title: c.title },
      {
        title: c.title,
        description: c.description,
        videoUrl: c.videoUrl,
        category: c.category,
        level: c.level,
        notes: c.notes,
        createdBy: 'admin',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    courseIdByKey[c.courseKey] = doc._id;
  }
  console.log(`Courses upserted: ${data.courses.length}`);

  // ---- 2. Questions (only categories with authored banks) ----------
  const questionIdByQId = {};
  let qCount = 0;
  for (const q of data.questions) {
    const doc = await Question.findOneAndUpdate(
      { qId: q.qId },
      {
        qId: q.qId,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale,
        category: q.category,
        level: q.level,
        moduleTopic: q.moduleTopic,
        marks: q.marks,
        reviewStatus: q.reviewStatus === 'ready' ? 'reviewed' : 'draft',
        isActive: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    questionIdByQId[q.qId] = doc._id;
    qCount++;
  }
  console.log(`Questions upserted: ${qCount}`);

  // ---- 3. Quizzes (linked to course + questions by key) ------------
  let quizCount = 0;
  for (const qz of data.quizzes) {
    const questionIds = qz.questionQIds.map(id => questionIdByQId[id]).filter(Boolean);
    const totalQuestions = questionIds.length || qz.totalQuestionsTarget;
    const totalMarks = questionIds.length || qz.totalQuestionsTarget;
    const passMarks = Math.ceil((qz.passPercentage / 100) * totalMarks);

    await Quiz.findOneAndUpdate(
      { quizKey: qz.quizKey },
      {
        quizKey: qz.quizKey,
        title: qz.title,
        description: qz.description,
        category: qz.category,
        level: qz.level,
        courseId: courseIdByKey[qz.courseKey] || null,
        totalQuestions,
        totalMarks,
        passMarks,
        passPercentage: qz.passPercentage,
        duration: qz.duration,
        attemptsAllowed: qz.attemptsAllowed,
        questions: questionIds,
        // Only quizzes with a real question bank behind them go live;
        // categories still marked "To author" stay draft until authored.
        status: questionIds.length > 0 ? qz.status : 'draft',
        shuffleQuestions: true,
        shuffleOptions: true,
        negativeMarking: false,
        createdBy: 'admin',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    quizCount++;
  }
  console.log(`Quizzes upserted: ${quizCount}`);

  const readyCount = data.quizzes.filter(q => q.questionQIds.length > 0).length;
  console.log(`\nSummary: ${data.courses.length} modules across 11 categories x 4 levels.`);
  console.log(`${readyCount} quizzes published with real questions (Categories 1, 4, 8).`);
  console.log(`${data.quizzes.length - readyCount} quizzes created as drafts, awaiting question authoring (matches workbook status).`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(err => { console.error(err); process.exit(1); });
