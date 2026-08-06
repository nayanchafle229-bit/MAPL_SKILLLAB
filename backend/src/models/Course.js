const mongoose = require('mongoose');

// The 4 difficulty tiers a course can be placed in — used to power the
// Coursera/Udemy-style "browse by level" exploration on the Courses page.
const COURSE_LEVELS = ['apprentice', 'adept', 'master', 'legend'];

const courseSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  videoUrl:    { type: String, required: true, trim: true },
  thumbnail:   { type: String, default: '' },
  category:    { type: String, default: 'General' },
  level:       { type: String, enum: COURSE_LEVELS, default: 'apprentice' },
  // Free-form written notes shown alongside the video (like Coursera's
  // reading/notes tab). Supports basic markdown-style line prefixes
  // (#, -, etc.) which the frontend renders.
  notes:       { type: String, default: '', trim: true },
  createdBy:   { type: String, default: 'admin' },
}, { timestamps: true });

courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });

module.exports = mongoose.model('Course', courseSchema);
module.exports.COURSE_LEVELS = COURSE_LEVELS;
