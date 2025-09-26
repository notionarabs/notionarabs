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
    .withMessage('رابط نوشن غير صحيح'),
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

    // Check for duplicate templates by the same creator
    const existingTemplate = await Template.findOne({
      creator: req.user._id,
      $or: [
        { title: req.body.title.trim() },
        { notionLink: req.body.notionLink.trim() }
      ]
    });

    if (existingTemplate) {
      return res.status(409).json({
        success: false,
        message: 'يبدو أنك قمت بإرسال قالب مشابه من قبل. يرجى التأكد من أن العنوان ورابط نوشن مختلفان عن القوالب السابقة.',
        duplicateField: existingTemplate.title === req.body.title.trim() ? 'title' : 'notionLink'
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
          screenshotError = screenshotResult.userMessage || screenshotResult.error;
        }
      } catch (error) {
        screenshotError = error.message;
        // Continue without screenshot - it's not required
      }
    }

    const templateData = {
      ...req.body,
      creator: req.user._id,
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

    const templates = await Template.find({ creator: req.user._id })
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
    .withMessage('رابط نوشن غير صحيح')
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

// @route   GET /api/templates/export
// @desc    Export template data as CSV
// @access  Private (Admin or Creator)
router.get('/export', auth, async (req, res) => {
  try {
    // Check if user is admin or requesting their own data
    const isAdmin = req.user.role === 'admin';
    const creatorId = req.query.creatorId;

    if (!isAdmin && creatorId && creatorId !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتصدير بيانات الآخرين'
      });
    }

    // Build query
    const query = {};
    if (!isAdmin && !creatorId) {
      query.creator = req.user._id; // User can only export their own templates
    } else if (creatorId) {
      query.creator = creatorId;
    }

    // Get templates with creator information
    const templates = await Template.find(query)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Convert to CSV format
    const csvHeader = 'العنوان,المنشئ,البريد الإلكتروني,الفئة,السعر,الحالة,المشاهدات,التحميلات,المبيعات,التقييم,تاريخ الموافقة,تاريخ الإنشاء\n';

    const csvRows = templates.map(template => {
      const title = `"${(template.title || '').replace(/"/g, '""')}"`;
      const creator = `"${(template.creator?.name || '').replace(/"/g, '""')}"`;
      const email = `"${(template.creator?.email || '').replace(/"/g, '""')}"`;
      const category = `"${(template.category || '').replace(/"/g, '""')}"`;
      const price = template.price || 0;
      const status = `"${(template.status || '').replace(/"/g, '""')}"`;
      const views = template.views || 0;
      const downloads = template.downloads || 0;
      const sales = template.sales || 0;
      const rating = template.rating || 0;
      const approvedAt = template.approvedAt ? new Date(template.approvedAt).toLocaleDateString('ar-SA') : '';
      const createdAt = template.createdAt ? new Date(template.createdAt).toLocaleDateString('ar-SA') : '';

      return `${title},${creator},${email},${category},${price},${status},${views},${downloads},${sales},${rating},${approvedAt},${createdAt}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="template-data-${new Date().toISOString().split('T')[0]}.csv"`);

    // Add BOM for proper UTF-8 encoding in Excel
    res.write('\uFEFF');
    res.end(csvContent);

  } catch (error) {
    console.error('Export templates error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تصدير البيانات'
    });
  }
});

module.exports = router;
