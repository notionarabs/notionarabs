const express = require('express');
const { body, validationResult } = require('express-validator');
const Template = require('../models/Template');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/templates
// @desc    Create a new template
// @access  Private (Creator)
router.post('/', auth, [
  body('title')
    .notEmpty()
    .withMessage('عنوان القالب مطلوب')
    .isLength({ max: 100 })
    .withMessage('عنوان القالب لا يجب أن يتجاوز 100 حرف'),
  body('description')
    .notEmpty()
    .withMessage('وصف القالب مطلوب')
    .isLength({ max: 1000 })
    .withMessage('وصف القالب لا يجب أن يتجاوز 1000 حرف'),
  body('category')
    .isIn([
      'الإنتاجية',
      'الدراسة',
      'الأعمال',
      'الحياة الشخصية',
      'الإبداع',
      'التقنية',
      'الصحة',
      'المالية',
      'التنظيم',
      'التخطيط'
    ])
    .withMessage('فئة القالب غير صحيحة'),
  body('price')
    .isNumeric()
    .withMessage('السعر يجب أن يكون رقماً')
    .isFloat({ min: 0 })
    .withMessage('السعر لا يمكن أن يكون سالباً'),
  body('notionLink')
    .isURL()
    .withMessage('رابط نوتيون غير صحيح'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('مستوى الصعوبة غير صحيح'),
  body('previewImage')
    .optional()
    .custom((value) => {
      // If no value provided, that's fine - screenshot will be captured automatically
      if (!value) return true;

      try {
        const url = new URL(value);
        // Allow http, https protocols
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
        return true;
      } catch (error) {
        throw new Error('رابط الصورة غير صحيح');
      }
    })
], async (req, res) => {
  try {
    // Check if user is an approved creator
    if (req.user.creatorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'يجب أن تكون مبدعاً معتمداً لإنشاء قوالب'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    // If no preview image provided, capture screenshot automatically
    let previewImageUrl = req.body.previewImage;
    let screenshotError = null;

    if (!previewImageUrl && req.body.notionLink) {
      try {
        const screenshotService = require('../services/screenshotService');
        const screenshotResult = await screenshotService.takeScreenshot(req.body.notionLink, req);

        if (screenshotResult.success) {
          previewImageUrl = screenshotResult.screenshotUrl;
        } else {
          screenshotError = screenshotResult.error;
        }
      } catch (error) {
        screenshotError = error.message;
        // Continue without screenshot - it's not required
      }
    }

    const templateData = {
      ...req.body,
      creator: req.user.id,
      status: 'pending',
      previewImage: previewImageUrl
    };

    const template = new Template(templateData);
    await template.save();

    // Populate creator information
    await template.populate('creator', 'name email profilePicture');

    const response = {
      success: true,
      message: 'تم إرسال القالب بنجاح. سيتم مراجعته من قبل الإدارة قريباً.',
      template
    };

    // Include screenshot status in response
    if (screenshotError) {
      response.screenshotStatus = {
        success: false,
        error: screenshotError,
        message: 'فشل في التقاط صورة المعاينة تلقائياً. يمكنك إضافة صورة يدوياً لاحقاً.'
      };
    } else if (previewImageUrl) {
      response.screenshotStatus = {
        success: true,
        message: 'تم التقاط صورة المعاينة بنجاح'
      };
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/templates
// @desc    Get all approved templates
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = { status: 'approved' };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const templates = await Template.find(filter)
      .populate('creator', 'name profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Template.countDocuments(filter);

    res.json({
      success: true,
      templates,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/templates/my-templates
// @desc    Get current user's templates
// @access  Private (Creator)
router.get('/my-templates', auth, async (req, res) => {
  try {
    if (req.user.creatorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'يجب أن تكون مبدعاً معتمداً'
      });
    }

    const templates = await Template.find({ creator: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get my templates error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/templates/creator/:creatorId
// @desc    Get templates by creator
// @access  Public
router.get('/creator/:creatorId', async (req, res) => {
  try {
    const { status = 'approved' } = req.query;

    const filter = { creator: req.params.creatorId };
    if (status !== 'all') {
      filter.status = status;
    }

    const templates = await Template.find(filter)
      .populate('creator', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get creator templates error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/templates/:id
// @desc    Get single template by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      status: 'approved'
    }).populate('creator', 'name profilePicture bio');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'القالب غير موجود'
      });
    }

    // Increment views
    await template.incrementViews();

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   PUT /api/templates/:id
// @desc    Update template
// @access  Private (Creator - own templates only)
router.put('/:id', auth, [
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('عنوان القالب لا يجب أن يتجاوز 100 حرف'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('وصف القالب لا يجب أن يتجاوز 1000 حرف'),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('السعر يجب أن يكون رقماً')
    .isFloat({ min: 0 })
    .withMessage('السعر لا يمكن أن يكون سالباً'),
  body('notionLink')
    .optional()
    .isURL()
    .withMessage('رابط نوتيون غير صحيح')
], async (req, res) => {
  try {
    if (req.user.creatorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'يجب أن تكون مبدعاً معتمداً'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const template = await Template.findOne({
      _id: req.params.id,
      creator: req.user.id
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'القالب غير موجود أو ليس لديك صلاحية لتعديله'
      });
    }

    // If template is approved, changing it will set it back to pending
    if (template.status === 'approved') {
      template.status = 'pending';
      template.approvedAt = null;
      template.approvedBy = null;
      template.adminNotes = '';
    }

    Object.assign(template, req.body);
    await template.save();

    res.json({
      success: true,
      message: 'تم تحديث القالب بنجاح',
      template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   DELETE /api/templates/:id
// @desc    Delete template
// @access  Private (Creator - own templates only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.creatorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'يجب أن تكون مبدعاً معتمداً'
      });
    }

    const template = await Template.findOne({
      _id: req.params.id,
      creator: req.user.id
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'القالب غير موجود أو ليس لديك صلاحية لحذفه'
      });
    }

    await Template.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف القالب بنجاح'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;
