const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    maxlength: [50, 'الاسم لا يجب أن يتجاوز 50 حرف']
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    default: undefined, // Use undefined instead of null
    validate: {
      validator: function (v) {
        // Allow null/undefined/empty values
        if (v === null || v === undefined || v === '') return true;
        // If not null, validate the format
        return /^[a-zA-Z0-9_]+$/.test(v);
      },
      message: 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطة سفلية فقط'
    }
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
    enum: ['user', 'creator', 'admin'],
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
  backgroundImage: {
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
  // Payment-related fields removed - all templates are free
  followers: {
    type: Number,
    default: 0
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  templateCount: {
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
  requestedName: {
    type: String,
    default: null,
    trim: true,
    maxlength: [50, 'الاسم المطلوب لا يجب أن يتجاوز 50 حرف']
  },
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
    website: { type: String, default: null },
    youtube: { type: String, default: null },
    facebook: { type: String, default: null }
  },
  availability: {
    type: String,
    default: null
  },
  // Expected earnings field removed - all templates are free
  // Profile settings fields
  displayName: {
    type: String,
    default: null,
    trim: true,
    maxlength: [50, 'الاسم المعروض لا يجب أن يتجاوز 50 حرف']
  },
  socialLinks: [{
    url: { type: String, default: '' }
  }],
  profileVisibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  showEmail: {
    type: Boolean,
    default: false
  },
  showPhone: {
    type: Boolean,
    default: false
  },
  allowMessages: {
    type: Boolean,
    default: true
  },
  contactEmail: {
    type: String,
    default: null,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'يرجى إدخال بريد إلكتروني صحيح']
  },
  showTemplateCount: {
    type: Boolean,
    default: true
  },
  showJoinDate: {
    type: Boolean,
    default: true
  },
  customMessage: {
    type: String,
    default: '',
    maxlength: [200, 'الرسالة المخصصة لا يجب أن تتجاوز 200 حرف']
  },
  // Badge system
  badges: [{
    type: {
      type: String,
      enum: ['verified', 'top-creator', 'active', 'community-favorite', 'trusted'],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#3b82f6' // blue
    },
    icon: {
      type: String,
      default: '✓'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
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
