const express = require('express');
const { body, validationResult } = require('express-validator');
const Template = require('../models/Template');
const DownloadLog = require('../models/DownloadLog');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { generateTemplateSlug } = require('../utils/slugGenerator');
const Fuse = require('fuse.js');

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
  // Price validation removed - all templates are free
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

    const templateData = {
      ...req.body,
      creator: req.user._id,
      status: 'pending',
      previewImage: previewImageUrl,
      slug
    };

    const template = new Template(templateData);
    await template.save();

    // Create admin notification for new template submission
    try {
      await Notification.create({
        user: null, // Admin notifications don't have a specific user
        type: 'admin_template_pending',
        title: 'قالب جديد يحتاج مراجعة',
        message: `${req.user.name} قدم قالبًا جديدًا: ${template.title}`,
        link: '/admin/templates',
        metadata: {
          templateId: template._id,
          templateTitle: template.title,
          creatorId: req.user._id,
          creatorName: req.user.name,
          creatorEmail: req.user.email,
          submissionDate: new Date()
        }
      });
    } catch (notifyErr) {
      console.error('Create admin notification error:', notifyErr);
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

// @route   GET /api/templates
// @desc    Get all approved templates
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      creator,
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

    if (creator) {
      filter.creator = creator;
    }

    // Get all templates first (for Fuse.js search)
    let templates = await Template.find(filter)
      .populate('creator', 'name username displayName profilePicture')
      .lean();

    // Apply Fuse.js search if search term is provided
    if (search && search.trim()) {
      const fuseOptions = {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'category', weight: 0.2 },
          { name: 'tags', weight: 0.1 },
          { name: 'creator.name', weight: 0.1 },
          { name: 'creator.username', weight: 0.1 },
          { name: 'creator.displayName', weight: 0.1 }
        ],
        threshold: 0.4, // Lower threshold for more strict matching
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2,
        // Support both Arabic and English
        ignoreLocation: true,
        findAllMatches: true,
        // Custom search function to handle both languages
        getFn: (obj, path) => {
          const value = Fuse.config.getFn(obj, path);
          if (typeof value === 'string') {
            // Normalize text for better matching
            return value.toLowerCase().trim();
          }
          return value;
        }
      };

      const fuse = new Fuse(templates, fuseOptions);
      const searchResults = fuse.search(search.trim().toLowerCase());

      // Extract the items from Fuse results
      templates = searchResults.map(result => result.item);
    }

    // Apply sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Sort the templates array
    templates.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = templates.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedTemplates = templates.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      templates: paginatedTemplates,
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
      .populate('creator', 'name username displayName profilePicture')
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
    const isAdmin = req.user.role === 'admin';
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
      .populate('creator', 'name username displayName email')
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
      .populate('creator', 'name username displayName email')
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
router.get('/similar/:id', async (req, res) => {
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

    // Get all approved templates except the current one
    const allTemplates = await Template.find({
      status: 'approved',
      _id: { $ne: currentTemplate._id }
    }).populate('creator', 'name username displayName profilePicture');

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

    // Try to find by slug first, then by ID
    let template = await Template.findOne({
      slug: identifier,
      status: 'approved'
    }).populate('creator', 'name username displayName profilePicture bio');

    // If not found by slug, try by ID
    if (!template) {
      template = await Template.findOne({
        _id: identifier,
        status: 'approved'
      }).populate('creator', 'name username displayName profilePicture bio');
    }

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
  body('notionLink')
    .optional()
    .isURL()
    .withMessage('رابط نوشن غير صحيح'),
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
      .populate('creator', 'name username displayName email')
      .sort({ createdAt: -1 })
      .lean();

    // Convert to CSV format
    const csvHeader = 'العنوان,المنشئ,البريد الإلكتروني,الفئة,السعر,الحالة,المشاهدات,التحميلات,المبيعات,التقييم,تاريخ الموافقة,تاريخ الإنشاء\n';

    const csvRows = templates.map(template => {
      const title = `"${(template.title || '').replace(/"/g, '""')}"`;
      const creator = `"${(template.creator?.name || '').replace(/"/g, '""')}"`;
      const email = `"${(template.creator?.email || '').replace(/"/g, '""')}"`;
      const category = `"${(template.category || '').replace(/"/g, '""')}"`;
      const price = 'مجاني'; // All templates are now free
      const status = `"${(template.status || '').replace(/"/g, '""')}"`;
      const views = template.views || 0;
      const downloads = template.downloads || 0;
      const sales = template.sales || 0;
      const rating = template.rating || 0;
      const approvedAt = template.approvedAt ? new Date(template.approvedAt).toLocaleDateString('en-US') : '';
      const createdAt = template.createdAt ? new Date(template.createdAt).toLocaleDateString('en-US') : '';

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

    const isAdmin = false; // public export is for self only
    const query = {};
    if (!isAdmin && !creatorId) {
      query.creator = requesterId;
    } else if (creatorId) {
      // Allow specifying creatorId only if matches requester
      if (creatorId !== requesterId) {
        return res.status(403).json({ success: false, message: 'غير مصرح لك بتصدير بيانات الآخرين' });
      }
      query.creator = creatorId;
    }

    const templates = await Template.find(query)
      .populate('creator', 'name username displayName email')
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

// @route   POST /api/templates/:id/download
// @desc    Track template download
// @access  Private
router.post('/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp, userAgent, referrer } = req.body;

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

    // Log download for analytics (optional)
    console.log(`Template downloaded: ${template.title} (${template._id})`, {
      timestamp,
      userAgent,
      referrer,
      downloadCount: template.downloads
    });

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
