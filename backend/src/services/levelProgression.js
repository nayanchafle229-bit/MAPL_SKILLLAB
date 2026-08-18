const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');

const LEVELS = ['apprentice', 'adept', 'master', 'legend'];

/**
 * Checks if the user has completed ALL Courses for a given level in a specific category.
 */
async function isContentCompletedForLevel(userId, level, category) {
  const query = { level };
  if (category) query.category = category;
  
  const coursesInLevel = await Course.find(query).lean();
  if (coursesInLevel.length === 0) {
    return true; // No courses to complete
  }
  
  const courseIds = coursesInLevel.map(c => c._id);
  const completedCourseProgress = await CourseProgress.find({
    userId,
    courseId: { $in: courseIds },
    status: 'completed'
  }).lean();
  
  return completedCourseProgress.length === coursesInLevel.length;
}

/**
 * Determines if a specific level is locked for a user IN A SPECIFIC CATEGORY.
 * To unlock Level N, the user must have passed the Level N-1 quiz in that same category.
 */
async function isLevelLocked(userId, targetLevel, category) {
  const targetIndex = LEVELS.indexOf(targetLevel);
  if (targetIndex <= 0) return false; // Apprentice is always unlocked

  const prevLevel = LEVELS[targetIndex - 1];
  
  const query = { level: prevLevel, status: 'published' };
  if (category) query.category = category;

  const prevLevelQuiz = await Quiz.findOne(query).lean();

  if (!prevLevelQuiz) {
    // Failsafe: if there is no quiz configured for the previous level in this category,
    // we default to unlocked so progression isn't hard-blocked.
    return false;
  }

  const result = await QuizResult.findOne({
    userId,
    quizId: prevLevelQuiz._id,
    passStatus: 'PASS'
  }).lean();

  return !result; // Locked if there is NO pass result
}

/**
 * Determines if a specific quiz is locked for a user.
 */
async function isQuizLocked(userId, quiz) {
  if (!quiz.level) return false;

  // 0. If the user has already attempted this quiz, it should remain unlocked 
  // so they can view results or retry (retry limits are enforced separately).
  const previousAttempt = await QuizResult.findOne({ userId, quizId: quiz._id }).lean();
  if (previousAttempt) return false;

  // 1. If the level itself is locked in this category, the quiz is definitely locked.
  const levelLocked = await isLevelLocked(userId, quiz.level, quiz.category);
  if (levelLocked) return true;

  // 2. The quiz requires all courses in this level & category to be completed first.
  const contentCompleted = await isContentCompletedForLevel(userId, quiz.level, quiz.category);
  if (!contentCompleted) {
    return true;
  }

  return false;
}

module.exports = {
  LEVELS,
  isContentCompletedForLevel,
  isLevelLocked,
  isQuizLocked
};
