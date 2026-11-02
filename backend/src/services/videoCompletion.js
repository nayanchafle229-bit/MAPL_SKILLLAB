const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const Category = require('../models/Category');

function extractVideoId(url) {
  if (!url) return '';
  const trimmed = url.trim();
  const m = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  return trimmed;
}

function normalizeUrl(url) {
  if (!url) return '';
  let clean = url.trim();
  const m = clean.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  // Remove protocol and trailing slashes for resilient comparison
  clean = clean.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
  return clean;
}

function areUrlsEqual(url1, url2) {
  if (!url1 || !url2) return false;
  if (url1 === url2) return true;
  return normalizeUrl(url1) === normalizeUrl(url2);
}

/**
 * Marks a video as completed in both Course and Curriculum modules for a user.
 * Supports passing either { courseId } or { url }.
 */
async function markVideoComplete(userId, { url, courseId }) {
  let targetUrl = url;
  let targetCategory = null;
  let targetLevel = null;

  if (courseId) {
    const course = await Course.findById(courseId).lean();
    if (course) {
      targetUrl = targetUrl || course.videoUrl;
      targetCategory = course.category;
      targetLevel = course.level;
    }
  }

  if (!targetUrl && !courseId) {
    throw new Error('Video URL or Course ID is required');
  }

  const ytId = extractVideoId(targetUrl);
  const norm = normalizeUrl(targetUrl);

  // 1. Find all matching Courses (by exact URL or YouTube ID or normalized URL)
  let matchingCourses = [];
  if (ytId && ytId.length === 11) {
    matchingCourses = await Course.find({
      $or: [{ videoUrl: targetUrl }, { videoUrl: { $regex: ytId } }]
    }).lean();
  } else {
    // Non-youtube URL: match exact or normalized regex
    matchingCourses = await Course.find({
      $or: [{ videoUrl: targetUrl }, { videoUrl: targetUrl.replace(/\/+$/, '') }, { videoUrl: targetUrl + '/' }]
    }).lean();
  }

  // If courseId was provided directly, make sure it is in matchingCourses
  if (courseId && !matchingCourses.some(c => c._id.toString() === courseId.toString())) {
    const specificCourse = await Course.findById(courseId).lean();
    if (specificCourse) matchingCourses.push(specificCourse);
  }

  // Mark all matching courses as completed in CourseProgress
  const now = new Date();
  for (const c of matchingCourses) {
    await CourseProgress.findOneAndUpdate(
      { userId, courseId: c._id },
      {
        status: 'completed',
        completedAt: now,
        lastWatchedAt: now,
        $setOnInsert: { startedAt: now, viewCount: 1 }
      },
      { upsert: true, new: true }
    );
  }

  // 2. Find matching Modules (by video URL in videos array)
  let matchingModules = [];
  if (ytId && ytId.length === 11) {
    matchingModules = await Module.find({ 'videos.url': { $regex: ytId } }).lean();
  } else {
    matchingModules = await Module.find({
      $or: [
        { 'videos.url': targetUrl },
        { 'videos.url': targetUrl.replace(/\/+$/, '') },
        { 'videos.url': targetUrl + '/' }
      ]
    }).lean();
  }

  // If no module was found by URL query, but we have targetCategory & targetLevel, find module by cell
  if (matchingModules.length === 0 && targetCategory && targetLevel) {
    const cat = await Category.findOne({ name: targetCategory }).lean();
    if (cat) {
      const mod = await Module.findOne({ categoryId: cat._id, level: targetLevel }).lean();
      if (mod) matchingModules = [mod];
    }
  }

  // Add targetUrl (and variations) to completedVideos in Progress for each matching module
  for (const mod of matchingModules) {
    await Progress.findOneAndUpdate(
      { userId, moduleId: mod._id },
      {
        $addToSet: { completedVideos: { $each: [targetUrl, norm] } },
        $setOnInsert: {
          categoryId: mod.categoryId,
          level: mod.level,
          status: (mod.prerequisites || []).length === 0 ? 'unlocked' : 'locked',
          unlockedAt: (mod.prerequisites || []).length === 0 ? now : null
        }
      },
      { upsert: true, new: true }
    );
  }

  return { success: true, url: targetUrl, matchedCoursesCount: matchingCourses.length };
}

/**
 * Returns a set of completed video identifiers/URLs for a given module.
 */
async function getCompletedVideosForModule(userId, module) {
  const completedSet = new Set();

  // 1. From Progress.completedVideos
  const prog = await Progress.findOne({ userId, moduleId: module._id }).lean();
  if (prog && Array.isArray(prog.completedVideos)) {
    prog.completedVideos.forEach(v => {
      completedSet.add(v);
      completedSet.add(normalizeUrl(v));
      const yId = extractVideoId(v);
      if (yId) completedSet.add(yId);
    });
  }

  // 2. Cross-check with CourseProgress for courses in same category & level
  const cat = module.categoryId?.name
    ? module.categoryId
    : await Category.findById(module.categoryId).lean();

  if (cat) {
    const coursesInCell = await Course.find({ category: cat.name, level: module.level }).lean();
    if (coursesInCell.length > 0) {
      const courseIds = coursesInCell.map(c => c._id);
      const completedProgs = await CourseProgress.find({
        userId,
        courseId: { $in: courseIds },
        status: 'completed'
      }).lean();

      const completedCourseIdSet = new Set(completedProgs.map(p => p.courseId.toString()));
      coursesInCell.forEach(c => {
        if (completedCourseIdSet.has(c._id.toString())) {
          completedSet.add(c.videoUrl);
          completedSet.add(normalizeUrl(c.videoUrl));
          const yId = extractVideoId(c.videoUrl);
          if (yId) completedSet.add(yId);
        }
      });
    }
  }

  return completedSet;
}

/**
 * Determines whether all videos in a given category and level are completed by the user.
 * Prioritizes the authoritative curriculum module lectures.
 */
async function isContentCompletedForLevel(userId, level, categoryName) {
  const cat = await Category.findOne({ name: categoryName }).lean();
  const mod = cat ? await Module.findOne({ categoryId: cat._id, level }).lean() : null;

  // Filter approved videos in module (excluding placeholder/dash links)
  const approvedVideos = (mod?.videos || []).filter(v =>
    v.status === 'approved' && v.url && v.url !== '-' && v.url !== 'TBD'
  );

  const coursesInLevel = await Course.find({ category: categoryName, level }).lean();

  // If no content exists in this level, consider it complete
  if (approvedVideos.length === 0 && coursesInLevel.length === 0) {
    return true;
  }

  // Get completed identifiers for this cell
  let completedSet = new Set();
  if (mod) {
    completedSet = await getCompletedVideosForModule(userId, mod);
  } else {
    // If no module, check CourseProgress directly
    const courseIds = coursesInLevel.map(c => c._id);
    const completedProgs = await CourseProgress.find({
      userId,
      courseId: { $in: courseIds },
      status: 'completed'
    }).lean();
    const completedIdSet = new Set(completedProgs.map(p => p.courseId.toString()));
    coursesInLevel.forEach(c => {
      if (completedIdSet.has(c._id.toString())) {
        completedSet.add(c.videoUrl);
        completedSet.add(normalizeUrl(c.videoUrl));
        const yId = extractVideoId(c.videoUrl);
        if (yId) completedSet.add(yId);
      }
    });
  }

  // Primary check: All approved lectures in the module MUST be completed
  if (approvedVideos.length > 0) {
    for (const v of approvedVideos) {
      const yId = extractVideoId(v.url);
      const norm = normalizeUrl(v.url);
      const isCompleted = completedSet.has(v.url) || completedSet.has(norm) || (yId && completedSet.has(yId));
      if (!isCompleted) return false;
    }
    return true;
  }

  // Fallback if module has no approved videos: check coursesInLevel
  for (const c of coursesInLevel) {
    const yId = extractVideoId(c.videoUrl);
    const norm = normalizeUrl(c.videoUrl);
    const isCompleted = completedSet.has(c.videoUrl) || completedSet.has(norm) || (yId && completedSet.has(yId));
    if (!isCompleted) return false;
  }

  return true;
}

module.exports = {
  extractVideoId,
  normalizeUrl,
  areUrlsEqual,
  markVideoComplete,
  getCompletedVideosForModule,
  isContentCompletedForLevel,
};
