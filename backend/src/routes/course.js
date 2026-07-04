const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/course — all users
router.get('/', protect, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ courses });
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
    const { title, description, videoUrl, category } = req.body;
    if (!title || !description || !videoUrl) {
      return res.status(400).json({ message: 'Title, description and video URL are required' });
    }
    const course = await Course.create({ title, description, videoUrl, category, createdBy: req.user._id });
    res.status(201).json({ course, message: 'Course created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/course/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
