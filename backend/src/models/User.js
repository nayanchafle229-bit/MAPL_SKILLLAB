const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema({
  name:      { type: String, default: '' },
  branch:    { type: String, default: '' },
  year:      { type: String, default: '' },
  interests: { type: String, default: '' },
  bio:       { type: String, default: '' },
  phone:     { type: String, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 4 },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  profile:  { type: profileSchema, default: () => ({}) },
  profileComplete: { type: Boolean, default: false },
  // When true, this user (even though role='user') is permitted to view
  // other students' progress via the /api/progress routes. Granted by admin.
  canViewProgress: { type: Boolean, default: false },
  // Password reset — we store a SHA-256 hash of the token (never the raw
  // token) so a leaked database never exposes usable reset links.
  resetPasswordToken:   { type: String, default: undefined },
  resetPasswordExpires: { type: Date,   default: undefined },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
