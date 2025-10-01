const express = require('express');
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/blogs
// @desc    Create a new blog post
// @access  Private (Creator)
router.post('/', auth, [
  body('title')
    .notEmpty()
    .withMessage('عنوان المقال مطلوب')
    .isLength({ max: 200 })
    .withMessage('عنوان المقال لا يجب أن يتجاوز 200 حرف'),
  body('excerpt')
    .notEmpty()
    .withMessage('ملخص المقال مطلوب')
    .isLength({ max: 500 })
    .withMessage('ملخص المقال لا يجب أن يتجاوز 500 حرف'),
  body('content')
    .notEmpty()
    .withMessage('محتوى المقال مطلوب')
    .isLength({ min: 100 })
    .withMessage('محتوى المقال يجب أن يكون 100 حرف على الأقل'),
  body('category')
    .isIn([
      'نصائح',
      'تصميم',
      'الدراسة',
      'الأعمال',
      'الإنتاجية',
      'التقنية',
      'المراجعات',
      'التعليم',
      'الأخبار',
      'عام'
    ])
    .withMessage('فئة المقال غير صحيحة'),
  body('tags')
    .optional()
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      return Array.isArray(value) ? value : [];
    })
    .isArray()
    .withMessage('العلامات يجب أن تكون مصفوفة'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('رابط الصورة غير صحيح'),
  body('status')
    .optional()
    .isIn(['draft', 'pending'])
    .withMessage('حالة المقال غير صحيحة')
], async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح لك بإنشاء مقالات'
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

    const { title, excerpt, content, category, tags, featuredImage, status = 'draft' } = req.body;

    // Check for duplicate title by same author
    const existingBlog = await Blog.findOne({
      author: req.user._id,
      title: title.trim()
    });

    if (existingBlog) {
      return res.status(409).json({
        success: false,
        message: 'يبدو أنك قمت بإنشاء مقال بنفس العنوان من قبل. يرجى اختيار عنوان مختلف.'
      });
    }

    // Force status to 'pending' for admin review (except for drafts)
    const finalStatus = status === 'draft' ? 'draft' : 'pending';

    // Create blog post
    const blog = new Blog({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: req.user._id,
      category,
      tags: tags || [],
      featuredImage: featuredImage || undefined,
      status: finalStatus
    });

    try {
      await blog.save();
    } catch (saveError) {
      // Handle duplicate slug error
      if (saveError.code === 11000 && saveError.keyPattern && saveError.keyPattern.slug) {
        // Generate a new slug with timestamp
        blog.slug = (blog.generateSlug() || 'blog') + '-' + Date.now();
        try {
          await blog.save();
        } catch (retryError) {
          throw retryError;
        }
      } else {
        throw saveError;
      }
    }

    // Populate author information
    await blog.populate('author', 'name profilePicture');

    const message = finalStatus === 'draft'
      ? 'تم حفظ المقال كمسودة بنجاح! يمكنك العودة لتعديله أو إرساله للمراجعة لاحقاً.'
      : 'تم إرسال المقال للمراجعة بنجاح! سيتم مراجعته من قبل الإدارة قريباً.';

    res.status(201).json({
      success: true,
      message,
      blog
    });

  } catch (error) {
    console.error('Create blog error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      user: req.user ? req.user._id : 'No user',
      body: req.body
    });
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/blogs
// @desc    Get all published blog posts with pagination and filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'publishedAt';
    const sortOrder = req.query.sortOrder || 'desc';

    // Build query
    const query = { status: 'published' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate('author', 'name profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      blogs,
      pagination: {
        current: page,
        pages,
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/blogs/featured
// @desc    Get featured blog posts
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    const blogs = await Blog.find({
      status: 'published',
      featured: true
    })
      .populate('author', 'name profilePicture')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      blogs
    });

  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/blogs/export
// @desc    Export blog data as CSV
// @access  Private (Admin or Author)
router.get('/export', auth, async (req, res) => {
  try {
    // Check if user is admin or requesting their own data
    const isAdmin = req.user.role === 'admin';
    const authorId = req.query.authorId;

    if (!isAdmin && authorId && authorId !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتصدير بيانات الآخرين'
      });
    }

    // Build query
    const query = {};
    if (!isAdmin && !authorId) {
      query.author = req.user._id; // User can only export their own blogs
    } else if (authorId) {
      query.author = authorId;
    }

    // Get blogs with author information
    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Convert to CSV format
    const csvHeader = 'العنوان,المؤلف,البريد الإلكتروني,الفئة,الحالة,المشاهدات,الإعجابات,تاريخ النشر,تاريخ الإنشاء\n';

    const csvRows = blogs.map(blog => {
      const title = `"${(blog.title || '').replace(/"/g, '""')}"`;
      const author = `"${(blog.author?.name || '').replace(/"/g, '""')}"`;
      const email = `"${(blog.author?.email || '').replace(/"/g, '""')}"`;
      const category = `"${(blog.category || '').replace(/"/g, '""')}"`;
      const status = `"${(blog.status || '').replace(/"/g, '""')}"`;
      const views = blog.views || 0;
      const likes = blog.likes || 0;
      const publishedAt = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US') : '';
      const createdAt = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US') : '';

      return `${title},${author},${email},${category},${status},${views},${likes},${publishedAt},${createdAt}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="blog-data-${new Date().toISOString().split('T')[0]}.csv"`);

    // Add BOM for proper UTF-8 encoding in Excel
    res.write('\uFEFF');
    res.end(csvContent);

  } catch (error) {
    console.error('Export blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تصدير البيانات'
    });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog post by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: 'published'
    }).populate('author', 'name profilePicture bio');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    // Increment views
    await blog.incrementViews();

    // Get related blogs (same category, excluding current blog)
    const relatedBlogs = await Blog.find({
      category: blog.category,
      status: 'published',
      _id: { $ne: blog._id }
    })
      .populate('author', 'name profilePicture')
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    res.json({
      success: true,
      blog,
      relatedBlogs
    });

  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/blogs/author/:authorId
// @desc    Get blog posts by specific author
// @access  Public
router.get('/author/:authorId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = {
      author: req.params.authorId,
      status: 'published'
    };

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate('author', 'name profilePicture')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      blogs,
      pagination: {
        current: page,
        pages,
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get author blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/blogs/user/my-blogs
// @desc    Get current user's blog posts
// @access  Private (Creator)
router.get('/user/my-blogs', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { author: req.user._id };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      blogs,
      pagination: {
        current: page,
        pages,
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get user blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/blogs/by-id/:id
// @desc    Get single blog post by ID (for editing)
// @access  Private (Author or Admin)
router.get('/by-id/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name profilePicture');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'المقال غير موجود' });
    }

    // Check if user is the author or admin
    if (blog.author._id.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بالوصول لهذا المقال' });
    }

    res.json({ success: true, blog });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog post
// @access  Private (Author or Admin)
router.put('/:id', auth, [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('عنوان المقال لا يجب أن يتجاوز 200 حرف'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('ملخص المقال لا يجب أن يتجاوز 500 حرف'),
  body('content')
    .optional()
    .isLength({ min: 100 })
    .withMessage('محتوى المقال يجب أن يكون 100 حرف على الأقل'),
  body('category')
    .optional()
    .isIn([
      'نصائح',
      'تصميم',
      'الدراسة',
      'الأعمال',
      'الإنتاجية',
      'التقنية',
      'المراجعات',
      'التعليم',
      'الأخبار',
      'عام'
    ])
    .withMessage('فئة المقال غير صحيحة'),
  body('tags')
    .optional()
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      return Array.isArray(value) ? value : [];
    })
    .isArray()
    .withMessage('العلامات يجب أن تكون مصفوفة'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('رابط الصورة غير صحيح'),
  body('status')
    .optional()
    .isIn(['draft', 'pending'])
    .withMessage('حالة المقال غير صحيحة')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل هذا المقال'
      });
    }

    // Update blog
    const updateData = { ...req.body };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name profilePicture');

    res.json({
      success: true,
      message: 'تم تحديث المقال بنجاح',
      blog: updatedBlog
    });

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog post
// @access  Private (Author or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف هذا المقال'
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف المقال بنجاح'
    });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;
