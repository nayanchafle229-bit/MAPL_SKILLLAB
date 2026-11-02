const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const { isContentCompletedForLevel } = require('./videoCompletion');

const LEVELS = ['apprentice', 'adept', 'master', 'legend'];

/**
 * Determines if a specific level is locked for a user IN A SPECIFIC CATEGORY.
 * Category independence: Category 1 Level 1 passing has zero effect on Category 2 Level 2.
 * Level 1 (apprentice) is always unlocked for every category.
 * To unlock Level N, the user MUST have a QuizResult with passStatus === 'PASS'
 * for the Level N-1 quiz in that same category.
 */
async function isLevelLocked(userId, targetLevel, category) {
  const targetIndex = LEVELS.indexOf(targetLevel);
  if (targetIndex <= 0) return false; // Apprentice (Level 1) is always unlocked

  const prevLevel = LEVELS[targetIndex - 1];
  
  const query = { level: prevLevel, status: 'published' };
  if (category) query.category = category;

  const prevLevelQuiz = await Quiz.findOne(query).lean();

  if (!prevLevelQuiz) {
    // If no published quiz exists for the previous level in this category,
    // progression is not blocked.
    return false;
  }

  const result = await QuizResult.findOne({
    userId,
    quizId: prevLevelQuiz._id,
    passStatus: 'PASS'
  }).lean();

  return !result; // Locked if there is NO PASS result
}

/**
 * Determines if a specific quiz is locked for a user.
 * Rules:
 * 1. If the level is locked in this category -> Quiz is locked.
 * 2. If all videos in this level are NOT completed -> Quiz is locked.
 * 3. Only when all videos are completed does the quiz unlock.
 */
async function isQuizLocked(userId, quiz) {
  if (!quiz.level) return false;

  // 1. If the level itself is locked in this category, the quiz is definitely locked.
  const levelLocked = await isLevelLocked(userId, quiz.level, quiz.category);
  if (levelLocked) return true;

  // 2. The quiz requires ALL videos in this level & category to be completed first.
  const contentCompleted = await isContentCompletedForLevel(userId, quiz.level, quiz.category);
  if (!contentCompleted) {
    return true;
  }

  return false;
}

/**
 * Detailed quiz lock check with reason, for rich UI messaging.
 */
async function getQuizLockStatus(userId, quiz) {
  if (!quiz.level) return { locked: false };

  const levelLocked = await isLevelLocked(userId, quiz.level, quiz.category);
  if (levelLocked) {
    const targetIndex = LEVELS.indexOf(quiz.level);
    const prevLevel = targetIndex > 0 ? LEVELS[targetIndex - 1] : '';
    return {
      locked: true,
      reason: 'level_locked',
      message: `Pass the ${prevLevel ? prevLevel.toUpperCase() : 'previous'} level quiz in this category first.`
    };
  }

  const contentCompleted = await isContentCompletedForLevel(userId, quiz.level, quiz.category);
  if (!contentCompleted) {
    return {
      locked: true,
      reason: 'videos_incomplete',
      message: `Complete all videos in this level first to unlock this quiz.`
    };
  }

  return { locked: false };
}

module.exports = {
  LEVELS,
  isContentCompletedForLevel,
  isLevelLocked,
  isQuizLocked,
  getQuizLockStatus
};
