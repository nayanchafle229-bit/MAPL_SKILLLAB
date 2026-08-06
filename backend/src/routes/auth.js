const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/email');

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

// POST /api/auth/forgot-password
// Always responds with a generic message so we never reveal whether an
// email address is registered (prevents account enumeration).
router.post('/forgot-password', async (req, res) => {
  const GENERIC_MSG = 'If that email is registered, a password reset link has been sent.';
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Admin account (env-based) has no DB record and no password reset flow.
    if (user) {
      const rawToken  = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.resetPasswordToken   = tokenHash;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password/${rawToken}`;

      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (emailErr) {
        // Don't leak email-provider errors to the client — log server-side only.
        console.error('[forgot-password] failed to send email:', emailErr.message);
      }
    }

    res.json({ message: GENERIC_MSG });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    user.password = password; // pre-save hook hashes it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
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
