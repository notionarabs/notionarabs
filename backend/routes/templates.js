const express = require('express');
const { body, validationResult } = require('express-validator');
const Template = require('../models/Template');
const DownloadLog = require('../models/DownloadLog');
const User = require('../models/User');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { generateTemplateSlug } = require('../utils/slugGenerator');
const { cacheMiddleware, invalidateCache } = require('../utils/redis-cache');

const router = express.Router();

// Optimized pagination handler for templates without search
async function handleOptimizedPagination(req, res, options) {
  const { category, creator, isPinned, sortBy, sortOrder, page, limit, isPaid, minRating } = options;

  // Build filter object
  const filter = { status: 'approved' };

  if (category && category !== 'all') {
    filter.categories = category;
  }

  if (creator) {
    filter.creator = creator;
  }

  if (isPinned === 'true') {
    filter.isPinned = true;
  } else if (isPinned === 'false') {
    filter.isPinned = false;
  }

  if (isPaid === 'true') {
    filter.isPaid = true;
  } else if (isPaid === 'false') {
    filter.isPaid = false;
  }

  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Use aggregation for better performance with pagination
  const [templates, totalCount] = await Promise.all([
    Template.find(filter)
      .select('title description features category categories tags creator previewImage slug rating reviewsCount downloads views isPaid price purchaseLink isPinned pinnedAt pinnedBy ')
      .populate('creator', 'name username displayName profilePicture badges')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Template.countDocuments(filter)
  ]);

  res.json({
    success: true,
    templates,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(totalCount / parseInt(limit)),
      total: totalCount,
      limit: parseInt(limit)
    }
  });
}

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
  body('categories')
    .isIn([
      'الإنتاجية', 'الدراسة', 'الأعمال', 'الحياة الشخصية', 'الإبداع', 'التقنية', 'الصحة', 'المالية', 'التنظيم', 'التخطيط', 'ديني',
      'التسويق', 'التصميم', 'التطوير', 'التعليم', 'السفر', 'الطعام', 'الرياضة', 'الترفيه', 'الموضة', 'الجمال', 'المنزل',
      'الحديقة', 'الحيوانات الأليفة', 'السيارات', 'التكنولوجيا', 'البرمجة', 'قواعد البيانات', 'الأمان السيبراني', 'الذكاء الاصطناعي',
      'البلوك تشين', 'التجارة الإلكترونية', 'المبيعات', 'خدمة العملاء', 'الموارد البشرية', 'المحاسبة', 'الاستثمار', 'العقارات',
      'التأمين', 'القانون', 'الطب', 'التمريض', 'العلاج الطبيعي', 'التغذية', 'الطبخ', 'الحلويات', 'المشروبات', 'المطاعم',
      'الفنون', 'الموسيقى', 'الرسم', 'النحت', 'التصوير', 'الفيديو', 'الكتابة', 'الترجمة', 'اللغات', 'التاريخ', 'الجغرافيا',
      'العلوم', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'علم النفس', 'علم الاجتماع', 'الفلسفة', 'الأدب', 'الشعر',
      'المسرح', 'السينما', 'الألعاب', 'الرياضة الإلكترونية', 'السياحة', 'الفندقة', 'النقل', 'الطيران', 'البحرية', 'الزراعة',
      'البيئة', 'الطاقة', 'البناء', 'الهندسة', 'العمارة', 'الديكور', 'الأثاث', 'الأدوات', 'الأجهزة', 'البرامج', 'التطبيقات',
      'المواقع', 'التطوير الويب', 'تطوير التطبيقات', 'التعليم الإلكتروني', 'الاجتماعات', 'التواصل', 'الشبكات الاجتماعية', 'المحتوى',
      'الإعلان', 'العلاقات العامة', 'العلامة التجارية', 'الاستراتيجية', 'القيادة', 'الإدارة', 'المشاريع', 'العمليات', 'الجودة',
      'الابتكار', 'البحث والتطوير', 'التحليل', 'الإحصاء', 'البيانات', 'التقارير', 'العروض التقديمية', 'التدريب', 'التطوير المهني',
      'الاستشارات', 'الخدمات', 'المنتجات', 'التصنيع', 'التوزيع', 'المخازن', 'اللوجستيات'
    ])
    .withMessage('فئة القالب غير صحيحة'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('الفئات يجب أن تكون مصفوفة')
    .custom((categories) => {
      if (categories && categories.length > 3) {
        throw new Error('لا يمكن اختيار أكثر من 3 فئات');
      }
      const validCategories = [
        'الإنتاجية', 'الدراسة', 'الأعمال', 'الحياة الشخصية', 'الإبداع', 'التقنية', 'الصحة', 'المالية', 'التنظيم', 'التخطيط', 'ديني',
        'التسويق', 'التصميم', 'التطوير', 'التعليم', 'السفر', 'الطعام', 'الرياضة', 'الترفيه', 'الموضة', 'الجمال', 'المنزل',
        'الحديقة', 'الحيوانات الأليفة', 'السيارات', 'التكنولوجيا', 'البرمجة', 'قواعد البيانات', 'الأمان السيبراني', 'الذكاء الاصطناعي',
        'البلوك تشين', 'التجارة الإلكترونية', 'المبيعات', 'خدمة العملاء', 'الموارد البشرية', 'المحاسبة', 'الاستثمار', 'العقارات',
        'التأمين', 'القانون', 'الطب', 'التمريض', 'العلاج الطبيعي', 'التغذية', 'الطبخ', 'الحلويات', 'المشروبات', 'المطاعم',
        'الفنون', 'الموسيقى', 'الرسم', 'النحت', 'التصوير', 'الفيديو', 'الكتابة', 'الترجمة', 'اللغات', 'التاريخ', 'الجغرافيا',
        'العلوم', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'علم النفس', 'علم الاجتماع', 'الفلسفة', 'الأدب', 'الشعر',
        'المسرح', 'السينما', 'الألعاب', 'الرياضة الإلكترونية', 'السياحة', 'الفندقة', 'النقل', 'الطيران', 'البحرية', 'الزراعة',
        'البيئة', 'الطاقة', 'البناء', 'الهندسة', 'العمارة', 'الديكور', 'الأثاث', 'الأدوات', 'الأجهزة', 'البرامج', 'التطبيقات',
        'المواقع', 'التطوير الويب', 'تطوير التطبيقات', 'التعليم الإلكتروني', 'الاجتماعات', 'التواصل', 'الشبكات الاجتماعية', 'المحتوى',
        'الإعلان', 'العلاقات العامة', 'العلامة التجارية', 'الاستراتيجية', 'القيادة', 'الإدارة', 'المشاريع', 'العمليات', 'الجودة',
        'الابتكار', 'البحث والتطوير', 'التحليل', 'الإحصاء', 'البيانات', 'التقارير', 'العروض التقديمية', 'التدريب', 'التطوير المهني',
        'الاستشارات', 'الخدمات', 'المنتجات', 'التصنيع', 'التوزيع', 'المخازن', 'اللوجستيات'
      ];
      if (categories) {
        for (const category of categories) {
          if (!validCategories.includes(category)) {
            throw new Error(`فئة غير صحيحة: ${category}`);
          }
        }
      }
      return true;
    }),
  body('language')
    .optional()
    .isIn(['ar', 'en', 'fr', 'ar-en', 'ar-fr'])
    .withMessage('لغة القالب غير صحيحة'),
  body('isPaid')
    .optional()
    .isBoolean()
    .withMessage('قيمة isPaid يجب أن تكون صحيحة أو خاطئة'),
  body('price')
    .optional()
    .custom((value, { req }) => {
      // If isPaid is true, price must be provided and greater than 0
      if (req.body.isPaid === true || req.body.isPaid === 'true') {
        if (!value || value <= 0) {
          throw new Error('السعر مطلوب للقوالب المدفوعة ويجب أن يكون أكبر من 0');
        }
      }
      // If price is provided, it must be a valid number >= 0
      if (value !== undefined && value !== null && value !== '') {
        const numPrice = Number(value);
        if (isNaN(numPrice) || numPrice < 0) {
          throw new Error('السعر يجب أن يكون رقماً صحيحاً أكبر من أو يساوي 0');
        }
      }
      return true;
    }),
  body('purchaseLink')
    .optional()
    .custom((value, { req }) => {
      // If isPaid is true, purchaseLink must be provided
      if (req.body.isPaid === true || req.body.isPaid === 'true') {
        if (!value || value.trim() === '') {
          throw new Error('رابط الشراء مطلوب للقوالب المدفوعة');
        }
      }
      // If purchaseLink is provided, it must be a valid URL
      if (value && value.trim() !== '') {
        if (!/^https?:\/\/.+/.test(value)) {
          throw new Error('رابط الشراء غير صحيح');
        }
      }
      return true;
    }),
  body('notionLink')
    .isURL()
    .withMessage('رابط نوشن غير صحيح'),
  body('previewImage')
    .optional()
    .custom((value) => {
      if (!value) return true; // No auto-screenshot fallback anymore

      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
        return true;
      } catch (error) {
        throw new Error('رابط الصورة غير صحيح');
      }
    }),
  body('previewImages')
    .optional()
    .isArray()
    .withMessage('صور المعاينة يجب أن تكون مصفوفة')
    .custom((value) => {
      if (!Array.isArray(value)) return true; // Let isArray handle this

      // Validate each image URL in the array
      for (const imageUrl of value) {
        if (typeof imageUrl !== 'string') {
          throw new Error('كل رابط صورة يجب أن يكون نص');
        }

        try {
          const url = new URL(imageUrl);
          if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Invalid protocol');
          }
        } catch (error) {
          throw new Error('رابط صورة غير صحيح: ' + imageUrl);
        }
      }
      return true;
    }),
  body('explanationVideo')
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field

      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
        return true;
      } catch (error) {
        throw new Error('رابط الفيديو غير صحيح');
      }
    })
], async (req, res) => {
  console.log('>>> POST /api/templates entry');
  console.log('User:', req.user?._id);
  try {
    // Check if user is an approved creator
    if (req.user.creatorStatus !== 'approved' || req.user.role !== 'creator') {
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

    // No automatic screenshot capture; require explicit preview image if needed
    let previewImageUrl = req.body.previewImage;

    // Generate unique slug for the template
    const slugExists = async (slug, excludeId = null) => {
      const query = { slug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const existingTemplate = await Template.findOne(query);
      return !!existingTemplate;
    };

    const slug = await generateTemplateSlug(req.body.title, slugExists);

    // Check if auto-approve is enabled
    const { shouldAutoApproveTemplates } = require('../middleware/settings');
    const autoApprove = await shouldAutoApproveTemplates();

    const templateData = {
      ...req.body,
      creator: req.user._id,
      status: autoApprove ? 'approved' : 'pending',
      previewImage: previewImageUrl,
      slug
    };

    const template = new Template(templateData);
    await template.save();

    // Invalidate templates cache
    await invalidateCache('template');

    // Create admin notification for new template submission (only if not auto-approved)
    if (!autoApprove) {
      try {
        const priceInfo = template.isPaid ? ` (مدفوع - ${template.price} ج.م)` : ' (مجاني)';
        await Notification.create({
          user: null, // Admin notifications don't have a specific user
          type: 'admin_template_pending',
          title: 'قالب جديد يحتاج مراجعة',
          message: `${req.user.name} قدم قالبًا جديدًا: ${template.title}${priceInfo}`,
          link: '/admin/templates',
          metadata: {
            templateId: template._id,
            templateTitle: template.title,
            isPaid: template.isPaid || false,
            price: template.price || null,
            creatorId: req.user._id,
            creatorName: req.user.name,
            creatorEmail: req.user.email,
            submissionDate: new Date()
          }
        });
      } catch (notifyErr) {
        console.error('Create admin notification error:', notifyErr);
      }
    }

    // Populate creator information
    await template.populate('creator', 'name username displayName email profilePicture');

    const response = {
      success: true,
      message: 'تم إرسال القالب بنجاح. سيتم مراجعته من قبل الإدارة قريباً.',
      template
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/templates/bulk-import
// @desc    Bulk import templates
// @access  Private (Creator)
router.post('/bulk-import', auth, async (req, res) => {
  try {
    // Check if user is an approved creator
    if (req.user.creatorStatus !== 'approved' || req.user.role !== 'creator') {
      return res.status(403).json({
        success: false,
        message: 'يجب أن تكون مبدعاً معتمداً لإنشاء قوالب'
      });
    }

    const { templates } = req.body;

    if (!templates || !Array.isArray(templates) || templates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب توفير مصفوفة من القوالب'
      });
    }

    if (templates.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن استيراد أكثر من 50 قالب في المرة الواحدة'
      });
    }

    const results = {
      success: [],
      errors: []
    };

    const { shouldAutoApproveTemplates } = require('../middleware/settings');
    const autoApprove = await shouldAutoApproveTemplates();

    for (const item of templates) {
      try {
        // Basic validation
        if (!item.title || !item.notionLink) {
          results.errors.push({ title: item.title || 'Unknown', error: 'العنوان ورابط نوشن مطلوبان' });
          continue;
        }

        // Generate unique slug first to check for collisions
        const slugExists = async (slug, excludeId = null) => {
          const query = { slug };
          if (excludeId) query._id = { $ne: excludeId };
          const existing = await Template.findOne(query);
          return !!existing;
        };
        const slug = await generateTemplateSlug(item.title, slugExists);

        // Robust duplicate check (Case-insensitive title and notionLink)
        const existingTemplate = await Template.findOne({
          creator: req.user._id,
          $or: [
            { title: { $regex: `^${item.title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
            { notionLink: item.notionLink.trim() },
            { slug: slug }
          ]
        });

        if (existingTemplate) {
          let errorMsg = 'القالب موجود بالفعل';
          if (existingTemplate.slug === slug) errorMsg = 'عنوان القالب مستخدم بالفعل (Slug collision)';
          else if (existingTemplate.notionLink === item.notionLink.trim()) errorMsg = 'رابط نوشن هذا مستخدم في قالب آخر';
          
          results.errors.push({ 
            title: item.title, 
            error: errorMsg
          });
          continue;
        }

        // Process categories
        let categories = item.categories;
        if (typeof categories === 'string') {
          categories = categories.split(',').map(c => c.trim()).filter(c => c);
        }
        if (!Array.isArray(categories)) categories = [];
        
        // Limit to 3 categories as per validation rules in POST /
        categories = categories.slice(0, 3);

        const templateData = {
          ...item,
          categories,
          creator: req.user._id,
          status: autoApprove ? 'approved' : 'pending',
          slug,
          isPaid: item.isPaid === true || item.isPaid === 'true',
          price: Number(item.price) || 0
        };

        const template = new Template(templateData);
        await template.save();
        results.success.push({ title: item.title, id: template._id, slug: template.slug });
      } catch (err) {
        console.error('Error importing item:', item.title, err);
        results.errors.push({ title: item.title, error: err.message || 'خطأ أثناء الحفظ' });
      }
    }

    // Invalidate templates cache if any were successful
    if (results.success.length > 0) {
      await invalidateCache('template');
      
      // Create admin notification if not auto-approved
      if (!autoApprove) {
        try {
          await Notification.create({
            user: null,
            type: 'admin_template_pending',
            title: 'قوالب مستوردة جديدة تحتاج مراجعة',
            message: `${req.user.name} قام باستيراد ${results.success.length} قوالب جديدة`,
            link: '/admin/templates',
            metadata: {
              creatorId: req.user._id,
              creatorName: req.user.name,
              count: results.success.length,
              submissionDate: new Date()
            }
          });
        } catch (notifyErr) {
          console.error('Create admin notification error:', notifyErr);
        }
      }
    }

    res.json({
      success: true,
      message: `تم استيراد ${results.success.length} قوالب بنجاح، وحدث خطأ في ${results.errors.length}`,
      results
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/templates
// @desc    Get all approved templates with optimized server-side pagination
// @access  Public
router.get('/', cacheMiddleware(300), async (req, res) => {
  try {
    const {
      category,
      search,
      creator,
      isPinned,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      isPaid,
      minRating
    } = req.query;

    // If no search term, use optimized server-side pagination
    if (!search || !search.trim()) {
      return await handleOptimizedPagination(req, res, {
        category,
        creator,
        isPinned,
        sortBy,
        sortOrder,
        page,
        limit,
        isPaid,
        minRating
      });
    }

    // Build filter object
    const filter = { status: 'approved' };

    if (category && category !== 'all') {
      filter.categories = category;
    }

    if (creator) {
      filter.creator = creator;
    }

    if (isPaid === 'true') {
      filter.isPaid = true;
    } else if (isPaid === 'false') {
      filter.isPaid = false;
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    // If search is provided, use server-side text search
    if (search && search.trim()) {
      try {
        const regexQuery = {
          ...filter,
          $or: [
            { title: { $regex: search.trim() } },
            { description: { $regex: search.trim() } },
            { tags: search.trim() },
            { categories: search.trim() }
          ]
        };

        const sort = {
          [sortBy]: sortOrder === 'desc' ? -1 : 1
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [templates, totalCount] = await Promise.all([
          Template.find(regexQuery)
            .select('title description features category categories tags creator previewImage slug rating reviewsCount downloads views isPaid price purchaseLink isPinned pinnedAt pinnedBy ')
            .populate('creator', 'name username displayName profilePicture badges')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
          Template.countDocuments(regexQuery)
        ]);

        return res.json({
          success: true,
          templates,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(totalCount / parseInt(limit)),
            total: totalCount,
            limit: parseInt(limit)
          }
        });
      } catch (searchError) {
        console.error('Search failed:', searchError.message);
        throw searchError;
      }
    }

    // This code is now handled by handleOptimizedPagination function above
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
    if (req.user.creatorStatus !== 'approved' || req.user.role !== 'creator') {
      return res.status(403).json({
        success: false,
        message: 'يجب أن تكون مبدعاً معتمداً'
      });
    }

    const templates = await Template.find({ creator: req.user._id })
      .select('title description features category categories tags previewImage slug rating reviewsCount downloads views isPaid price purchaseLink status adminNotes approvedAt rejectedAt approvedBy rejectedBy createdAt updatedAt ')
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
router.get('/creator/:creatorId', cacheMiddleware(600), async (req, res) => {
  try {
    const { status = 'approved' } = req.query;

    const filter = { creator: req.params.creatorId };
    if (status !== 'all') {
      filter.status = status;
    }

    const templates = await Template.find(filter)
      .populate('creator', 'name username displayName profilePicture badges')
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

// Place export routes BEFORE the wildcard '/:identifier' to avoid route conflicts
// @route   GET /api/templates/export
// @desc    Export template data as CSV
// @access  Private (Admin or Creator)
router.get('/export', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    const creatorId = req.query.creatorId;

    if (!isAdmin && creatorId && creatorId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بتصدير بيانات الآخرين' });
    }

    const query = {};
    if (!isAdmin && !creatorId) {
      query.creator = req.user._id;
    } else if (creatorId) {
      query.creator = creatorId;
    }

    const templates = await Template.find(query)
      .populate('creator', 'name username displayName email badges')
      .sort({ createdAt: -1 })
      .lean();

    const csvHeader = 'العنوان,المنشئ,البريد الإلكتروني,الفئة,السعر,الحالة,المشاهدات,التحميلات,التقييم,تاريخ الموافقة,تاريخ الإنشاء\n';
    const csvRows = templates.map(template => {
      const title = `"${(template.title || '').replace(/\"/g, '\"\"')}"`;
      const creator = `"${(template.creator?.name || '').replace(/\"/g, '\"\"')}"`;
      const email = `"${(template.creator?.email || '').replace(/\"/g, '\"\"')}"`;
      const category = `"${(template.category || '').replace(/\"/g, '\"\"')}"`;
      const price = 'مجاني';
      const status = `"${(template.status || '').replace(/\"/g, '\"\"')}"`;
      const views = template.views || 0;
      const downloads = template.downloads || 0;
      const rating = template.rating || 0;
      const approvedAt = template.approvedAt ? new Date(template.approvedAt).toLocaleDateString('en-US') : '';
      const createdAt = template.createdAt ? new Date(template.createdAt).toLocaleDateString('en-US') : '';
      return `${title},${creator},${email},${category},${price},${status},${views},${downloads},${rating},${approvedAt},${createdAt}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="template-data-${new Date().toISOString().split('T')[0]}.csv"`);
    res.write('\uFEFF');
    res.end(csvContent);
  } catch (error) {
    console.error('Export templates error:', error);
    res.status(500).json({ success: false, message: 'خطأ في تصدير البيانات' });
  }
});

// @route   GET /api/templates/export-public
// @desc    Export templates as CSV using token in query (direct download)
// @access  Public (valid token required)
router.get('/export-public', async (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const { token, creatorId } = req.query;
    if (!token) {
      return res.status(401).json({ success: false, message: 'مصادقة مطلوبة' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (e) {
      return res.status(401).json({ success: false, message: 'رمز غير صالح' });
    }

    const requesterId = decoded.id || decoded.userId || decoded._id;
    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'رمز غير صالح' });
    }

    const query = {};
    if (!creatorId) {
      query.creator = requesterId;
    } else {
      if (creatorId !== requesterId) {
        return res.status(403).json({ success: false, message: 'غير مصرح لك بتصدير بيانات الآخرين' });
      }
      query.creator = creatorId;
    }

    const templates = await Template.find(query)
      .populate('creator', 'name username displayName email badges')
      .sort({ createdAt: -1 })
      .lean();

    const csvHeader = 'العنوان,المنشئ,البريد الإلكتروني,الفئة,السعر,الحالة,المشاهدات,التحميلات,التقييم,تاريخ الموافقة,تاريخ الإنشاء\n';
    const csvRows = templates.map(template => {
      const title = `"${(template.title || '').replace(/\"/g, '\"\"')}"`;
      const creator = `"${(template.creator?.name || '').replace(/\"/g, '\"\"')}"`;
      const email = `"${(template.creator?.email || '').replace(/\"/g, '\"\"')}"`;
      const category = `"${(template.category || '').replace(/\"/g, '\"\"')}"`;
      const price = 'مجاني';
      const status = `"${(template.status || '').replace(/\"/g, '\"\"')}"`;
      const views = template.views || 0;
      const downloads = template.downloads || 0;
      const rating = template.rating || 0;
      const approvedAt = template.approvedAt ? new Date(template.approvedAt).toLocaleDateString('en-US') : '';
      const createdAt = template.createdAt ? new Date(template.createdAt).toLocaleDateString('en-US') : '';
      return `${title},${creator},${email},${category},${price},${status},${views},${downloads},${rating},${approvedAt},${createdAt}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const authorDoc = await User.findById(requesterId).select('username email');
    const baseName = authorDoc?.username || (authorDoc?.email ? authorDoc.email.split('@')[0] : 'templates');
    const filename = `${baseName}-templates-${new Date().toISOString().split('T')[0]}.csv`;
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(`\uFEFF${csvContent}`);
  } catch (error) {
    console.error('Export templates public error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'خطأ في تصدير البيانات' });
    }
  }
});
// @route   GET /api/templates/similar/:id
// @desc    Get similar templates based on content similarity
// @access  Public
router.get('/similar/:id', cacheMiddleware(600), async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;

    // Find the current template - try multiple approaches
    let currentTemplate = await Template.findOne({
      $or: [{ _id: id }, { slug: id }],
      status: 'approved'
    });

    // If not found, try with trimmed slug
    if (!currentTemplate) {
      currentTemplate = await Template.findOne({
        $or: [{ _id: id }, { slug: id.trim() }],
        status: 'approved'
      });
    }

    // If still not found, try without status filter
    if (!currentTemplate) {
      currentTemplate = await Template.findOne({
        $or: [{ _id: id }, { slug: id }]
      });
    }

    if (!currentTemplate) {
      // If template exists but not approved, return empty array instead of error
      return res.json({
        success: true,
        templates: []
      });
    }

    // Get all approved templates except the current one with limit for performance
    // Optimize: Use lean() and selective field projection for better performance
    const selectFields = 'title description category categories tags creator previewImage slug rating reviewsCount downloads isPaid price';
    const allTemplates = await Template.find({
      status: 'approved',
      _id: { $ne: currentTemplate._id }
    })
      .select(selectFields)
      .populate('creator', 'name username displayName profilePicture badges')
      .lean()
      .limit(100); // Limit to prevent performance issues

    if (allTemplates.length === 0) {
      return res.json({
        success: true,
        templates: []
      });
    }

    // Simple similarity matching without complex Fuse.js configuration
    let similarTemplates = [];

    try {
      // First, try to find templates with matching tags
      if (currentTemplate.tags && currentTemplate.tags.length > 0) {
        const tagMatches = allTemplates.filter(template => {
          return template.tags && template.tags.some(tag =>
            currentTemplate.tags.some(currentTag =>
              currentTag.toLowerCase().includes(tag.toLowerCase()) ||
              tag.toLowerCase().includes(currentTag.toLowerCase())
            )
          );
        }).sort((a, b) => b.downloads - a.downloads);

        similarTemplates = tagMatches.slice(0, parseInt(limit));
      }

      // If not enough matches from tags, add templates from same category
      if (similarTemplates.length < parseInt(limit)) {
        const categoryTemplates = allTemplates
          .filter(t => t.category === currentTemplate.category)
          .sort((a, b) => b.downloads - a.downloads);

        const existingIds = new Set(similarTemplates.map(t => t._id.toString()));
        const additionalTemplates = categoryTemplates.filter(t => !existingIds.has(t._id.toString()));

        similarTemplates.push(...additionalTemplates.slice(0, parseInt(limit) - similarTemplates.length));
      }

      // If still not enough, add popular templates
      if (similarTemplates.length < parseInt(limit)) {
        const remainingTemplates = allTemplates
          .filter(t => !similarTemplates.some(st => st._id.toString() === t._id.toString()))
          .sort((a, b) => b.downloads - a.downloads)
          .slice(0, parseInt(limit) - similarTemplates.length);

        similarTemplates.push(...remainingTemplates);
      }
    } catch (similarityError) {
      console.error('Similarity matching error:', similarityError);
      // Fallback to category-based matching
      similarTemplates = allTemplates
        .filter(t => t.category === currentTemplate.category)
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      templates: similarTemplates
    });

  } catch (error) {
    console.error('Get similar templates error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/templates/:identifier
// @desc    Get single template by ID or slug
// @access  Public
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    // Optimize: Use lean() for better performance and selective field projection
    const selectFields = 'title description features category categories tags creator previewImage previewImages slug rating reviewsCount downloads isPaid price purchaseLink notionLink views createdAt updatedAt explanationVideo isPinned pinnedAt pinnedBy';

    // Try to find by slug first, then by ID
    let template = await Template.findOne({
      slug: identifier,
      status: 'approved'
    })
      .select(selectFields)
      .populate('creator', 'name username displayName profilePicture bio badges')
      .lean();

    // If not found by slug, try by ID (only if it's a valid ObjectId)
    const isValidOldId = /^[0-9a-fA-F]{24}$/.test(identifier);
    if (!template && isValidOldId) {
      template = await Template.findOne({
        _id: identifier,
        status: 'approved'
      })
        .select(selectFields)
        .populate('creator', 'name username displayName profilePicture bio badges')
        .lean();
    }

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'القالب غير موجود'
      });
    }

    // Increment views (non-blocking with lean document)
    Template.findByIdAndUpdate(template._id, { $inc: { views: 1 } })
      .exec()
      .catch(err => console.error('Failed to increment views:', err.message));

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Get template error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
  body('notionLink')
    .optional()
    .isURL()
    .withMessage('رابط نوشن غير صحيح'),
  body('isPaid')
    .optional()
    .isBoolean()
    .withMessage('قيمة isPaid يجب أن تكون صحيحة أو خاطئة'),
  body('price')
    .optional()
    .custom((value, { req }) => {
      // If isPaid is true, price must be provided and greater than 0
      if (req.body.isPaid === true || req.body.isPaid === 'true') {
        if (!value || value <= 0) {
          throw new Error('السعر مطلوب للقوالب المدفوعة ويجب أن يكون أكبر من 0');
        }
      }
      // If price is provided, it must be a valid number >= 0
      if (value !== undefined && value !== null && value !== '') {
        const numPrice = Number(value);
        if (isNaN(numPrice) || numPrice < 0) {
          throw new Error('السعر يجب أن يكون رقماً صحيحاً أكبر من أو يساوي 0');
        }
      }
      return true;
    }),
  body('purchaseLink')
    .optional()
    .custom((value, { req }) => {
      // If isPaid is true, purchaseLink must be provided
      if (req.body.isPaid === true || req.body.isPaid === 'true') {
        if (!value || value.trim() === '') {
          throw new Error('رابط الشراء مطلوب للقوالب المدفوعة');
        }
      }
      // If purchaseLink is provided, it must be a valid URL
      if (value && value.trim() !== '') {
        if (!/^https?:\/\/.+/.test(value)) {
          throw new Error('رابط الشراء غير صحيح');
        }
      }
      return true;
    }),
  body('explanationVideo')
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field

      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
        return true;
      } catch (error) {
        throw new Error('رابط الفيديو غير صحيح');
      }
    }),
  body('language')
    .optional()
    .isIn(['ar', 'en', 'fr', 'ar-en', 'ar-fr'])
    .withMessage('لغة القالب غير صحيحة')
], async (req, res) => {
  try {
    if (req.user.creatorStatus !== 'approved' || req.user.role !== 'creator') {
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

    // Store the previous status before making changes
    const previousStatus = template.status;

    // If template is approved or rejected, changing it will set it back to pending
    if (template.status === 'approved' || template.status === 'rejected') {
      // Save specific fields to previousData for later revert if needed
      const updateableFields = [
        'title', 'description', 'notionLink', 'isPaid', 'price', 'purchaseLink',
        'features', 'tags', 'previewImage', 'previewImages', 'explanationVideo',
        'categories', 'language'
      ];

      const prevData = {};
      updateableFields.forEach(field => {
        if (template[field] !== undefined) {
          prevData[field] = template[field];
        }
      });

      template.previousData = prevData;
      template.updatePending = true;
      template.status = 'pending';
      template.approvedAt = null;
      template.approvedBy = null;
      template.rejectedAt = null;
      template.rejectedBy = null;
      template.adminNotes = '';
    }

    Object.assign(template, req.body);
    await template.save();

    // Invalidate templates cache
    await invalidateCache('template', template._id);

    // Create admin notification for template edit (only if status was changed from approved/rejected)
    if (previousStatus === 'approved' || previousStatus === 'rejected') {
      try {
        await Notification.create({
          user: null, // Admin notifications don't have a specific user
          type: 'template_edited',
          title: 'تم تعديل قالب يحتاج مراجعة',
          message: `${req.user.name} قام بتعديل قالب: ${template.title} (تم إعادة تعيين الحالة من ${previousStatus === 'approved' ? 'موافق عليه' : 'مرفوض'} إلى قيد المراجعة)`,
          link: '/admin/templates',
          metadata: {
            templateId: template._id,
            templateTitle: template.title,
            creatorId: req.user._id,
            creatorName: req.user.name,
            creatorEmail: req.user.email,
            editDate: new Date(),
            previousStatus: previousStatus
          }
        });
      } catch (notifyErr) {
        console.error('Create admin edit notification error:', notifyErr);
      }
    }

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
    if (req.user.creatorStatus !== 'approved' || req.user.role !== 'creator') {
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

// @route   POST /api/templates/:id/download
// @desc    Track template download
// @access  Private
router.post('/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userAgent: bodyUA, referrer: bodyRef } = req.body || {};
    const userAgent = bodyUA || req.get('User-Agent');
    const referrer = bodyRef || req.get('Referrer');

    // Find the template
    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'القالب غير موجود'
      });
    }

    // Increment download count
    template.downloads = (template.downloads || 0) + 1;
    await template.save();

    // Persist a download log entry for creator analytics
    try {
      await DownloadLog.create({
        template: template._id,
        creator: template.creator,
        user: req.user._id,
        userEmailSnapshot: req.user.email || null,
        templateTitleSnapshot: template.title || null,
        userAgent: userAgent || null,
        referrer: referrer || null
      });
    } catch (logErr) {
      // Non-blocking: logging failure should not fail the request
      console.error('DownloadLog create error:', logErr?.message || logErr);
    }

    // Notify creator about download (non-blocking)
    try {
      if (template.creator && template.creator.toString() !== req.user._id.toString()) {
        const downloaderName = req.user.displayName || req.user.name || 'مستخدم';
        await Notification.create({
          user: template.creator,
          type: 'template_downloaded',
          title: 'تم تحميل قالبك',
          message: `${downloaderName} قام بتحميل قالبك: ${template.title}`,
          link: `/templates/${template.slug || template._id}`,
          metadata: { templateId: template._id, downloaderId: req.user._id, actorProfilePicture: req.user.profilePicture || '' }
        });
      }
    } catch (notifyErr) {
      console.error('Create download notification error:', notifyErr?.message || notifyErr);
    }

    // Create a free order record for the user so it appears in /purchases
    if (!template.isPaid || template.price === 0) {
      console.log(`[DEBUG] Attempting to create free order for template: ${template.title} (${template._id}) for user: ${req.user._id || req.user.id}`);
      try {
        // Robust check for existing order for this template by this user
        const supabase = require('../utils/supabase');
        const { data: existingItems } = await supabase
          .from('OrderItem')
          .select('orderId')
          .eq('templateId', template._id);
          
        let alreadyOwned = false;
        if (existingItems && existingItems.length > 0) {
           const orderIds = existingItems.map(i => i.orderId);
           const { data: userOrders } = await supabase
             .from('Order')
             .select('id')
             .in('id', orderIds)
             .eq('userId', req.user._id || req.user.id);
           
           if (userOrders && userOrders.length > 0) {
             console.log(`[DEBUG] User already owns template: ${template.title}`);
             alreadyOwned = true;
           }
        }

        if (!alreadyOwned) {
          const newOrder = await Order.create({
            user: req.user._id || req.user.id,
            items: [{
              templateId: template._id,
              name: template.title,
              price: 0
            }],
            total: 0,
            status: 'completed',
            paymentMethod: 'free',
            notes: 'تحميل مجاني'
          });
          console.log(`[DEBUG] Free order created successfully: ${newOrder._id || newOrder.id}`);
        }
      } catch (orderErr) {
        console.error('[DEBUG] Failed to create free order record:', orderErr);
      }
    }

    res.json({
      success: true,
      message: 'تم تسجيل التحميل بنجاح',
      downloadCount: template.downloads
    });

  } catch (error) {
    console.error('Download tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تسجيل التحميل'
    });
  }
});

module.exports = router;
