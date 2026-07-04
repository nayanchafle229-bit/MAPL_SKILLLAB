const express    = require('express');
const router     = express.Router();
const User       = require('../models/User');
const QuizResult = require('../models/QuizResult');
const Question   = require('../models/Question');
const Course     = require('../models/Course');
const Quiz       = require('../models/Quiz');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [users, questions, courses, results, quizzes] = await Promise.all([
      User.countDocuments({ role:'user' }),
      Question.countDocuments({ isActive:true }),
      Course.countDocuments(),
      QuizResult.countDocuments(),
      Quiz.countDocuments({ isActive:true }),
    ]);
    const avgResult = await QuizResult.aggregate([
      { $group: { _id:null, avg:{ $avg:'$percentage' } } }
    ]);
    res.json({
      stats: {
        totalUsers:     users,
        totalQuestions: questions,
        totalCourses:   courses,
        totalAttempts:  results,
        totalQuizzes:   quizzes,
        avgScore:       +(avgResult[0]?.avg||0).toFixed(1),
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role:'user' }).select('-password').sort({ createdAt:-1 });
    res.json({ users });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/results
router.get('/results', async (req, res) => {
  try {
    const results = await QuizResult.find()
      .populate('userId','email profile')
      .populate('quizId','title totalMarks')
      .sort({ createdAt:-1 })
      .select('-answers')
      .limit(300);
    res.json({ results });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await QuizResult.deleteMany({ userId: req.params.id });
    res.json({ message:'User and their results deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
