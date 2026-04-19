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
    .matches(/^https:\/\/([a-zA-Z0-9-]+\.)?notion\.(so|site)/)
    .withMessage('يجب أن يكون الرابط من موقع نوشن (مثال: https://notion.so/your-page)')
], async (req, res) => {
  try {
    // Debug logs removed for production

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
    if (req.user.creatorStatus !== 'approved' || req.user.role !== 'creator') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذه الميزة. يجب أن تكون منشئ معتمد لاستخدام هذه الميزة.',
        userMessage: 'يجب أن تكون منشئ معتمد لاستخدام ميزة التقاط الصور التلقائية. يمكنك التقديم لتصبح منشئ معتمد من صفحة الملف الشخصي.',
        debug: {
          userId: req.user.id,
          creatorStatus: req.user.creatorStatus,
          required: 'approved'
        }
      });
    }

    const { url } = req.body;

    // Take screenshot
    const result = await screenshotService.takeScreenshot(url, req);

    if (result.success) {
      res.json({
        success: true,
        message: 'تم التقاط الصورة بنجاح',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.userMessage || result.error || 'فشل في التقاط الصورة',
        details: process.env.NODE_ENV === 'development' ? result.details : undefined
      });
    }

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

// @route   GET /api/screenshot/health
// @desc    Check screenshot service health
// @access  Public
router.get('/health', async (req, res) => {
  try {
    // Basic health check without launching browser
    const puppeteer = require('puppeteer');

    // Check if Puppeteer is available
    if (!puppeteer) {
      throw new Error('Puppeteer not available');
    }

    // Try a simple launch test with minimal options
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        timeout: 10000
      });
      await browser.close();
    } catch (launchError) {
      console.warn('Puppeteer launch test failed, but service is still available:', launchError.message);
    }

    res.json({
      success: true,
      message: 'Screenshot service is available',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      puppeteerAvailable: !!puppeteer,
      fallbackAvailable: !!process.env.SCREENSHOT_API_KEY
    });
  } catch (error) {
    console.error('Screenshot health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Screenshot service is not available',
      error: error.message,
      environment: process.env.NODE_ENV,
      fallbackAvailable: !!process.env.SCREENSHOT_API_KEY
    });
  }
});

// @route   GET /api/screenshot/cleanup
// @desc    Clean up old screenshots (admin only)
// @access  Private (Admin)
router.get('/cleanup', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role?.toLowerCase() !== 'admin') {
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
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التنظيف'
    });
  }
});

module.exports = router;
