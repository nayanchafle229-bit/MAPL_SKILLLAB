const mongoose = require('mongoose');

// The 11 rows of the Category x Level Matrix. This is a small, mostly-static
// reference table (11 docs, ever) — seeded once from the "Category Matrix"
// sheet and rarely touched by hand afterwards. Kept as its own collection
// (rather than a hardcoded enum) so the admin UI can render category names,
// ordering, and curation status without redeploying code.
const categorySchema = new mongoose.Schema({
  // Stable numeric id matching the Excel's "#" column (1-11). Used to build
  // moduleKey / quizKey strings elsewhere, e.g. "cat04-l2". Never reused or
  // renumbered even if a category is retired — see isActive below.
  catNumber:   { type: Number, required: true, unique: true, min: 1, max: 11 },
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, trim: true, lowercase: true }, // "comms", "safety", ...
  whyItExists: { type: String, default: '', trim: true }, // matrix column C, shown as tooltip/context in UI

  // Tracks how far the content team has gotten for this category, so the
  // frontend can show "coming soon" instead of a broken/empty module and the
  // unlock engine (see prerequisites in Module.js) can be told to skip
  // categories that aren't launch-ready yet. Mirrors the workbook's own
  // per-category state, e.g. only 3 of 11 have question banks at pilot launch.
  curationStatus: {
    type: String,
    enum: ['not_started', 'content_curated', 'question_bank_ready', 'live'],
    default: 'not_started',
  },

  order:    { type: Number, default: 0 }, // display order in the curriculum map, defaults to catNumber
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.index({ order: 1 });

module.exports = mongoose.model('Category', categorySchema);
