const mongoose = require('mongoose');

// L4 breaks the "submit -> instant auto-grade" assumption every other level
// relies on. This is its own collection (rather than bolting fields onto
// QuizResult) because its lifecycle is fundamentally different: it sits in a
// 'pending' state, possibly for days, waiting on a human — and needs its own
// queue view for reviewers. Keeping it separate also means a reviewer-grading
// bug can't corrupt the auto-graded QuizResult data path.
const caseSubmissionSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },

  // The MCQ/multi-select/numeric portion of the L4 attempt is graded
  // instantly as usual and lives in QuizResult, referenced here so a
  // reviewer sees both halves together. Overall L4 pass requires BOTH
  // quizResultId.passStatus === 'PASS' AND this doc's status === 'passed'.
  quizResultId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult', required: true },

  prompt:    { type: String, required: true, trim: true }, // the case study text shown to the student
  response:  { type: String, required: true, trim: true }, // student's written answer

  status: {
    type: String,
    enum: ['pending_review', 'passed', 'needs_revision', 'failed'],
    default: 'pending_review',
  },

  reviewerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewNotes:  { type: String, default: '', trim: true },
  reviewedAt:   { type: Date, default: null },

  attemptNumber: { type: Number, default: 1 },
  submittedAt:   { type: Date, default: Date.now },
}, { timestamps: true });

caseSubmissionSchema.index({ status: 1, submittedAt: 1 }); // reviewer queue, oldest-first
caseSubmissionSchema.index({ userId: 1, moduleId: 1 });

module.exports = mongoose.model('CaseSubmission', caseSubmissionSchema);
