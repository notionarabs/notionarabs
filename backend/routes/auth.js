const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const mongoose = require('mongoose');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Template = require('../models/Template');
const auth = require('../middleware/auth');

const router = express.Router();

// Temporary storage for unverified users (in production, use Redis or database)
const tempUserStorage = new Map();

// Rate limiting for signup attempts
const signupAttempts = new Map();
const MAX_ATTEMPTS = 3;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Clean up expired tokens every hour
setInterval(() => {
  const now = new Date();
  for (const [token, userData] of tempUserStorage.entries()) {
    if (userData.emailVerificationExpiry < now) {
      tempUserStorage.delete(token);
    }
  }
}, 60 * 60 * 1000); // 1 hour

// Function to validate email domain
const validateEmailDomain = async (email) => {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;

    // Check MX record for the domain
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    console.log('Email domain validation failed:', error.message);
    return false;
  }
};

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

    // Validate email domain - block common fake email domains
    const blockedDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
      'throwaway.email', 'temp-mail.org', 'sharklasers.com', 'guerrillamailblock.com',
      'pokemail.net', 'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com',
      'mailnesia.com', 'meltmail.com', 'trashmail.com', 'yopmail.com',
      'example.com', 'test.com', 'fake.com', 'invalid.com'
    ];

    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(emailDomain)) {
      return res.status(400).json({
        success: false,
        message: 'يرجى استخدام بريد إلكتروني صحيح ومؤكد'
      });
    }

    // Validate email domain exists (has MX record)
    const isDomainValid = await validateEmailDomain(email);
    if (!isDomainValid) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني غير صحيح أو غير موجود'
      });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Send verification email first
    try {
      const transporter = createTransporter();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(email)}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'تأكيد البريد الإلكتروني - عرب نوشن',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #333; text-align: center;">مرحباً ${name}!</h2>
            <p>شكراً لانضمامك إلى عرب نوشن. لتأكيد حسابك، يرجى الضغط على الرابط أدناه:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">تأكيد البريد الإلكتروني</a>
            </div>
            <p>هذا الرابط صالح لمدة 24 ساعة.</p>
            <p>إذا لم تنشئ هذا الحساب، يمكنك تجاهل هذا البريد الإلكتروني.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">عرب نوشن - منصة القوالب العربية</p>
          </div>
        `
      };

      // Try to send the email - this will fail if email doesn't exist
      await transporter.sendMail(mailOptions);

      // Store user data temporarily (not in database yet)
      tempUserStorage.set(emailVerificationToken, {
        name,
        email,
        password,
        emailVerificationToken,
        emailVerificationExpiry,
        createdAt: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق من بريدك والضغط على الرابط لتأكيد حسابك.',
        requiresVerification: true,
        verificationToken: emailVerificationToken,
        email: email
      });
    } catch (emailError) {
      console.error('Verification email sending error:', emailError);

      res.status(500).json({
        success: false,
        message: 'فشل في إرسال بريد التأكيد. يرجى المحاولة مرة أخرى لاحقاً.',
        errorType: 'EMAIL_SEND_FAILED'
      });
    }
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

    // Check if email is verified first
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تأكيد بريدك الإلكتروني أولاً قبل تسجيل الدخول.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'تم تعطيل الحساب. يرجى التواصل مع الدعم الفني.'
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
        role: user.role,
        profilePicture: user.profilePicture,
        creatorStatus: user.creatorStatus
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


// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    });
  }

  if (!process.env.JWT_SECRET) {
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
    // Check if we have the required parameters
    if (!req.query.code) {
      return res.redirect('https://notion-arabs.vercel.app/auth/callback?success=false&error=no_code');
    }

    // Use passport.authenticate as middleware
    passport.authenticate('google', { session: false }, async (err, user, info) => {
      try {
        if (err) {
          console.error('Passport authentication error:', err);
          return res.redirect('https://notion-arabs.vercel.app/auth/callback?success=false&error=passport_error');
        }

        if (!user) {
          console.error('No user from Google OAuth');
          return res.redirect('https://notion-arabs.vercel.app/auth/callback?success=false&error=no_user');
        }

        // Generate token
        const token = generateToken(user._id);

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'https://notion-arabs.vercel.app';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&success=true`);
      } catch (error) {
        console.error('Callback processing error:', error);
        res.redirect('https://notion-arabs.vercel.app/auth/callback?success=false&error=processing_error');
      }
    })(req, res);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect('https://notion-arabs.vercel.app/auth/callback?success=false&error=callback_error');
  }
});

// Email configuration
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح')
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

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني مسجلاً، ستتلقى رابط إعادة تعيين كلمة المرور'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'تم تعطيل الحساب'
      });
    }

    // Check if this is a Google account
    if (user.googleId) {
      return res.status(400).json({
        success: false,
        message: 'هذا الحساب مسجل عبر Google. يرجى استخدام "تسجيل الدخول بـ Google" بدلاً من إعادة تعيين كلمة المرور'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'إعادة تعيين كلمة المرور - عرب نوشن',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #333; text-align: center;">إعادة تعيين كلمة المرور</h2>
            <p>مرحباً ${user.name}،</p>
            <p>لقد تلقيت طلباً لإعادة تعيين كلمة المرور لحسابك في عرب نوشن.</p>
            <p>اضغط على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">إعادة تعيين كلمة المرور</a>
            </div>
            <p>هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">عرب نوشن - منصة القوالب العربية</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      console.error('Email error details:', {
        message: emailError.message,
        code: emailError.code,
        response: emailError.response
      });

      // Clear the reset token if email fails
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();

      res.status(500).json({
        success: false,
        message: 'فشل في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى لاحقاً'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('رمز إعادة التعيين مطلوب'),
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

    const { token, password } = req.body;

    // Find user by reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'رمز إعادة التعيين غير صحيح أو منتهي الصلاحية'
      });
    }

    // Update password
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with token and create user account
// @access  Public
router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('رمز التأكيد مطلوب')
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

    const { token: verificationToken } = req.body;

    // Check if token exists in temporary storage
    const tempUserData = tempUserStorage.get(verificationToken);

    if (!tempUserData) {
      return res.status(400).json({
        success: false,
        message: 'رمز التأكيد غير موجود أو منتهي الصلاحية',
        errorType: 'INVALID_TOKEN'
      });
    }

    // Check if token is expired
    if (tempUserData.emailVerificationExpiry < new Date()) {
      // Remove expired token
      tempUserStorage.delete(verificationToken);
      return res.status(400).json({
        success: false,
        message: 'رمز التأكيد منتهي الصلاحية. يرجى طلب رابط جديد',
        errorType: 'EXPIRED_TOKEN'
      });
    }

    // Check if user already exists in database
    const existingUser = await User.findOne({ email: tempUserData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مؤكد بالفعل. يمكنك تسجيل الدخول الآن',
        errorType: 'ALREADY_VERIFIED'
      });
    }

    // Create the actual user account now
    const user = new User({
      name: tempUserData.name,
      email: tempUserData.email,
      password: tempUserData.password,
      isEmailVerified: true,
      isActive: true
    });

    await user.save();

    // Remove from temporary storage
    tempUserStorage.delete(verificationToken);

    // Generate token for automatic login
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'تم تأكيد البريد الإلكتروني بنجاح. مرحباً بك في عرب نوشن!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        creatorStatus: user.creatorStatus,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/auth/apply-creator
// @desc    Apply to become a creator
// @access  Private
router.post('/apply-creator', auth, [
  body('portfolio')
    .notEmpty()
    .withMessage('رابط المعرض مطلوب'),
  body('experience')
    .notEmpty()
    .withMessage('وصف الخبرة مطلوب'),
  body('specialties')
    .isArray({ min: 1 })
    .withMessage('يجب اختيار مجال واحد على الأقل'),
  body('motivation')
    .notEmpty()
    .withMessage('سبب الرغبة في الانضمام مطلوب')
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

    const { portfolio, experience, specialties, motivation, phone, socialMedia, availability, expectedEarnings } = req.body;

    // Check if user already has a pending or approved creator status
    if (req.user.creatorStatus !== 'none') {
      return res.status(400).json({
        success: false,
        message: 'لديك طلب مبدع موجود بالفعل'
      });
    }

    // Update user with creator application data
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        creatorStatus: 'pending',
        // Store additional creator application data (you might want to create a separate CreatorApplication model)
        portfolio,
        experience,
        specialties,
        motivation,
        phone,
        socialMedia,
        availability,
        expectedEarnings
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'تم إرسال طلب الانضمام كمبدع بنجاح. سنراجع طلبك وسنعاود التواصل معك خلال 3-5 أيام عمل.',
      user
    });
  } catch (error) {
    console.error('Creator application error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/auth/create-admin
// @desc    Create admin user (development only)
// @access  Public (restrict in production)
router.post('/create-admin', [
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
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('adminSecret')
    .equals(process.env.ADMIN_SECRET || 'admin-secret-2024')
    .withMessage('Admin secret is required')
], async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Admin creation not allowed in production'
      });
    }

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

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password,
      role: 'admin',
      isActive: true,
      isEmailVerified: true // Skip email verification for admin
    });

    await adminUser.save();

    // Generate token for automatic login
    const token = generateToken(adminUser._id);

    res.json({
      success: true,
      message: 'تم إنشاء حساب المدير بنجاح',
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        profilePicture: adminUser.profilePicture,
        creatorStatus: adminUser.creatorStatus
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح')
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

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني غير مسجل'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مؤكد بالفعل'
      });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpiry = emailVerificationExpiry;
    await user.save();

    // Send verification email
    try {
      const transporter = createTransporter();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'تأكيد البريد الإلكتروني - عرب نوشن',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #333; text-align: center;">تأكيد البريد الإلكتروني</h2>
            <p>مرحباً ${user.name}،</p>
            <p>لقد طلبت إعادة إرسال رابط تأكيد البريد الإلكتروني.</p>
            <p>اضغط على الرابط أدناه لتأكيد حسابك:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">تأكيد البريد الإلكتروني</a>
            </div>
            <p>هذا الرابط صالح لمدة 24 ساعة.</p>
            <p>إذا لم تطلب هذا الرابط، يمكنك تجاهل هذا البريد الإلكتروني.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">عرب نوشن - منصة القوالب العربية</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني'
      });
    } catch (emailError) {
      console.error('Resend verification email error:', emailError);
      res.status(500).json({
        success: false,
        message: 'فشل في إرسال بريد التأكيد. يرجى المحاولة مرة أخرى لاحقاً'
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   DELETE /api/auth/account
// @desc    Delete user account and all associated data
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete user's blogs
      await Blog.deleteMany({ author: userId }, { session });

      // Delete user's templates
      await Template.deleteMany({ creator: userId }, { session });

      // Delete user's profile
      await User.findByIdAndDelete(userId, { session });

      // Commit the transaction
      await session.commitTransaction();

      res.json({
        success: true,
        message: 'تم حذف حسابك وجميع البيانات المرتبطة به بنجاح'
      });

    } catch (error) {
      // Rollback the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الحساب. يرجى المحاولة مرة أخرى'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('كلمة المرور الحالية مطلوبة'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('كلمة المرور الجديدة يجب أن تحتوي على حرف صغير وحرف كبير ورقم واحد على الأقل'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('تأكيد كلمة المرور لا يطابق كلمة المرور الجديدة');
      }
      return true;
    })
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى'
    });
  }
});

module.exports = router;
