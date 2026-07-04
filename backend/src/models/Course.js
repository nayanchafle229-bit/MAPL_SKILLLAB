const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  videoUrl:    { type: String, required: true, trim: true },
  thumbnail:   { type: String, default: '' },
  category:    { type: String, default: 'General' },
  createdBy:   { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
