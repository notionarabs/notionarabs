const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/unsubscribe
// @desc    Unsubscribe user from emails
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب'
      });
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني غير صحيح'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'البريد الإلكتروني غير مسجل في نظامنا'
      });
    }

    // Update user to unsubscribe from emails
    await User.findByIdAndUpdate(user._id, {
      $set: {
        emailNotifications: false,
        unsubscribeDate: new Date(),
        lastUpdated: new Date()
      }
    });

    console.log(`✅ User unsubscribed: ${email}`);

    res.json({
      success: true,
      message: 'تم إلغاء الاشتراك بنجاح'
    });

  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى'
    });
  }
});

// @route   GET /api/unsubscribe
// @desc    Show unsubscribe page with email parameter
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;

    if (email) {
      // Check if email exists and is subscribed
      const user = await User.findOne({ email: email.toLowerCase().trim() });

      if (user && user.emailNotifications) {
        return res.json({
          success: true,
          message: 'البريد الإلكتروني مسجل ومشترك',
          email: email,
          canUnsubscribe: true
        });
      } else if (user && !user.emailNotifications) {
        return res.json({
          success: false,
          message: 'هذا البريد الإلكتروني غير مشترك بالفعل',
          email: email,
          canUnsubscribe: false
        });
      } else {
        return res.json({
          success: false,
          message: 'البريد الإلكتروني غير مسجل في نظامنا',
          email: email,
          canUnsubscribe: false
        });
      }
    }

    res.json({
      success: true,
      message: 'صفحة إلغاء الاشتراك متاحة'
    });

  } catch (error) {
    console.error('❌ Unsubscribe check error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
});

module.exports = router;
