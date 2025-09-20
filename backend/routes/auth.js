const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = new User({
      name,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpiry
    });

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

      await transporter.sendMail(mailOptions);

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.',
        requiresVerification: true,
        verificationToken: emailVerificationToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive
        }
      });
    } catch (emailError) {
      console.error('Verification email sending error:', emailError);

      // Still create the user but without verification
      res.status(201).json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح، لكن فشل في إرسال بريد التأكيد. يرجى المحاولة لاحقاً.',
        requiresVerification: true,
        verificationToken: emailVerificationToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive
        }
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

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'تم تعطيل الحساب'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'الحساب غير مفعل. يرجى تأكيد بريدك الإلكتروني أولاً.',
        requiresVerification: true,
        email: user.email
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
// @desc    Verify email with token
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

    // Find user by verification token
    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'رمز التأكيد غير صحيح أو منتهي الصلاحية'
      });
    }

    // Mark email as verified and activate account
    user.isEmailVerified = true;
    user.isActive = true; // Activate the account
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await user.save();

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

module.exports = router;
