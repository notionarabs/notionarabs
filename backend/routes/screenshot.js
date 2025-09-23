const express = require('express');
const { body, validationResult } = require('express-validator');
const screenshotService = require('../services/screenshotService');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/screenshot
// @desc    Take a screenshot of a URL
// @access  Private (Creator)
router.post('/', auth, [
  body('url')
    .isURL()
    .withMessage('رابط غير صحيح')
    .matches(/^https:\/\/(www\.)?notion\.so\//)
    .withMessage('يجب أن يكون الرابط من موقع نوتيون')
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

    // Check if user is an approved creator
    if (req.user.creatorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذه الميزة'
      });
    }

    const { url } = req.body;

    // Take screenshot
    const result = await screenshotService.takeScreenshot(url, req);

    res.json({
      success: true,
      message: 'تم التقاط الصورة بنجاح',
      data: result
    });

  } catch (error) {
    console.error('Screenshot API error:', {
      message: error.message,
      stack: error.stack,
      url: req.body.url,
      userId: req.user?.id
    });

    // Determine appropriate status code and message
    let statusCode = 500;
    let message = 'حدث خطأ أثناء التقاط الصورة';

    if (error.message.includes('Browser closed unexpectedly')) {
      statusCode = 503;
      message = 'تعذر فتح المتصفح. يرجى المحاولة مرة أخرى';
    } else if (error.message.includes('Navigation timeout')) {
      statusCode = 408;
      message = 'استغرق تحميل الصفحة وقتاً طويلاً. يرجى التحقق من الرابط والمحاولة مرة أخرى';
    } else if (error.message.includes('Cannot reach the website')) {
      statusCode = 400;
      message = 'لا يمكن الوصول إلى الموقع. يرجى التحقق من الرابط';
    } else if (error.message.includes('Invalid URL')) {
      statusCode = 400;
      message = 'رابط غير صحيح';
    }

    res.status(statusCode).json({
      success: false,
      message: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/screenshot/cleanup
// @desc    Clean up old screenshots (admin only)
// @access  Private (Admin)
router.get('/cleanup', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذه الميزة'
      });
    }

    await screenshotService.cleanupOldScreenshots();

    res.json({
      success: true,
      message: 'تم تنظيف الصور القديمة بنجاح'
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التنظيف'
    });
  }
});

module.exports = router;
