const express    = require('express');
const router     = express.Router();
const Quiz       = require('../models/Quiz');
const Question   = require('../models/Question');
const QuizResult = require('../models/QuizResult');
const { protect } = require('../middleware/auth');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ────────────────────────────────────────────────────────────
// GET /api/quiz  — list PUBLISHED quizzes for students
// ISSUE 2 FIX: filter by status === 'published' only
// ────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    // ISSUE 2 FIX: only published quizzes visible to students
    const quizzes = await Quiz.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .select('-questions'); // don't expose question IDs

    if (!quizzes.length) {
      return res.json({ quizzes: [], message: 'No published quizzes yet' });
    }

    // Mark which ones this user already attempted
    const userId = req.user._id;
    let attemptMap = {};

    if (userId && userId !== 'admin') {
      const attempts = await QuizResult.find({ userId })
        .select('quizId score percentage passStatus rank attemptNumber');
      attemptMap = Object.fromEntries(
        attempts.map(a => [a.quizId.toString(), a])
      );
    }

    const enriched = quizzes.map(q => ({
      ...q.toObject(),
      attempted:    !!attemptMap[q._id.toString()],
      myScore:      attemptMap[q._id.toString()]?.score       ?? null,
      myPct:        attemptMap[q._id.toString()]?.percentage  ?? null,
      myStatus:     attemptMap[q._id.toString()]?.passStatus  ?? null,
      myRank:       attemptMap[q._id.toString()]?.rank        ?? null,
    }));

    res.json({ quizzes: enriched });
  } catch (err) {
    console.error('GET /api/quiz error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/quiz/:id/start  — fetch quiz + shuffled questions
// ISSUE 3 FIX: uses quiz.questions.populate() not questionIds
// ────────────────────────────────────────────────────────────
router.get('/:id/start', protect, async (req, res) => {
  try {
    if (req.user.id === 'admin') {
      return res.status(403).json({ message: 'Admin cannot take quizzes' });
    }

    // ISSUE 3 FIX: populate 'questions' (not 'questionIds')
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz)                         return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.status !== 'published')   return res.status(400).json({ message: 'This quiz is not published yet' });
    if (!quiz.questions?.length)       return res.status(400).json({ message: 'This quiz has no questions configured' });

    // Check attempt limit
    const attemptsDone = await QuizResult.countDocuments({ userId: req.user._id, quizId: quiz._id });
    if (attemptsDone >= quiz.attemptsAllowed) {
      const lastResult = await QuizResult.findOne({ userId: req.user._id, quizId: quiz._id }).sort({ createdAt: -1 });
      return res.status(409).json({
        message: `You have used all ${quiz.attemptsAllowed} attempt(s) for this quiz`,
        resultId: lastResult?._id,
      });
    }

    // Shuffle question order
    let questions = [...quiz.questions];
    if (quiz.shuffleQuestions) questions = shuffle(questions);

    // Build client-safe question objects (no correctAnswer)
    const optionKeys = ['A','B','C','D'];
    const clientQs = questions.map(q => {
      let opts = optionKeys.map(k => ({ key: k, text: q.options[k] }));
      if (quiz.shuffleOptions) opts = shuffle(opts);

      // Build option map so submit can reverse-resolve shuffled label → original key
      const optMap = {};
      opts.forEach((o, i) => {
        optMap[optionKeys[i]] = { text: o.text, originalKey: o.key };
      });

      return {
        _id:        q._id,
        question:   q.question,
        difficulty: q.difficulty,
        marks:      q.marks || 1,
        category:   q.category,
        // Shuffled options (A/B/C/D labels may map to different original options)
        options:    Object.fromEntries(optionKeys.map((l, i) => [l, opts[i].text])),
        // Sent to client so submit can reverse-map without server state
        _optMap:    optMap,
      };
    });

    res.json({
      quiz: {
        _id:             quiz._id,
        title:           quiz.title,
        description:     quiz.description,
        totalQuestions:  quiz.totalQuestions,
        totalMarks:      quiz.totalMarks,
        passMarks:       quiz.passMarks,
        passPercentage:  quiz.passPercentage,
        duration:        quiz.duration,
        negativeMarking: quiz.negativeMarking,
        negativeMarksPerQ: quiz.negativeMarksPerQ,
        attemptsAllowed: quiz.attemptsAllowed,
        attemptsDone,
        attemptsLeft:    quiz.attemptsAllowed - attemptsDone,
      },
      questions: clientQs,
    });
  } catch (err) {
    console.error('GET /api/quiz/:id/start error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/quiz/:id/submit
// ISSUE 5 FIX: score, percentage, pass/fail, rank all computed
// ────────────────────────────────────────────────────────────
router.post('/:id/submit', protect, async (req, res) => {
  try {
    if (req.user.id === 'admin') {
      return res.status(403).json({ message: 'Admin cannot submit quizzes' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Check attempt count
    const attemptsDone = await QuizResult.countDocuments({ userId: req.user._id, quizId: quiz._id });
    if (attemptsDone >= quiz.attemptsAllowed) {
      return res.status(409).json({ message: `All ${quiz.attemptsAllowed} attempt(s) already used` });
    }

    const { answers = [], timeTaken = 0 } = req.body;
    if (!answers.length) return res.status(400).json({ message: 'No answers provided' });

    // Fetch correct answers from DB
    const qIds      = answers.map(a => a.questionId);
    const dbQuestions = await Question.find({ _id: { $in: qIds } }).select('correctAnswer difficulty marks negativeMarks').lean();
    const qMap = Object.fromEntries(dbQuestions.map(q => [q._id.toString(), q]));

    // Evaluate each answer
    let score = 0;
    let correctAnswers = 0, wrongAnswers = 0, unattempted = 0;
    const diffBreakdown = {
      easy:   { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard:   { correct: 0, total: 0 },
    };

    const evaluatedAnswers = answers.map(a => {
      const dbQ    = qMap[a.questionId];
      if (!dbQ) return null;

      const diff   = dbQ.difficulty || 'medium';
      const qMarks = dbQ.marks || 1;
      if (diffBreakdown[diff]) diffBreakdown[diff].total++;

      // Reverse-map shuffled option label → original key
      let resolvedSelected = '';
      if (a.selected && a.optMap?.[a.selected]) {
        resolvedSelected = a.optMap[a.selected].originalKey || a.selected;
      } else {
        resolvedSelected = a.selected || '';
      }

      const isCorrect = resolvedSelected !== '' && resolvedSelected === dbQ.correctAnswer;
      let marksAwarded = 0;

      if (!resolvedSelected) {
        unattempted++;
      } else if (isCorrect) {
        marksAwarded = qMarks;
        correctAnswers++;
        if (diffBreakdown[diff]) diffBreakdown[diff].correct++;
      } else {
        wrongAnswers++;
        if (quiz.negativeMarking) {
          marksAwarded = -(dbQ.negativeMarks || quiz.negativeMarksPerQ || 0.25);
        }
      }

      score += marksAwarded;
      return {
        questionId:   dbQ._id,
        selected:     resolvedSelected,
        correct:      dbQ.correctAnswer,
        isCorrect,
        marksAwarded,
        difficulty:   diff,
        marks:        qMarks,
      };
    }).filter(Boolean);

    // Clamp score to [0, totalMarks]
    score = Math.max(0, Math.min(quiz.totalMarks, parseFloat(score.toFixed(2))));
    const percentage = parseFloat(((score / quiz.totalMarks) * 100).toFixed(2));
    const passStatus = score >= quiz.passMarks ? 'PASS' : 'FAIL';

    // Save result
    const result = await QuizResult.create({
      userId:         req.user._id,
      quizId:         quiz._id,
      score,
      totalMarks:     quiz.totalMarks,
      percentage,
      passStatus,
      correctAnswers,
      wrongAnswers,
      unattempted,
      timeTaken,
      answers:        evaluatedAnswers,
      diffBreakdown,
      attemptNumber:  attemptsDone + 1,
      submittedAt:    new Date(),
    });

    // Increment quiz attempt counter
    await Quiz.findByIdAndUpdate(quiz._id, { $inc: { attemptCount: 1 } });

    // ISSUE 5 FIX: compute rank (100 marks = Rank 1, 99 = Rank 2, ties share rank)
    const allResults = await QuizResult.find({ quizId: quiz._id })
      .sort({ score: -1, timeTaken: 1 })
      .select('_id score timeTaken');

    let assignedRank = 1;
    for (let i = 0; i < allResults.length; i++) {
      if (allResults[i]._id.toString() === result._id.toString()) {
        // Rank = number of results with strictly higher score + 1
        const higherCount = allResults.filter(r =>
          r.score > result.score ||
          (r.score === result.score && r.timeTaken < result.timeTaken && r._id.toString() !== result._id.toString())
        ).length;
        assignedRank = higherCount + 1;
        break;
      }
    }

    await QuizResult.findByIdAndUpdate(result._id, { rank: assignedRank });

    res.status(201).json({
      success: true,
      result: {
        _id:            result._id,
        score,
        totalMarks:     quiz.totalMarks,
        percentage,
        passStatus,
        rank:           assignedRank,
        correctAnswers,
        wrongAnswers,
        unattempted,
        timeTaken,
        diffBreakdown,
        attemptNumber:  attemptsDone + 1,
        attemptsAllowed: quiz.attemptsAllowed,
      },
      message: passStatus === 'PASS'
        ? `🎉 Congratulations! You PASSED with ${percentage}% (Rank #${assignedRank})`
        : `You scored ${percentage}%. Pass mark is ${quiz.passPercentage}%. Try again!`,
    });
  } catch (err) {
    console.error('POST /api/quiz/:id/submit error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/quiz/my-results  — current user's all results
// ────────────────────────────────────────────────────────────
router.get('/my-results', protect, async (req, res) => {
  try {
    if (req.user.id === 'admin') return res.json({ results: [] });
    const results = await QuizResult.find({ userId: req.user._id })
      .populate('quizId', 'title totalMarks passMarks duration category status')
      .sort({ createdAt: -1 })
      .select('-answers');
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/quiz/result/:id  — full result with answer review
// ────────────────────────────────────────────────────────────
router.get('/result/:id', protect, async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.id)
      .populate('userId', 'email profile')
      .populate('quizId', 'title totalMarks passMarks passPercentage duration')
      .populate('answers.questionId', 'question options correctAnswer difficulty marks category');

    if (!result) return res.status(404).json({ message: 'Result not found' });

    // Access control: user can only see own result; admin sees all
    if (req.user.role !== 'admin' && result.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
