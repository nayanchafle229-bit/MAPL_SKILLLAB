const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Category = require('../models/Category');
const Module = require('../models/Module');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const unlockEngine = require('../services/unlockEngine');
const videoCompletion = require('../services/videoCompletion');
const { isLevelLocked, isQuizLocked, getQuizLockStatus } = require('../services/levelProgression');

async function testProgression() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Testing Progression Logic...');

  // Use a temporary test user
  const testEmail = `test_student_${Date.now()}@maplskill.test`;
  const testUser = await User.create({
    name: 'Progression Test Student',
    email: testEmail,
    password: 'password123',
    role: 'user',
    profileComplete: true,
  });

  try {
    const userId = testUser._id;
    console.log(`Created test user: ${testEmail} (${userId})`);

    // Step 0: Initialize user progress
    await unlockEngine.initializeUserProgress(userId);

    // Get Category 1 & Category 2
    const cat1 = await Category.findOne({ catNumber: 1 }).lean();
    const cat2 = await Category.findOne({ catNumber: 2 }).lean();

    console.log(`\n--- Verification 1: Initial State ---`);
    const c1L1Locked = await isLevelLocked(userId, 'apprentice', cat1.name);
    const c1L2Locked = await isLevelLocked(userId, 'adept', cat1.name);
    const c2L1Locked = await isLevelLocked(userId, 'apprentice', cat2.name);
    const c2L2Locked = await isLevelLocked(userId, 'adept', cat2.name);

    console.log(`Cat 1 Level 1 (Apprentice) locked: ${c1L1Locked} (Expected: false)`);
    console.log(`Cat 1 Level 2 (Adept) locked: ${c1L2Locked} (Expected: true)`);
    console.log(`Cat 2 Level 1 (Apprentice) locked: ${c2L1Locked} (Expected: false)`);
    console.log(`Cat 2 Level 2 (Adept) locked: ${c2L2Locked} (Expected: true)`);

    if (c1L1Locked !== false || c1L2Locked !== true || c2L1Locked !== false || c2L2Locked !== true) {
      throw new Error('Initial level locking failed');
    }

    // Step 1: Check Cat 1 Level 1 Quiz locking (before videos completed)
    const c1L1Quiz = await Quiz.findOne({ category: cat1.name, level: 'apprentice' }).lean();
    const quizLockBefore = await getQuizLockStatus(userId, c1L1Quiz);
    console.log(`\n--- Verification 2: Quiz Lock Before Videos Completed ---`);
    console.log(`Cat 1 L1 Quiz locked: ${quizLockBefore.locked} (Reason: ${quizLockBefore.reason})`);
    if (!quizLockBefore.locked || quizLockBefore.reason !== 'videos_incomplete') {
      throw new Error('Quiz should be locked before videos completed');
    }

    // Step 2: Partial video completion
    const c1L1Mod = await Module.findOne({ categoryId: cat1._id, level: 'apprentice' }).lean();
    const approvedVideos = (c1L1Mod.videos || []).filter(v => v.status === 'approved' && v.url && v.url !== '-');
    console.log(`Approved videos count in Cat 1 Level 1: ${approvedVideos.length}`);

    if (approvedVideos.length > 1) {
      console.log(`\n--- Verification 3: Partial Video Completion ---`);
      // Mark only the first video complete
      await videoCompletion.markVideoComplete(userId, { url: approvedVideos[0].url });
      const partialQuizLock = await getQuizLockStatus(userId, c1L1Quiz);
      console.log(`After 1/${approvedVideos.length} videos: Quiz locked: ${partialQuizLock.locked} (Expected: true)`);
      if (!partialQuizLock.locked) {
        throw new Error('Quiz must remain locked when only some videos are completed');
      }
    }

    // Step 3: Complete ALL videos in Level 1 & verify two-way sync
    console.log(`\n--- Verification 4: Complete All Videos in Level 1 & Two-Way Sync ---`);
    for (const v of approvedVideos) {
      await videoCompletion.markVideoComplete(userId, { url: v.url });
    }

    // Verify sync to Course section:
    const coursesInC1L1 = await Course.find({ category: cat1.name, level: 'apprentice' }).lean();
    const courseProgs = await CourseProgress.find({
      userId,
      courseId: { $in: coursesInC1L1.map(c => c._id) },
      status: 'completed'
    }).lean();
    console.log(`Courses in C1 L1: ${coursesInC1L1.length}, Completed in CourseProgress: ${courseProgs.length}`);
    if (coursesInC1L1.length > 0 && courseProgs.length !== coursesInC1L1.length) {
      throw new Error('Video completion did not sync to all courses in Course section');
    }

    // Check if Quiz is now unlocked
    const quizLockAfter = await getQuizLockStatus(userId, c1L1Quiz);
    console.log(`After all videos completed: Quiz locked: ${quizLockAfter.locked} (Expected: false)`);
    if (quizLockAfter.locked) {
      throw new Error('Quiz should be unlocked after all videos completed');
    }

    // Level 2 must STILL be locked before taking the quiz!
    const c1L2StillLocked = await isLevelLocked(userId, 'adept', cat1.name);
    console.log(`Completing videos alone: Level 2 locked: ${c1L2StillLocked} (Expected: true)`);
    if (!c1L2StillLocked) {
      throw new Error('Completing videos alone must not unlock the next level');
    }

    // Step 4: Submit a FAILING quiz attempt
    console.log(`\n--- Verification 5: Failing Quiz ---`);
    await QuizResult.create({
      userId,
      quizId: c1L1Quiz._id,
      score: 1,
      totalMarks: c1L1Quiz.totalMarks || 10,
      percentage: 10,
      passStatus: 'FAIL',
      submittedAt: new Date(),
    });

    const c1L2AfterFail = await isLevelLocked(userId, 'adept', cat1.name);
    console.log(`After FAILING quiz: Level 2 locked: ${c1L2AfterFail} (Expected: true)`);
    if (!c1L2AfterFail) {
      throw new Error('Failing quiz must not unlock the next level');
    }

    // Step 5: Submit a PASSING quiz attempt & trigger unlockEngine
    console.log(`\n--- Verification 6: Passing Quiz ---`);
    await QuizResult.create({
      userId,
      quizId: c1L1Quiz._id,
      score: c1L1Quiz.totalMarks || 10,
      totalMarks: c1L1Quiz.totalMarks || 10,
      percentage: 100,
      passStatus: 'PASS',
      submittedAt: new Date(),
    });
    await unlockEngine.onModulePassed(userId, c1L1Mod._id, { scorePercent: 100 });

    const c1L2AfterPass = await isLevelLocked(userId, 'adept', cat1.name);
    console.log(`After PASSING quiz: Cat 1 Level 2 locked: ${c1L2AfterPass} (Expected: false - UNLOCKED!)`);
    if (c1L2AfterPass !== false) {
      throw new Error('Passing quiz must unlock Level 2 in this category');
    }

    // Step 6: Verify Category Independence!
    console.log(`\n--- Verification 7: Category Independence ---`);
    const c2L2AfterCat1Pass = await isLevelLocked(userId, 'adept', cat2.name);
    console.log(`Cat 2 Level 2 locked: ${c2L2AfterCat1Pass} (Expected: true - INDEPENDENT!)`);
    if (c2L2AfterCat1Pass !== true) {
      throw new Error('Passing Category 1 must NOT unlock Category 2!');
    }

    console.log(`\n🎉 ALL PROGRESSION REQUIREMENTS FULLY VERIFIED AND PASSING!`);
  } finally {
    // Clean up test data
    await User.findByIdAndDelete(testUser._id);
    await Progress.deleteMany({ userId: testUser._id });
    await CourseProgress.deleteMany({ userId: testUser._id });
    await QuizResult.deleteMany({ userId: testUser._id });
    console.log('Cleaned up test user and test records.');
    process.exit(0);
  }
}

testProgression().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
