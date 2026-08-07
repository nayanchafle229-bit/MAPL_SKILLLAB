// unlockEngine.js
const Module = require('../models/Module');    // ✅ Fixed
const Progress = require('../models/Progress'); // ✅ Fixed

/**
 * Call once, at user registration. Creates a Progress row for every active
 * module: 'unlocked' if it has no prerequisites (every category's own L1),
 * 'locked' otherwise.
 */
async function initializeUserProgress(userId) {
  const modules = await Module.find({ isActive: true }).lean();

  const ops = modules.map((mod) => ({
    updateOne: {
      filter: { userId, moduleId: mod._id },
      update: {
        $setOnInsert: {
          userId,
          moduleId: mod._id,
          categoryId: mod.categoryId,
          level: mod.level,
          status: mod.prerequisites.length === 0 ? 'unlocked' : 'locked',
          unlockedAt: mod.prerequisites.length === 0 ? new Date() : null,
        },
      },
      upsert: true,
    },
  }));

  if (ops.length) await Progress.bulkWrite(ops);
}

/**
 * Call after a module's gate quiz (and case study, for L4) is passed.
 * Marks the module passed, then re-evaluates every module that could be
 * waiting on it.
 */
async function onModulePassed(userId, moduleId, { scorePercent } = {}) {
  await Progress.updateOne(
    { userId, moduleId },
    {
      $set: {
        status: 'passed',
        passedAt: new Date(),
        ...(scorePercent != null ? { bestScorePercent: scorePercent } : {}),
      },
    }
  );

  const passedModule = await Module.findById(moduleId).lean();
  if (!passedModule) return;

  const candidates = await Module.find({
    isActive: true,
    'prerequisites.categoryId': passedModule.categoryId,
    'prerequisites.level': passedModule.level,
  }).lean();

  for (const candidate of candidates) {
    await tryUnlock(userId, candidate);
  }
}

/**
 * Checks whether every prerequisite of `module` is 'passed' for this user,
 * and if so, flips its Progress row to 'unlocked'.
 */
async function tryUnlock(userId, module) {
  if (module.prerequisites.length === 0) return;

  const prereqChecks = await Promise.all(
    module.prerequisites.map(async (p) => {
      const prereqModule = await Module.findOne({
        categoryId: p.categoryId,
        level: p.level,
      }).lean();
      if (!prereqModule) return false;
      const prog = await Progress.findOne({
        userId,
        moduleId: prereqModule._id,
      }).lean();
      return prog?.status === 'passed';
    })
  );

  if (!prereqChecks.every(Boolean)) return;

  await Progress.updateOne(
    { userId, moduleId: module._id, status: 'locked' },
    { $set: { status: 'unlocked', unlockedAt: new Date() } }
  );
}

module.exports = { initializeUserProgress, onModulePassed, tryUnlock };