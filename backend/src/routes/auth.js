const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    if (password.length < 4) return res.status(400).json({ message: 'Password must be at least 4 characters' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ email: email.toLowerCase(), password, role: 'user' });
    const token = signToken(user._id, user.role);

    res.status(201).json({
      token,
      user: user.toSafeObject(),
      message: 'Registration successful',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login  (handles both admin hard-coded + normal users)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // Hard-coded admin check
    if (email === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = signToken('admin', 'admin');
      return res.json({
        token,
        user: { _id: 'admin', id: 'admin', email: 'admin', role: 'admin', profile: { name: 'Administrator' } },
        message: 'Admin login successful',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id, user.role);
    res.json({ token, user: user.toSafeObject(), message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me — verify token & return current user
router.get('/me', protect, async (req, res) => {
  if (req.user.id === 'admin') {
    return res.json({ user: req.user });
  }
  const user = await User.findById(req.user._id).select('-password');
  res.json({ user });
});

module.exports = router;
