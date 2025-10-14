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
// @route   POST /api/auth/check-username
// @desc    Check if username is available
// @access  Public
router.post('/check-username', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('اسم المستخدم يجب أن يكون بين 3 و 20 حرف')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطة سفلية فقط')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم غير صحيح',
        errors: errors.array()
      });
    }

    const { username } = req.body;
    const lowerUsername = username.toLowerCase();

    // Check if username exists
    const existingUser = await User.findOne({
      username: lowerUsername
    });

    return res.json({
      success: true,
      available: !existingUser,
      username: lowerUsername
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/auth/check-username/:username
// @desc    Check if username is available (GET version)
// @access  Public
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const lowerUsername = username.toLowerCase();

    // Basic validation
    if (!lowerUsername || lowerUsername.length < 3 || lowerUsername.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم يجب أن يكون بين 3 و 20 حرف'
      });
    }

    if (!/^[a-z0-9_]+$/.test(lowerUsername)) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم يجب أن يحتوي على أحرف صغيرة وأرقام وشرطة سفلية فقط'
      });
    }

    // Check for reserved usernames
    const reservedUsernames = ['admin', 'api', 'www', 'mail', 'ftp', 'root', 'support', 'help', 'contact', 'about', 'terms', 'privacy', 'login', 'signup', 'register', 'dashboard', 'profile', 'settings', 'account', 'user', 'users', 'creator', 'creators', 'template', 'templates', 'blog', 'news', 'home', 'index', 'main', 'app', 'site', 'web', 'online', 'service', 'services'];
    if (reservedUsernames.includes(lowerUsername)) {
      return res.status(409).json({
        success: false,
        message: 'هذا الاسم محجوز ولا يمكن استخدامه'
      });
    }

    // Check if username exists (exclude current user if they're authenticated)
    const query = { username: lowerUsername };

    // If user is authenticated (has Authorization header), exclude their own username
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        query._id = { $ne: decoded.id };
      } catch (tokenError) {
        // If token is invalid, continue without excluding any user
      }
    }

    const existingUser = await User.findOne(query);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'اسم المستخدم غير متاح'
      });
    }

    return res.json({
      success: true,
      available: true,
      username: lowerUsername
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

router.post('/signup', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('اسم المستخدم يجب أن يكون بين 3 و 20 حرف')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطة سفلية فقط'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
], async (req, res) => {
  try {
    console.log('Signup request received:', {
      name: req.body.name,
      email: req.body.email,
      hasPassword: !!req.body.password
    });

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { name, username, email, password } = req.body;

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
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

    // Skip DNS validation for faster signup - email verification will catch invalid emails

    // Check username if provided
    let finalUsername = null;
    if (username && username.trim()) {
      const lowerUsername = username.toLowerCase().trim();

      // Check for reserved usernames
      const reservedUsernames = ['admin', 'api', 'www', 'mail', 'ftp', 'root', 'support', 'help', 'contact', 'about', 'terms', 'privacy', 'login', 'signup', 'register', 'dashboard', 'profile', 'settings', 'account', 'user', 'users', 'creator', 'creators', 'template', 'templates', 'blog', 'news', 'home', 'index', 'main', 'app', 'site', 'web', 'online', 'service', 'services'];
      if (reservedUsernames.includes(lowerUsername)) {
        return res.status(400).json({
          success: false,
          message: 'هذا الاسم محجوز ولا يمكن استخدامه'
        });
      }

      // Check if username already exists
      const existingUserByUsername = await User.findOne({ username: lowerUsername });
      if (existingUserByUsername) {
        return res.status(400).json({
          success: false,
          message: 'اسم المستخدم مستخدم بالفعل'
        });
      }

      finalUsername = lowerUsername;
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Try to send verification email first
    let emailSent = false;
    try {
      const transporter = createTransporter();
      const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';
      const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(email)}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM || `"عرب نوشن" <support@notionarabs.com>`,
        to: email,
        subject: 'تأكيد حسابك في عرب نوشن',
        html: `
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تأكيد البريد الإلكتروني - عرب نوشن</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Tajawal', sans-serif; background-color: #f8f9fa;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px; text-align: center; background-color: #f5631e; border-radius: 12px 12px 0 0;">
                        <img src="https://www.notionarabs.com/favicon.png" alt="عرب نوشن" style="height: 60px; width: auto;" />
                        <h1 style="color: #ffffff; margin: 20px 0 10px; font-size: 24px; font-weight: 700;">مرحباً ${name}!</h1>
                        <p style="color: #ffffff; margin: 0; font-size: 16px;">شكراً لانضمامك إلى عرب نوشن</p>
                      </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px; text-align: right; direction: rtl;">
                        <h2 style="color: #132859; font-size: 20px; margin: 0 0 20px; font-weight: 600; text-align: right;">أكمل تسجيلك الآن</h2>
                        <p style="color: #5f6368; font-size: 16px; line-height: 1.6; margin: 0 0 30px; text-align: right;">
                          لإكمال التسجيل، يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه
                        </p>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${verificationUrl}" style="display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            تأكيد البريد الإلكتروني
                          </a>
                        </div>
                        
                        <!-- Info -->
                        <div style="background-color: #fef7f0; border-right: 4px solid #f5631e; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
                          <p style="color: #132859; font-size: 14px; margin: 0; font-weight: 500; text-align: right;">
                            ملاحظة مهمة: الرابط صالح لمدة 24 ساعة فقط
                          </p>
                        </div>
                        
                        <!-- Security Note -->
                        <p style="color: #9aa0a6; font-size: 14px; text-align: center; margin: 20px 0 0;">
                          لم تطلب هذا الحساب؟ يمكنك تجاهل هذا البريد بأمان
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px; background-color: #132859; text-align: center; border-radius: 0 0 12px 12px;">
                        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 10px; font-weight: 700;">عرب نوشن</h3>
                        <p style="color: #9aa0a6; font-size: 14px; margin: 0 0 15px;">منصة القوالب العربية</p>
                        <a href="https://www.notionarabs.com" style="color: #f5631e; text-decoration: none; font-weight: 600;">www.notionarabs.com</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `مرحباً ${name}!\n\nشكراً لانضمامك إلى عرب نوشن.\n\nلتأكيد حسابك، يرجى زيارة الرابط التالي:\n${verificationUrl}\n\nهذا الرابط صالح لمدة 24 ساعة.\n\nإذا لم تنشئ هذا الحساب، يمكنك تجاهل هذا البريد.\n\nعرب نوشن - منصة القوالب العربية\nwww.notionarabs.com`
      };

      // Try to send the email
      await transporter.sendMail(mailOptions);
      emailSent = true;

      // Store user data temporarily (not in database yet)
      const tempUserData = {
        name,
        email,
        password,
        emailVerificationToken,
        emailVerificationExpiry,
        createdAt: new Date()
      };

      // Only add username if it's provided
      if (finalUsername) {
        tempUserData.username = finalUsername;
      }

      tempUserStorage.set(emailVerificationToken, tempUserData);

      res.status(201).json({
        success: true,
        message: 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق من بريدك والضغط على الرابط لتأكيد حسابك.',
        requiresVerification: true,
        verificationToken: emailVerificationToken,
        email: email
      });
    } catch (emailError) {
      console.error('Verification email sending error:', emailError);
      console.error('Email error message:', emailError.message);
      console.error('Email error type:', typeof emailError.message);

      // Store user data temporarily for email verification (even if email service fails)
      const tempUserData = {
        name,
        email,
        password,
        emailVerificationToken,
        emailVerificationExpiry,
        createdAt: new Date()
      };

      // Only add username if it's provided
      if (finalUsername) {
        tempUserData.username = finalUsername;
      }

      tempUserStorage.set(emailVerificationToken, tempUserData);

      // Always return verification required (even if email failed to send)
      res.status(201).json({
        success: true,
        message: 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق من بريدك والضغط على الرابط لتأكيد حسابك.',
        requiresVerification: true,
        verificationToken: emailVerificationToken,
        email: email,
        emailSent: false // Indicate that email wasn't actually sent
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
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

// @route   GET /api/auth/profile/settings
// @desc    Get user profile settings
// @access  Private
router.get('/profile/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Return profile settings
    const profileSettings = {
      username: user.username || '',
      displayName: user.displayName || user.name,
      bio: user.bio || '',
      profilePicture: user.profilePicture || '',
      backgroundImage: user.backgroundImage || '', // Include background image
      socialLinks: user.socialLinks || {
        website: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        youtube: ''
      },
      profileVisibility: user.profileVisibility || 'public',
      showEmail: user.showEmail || false,
      showPhone: user.showPhone || false,
      allowMessages: user.allowMessages !== false, // default true
      contactEmail: user.contactEmail || '',
      showTemplateCount: user.showTemplateCount !== false, // default true
      showJoinDate: user.showJoinDate !== false, // default true
      customMessage: user.customMessage || '',
      // Specialties field
      specialties: user.specialties || []
    };

    res.json({
      success: true,
      data: profileSettings
    });
  } catch (error) {
    console.error('Get profile settings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   PUT /api/auth/profile/settings
// @desc    Update user profile settings
// @access  Private
router.put('/profile/settings', auth, [
  body('username')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true; // Allow empty username
      if (value.length < 3 || value.length > 20) {
        throw new Error('اسم المستخدم يجب أن يكون بين 3 و 20 حرف');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        throw new Error('اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطة سفلية فقط');
      }
      return true;
    }),
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم المعروض يجب أن يكون بين 2 و 50 حرف'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('النبذة الشخصية لا يجب أن تتجاوز 500 حرف'),
  body('customMessage')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('الرسالة المخصصة لا يجب أن تتجاوز 200 حرف'),
  body('socialLinks.website')
    .optional()
    .custom((value) => {
      if (!value) return true;
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return true;
      }
      return false;
    })
    .withMessage('رابط الموقع الإلكتروني غير صحيح'),
  body('socialLinks.twitter')
    .optional()
    .custom((value) => {
      if (!value) return true;
      // Allow @username or full URL
      if (value.startsWith('@') || value.startsWith('http')) {
        return true;
      }
      return false;
    })
    .withMessage('اسم مستخدم تويتر غير صحيح'),
  body('socialLinks.linkedin')
    .optional()
    .custom((value) => {
      if (!value) return true;
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('linkedin.com/')) {
        return true;
      }
      return false;
    })
    .withMessage('رابط لينكد إن غير صحيح'),
  body('socialLinks.instagram')
    .optional()
    .custom((value) => {
      if (!value) return true;
      // Allow @username or full URL
      if (value.startsWith('@') || value.startsWith('http')) {
        return true;
      }
      return false;
    })
    .withMessage('اسم مستخدم إنستغرام غير صحيح'),
  body('socialLinks.youtube')
    .optional()
    .custom((value) => {
      if (!value) return true;
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('youtube.com/')) {
        return true;
      }
      return false;
    })
    .withMessage('رابط يوتيوب غير صحيح'),
  body('profileVisibility')
    .optional()
    .isIn(['public', 'followers', 'private'])
    .withMessage('نوع الرؤية غير صحيح'),
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني للتواصل غير صحيح'),
  // Specialties validation
  body('specialties')
    .optional()
    .isArray()
    .withMessage('المجالات يجب أن تكون قائمة')
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

    const {
      username,
      displayName,
      bio,
      profilePicture,
      backgroundImage,
      socialLinks,
      profileVisibility,
      showEmail,
      showPhone,
      allowMessages,
      contactEmail,
      showTemplateCount,
      showJoinDate,
      customMessage,
      // Specialties field
      specialties
    } = req.body;

    const updateData = {};

    if (username !== undefined) {
      // Check if username is already taken
      const existingUser = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: req.user._id }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'اسم المستخدم مستخدم بالفعل'
        });
      }
      updateData.username = username.toLowerCase();
    }
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (backgroundImage !== undefined) updateData.backgroundImage = backgroundImage;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (profileVisibility !== undefined) updateData.profileVisibility = profileVisibility;
    if (showEmail !== undefined) updateData.showEmail = showEmail;
    if (showPhone !== undefined) updateData.showPhone = showPhone;
    if (allowMessages !== undefined) updateData.allowMessages = allowMessages;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (showTemplateCount !== undefined) updateData.showTemplateCount = showTemplateCount;
    if (showJoinDate !== undefined) updateData.showJoinDate = showJoinDate;
    if (customMessage !== undefined) updateData.customMessage = customMessage;
    // Specialties field
    if (specialties !== undefined) updateData.specialties = specialties;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'تم حفظ إعدادات الملف الشخصي بنجاح! 🎉',
      user
    });
  } catch (error) {
    console.error('Update profile settings error:', error);
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
      const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';
      return res.redirect(`${frontendUrl}/auth/callback?success=false&error=no_code`);
    }

    // Use passport.authenticate as middleware
    passport.authenticate('google', { session: false }, async (err, user, info) => {
      try {
        if (err) {
          console.error('Passport authentication error:', err);
          const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';
          return res.redirect(`${frontendUrl}/auth/callback?success=false&error=passport_error`);
        }

        if (!user) {
          console.error('No user from Google OAuth');
          const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';
          return res.redirect(`${frontendUrl}/auth/callback?success=false&error=no_user`);
        }

        // Generate token
        const token = generateToken(user._id);

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&success=true`);
      } catch (error) {
        console.error('Callback processing error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';
        res.redirect(`${frontendUrl}/auth/callback?success=false&error=processing_error`);
      }
    })(req, res);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';
    res.redirect(`${frontendUrl}/auth/callback?success=false&error=callback_error`);
  }
});

// Email configuration - Brevo only
const createTransporter = () => {
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is not configured!');
    throw new Error('Email service is not configured. Please set BREVO_API_KEY.');
  }

  console.log('✅ Using Brevo for email service');

  return {
    sendMail: async (mailOptions) => {
      try {
        const fetch = require('node-fetch');
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
          },
          body: JSON.stringify({
            sender: {
              email: process.env.EMAIL_FROM || process.env.BREVO_FROM_EMAIL || 'support@notionarabs.com'
            },
            to: [{ email: mailOptions.to }],
            subject: mailOptions.subject,
            htmlContent: mailOptions.html
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Brevo error: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log('✅ Brevo email sent successfully:', result.messageId);
        return {
          messageId: result.messageId,
          response: 'Email sent via Brevo'
        };
      } catch (error) {
        console.error('❌ Brevo error:', error);
        throw error;
      }
    },
    verify: (callback) => {
      console.log('✅ Brevo API key is configured');
      callback(null, true);
    }
  };
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
    const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM || `"عرب نوشن" <support@notionarabs.com>`,
        to: email,
        subject: 'إعادة تعيين كلمة المرور - Reset Password | عرب نوشن',
        html: `
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>إعادة تعيين كلمة المرور - عرب نوشن</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Tajawal', sans-serif; background-color: #f8f9fa;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px; text-align: center; background-color: #f5631e; border-radius: 12px 12px 0 0;">
                        <img src="https://www.notionarabs.com/apple-touch-icon.png" alt="عرب نوشن" style="height: 60px; width: auto;" />
                        <h1 style="color: #ffffff; margin: 20px 0 10px; font-size: 24px; font-weight: 700;">إعادة تعيين كلمة المرور</h1>
                        <p style="color: #ffffff; margin: 0; font-size: 16px;">أمانك هو أولويتنا</p>
                      </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px; text-align: right; direction: rtl;">
                        <h2 style="color: #132859; font-size: 20px; margin: 0 0 20px; font-weight: 600; text-align: right;">مرحباً ${user.name}</h2>
                        <p style="color: #5f6368; font-size: 16px; line-height: 1.6; margin: 0 0 30px; text-align: right;">
                          تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في عرب نوشن
                        </p>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${resetUrl}" style="display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            إعادة تعيين كلمة المرور
                          </a>
                        </div>
                        
                        <!-- Alternative Link -->
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
                          <p style="color: #5f6368; font-size: 14px; margin: 0 0 10px; font-weight: 500; text-align: right;">أو انسخ هذا الرابط:</p>
                          <p style="color: #f5631e; font-size: 13px; word-break: break-all; margin: 0; font-family: monospace; text-align: left; direction: ltr;">${resetUrl}</p>
                        </div>
                        
                        <!-- Warning -->
                        <div style="background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
                          <p style="color: #856404; font-size: 14px; margin: 0; font-weight: 500; text-align: right;">
                            ملاحظة مهمة: هذا الرابط صالح لمدة ساعة واحدة فقط
                          </p>
                        </div>
                        
                        <!-- Security Note -->
                        <p style="color: #9aa0a6; font-size: 14px; text-align: center; margin: 20px 0 0;">
                          إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px; background-color: #132859; text-align: center; border-radius: 0 0 12px 12px;">
                        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 10px; font-weight: 700;">عرب نوشن</h3>
                        <p style="color: #9aa0a6; font-size: 14px; margin: 0 0 15px;">منصة القوالب العربية</p>
                        <a href="https://www.notionarabs.com" style="color: #f5631e; text-decoration: none; font-weight: 600;">www.notionarabs.com</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `مرحباً ${user.name},\n\nتلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.\n\nلإعادة تعيين كلمة المرور، زر الرابط:\n${resetUrl}\n\nهذا الرابط صالح لمدة ساعة واحدة.\n\nإذا لم تطلب هذا، تجاهل هذا البريد.\n\nعرب نوشن\nwww.notionarabs.com`
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
      // Check if user exists in database (might have been verified already)
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser && existingUser.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني مؤكد بالفعل. يمكنك تسجيل الدخول الآن',
          errorType: 'ALREADY_VERIFIED'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'رمز التأكيد غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد من صفحة تسجيل الدخول',
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
    let user;
    try {
      const userData = {
        name: tempUserData.name,
        email: tempUserData.email,
        password: tempUserData.password,
        isEmailVerified: true,
        isActive: true
      };

      // Only add username if it's provided
      if (tempUserData.username) {
        userData.username = tempUserData.username;
      }

      user = new User(userData);

      await user.save();
    } catch (userCreationError) {
      console.error('Error creating user:', userCreationError);
      throw userCreationError;
    }

    // Remove from temporary storage
    tempUserStorage.delete(verificationToken);

    // Create admin notification for new user registration
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: null, // Admin notifications don't have a specific user
        type: 'admin_user_registered',
        title: 'مستخدم جديد انضم للمنصة',
        message: `${user.name} (${user.email}) انضم للمنصة`,
        link: '/admin',
        metadata: {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          registrationDate: new Date()
        }
      });
    } catch (notifyErr) {
      console.error('Create admin notification error:', notifyErr);
    }

    // Generate token for automatic login
    try {
      const token = generateToken(user._id);
      res.json({
        success: true,
        message: 'تم تأكيد البريد الإلكتروني بنجاح. مرحباً بك في عرب نوشن!',
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          creatorStatus: user.creatorStatus,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive
        }
      });
    } catch (tokenError) {
      console.error('Error generating token:', tokenError);
      throw tokenError;
    }
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
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('portfolio')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty values
      // Basic URL validation - just check if it starts with http/https
      return value.startsWith('http://') || value.startsWith('https://');
    })
    .withMessage('رابط المعرض غير صحيح'),
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

    const { name, portfolio, experience, specialties, motivation, phone, socialMedia, availability, expectedEarnings } = req.body;

    // Check if user already has a pending or approved creator status
    if (req.user.creatorStatus !== 'none') {
      return res.status(400).json({
        success: false,
        message: 'لديك طلب مبدع موجود بالفعل'
      });
    }

    // Check if user wants to change their name
    const updateData = {
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
    };

    // If name is provided and different from current name, store it as requested name
    if (name && name.trim() !== req.user.name) {
      updateData.requestedName = name.trim();
    }

    // Update user with creator application data
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Create admin notification for new creator application
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: null, // Admin notifications don't have a specific user
        type: 'admin_creator_application',
        title: 'طلب انضمام مبدع جديد',
        message: `${user.name} (${user.email}) قدم طلب انضمام كمبدع`,
        link: '/admin/creator-applications',
        metadata: {
          applicantId: user._id,
          applicantName: user.name,
          applicantEmail: user.email,
          applicationDate: new Date()
        }
      });
    } catch (notifyErr) {
      console.error('Create admin notification error:', notifyErr);
    }

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

    // Variables to store token and user data
    let emailVerificationToken;
    let userName;

    // Check if user exists in database first
    const user = await User.findOne({ email });
    if (user) {
      // Check if already verified
      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني مؤكد بالفعل'
        });
      }

      // Generate new verification token for existing user
      emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationExpiry = emailVerificationExpiry;
      await user.save();

      userName = user.name;
    } else {
      // Check if user exists in temporary storage
      let tempUserData = null;
      for (const [token, data] of tempUserStorage.entries()) {
        if (data.email === email) {
          tempUserData = data;
          // Remove old token
          tempUserStorage.delete(token);
          break;
        }
      }

      if (!tempUserData) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني غير مسجل أو انتهت صلاحية رابط التأكيد. يرجى التسجيل مرة أخرى'
        });
      }

      // Generate new verification token for temp user
      emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update temp user data with new token
      tempUserData.emailVerificationToken = emailVerificationToken;
      tempUserData.emailVerificationExpiry = emailVerificationExpiry;
      tempUserStorage.set(emailVerificationToken, tempUserData);

      userName = tempUserData.name;
    }

    // Send verification email
    try {
      const transporter = createTransporter();
      const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';
      const verificationUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM || `"عرب نوشن" <support@notionarabs.com>`,
        to: email,
        subject: 'تأكيد البريد الإلكتروني - Verify Email | عرب نوشن',
        html: `
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تأكيد البريد الإلكتروني - عرب نوشن</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Tajawal', sans-serif; background-color: #f8f9fa;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px; text-align: center; background-color: #f5631e; border-radius: 12px 12px 0 0;">
                        <img src="https://www.notionarabs.com/apple-touch-icon.png" alt="عرب نوشن" style="height: 60px; width: auto;" />
                        <h1 style="color: #ffffff; margin: 20px 0 10px; font-size: 24px; font-weight: 700;">تأكيد البريد الإلكتروني</h1>
                        <p style="color: #ffffff; margin: 0; font-size: 16px;">رابط جديد لتأكيد حسابك</p>
                      </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px; text-align: right; direction: rtl;">
                        <h2 style="color: #132859; font-size: 20px; margin: 0 0 20px; font-weight: 600; text-align: right;">مرحباً ${userName}</h2>
                        <p style="color: #5f6368; font-size: 16px; line-height: 1.6; margin: 0 0 30px; text-align: right;">
                          لقد طلبت إعادة إرسال رابط تأكيد البريد الإلكتروني لحسابك في عرب نوشن
                        </p>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${verificationUrl}" style="display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            تأكيد البريد الإلكتروني
                          </a>
                        </div>
                        
                        <!-- Alternative Link -->
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
                          <p style="color: #5f6368; font-size: 14px; margin: 0 0 10px; font-weight: 500; text-align: right;">أو انسخ هذا الرابط:</p>
                          <p style="color: #f5631e; font-size: 13px; word-break: break-all; margin: 0; font-family: monospace; text-align: left; direction: ltr;">${verificationUrl}</p>
                        </div>
                        
                        <!-- Info -->
                        <div style="background-color: #fef7f0; border-right: 4px solid #f5631e; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
                          <p style="color: #132859; font-size: 14px; margin: 0; font-weight: 500; text-align: right;">
                            ملاحظة مهمة: هذا الرابط صالح لمدة 24 ساعة فقط
                          </p>
                        </div>
                        
                        <!-- Security Note -->
                        <p style="color: #9aa0a6; font-size: 14px; text-align: center; margin: 20px 0 0;">
                          إذا لم تطلب هذا الرابط، يرجى تجاهله
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px; background-color: #132859; text-align: center; border-radius: 0 0 12px 12px;">
                        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 10px; font-weight: 700;">عرب نوشن</h3>
                        <p style="color: #9aa0a6; font-size: 14px; margin: 0 0 15px;">منصة القوالب العربية</p>
                        <a href="https://www.notionarabs.com" style="color: #f5631e; text-decoration: none; font-weight: 600;">www.notionarabs.com</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `مرحباً ${userName},\n\nطلبت إعادة إرسال رابط تأكيد البريد.\n\nللتأكيد، زر:\n${verificationUrl}\n\nالرابط صالح 24 ساعة.\n\nعرب نوشن\nwww.notionarabs.com`
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
    const userId = req.user._id;
    const userEmail = req.user.email;
    const isGoogleUser = !!req.user.googleId;


    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      // Delete user's blogs
      await Blog.deleteMany({ author: userId }, { session });

      // Delete user's templates
      await Template.deleteMany({ creator: userId }, { session });

      // Delete user's profile
      const deletedUser = await User.findByIdAndDelete(userId, { session });
      if (!deletedUser) {
        throw new Error(`User with ID ${userId} not found for deletion`);
      }

      // Commit the transaction
      await session.commitTransaction();

      res.json({
        success: true,
        message: 'تم حذف حسابك وجميع البيانات المرتبطة به بنجاح. نأسف لرؤيتك تترك مجتمع عرب نوشن! 😢'
      });

    } catch (error) {
      // Rollback the transaction
      console.error(`Transaction error for user ${userId}:`, error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Delete account error:', error);
    console.error('Error details:', {
      userId: req.user?._id,
      userEmail: req.user?.email,
      isGoogleUser: !!req.user?.googleId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الحساب. يرجى المحاولة مرة أخرى'
    });
  }
});

// @route   GET /api/auth/verify-deletion/:userId
// @desc    Verify if user account was deleted (for debugging)
// @access  Public (for debugging purposes)
router.get('/verify-deletion/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    res.json({
      success: true,
      exists: !!user,
      userId: userId,
      message: user ? 'User still exists' : 'User successfully deleted'
    });
  } catch (error) {
    console.error('Verify deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user deletion status'
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
    const userId = req.user._id;

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
