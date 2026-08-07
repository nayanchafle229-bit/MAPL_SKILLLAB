const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// ────────────────────────────────────────────────────────────
// GET /api/curriculum
// The single call the curriculum-map page needs: every category, each with
// its 4 modules, each module carrying this user's Progress status. Shaped
// as a nested category -> modules[4] structure so the frontend can render
// the grid directly without re-joining anything client-side.
//
// Students only ever see 'approved' videos — 'needs_review' entries exist
// in the DB (imported straight from the workbook) but must never reach a
// student-facing response. Admin has a separate, unfiltered endpoint below.
// ────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    const [categories, modules, progressRows] = await Promise.all([
      Category.find({ isActive: true }).sort({ order: 1 }).lean(),
      Module.find({ isActive: true }).lean(),
      isAdmin ? [] : Progress.find({ userId: req.user._id }).lean(),
    ]);

    const progressByModuleId = new Map(progressRows.map((p) => [p.moduleId.toString(), p]));

    const modulesByCategory = new Map();
    for (const mod of modules) {
      const catId = mod.categoryId.toString();
      if (!modulesByCategory.has(catId)) modulesByCategory.set(catId, []);

      const progress = progressByModuleId.get(mod._id.toString());
      const visibleVideos = mod.videos
        .filter((v) => isAdmin || v.status === 'approved')
        .sort((a, b) => a.order - b.order);

      modulesByCategory.get(catId).push({
        _id: mod._id,
        moduleKey: mod.moduleKey,
        level: mod.level,
        title: mod.title,
        videoCount: visibleVideos.length,
        videos: visibleVideos,
        hasQuiz: !!mod.quizId,
        quizId: mod.quizId,
        // Admin sees every module regardless of gating, always 'unlocked' in
        // its own view (they're not the one being gated) so the content
        // management UI never shows a lock icon on its own tools.
        status: isAdmin ? 'unlocked' : (progress?.status || 'locked'),
        bestScorePercent: progress?.bestScorePercent ?? null,
        passedAt: progress?.passedAt ?? null,
      });
    }

    const LEVEL_ORDER = ['apprentice', 'adept', 'master', 'legend'];
    const curriculum = categories.map((cat) => {
      const catModules = modulesByCategory.get(cat._id.toString()) || [];
      catModules.sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
      return {
        _id: cat._id,
        catNumber: cat.catNumber,
        name: cat.name,
        slug: cat.slug,
        whyItExists: cat.whyItExists,
        curationStatus: cat.curationStatus,
        modules: catModules,
      };
    });

    res.json({ curriculum });
  } catch (err) {
    console.error('GET /api/curriculum error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/curriculum/modules/:moduleKey
// Single-module detail (video player + notes page). Enforces the gate here
// too, not just in the UI — a locked module's videos/notes should not be
// fetchable by hitting the API directly.
// ────────────────────────────────────────────────────────────
router.get('/modules/:moduleKey', protect, async (req, res) => {
  try {
    const mod = await Module.findOne({ moduleKey: req.params.moduleKey }).populate('categoryId', 'name catNumber');
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    const isAdmin = req.user.role === 'admin';
    let status = 'unlocked';
    if (!isAdmin) {
      const progress = await Progress.findOne({ userId: req.user._id, moduleId: mod._id });
      status = progress?.status || 'locked';
      if (status === 'locked') {
        return res.status(403).json({ message: 'This module is locked. Pass its prerequisite first.' });
      }
    }

    const visibleVideos = mod.videos
      .filter((v) => isAdmin || v.status === 'approved')
      .sort((a, b) => a.order - b.order);

    res.json({
      module: {
        _id: mod._id,
        moduleKey: mod.moduleKey,
        title: mod.title,
        description: mod.description,
        notes: mod.notes,
        level: mod.level,
        category: mod.categoryId,
        videos: visibleVideos,
        quizId: mod.quizId,
        status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
