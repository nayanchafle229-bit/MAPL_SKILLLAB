const express    = require('express');
const router     = express.Router();
const Quiz       = require('../models/Quiz');
const Question   = require('../models/Question');
const QuizResult = require('../models/QuizResult');
const { protect, adminOnly } = require('../middleware/auth');

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ────────────────────────────────────────────────────────────
// POST /api/admin/quiz  —  Create quiz + auto-select questions
// ISSUE 3 FIX: saves question ObjectIds into quiz.questions[]
// ────────────────────────────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      title, description, totalQuestions, totalMarks,
      passMarks, duration, level, caseStudyPrompt,
      negativeMarking, negativeMarksPerQ,
      shuffleQuestions, shuffleOptions,
      category, attemptsAllowed,
    } = req.body;

    // Validate required fields
    if (!title)          return res.status(400).json({ message: 'Title is required' });
    if (!totalQuestions) return res.status(400).json({ message: 'totalQuestions is required' });
    if (!totalMarks)     return res.status(400).json({ message: 'totalMarks is required' });
    if (!passMarks)      return res.status(400).json({ message: 'passMarks is required' });
    if (!duration)       return res.status(400).json({ message: 'duration is required' });
    if (!level)          return res.status(400).json({ message: 'level is required' });

    // Validate enough questions exist
    const qCount = await Question.countDocuments({ level, category, isActive: true });
    
    if (totalQuestions > 0 && totalQuestions > qCount) {
      return res.status(400).json({ message: `Need ${totalQuestions} ${level} questions for ${category}, only ${qCount} in DB` });
    }

    // Random $sample matching category and level
    const questions = await Question.aggregate([
      { $match: { level, category, isActive: true } },
      { $sample: { size: Number(totalQuestions) } }
    ]);

    // Shuffle list
    const selectedQuestionIds = shuffle(questions).map(q => q._id);

    if (selectedQuestionIds.length !== Number(totalQuestions)) {
      return res.status(500).json({ message: `Expected ${totalQuestions} questions but got ${selectedQuestionIds.length}` });
    }

    const passPercentage = parseFloat(((passMarks / totalMarks) * 100).toFixed(2));

    // ISSUE 3 FIX: save as quiz.questions[] (not questionIds)
    const quiz = await Quiz.create({
      title,
      description:       description || '',
      totalQuestions,
      totalMarks,
      passMarks,
      passPercentage,
      duration,
      level,
      caseStudyPrompt:   level === 'legend' ? (caseStudyPrompt || '') : '',
      questions:         selectedQuestionIds,   // ← correct field name
      negativeMarking:   !!negativeMarking,
      negativeMarksPerQ: parseFloat(negativeMarksPerQ) || 0.25,
      shuffleQuestions:  shuffleQuestions !== false,
      shuffleOptions:    shuffleOptions   !== false,
      category:          category || 'General',
      attemptsAllowed:   attemptsAllowed  || 1,
      status:            'draft',              // always starts as draft
      createdBy:         'admin',
    });

    res.status(201).json({
      quiz,
      message: `Quiz created in DRAFT. Add questions then publish it.`,
      questionCount: selectedQuestionIds.length,
    });
  } catch (err) {
    console.error('Create quiz error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/admin/quiz  — list ALL quizzes (draft + published)
// ────────────────────────────────────────────────────────────
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .select('-questions');   // don't bloat list with question IDs

    // Attach live stats
    const ids = quizzes.map(q => q._id);
    const counts = await QuizResult.aggregate([
      { $match: { quizId: { $in: ids } } },
      { $group: { _id: '$quizId', count: { $sum: 1 }, avgScore: { $avg: '$percentage' }, passCount: { $sum: { $cond: [{ $eq: ['$passStatus','PASS'] }, 1, 0] } } } }
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c]));

    const enriched = quizzes.map(q => ({
      ...q.toObject(),
      attemptCount: countMap[q._id.toString()]?.count    || 0,
      avgScore:    +(countMap[q._id.toString()]?.avgScore || 0).toFixed(1),
      passCount:    countMap[q._id.toString()]?.passCount || 0,
    }));

    res.json({ quizzes: enriched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/admin/quiz/:id  — single quiz WITH populated questions
// ISSUE 3 FIX: .populate('questions')
// ────────────────────────────────────────────────────────────
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// PATCH /api/admin/quiz/:id/publish  — ISSUE 4: publish/unpublish
// ────────────────────────────────────────────────────────────
router.patch('/:id/publish', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Must have questions before publishing
    if (quiz.status === 'draft' && quiz.questions.length === 0) {
      return res.status(400).json({ message: 'Cannot publish a quiz with no questions' });
    }

    quiz.status = quiz.status === 'published' ? 'draft' : 'published';
    await quiz.save();

    res.json({
      quiz,
      message: quiz.status === 'published'
        ? '✅ Quiz published — now visible to students'
        : '📝 Quiz moved back to draft'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// PUT /api/admin/quiz/:id  — Update quiz settings
// ────────────────────────────────────────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const allowed = ['title','description','passMarks','duration','status',
                     'negativeMarking','negativeMarksPerQ','shuffleQuestions',
                     'shuffleOptions','attemptsAllowed','category','caseStudyPrompt'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    // Recalculate passPercentage if passMarks changed
    if (req.body.passMarks !== undefined) {
      const quiz = await Quiz.findById(req.params.id);
      if (quiz) {
        if (quiz.totalMarks && quiz.totalMarks > 0) {
          update.passPercentage = parseFloat(((req.body.passMarks / quiz.totalMarks) * 100).toFixed(2));
        } else {
          update.passPercentage = 0;
        }
      }
    }

    const quiz = await Quiz.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ quiz, message: 'Quiz updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// DELETE /api/admin/quiz/:id
// ────────────────────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Promise.all([
      Quiz.findByIdAndDelete(req.params.id),
      QuizResult.deleteMany({ quizId: req.params.id }),
    ]);
    res.json({ message: 'Quiz and all results deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/admin/quiz/:id/questions  — add questions to existing quiz
// ────────────────────────────────────────────────────────────
router.post('/:id/questions', protect, adminOnly, async (req, res) => {
  try {
    const { questionIds } = req.body;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: 'questionIds array is required' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Verify questions exist
    const validQs = await Question.find({ _id: { $in: questionIds }, isActive: true }).select('_id');
    if (validQs.length !== questionIds.length) {
      return res.status(400).json({ message: `Only ${validQs.length} of ${questionIds.length} questions found in DB` });
    }

    // Add without duplicates
    const existing = new Set(quiz.questions.map(id => id.toString()));
    const newIds   = validQs.map(q => q._id).filter(id => !existing.has(id.toString()));
    quiz.questions.push(...newIds);
    quiz.totalQuestions = quiz.questions.length;
    await quiz.save();

    res.json({ quiz, message: `${newIds.length} questions added to quiz` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// DELETE /api/admin/quiz/:id/questions/:qid  — remove a question
// ────────────────────────────────────────────────────────────
router.delete('/:id/questions/:qid', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    quiz.questions = quiz.questions.filter(id => id.toString() !== req.params.qid);
    quiz.totalQuestions = quiz.questions.length;
    await quiz.save();
    res.json({ message: 'Question removed from quiz' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/admin/quiz/:id/leaderboard
// ISSUE 5 FIX: ranking logic 100→#1, 99→#2, ties share same rank
// ────────────────────────────────────────────────────────────
router.get('/:id/leaderboard', protect, async (req, res) => {
  try {
    const results = await QuizResult.find({ quizId: req.params.id })
      .populate('userId', 'email profile')
      .sort({ score: -1, timeTaken: 1 })
      .select('-answers');

    // Dense ranking: same score → same rank; next rank = count of higher-scorers + 1
    const ranked = results.map((r, i) => {
      let rank = 1;
      for (let j = 0; j < i; j++) {
        if (results[j].score > r.score) rank++;
        else if (results[j].score === r.score && results[j].timeTaken < r.timeTaken) rank++;
      }
      return {
        rank,
        name:        r.userId?.profile?.name || r.userId?.email?.split('@')[0] || 'Student',
        email:       r.userId?.email,
        userId:      r.userId?._id,
        score:       r.score,
        totalMarks:  r.totalMarks,
        percentage:  r.percentage,
        passStatus:  r.passStatus,
        timeTaken:   r.timeTaken,
        submittedAt: r.submittedAt,
        resultId:    r._id,
        correctAnswers: r.correctAnswers,
        wrongAnswers:   r.wrongAnswers,
      };
    });

    const quiz = await Quiz.findById(req.params.id).select('title passMarks totalMarks passPercentage status');
    res.json({ leaderboard: ranked, quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/admin/quiz/:id/stats
// ────────────────────────────────────────────────────────────
router.get('/:id/stats', protect, adminOnly, async (req, res) => {
  try {
    const results = await QuizResult.find({ quizId: req.params.id });
    if (!results.length) return res.json({ stats: null });

    const scores  = results.map(r => r.percentage);
    const passed  = results.filter(r => r.passStatus === 'PASS').length;

    res.json({
      stats: {
        totalAttempts: results.length,
        passed,
        failed:    results.length - passed,
        passRate: +((passed / results.length) * 100).toFixed(1),
        avgScore: +(scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1),
        maxScore:  Math.max(...scores),
        minScore:  Math.min(...scores),
        avgTime:   Math.round(results.reduce((a, r) => a + r.timeTaken, 0) / results.length),
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
