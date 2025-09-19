const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'تم تعطيل الحساب'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('النبذة الشخصية لا يجب أن تتجاوز 500 حرف')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { name, bio } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/auth/debug
// @desc    Debug endpoint to check environment variables
// @access  Public
router.get('/debug', (req, res) => {
  res.json({
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    JWT_SECRET: !!process.env.JWT_SECRET,
    MONGODB_URI: !!process.env.MONGODB_URI,
    FRONTEND_URL: process.env.FRONTEND_URL,
    NODE_ENV: process.env.NODE_ENV
  });
});

// @route   GET /api/auth/test-callback
// @desc    Test callback simulation
// @access  Public
router.get('/test-callback', async (req, res) => {
  try {
    console.log('Test callback simulation started');

    // Check database connection
    const mongoose = require('mongoose');
    console.log('Database state:', mongoose.connection.readyState);

    // Test User model
    const User = require('../models/User');
    console.log('User model loaded successfully');

    // Test JWT generation
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign({ userId: 'test123' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('JWT generation test successful');

    res.json({
      success: true,
      message: 'All systems working',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      jwt: 'working',
      userModel: 'loaded'
    });
  } catch (error) {
    console.error('Test callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', (req, res) => {
  console.log('Google OAuth request received');
  console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth credentials missing');
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET missing');
    return res.status(503).json({
      success: false,
      message: 'JWT_SECRET is not configured. Please set JWT_SECRET environment variable.'
    });
  }

  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', async (req, res) => {
  try {
    console.log('Google OAuth callback received');
    console.log('Query params:', req.query);

    // Check if we have the required parameters
    if (!req.query.code) {
      console.error('No authorization code received');
      return res.redirect('https://notion-arabs.vercel.app/auth/callback?success=false&error=no_code');
    }

    // Use passport.authenticate as middleware
    passport.authenticate('google', { session: false }, async (err, user, info) => {
      try {
        console.log('Passport authentication completed');
        console.log('Error:', err);
        console.log('User:', user);
        console.log('Info:', info);

        if (err) {
          console.error('Passport authentication error:', err);
          return res.redirect('https://notion-arabs.vercel.app/auth/callback?success=false&error=passport_error');
        }

        if (!user) {
          console.error('No user from Google OAuth');
          return res.redirect('https://notion-arabs.vercel.app/auth/callback?success=false&error=no_user');
        }

        console.log('User authenticated successfully:', user.email);

        // Generate token
        console.log('Generating JWT token...');
        const token = generateToken(user._id);
        console.log('Token generated successfully');

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'https://notion-arabs.vercel.app';
        console.log('Redirecting to:', `${frontendUrl}/auth/callback?token=${token}&success=true`);
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&success=true`);
      } catch (error) {
        console.error('Callback processing error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.redirect('https://notion-arabs.vercel.app/auth/callback?success=false&error=processing_error');
      }
    })(req, res);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.redirect('https://notion-arabs.vercel.app/auth/callback?success=false&error=callback_error');
  }
});

module.exports = router;
