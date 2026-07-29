const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Admin hard-coded user
    if (decoded.role === 'admin' && decoded.id === 'admin') {
      req.user = { _id: 'admin', id: 'admin', role: 'admin', email: 'admin@system.local', profile: { name: 'Administrator' } };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Admin-only guard
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Progress-tracking guard — admin always allowed; a regular user is
// allowed only if the admin has explicitly granted them canViewProgress.
const progressAccess = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.canViewProgress === true) {
    return next();
  }
  return res.status(403).json({ message: 'You do not have permission to view student progress' });
};

module.exports = { protect, adminOnly, progressAccess };
