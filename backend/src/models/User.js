const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema({
  name:      { type: String, default: '' },
  role:      { type: String, default: '' }, // engineering job title, e.g. "Senior Engineer" — distinct from userSchema.role (auth role)
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
  return obj;
};

module.exports = mongoose.model('User', userSchema);
