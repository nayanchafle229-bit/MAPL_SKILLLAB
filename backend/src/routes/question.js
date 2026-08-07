const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/question — admin sees all; users see count only
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const questions = await Question.find().sort({ createdAt: -1 });
      return res.json({ questions, total: questions.length });
    }
    const total = await Question.countDocuments({ isActive: true });
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/question/random?limit=40  — protected, returns shuffled questions WITHOUT correct answer for users
router.get('/random', protect, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 40, 200);
    const questions = await Question.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: limit } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions available. Ask admin to add questions.' });
    }

    // Strip correct answer before sending to user (re-added on submit)
    const clientQuestions = questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
    }));

    res.json({ questions: clientQuestions, total: clientQuestions.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/question — admin only (single or bulk)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const body = req.body;

    // A question is valid if it has text, a correct answer, and — unless
    // it's NUMERIC (which has no options) — at least options A and B.
    const isValid = (q) => {
      if (!q.question || !q.correctAnswer) return false;
      if (q.type === 'NUMERIC') return true;
      return !!(q.options?.A && q.options?.B);
    };

    // Bulk insert: array of questions
    if (Array.isArray(body)) {
      for (const q of body) {
        if (!isValid(q)) {
          return res.status(400).json({ message: 'Each question needs: question, correctAnswer, and (unless NUMERIC) options A & B' });
        }
      }
      const created = await Question.insertMany(body);
      return res.status(201).json({ questions: created, message: `${created.length} questions added` });
    }

    // Single question
    const { question, type, options, correctAnswer, category, difficulty, qId, level, moduleTopic, rationale } = body;
    if (!isValid(body)) {
      return res.status(400).json({ message: 'question, correctAnswer, and (unless NUMERIC) options A & B are required' });
    }
    const q = await Question.create({ question, type, options, correctAnswer, category, difficulty, qId, level, moduleTopic, rationale });
    res.status(201).json({ question: q, message: 'Question added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/question/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!q) return res.status(404).json({ message: 'Question not found' });
    res.json({ question: q, message: 'Question updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/question/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
