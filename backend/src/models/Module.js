const mongoose = require('mongoose');

const MODULE_LEVELS = ['apprentice', 'adept', 'master', 'legend'];

// One curated YouTube video, carrying the review rubric from the workbook's
// content sheets (e.g. "Cat04 Comms"). The rubric fields are editorial state,
// not just metadata — losing them on import means someone has to re-open the
// spreadsheet to know why a video was chosen, which defeats the point of
// having curated it in the first place.
const videoSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  url:          { type: String, required: true, trim: true },
  source:       { type: String, default: '', trim: true }, // e.g. "RealPars"
  moduleTopic:  { type: String, default: '', trim: true },  // "Traces to" column — which sub-topic this covers
  whySelected:  { type: String, default: '', trim: true },

  rubric: {
    depth:        { type: Number, default: null, min: 0, max: 30 },
    credibility:  { type: Number, default: null, min: 0, max: 20 },
    clarity:      { type: Number, default: null, min: 0, max: 15 },
    neutrality:   { type: Number, default: null, min: 0, max: 15 },
    length:       { type: Number, default: null, min: 0, max: 10 },
    engagement:   { type: Number, default: null, min: 0, max: 10 },
    total:        { type: Number, default: null },
  },

  // NEEDS_REVIEW videos exist in the workbook (e.g. "creator unverifiable")
  // and must not silently appear as normal content on the student-facing
  // page. Only 'approved' videos should ever render for students.
  status: { type: String, enum: ['approved', 'needs_review', 'rejected'], default: 'needs_review' },
  order:  { type: Number, default: 0 },
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  // Stable key, e.g. "cat04-l2" — mirrors Quiz.quizKey so a module and its
  // gate quiz can always be re-matched to each other on re-import/re-seed,
  // independent of Mongo _ids.
  moduleKey:  { type: String, required: true, unique: true, trim: true, index: true },

  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  level:      { type: String, enum: MODULE_LEVELS, required: true },

  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  notes:       { type: String, default: '', trim: true }, // written notes tab, markdown-ish like the original Course.notes

  videos: [videoSchema],

  // --- Progression config -------------------------------------------------
  // Explicit prerequisites instead of a hardcoded "same category, previous
  // level" rule. Defaults to that same-category chain at seed time, but this
  // is what lets us add a real cross-category dependency later (e.g. "Cat9
  // Vertical Applications L2 requires Cat1 Process Control L2") as a data
  // change, not a schema/code change. Empty array = no prerequisite, always
  // unlocked (true for every category's own L1).
  prerequisites: [{
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    level:      { type: String, enum: MODULE_LEVELS },
  }],

  quizId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

moduleSchema.index({ categoryId: 1, level: 1 }, { unique: true }); // one module per cell
moduleSchema.index({ level: 1 });

module.exports = mongoose.model('Module', moduleSchema);
module.exports.MODULE_LEVELS = MODULE_LEVELS;
