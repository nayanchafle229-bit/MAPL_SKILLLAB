const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const { protect, adminOnly } = require('../middleware/auth');

const { COURSE_LEVELS } = Course;

// GET /api/course — all users
// Supports optional ?category=&level= query filters so the frontend can
// do server-side filtering too if it ever needs to (the Courses page
// currently filters client-side against the full list it already has).
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.level) filter.level = req.query.level;
    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/course/meta/categories — distinct categories with course counts
// and the fixed list of levels, so the frontend can build the
// "browse by category" / "browse by level" chips like Coursera/Udemy.
router.get('/meta/categories', protect, async (req, res) => {
  try {
    const categories = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({
      categories: categories.map(c => ({ name: c._id || 'General', count: c.count })),
      levels: COURSE_LEVELS,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/course/my-progress — current user's progress across ALL courses
// (place before /:id so it isn't swallowed by the param route)
router.get('/my-progress', protect, async (req, res) => {
  try {
    if (req.user.id === 'admin') return res.json({ progress: [] });
    const progress = await CourseProgress.find({ userId: req.user._id })
      .populate('courseId', 'title category thumbnail')
      .sort({ lastWatchedAt: -1 });
    res.json({ progress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/course/:id/my-progress — current user's progress for ONE course
router.get('/:id/my-progress', protect, async (req, res) => {
  try {
    if (req.user.id === 'admin') return res.json({ progress: null });
    const progress = await CourseProgress.findOne({ userId: req.user._id, courseId: req.params.id });
    res.json({ progress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/course/:id/watch — log that the student opened/is watching this course
router.post('/:id/watch', protect, async (req, res) => {
  try {
    if (req.user.id === 'admin') return res.status(403).json({ message: 'Admin progress is not tracked' });
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await CourseProgress.findOne({ userId: req.user._id, courseId: req.params.id });
    if (existing) {
      existing.lastWatchedAt = new Date();
      existing.viewCount += 1;
      await existing.save();
      return res.json({ progress: existing });
    }

    const progress = await CourseProgress.create({
      userId: req.user._id,
      courseId: req.params.id,
      status: 'in-progress',
    });
    res.status(201).json({ progress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/course/:id/complete — student marks this course as fully watched
router.post('/:id/complete', protect, async (req, res) => {
  try {
    if (req.user.id === 'admin') return res.status(403).json({ message: 'Admin progress is not tracked' });
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const progress = await CourseProgress.findOneAndUpdate(
      { userId: req.user._id, courseId: req.params.id },
      { status: 'completed', completedAt: new Date(), lastWatchedAt: new Date(), $setOnInsert: { startedAt: new Date() } },
      { new: true, upsert: true }
    );
    res.json({ progress, message: 'Course marked as completed 🎉' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/course/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/course — admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, videoUrl, category, level, notes } = req.body;
    if (!title || !description || !videoUrl) {
      return res.status(400).json({ message: 'Title, description and video URL are required' });
    }
    if (level && !COURSE_LEVELS.includes(level)) {
      return res.status(400).json({ message: `Level must be one of: ${COURSE_LEVELS.join(', ')}` });
    }
    const course = await Course.create({
      title, description, videoUrl, category, notes,
      level: level || 'easy',
      createdBy: req.user._id,
    });
    res.status(201).json({ course, message: 'Course created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/course/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (req.body.level && !COURSE_LEVELS.includes(req.body.level)) {
      return res.status(400).json({ message: `Level must be one of: ${COURSE_LEVELS.join(', ')}` });
    }
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course, message: 'Course updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/course/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
