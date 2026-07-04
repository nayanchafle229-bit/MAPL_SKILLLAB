const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question:      { type: String, required: true, trim: true },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
  },
  correctAnswer: { type: String, required: true, enum: ['A','B','C','D'] },
  difficulty:    { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  marks:         { type: Number, default: 1, min: 0.5 },
  negativeMarks: { type: Number, default: 0 },
  category:      { type: String, default: 'General', trim: true },
  isActive:      { type: Boolean, default: true },
  // ISSUE 3 FIX: optional quizId back-reference (for quiz-specific questions)
  quizId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
}, { timestamps: true });

questionSchema.index({ difficulty: 1, isActive: 1 });
questionSchema.index({ quizId: 1 });

module.exports = mongoose.model('Question', questionSchema);
