const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Contact route is working',
    timestamp: new Date().toISOString()
  });
});

// @route   POST /api/contact/creator
// @desc    Send message to creator
// @access  Public
router.post('/creator', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('الموضوع يجب أن يكون بين 5 و 100 حرف'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('الرسالة يجب أن تكون بين 10 و 1000 حرف'),
  body('creatorId')
    .isMongoId()
    .withMessage('معرف المبدع غير صحيح')
], async (req, res) => {
  try {
    console.log('Contact creator route called with data:', {
      body: req.body,
      headers: req.headers
    });

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { name, email, subject, message, creatorId } = req.body;

    // Find creator
    const creator = await User.findById(creatorId);

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'المبدع غير موجود'
      });
    }

    // Check if creator allows messages
    if (creator.allowMessages === false) {
      return res.status(403).json({
        success: false,
        message: 'هذا المبدع لا يقبل الرسائل حالياً'
      });
    }

    // Log the message for testing
    console.log('=== MESSAGE TO CREATOR ===');
    console.log('Creator:', creator.displayName || creator.name, `(${creator.email})`);
    console.log('From:', name, `(${email})`);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('========================');

    // TODO: Implement email sending when email configuration is ready
    // For now, messages are logged to console for testing

    res.json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح للمبدع (اختبار - سيتم إرسالها عند تفعيل البريد الإلكتروني)'
    });

  } catch (error) {
    console.error('Contact creator error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/contact/general
// @desc    Send general contact message
// @access  Public
router.post('/general', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('الموضوع يجب أن يكون بين 5 و 100 حرف'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('الرسالة يجب أن تكون بين 10 و 1000 حرف')
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

    const { name, email, subject, message } = req.body;

    // Log the general contact message
    console.log('=== GENERAL CONTACT MESSAGE ===');
    console.log('From:', name, `(${email})`);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('================================');

    // TODO: Implement email sending when email configuration is ready
    // For now, messages are logged to console for testing

    res.json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح (اختبار - سيتم إرسالها عند تفعيل البريد الإلكتروني)'
    });

  } catch (error) {
    console.error('General contact error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;