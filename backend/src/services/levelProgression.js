const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');

const LEVELS = ['apprentice', 'adept', 'master', 'legend'];

/**
 * Checks if the user has completed ALL content (all Courses OR all Modules) for a given level.
 */
async function isContentCompletedForLevel(userId, level) {
  // 1. Check Course track
  const coursesInLevel = await Course.find({ level }).lean();
  let courseTrackCompleted = false;
  if (coursesInLevel.length > 0) {
    const courseIds = coursesInLevel.map(c => c._id);
    const completedCourseProgress = await CourseProgress.find({
      userId,
      courseId: { $in: courseIds },
      status: 'completed'
    }).lean();
    courseTrackCompleted = completedCourseProgress.length === coursesInLevel.length;
  }

  // 2. Check Curriculum (Module) track
  const modulesInLevel = await Module.find({ level, isActive: true }).lean();
  let curriculumTrackCompleted = false;
  if (modulesInLevel.length > 0) {
    const moduleIds = modulesInLevel.map(m => m._id);
    const passedModuleProgress = await Progress.find({
      userId,
      moduleId: { $in: moduleIds },
      status: 'passed'
    }).lean();
    curriculumTrackCompleted = passedModuleProgress.length === modulesInLevel.length;
  }

  // If EITHER track is fully completed for this level, return true.
  return courseTrackCompleted || curriculumTrackCompleted;
}

/**
 * Checks if the user has passed the Level Quiz for a given level.
 * A Level Quiz is identified by its `level` field and lacking a courseId.
 */
async function isLevelQuizPassed(userId, level) {
  const levelQuiz = await Quiz.findOne({ 
    level, 
    status: 'published',
    $or: [{ courseId: null }, { courseId: { $exists: false } }],
    quizKey: { $regex: /^level-/ } // By convention, level quizzes can use 'level-{name}-quiz'
  }).lean();

  if (!levelQuiz) {
    // If no level quiz exists for this level, we assume they don't need to pass one,
    // so it's "passed" automatically (failsafe).
    return true; 
  }

  const result = await QuizResult.findOne({
    userId,
    quizId: levelQuiz._id,
    passStatus: 'PASS'
  }).lean();

  return !!result;
}

/**
 * Returns the highest unlocked level index (0 to 3) for a user.
 * 0 = apprentice, 1 = adept, 2 = master, 3 = legend.
 */
async function getHighestUnlockedLevelIndex(userId) {
  let highestUnlocked = 0; // Apprentice is always unlocked

  for (let i = 0; i < LEVELS.length - 1; i++) {
    const level = LEVELS[i];
    
    // To unlock level i+1, user must complete content for level i AND pass its Level Quiz
    const contentCompleted = await isContentCompletedForLevel(userId, level);
    if (!contentCompleted) break;
    
    const quizPassed = await isLevelQuizPassed(userId, level);
    if (!quizPassed) break;

    highestUnlocked = i + 1; // Unlock next level
  }

  return highestUnlocked;
}

/**
 * Determines if a specific level is locked for a user.
 */
async function isLevelLocked(userId, targetLevel) {
  const targetIndex = LEVELS.indexOf(targetLevel);
  if (targetIndex <= 0) return false; // Apprentice is always unlocked

  const highestUnlocked = await getHighestUnlockedLevelIndex(userId);
  return targetIndex > highestUnlocked;
}

/**
 * Get Level Quiz info (if available) for a level where content is completed but quiz is not passed.
 */
async function getPendingLevelQuiz(userId, level) {
  const contentCompleted = await isContentCompletedForLevel(userId, level);
  if (!contentCompleted) return null;

  const quizPassed = await isLevelQuizPassed(userId, level);
  if (quizPassed) return null;

  const levelQuiz = await Quiz.findOne({ 
    level, 
    status: 'published',
    $or: [{ courseId: null }, { courseId: { $exists: false } }],
    quizKey: { $regex: /^level-/ }
  }).lean();

  return levelQuiz;
}

module.exports = {
  LEVELS,
  isContentCompletedForLevel,
  isLevelQuizPassed,
  getHighestUnlockedLevelIndex,
  isLevelLocked,
  getPendingLevelQuiz,
  isQuizLocked
};

/**
 * Determines if a specific quiz is locked for a user.
 */
async function isQuizLocked(userId, quiz) {
  if (!quiz.level) return false; // Not tied to a level, no progression lock

  // 1. If the level itself is locked globally, the quiz is definitely locked.
  const levelLocked = await isLevelLocked(userId, quiz.level);
  if (levelLocked) return true;

  // 2. If the level is UNLOCKED, but this is the "Level Quiz" (capstone), 
  // it requires ALL content in that level to be completed first.
  const isLevelQuiz = quiz.quizKey && quiz.quizKey.startsWith('level-');
  if (isLevelQuiz) {
    const contentCompleted = await isContentCompletedForLevel(userId, quiz.level);
    if (!contentCompleted) {
      return true; // Lock the level quiz until content is completed
    }
  }

  return false;
}
