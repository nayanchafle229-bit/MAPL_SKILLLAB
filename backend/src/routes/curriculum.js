const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');
const unlockEngine = require('../services/unlockEngine');
const videoCompletion = require('../services/videoCompletion');
const { isLevelLocked, isContentCompletedForLevel, LEVELS: LEVEL_ORDER } = require('../services/levelProgression');

// ────────────────────────────────────────────────────────────
// GET /api/curriculum
// Returns every category with its 4 modules, each carrying the student's
// progression status ('locked', 'unlocked', 'passed'), video counts, and quiz state.
// ────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    let [categories, modules, progressRows] = await Promise.all([
      Category.find({ isActive: true }).sort({ order: 1 }).lean(),
      Module.find({ isActive: true }).lean(),
      isAdmin ? [] : Progress.find({ userId: req.user._id }).lean(),
    ]);

    // Auto-initialize progress for students who registered prior to initialization or have 0 records
    if (!isAdmin && progressRows.length === 0 && modules.length > 0) {
      await unlockEngine.initializeUserProgress(req.user._id);
      progressRows = await Progress.find({ userId: req.user._id }).lean();
    }

    const progressByModuleId = new Map(progressRows.map((p) => [p.moduleId.toString(), p]));

    const modulesByCategory = new Map();
    for (const mod of modules) {
      const catId = mod.categoryId.toString();
      if (!modulesByCategory.has(catId)) modulesByCategory.set(catId, []);

      const progress = progressByModuleId.get(mod._id.toString());
      const visibleVideos = (mod.videos || [])
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
        status: isAdmin ? 'unlocked' : (progress?.status || 'locked'),
        bestScorePercent: progress?.bestScorePercent ?? null,
        passedAt: progress?.passedAt ?? null,
        completedVideosCount: 0,
        isQuizUnlocked: false,
      });
    }

    if (!isAdmin) {
      // Enforce category-specific level locks and quiz unlock status
      for (const [catId, catModules] of modulesByCategory.entries()) {
        const cat = categories.find(c => c._id.toString() === catId);
        const catName = cat ? cat.name : null;

        await Promise.all(catModules.map(async (m) => {
          const locked = await isLevelLocked(req.user._id, m.level, catName);
          if (m.status !== 'passed') {
            m.status = locked ? 'locked' : 'unlocked';
          }

          if (m.status !== 'locked') {
            const rawMod = modules.find(rm => rm._id.toString() === m._id.toString());
            let completedCount = 0;
            if (rawMod) {
              const completedSet = await videoCompletion.getCompletedVideosForModule(req.user._id, rawMod);
              const approvedVids = (rawMod.videos || []).filter(v => v.status === 'approved' && v.url && v.url !== '-');
              approvedVids.forEach(v => {
                const yId = videoCompletion.extractVideoId(v.url);
                if (completedSet.has(v.url) || (yId && completedSet.has(yId))) {
                  completedCount++;
                }
              });
            }
            m.completedVideosCount = completedCount;
            const contentDone = await isContentCompletedForLevel(req.user._id, m.level, catName);
            m.isQuizUnlocked = contentDone;
          }
        }));
      }
    }

    const curriculum = categories.map((cat) => {
      const catModules = modulesByCategory.get(cat._id.toString()) || [];
      catModules.sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
      const passedCount = catModules.filter((m) => m.status === 'passed').length;
      return {
        _id: cat._id,
        catNumber: cat.catNumber,
        name: cat.name,
        slug: cat.slug,
        whyItExists: cat.whyItExists,
        curationStatus: cat.curationStatus,
        modules: catModules,
        passedCount,
        isCompleted: passedCount === catModules.length && catModules.length > 0,
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
// Single-module detail (video player + notes page). Enforces level lock gate.
// ────────────────────────────────────────────────────────────
router.get('/modules/:moduleKey', protect, async (req, res) => {
  try {
    const mod = await Module.findOne({ moduleKey: req.params.moduleKey }).populate('categoryId', 'name catNumber');
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    const isAdmin = req.user.role === 'admin';
    let status = 'unlocked';
    if (!isAdmin) {
      const globalLocked = await isLevelLocked(req.user._id, mod.level, mod.categoryId.name);
      const progress = await Progress.findOne({ userId: req.user._id, moduleId: mod._id });

      if (progress?.status === 'passed') {
        status = 'passed';
      } else {
        status = globalLocked ? 'locked' : 'unlocked';
      }

      if (status === 'locked') {
        return res.status(403).json({ message: 'This module is locked. Complete all previous level courses and quizzes first.' });
      }
    }

    const visibleVideos = (mod.videos || [])
      .filter((v) => isAdmin || v.status === 'approved')
      .sort((a, b) => a.order - b.order);

    // Fetch user completed video URLs
    let completedVideos = [];
    let isQuizUnlocked = true;
    let bestScorePercent = null;
    let passedAt = null;

    if (!isAdmin) {
      const completedSet = await videoCompletion.getCompletedVideosForModule(req.user._id, mod);
      completedVideos = Array.from(completedSet);
      isQuizUnlocked = await isContentCompletedForLevel(req.user._id, mod.level, mod.categoryId.name);

      const progress = await Progress.findOne({ userId: req.user._id, moduleId: mod._id });
      bestScorePercent = progress?.bestScorePercent ?? null;
      passedAt = progress?.passedAt ?? null;
    }

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
        completedVideos,
        isQuizUnlocked,
        bestScorePercent,
        passedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/curriculum/modules/:moduleKey/video-complete
// Marks a video as completed from the Curriculum module view.
// Syncs with Course section instantly.
// ────────────────────────────────────────────────────────────
router.post('/modules/:moduleKey/video-complete', protect, async (req, res) => {
  try {
    if (req.user.id === 'admin') {
      return res.status(200).json({ message: 'Admin progress is not tracked' });
    }

    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'Video URL is required' });

    const mod = await Module.findOne({ moduleKey: req.params.moduleKey }).populate('categoryId', 'name');
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    const locked = await isLevelLocked(req.user._id, mod.level, mod.categoryId.name);
    if (locked) {
      return res.status(403).json({ message: 'This module is locked.' });
    }

    const result = await videoCompletion.markVideoComplete(req.user._id, { url });
    const contentCompleted = await isContentCompletedForLevel(req.user._id, mod.level, mod.categoryId.name);

    res.json({
      success: true,
      message: 'Video marked as completed 🎉',
      url,
      isQuizUnlocked: contentCompleted,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
