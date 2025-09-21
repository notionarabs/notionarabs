const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    maxlength: [50, 'الاسم لا يجب أن يتجاوز 50 حرف']
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'يرجى إدخال بريد إلكتروني صحيح']
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Only required if not a Google user
    },
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  creatorStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  isActive: {
    type: Boolean,
    default: false // Changed to false - accounts are inactive until email verified
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'النبذة الشخصية لا يجب أن تتجاوز 500 حرف']
  },
  templatesCount: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpiry: {
    type: Date,
    default: null
  },
  // Creator application fields
  portfolio: {
    type: String,
    default: null
  },
  experience: {
    type: String,
    default: null
  },
  specialties: [{
    type: String
  }],
  motivation: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  socialMedia: {
    instagram: { type: String, default: null },
    twitter: { type: String, default: null },
    linkedin: { type: String, default: null },
    website: { type: String, default: null }
  },
  availability: {
    type: String,
    default: null
  },
  expectedEarnings: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password || this.googleId) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
