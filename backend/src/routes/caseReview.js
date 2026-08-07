const express = require('express');
const router = express.Router();
const CaseSubmission = require('../models/CaseSubmission');
const QuizResult = require('../models/QuizResult');
const unlockEngine = require('../services/unlockEngine');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// ────────────────────────────────────────────────────────────
// GET /api/admin/case-submissions?status=pending_review
// Reviewer queue. Defaults to pending_review, oldest first — matches the
// CaseSubmission index ({status:1, submittedAt:1}) so this stays a fast
// query even as the collection grows.
// ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const status = req.query.status || 'pending_review';
    const filter = status === 'all' ? {} : { status };

    const submissions = await CaseSubmission.find(filter)
      .populate('userId', 'email profile')
      .populate('quizId', 'title')
      .populate('moduleId', 'title level')
      .sort({ submittedAt: 1 })
      .select('-response'); // list view: no need to ship full essay text

    res.json({ submissions, count: submissions.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/case-submissions/:id — full detail for the review screen
router.get('/:id', async (req, res) => {
  try {
    const submission = await CaseSubmission.findById(req.params.id)
      .populate('userId', 'email profile')
      .populate('quizId', 'title level')
      .populate('moduleId', 'title level')
      .populate('quizResultId', 'score totalMarks percentage passStatus timeTaken');

    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json({ submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// PUT /api/admin/case-submissions/:id/review
// Body: { status: 'passed' | 'needs_revision' | 'failed', reviewNotes }
//
// 'passed' is the only outcome that reaches into progression: it's the
// second half of an L4 module pass (the first half — the auto-graded
// scenario questions — already happened in quizStudent.js). Both halves
// have to clear before the unlock engine fires, which is why this call
// lives here and not in the quiz-submit route.
// ────────────────────────────────────────────────────────────
router.put('/:id/review', async (req, res) => {
  try {
    const { status, reviewNotes = '' } = req.body;
    if (!['passed', 'needs_revision', 'failed'].includes(status)) {
      return res.status(400).json({ message: "status must be 'passed', 'needs_revision', or 'failed'" });
    }

    const submission = await CaseSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.status === 'passed') {
      return res.status(409).json({ message: 'This submission was already marked passed' });
    }

    submission.status = status;
    submission.reviewNotes = reviewNotes;
    submission.reviewerId = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    if (status === 'passed') {
      const quizResult = await QuizResult.findById(submission.quizResultId).select('percentage');
      await unlockEngine.onModulePassed(submission.userId, submission.moduleId, {
        scorePercent: quizResult?.percentage,
      });
    }

    res.json({
      success: true,
      submission: { _id: submission._id, status: submission.status, reviewedAt: submission.reviewedAt },
      message: status === 'passed'
        ? 'Case study passed — module unlocked for the student.'
        : 'Review recorded. Student can resubmit.',
    });
  } catch (err) {
    console.error('PUT /api/admin/case-submissions/:id/review error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
