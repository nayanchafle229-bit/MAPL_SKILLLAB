const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  description:    { type: String, default: '', trim: true },
  totalQuestions: { type: Number, required: true, min: 1 },
  totalMarks:     { type: Number, required: true, min: 1 },
  passMarks:      { type: Number, required: true },
  passPercentage: { type: Number, required: true },
  duration:       { type: Number, required: true, min: 1 }, // minutes

  // ISSUE 2 FIX: status field — only 'published' quizzes visible to students
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },

  // ISSUE 3 FIX: questions[] linked by ObjectId — use .populate('questions')
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],

  // Difficulty configuration
  difficultyRatio: {
    easy:   { type: Number, default: 40, min: 0, max: 100 },
    medium: { type: Number, default: 40, min: 0, max: 100 },
    hard:   { type: Number, default: 20, min: 0, max: 100 },
  },
  questionCounts: {
    easy:   { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard:   { type: Number, default: 0 },
  },

  // Quiz settings
  negativeMarking:   { type: Boolean, default: false },
  negativeMarksPerQ: { type: Number,  default: 0.25 },
  shuffleQuestions:  { type: Boolean, default: true },
  shuffleOptions:    { type: Boolean, default: true },
  attemptsAllowed:   { type: Number,  default: 1 }, // ISSUE 4: max attempts per user

  // Metadata
  category:     { type: String, default: 'General', trim: true },
  createdBy:    { type: String, default: 'admin' },
  attemptCount: { type: Number, default: 0 },

}, { timestamps: true });

// Index for fast student-facing query: published quizzes only
quizSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
