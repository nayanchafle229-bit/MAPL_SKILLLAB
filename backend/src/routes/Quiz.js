const mongoose = require('mongoose');

const QUIZ_LEVELS = ['apprentice', 'adept', 'master', 'legend'];

const quizSchema = new mongoose.Schema({
  // Stable, human-readable primary key (e.g. "cat04-l2-quiz") that ties this
  // quiz to its curriculum module regardless of the Mongo _id. Lets the
  // category x level matrix, the course module and the question qIds all be
  // re-matched to each other on re-import/re-seed.
  quizKey:        { type: String, trim: true, unique: true, sparse: true, index: true },
  title:          { type: String, required: true, trim: true },
  description:    { type: String, default: '', trim: true },
  // Which of the 4 curriculum levels this quiz gates (mirrors Course.level).
  level:          { type: String, enum: QUIZ_LEVELS, default: null },
  // The module/course this quiz assesses.
  // The module this quiz gates. courseId above is legacy (points at the old
  // flat Course model); moduleId is what the unlock engine and the L4 case-
  // study flow actually use. Set by the import script.
  moduleId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
  courseId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
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

  // L4 (Legend) only: the auto-graded questions[] above still run as normal,
  // but passing also requires a reviewer-marked CaseSubmission against this
  // prompt. Null/empty for L1-L3 — check `hasCaseStudy` rather than level
  // directly, so a future level's quiz can opt into this without a schema
  // change.
  caseStudyPrompt: { type: String, default: '', trim: true },
  hasCaseStudy:     { type: Boolean, default: false },

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
module.exports.QUIZ_LEVELS = QUIZ_LEVELS;
