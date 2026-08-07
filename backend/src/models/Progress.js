const mongoose = require('mongoose');

// One doc per (user, module) pair. Deliberately dumb/denormalized — it only
// records STATE, never DECIDES it. The decision of what unlocks what lives in
// unlockEngine.js, which reads Module.prerequisites. Keeping this model free
// of unlock logic means we can change the gating rule (per-category vs.
// global, see design doc §4) without touching this schema at all.
const progressSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moduleId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // denormalized for fast curriculum-map queries
  level:      { type: String, enum: ['apprentice', 'adept', 'master', 'legend'], required: true }, // denormalized, same reason

  status: {
    type: String,
    enum: ['locked', 'unlocked', 'passed'],
    default: 'locked',
  },

  unlockedAt: { type: Date, default: null },
  startedAt:  { type: Date, default: null }, // first video watched / quiz attempted
  passedAt:   { type: Date, default: null },

  bestScorePercent: { type: Number, default: null },
  attemptsUsed:      { type: Number, default: 0 },
}, { timestamps: true });

// One progress row per user per module — this is the row the unlock engine
// upserts into.
progressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
// Powers the curriculum map (11x4 grid) for a given user in one query.
progressSchema.index({ userId: 1, categoryId: 1, level: 1 });
// Powers "who's stuck / how far along is everyone" admin views.
progressSchema.index({ moduleId: 1, status: 1 });

module.exports = mongoose.model('Progress', progressSchema);
