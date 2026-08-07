const mongoose = require('mongoose');

// The 4 course/quiz levels — kept identical to Course.COURSE_LEVELS so a
// question's `level` always lines up with the module/quiz it belongs to.
const QUESTION_LEVELS = ['apprentice', 'adept', 'master', 'legend'];

// MCQ         = single-answer, 4-5 options (A-E), correctAnswer = one letter e.g. "B"
// MULTI       = multi-select, no stated count, correctAnswer = sorted comma list e.g. "A,C,E"
// NUMERIC     = typed numeric answer, correctAnswer = a number (as string), graded with +/-5% tolerance
const QUESTION_TYPES = ['MCQ', 'MULTI', 'NUMERIC'];

const questionSchema = new mongoose.Schema({
  question:      { type: String, required: true, trim: true },
  type:          { type: String, enum: QUESTION_TYPES, default: 'MCQ' },
  options: {
    A: { type: String, default: '' },
    B: { type: String, default: '' },
    C: { type: String, default: '' },
    D: { type: String, default: '' },
    E: { type: String, default: '' }, // 5th option -- used by MCQ/MULTI, blank for NUMERIC
  },
  // MCQ: single letter ("B"). MULTI: sorted comma-separated letters ("A,C,E").
  // NUMERIC: the accepted numeric value as a string ("40"), graded with +/-5% tolerance.
  correctAnswer: { type: String, required: true, trim: true },

  difficulty:    { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  marks:         { type: Number, default: 1, min: 0.5 },
  negativeMarks: { type: Number, default: 0 },
  category:      { type: String, default: 'General', trim: true },
  isActive:      { type: Boolean, default: true },

  // -- Curriculum traceability (Category x Level Matrix import) --------
  // qId is the primary key used by the source question bank (e.g. "C4-L1-001")
  // so a question can always be matched back to its quiz/module/answer-key row.
  qId:           { type: String, trim: true, unique: true, sparse: true, index: true },
  level:         { type: String, enum: QUESTION_LEVELS, default: null },
  moduleTopic:   { type: String, default: '', trim: true }, // "Traces to" column
  rationale:     { type: String, default: '', trim: true }, // why the answer is correct / what wrong options represent
  reviewStatus:  { type: String, enum: ['draft', 'reviewed'], default: 'draft' },

  quizId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
}, { timestamps: true });

questionSchema.index({ difficulty: 1, isActive: 1 });
questionSchema.index({ quizId: 1 });
questionSchema.index({ category: 1, level: 1 });

module.exports = mongoose.model('Question', questionSchema);
module.exports.QUESTION_TYPES = QUESTION_TYPES;
module.exports.QUESTION_LEVELS = QUESTION_LEVELS;
