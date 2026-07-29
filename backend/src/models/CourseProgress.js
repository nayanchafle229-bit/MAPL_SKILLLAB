const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  courseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status:        { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  startedAt:     { type: Date, default: Date.now },
  lastWatchedAt: { type: Date, default: Date.now },
  completedAt:   { type: Date, default: null },
  viewCount:     { type: Number, default: 1 }, // how many times the student opened this course
}, { timestamps: true });

// One progress record per student per course
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
courseProgressSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);
