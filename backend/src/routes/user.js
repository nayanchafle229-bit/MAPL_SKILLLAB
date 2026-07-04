const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/user/profile
router.get('/profile', protect, async (req, res) => {
  try {
    if (req.user.id === 'admin') return res.json({ profile: req.user.profile, profileComplete: true });
    const user = await User.findById(req.user._id).select('-password');
    res.json({ profile: user.profile, profileComplete: user.profileComplete, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/user/profile
router.put('/profile', protect, async (req, res) => {
  try {
    if (req.user.id === 'admin') return res.status(403).json({ message: 'Admin profile is fixed' });
    const { name, branch, year, interests, bio, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profile: { name, branch, year, interests, bio, phone }, profileComplete: true },
      { new: true }
    ).select('-password');

    res.json({ user, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
