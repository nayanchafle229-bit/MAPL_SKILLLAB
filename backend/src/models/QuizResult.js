const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  selected:     { type: String, enum: ['A','B','C','D',''], default: '' },
  correct:      { type: String },
  isCorrect:    { type: Boolean, default: false },
  marksAwarded: { type: Number, default: 0 },
  difficulty:   { type: String },
  marks:        { type: Number, default: 1 },
}, { _id: false });

const quizResultSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz',  required: true },
  score:          { type: Number, required: true },
  totalMarks:     { type: Number, required: true },
  percentage:     { type: Number, required: true },
  passStatus:     { type: String, enum: ['PASS','FAIL'], required: true },
  rank:           { type: Number, default: null },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers:   { type: Number, default: 0 },
  unattempted:    { type: Number, default: 0 },
  timeTaken:      { type: Number, default: 0 },
  answers:        [answerSchema],
  diffBreakdown: {
    easy:   { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    medium: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    hard:   { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
  },
  attemptNumber:  { type: Number, default: 1 }, // which attempt (1,2,3...)
  submittedAt:    { type: Date, default: Date.now },
}, { timestamps: true });

quizResultSchema.index({ userId: 1, quizId: 1 });
quizResultSchema.index({ quizId: 1, score: -1 });
quizResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
