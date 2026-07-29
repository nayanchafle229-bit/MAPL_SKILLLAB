const express     = require('express');
const router      = express.Router();
const User        = require('../models/User');
const QuizResult  = require('../models/QuizResult');
const CourseProgress = require('../models/CourseProgress');
const { protect, progressAccess } = require('../middleware/auth');

// Every route below requires a valid login AND progress-tracking permission
// (admins always pass; regular users only pass if canViewProgress is true).
router.use(protect, progressAccess);

// ────────────────────────────────────────────────────────────
// GET /api/progress/students
// List every student with a rolled-up progress summary, so the
// viewer can scan and pick who to drill into.
// ────────────────────────────────────────────────────────────
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = students.map(s => s._id);

    const agg = await QuizResult.aggregate([
      { $match: { userId: { $in: studentIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$userId',
          totalAttempts: { $sum: 1 },
          passedCount:   { $sum: { $cond: [{ $eq: ['$passStatus', 'PASS'] }, 1, 0] } },
          avgPercentage: { $avg: '$percentage' },
          bestPercentage: { $max: '$percentage' },
          lastAttemptAt: { $first: '$createdAt' },
        },
      },
    ]);

    const courseAgg = await CourseProgress.aggregate([
      { $match: { userId: { $in: studentIds } } },
      {
        $group: {
          _id: '$userId',
          coursesStarted:   { $sum: 1 },
          coursesCompleted: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          lastWatchedAt:    { $max: '$lastWatchedAt' },
        },
      },
    ]);

    const statsMap  = Object.fromEntries(agg.map(a => [a._id.toString(), a]));
    const courseMap = Object.fromEntries(courseAgg.map(c => [c._id.toString(), c]));

    const enriched = students.map(s => {
      const stat   = statsMap[s._id.toString()];
      const course = courseMap[s._id.toString()];
      return {
        ...s,
        progress: {
          totalAttempts:  stat?.totalAttempts || 0,
          passedCount:    stat?.passedCount || 0,
          passRate:       stat?.totalAttempts ? +((stat.passedCount / stat.totalAttempts) * 100).toFixed(1) : 0,
          avgPercentage:  stat?.avgPercentage ? +stat.avgPercentage.toFixed(1) : 0,
          bestPercentage: stat?.bestPercentage ? +stat.bestPercentage.toFixed(1) : 0,
          lastAttemptAt:  stat?.lastAttemptAt || null,
          coursesStarted:   course?.coursesStarted || 0,
          coursesCompleted: course?.coursesCompleted || 0,
          lastWatchedAt:    course?.lastWatchedAt || null,
        },
      };
    });

    res.json({ students: enriched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/progress/students/:id
// Full progress detail for a single student — profile + every
// quiz result (without the heavy per-answer breakdown).
// ────────────────────────────────────────────────────────────
router.get('/students/:id', async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'user' }).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const results = await QuizResult.find({ userId: student._id })
      .populate('quizId', 'title totalMarks passMarks duration category status')
      .sort({ createdAt: -1 })
      .select('-answers');

    const courseProgress = await CourseProgress.find({ userId: student._id })
      .populate('courseId', 'title category thumbnail')
      .sort({ lastWatchedAt: -1 });

    res.json({ student, results, courseProgress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
