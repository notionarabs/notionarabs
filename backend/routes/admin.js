const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Template = require('../models/Template');
const Notification = require('../models/Notification');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users with filtering and sorting (Admin only)
// @access  Private (Admin)
router.get('/users', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter object
    const filter = {};

    // Search filter (name or email)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role && role !== 'all') {
      filter.role = role;
    }

    // Status filter
    if (status && status !== 'all') {
      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(filter)
      .select('-password')
      .sort(sort);

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user by ID
// @access  Private (Admin)
router.get('/users/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get user statistics
// @access  Private (Admin)
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const totalUsers = await User.countDocuments();
    const googleUsers = await User.countDocuments({ googleId: { $exists: true } });
    const regularUsers = await User.countDocuments({ googleId: { $exists: false } });
    const activeUsers = await User.countDocuments({ isActive: true });

    // Additional stats used by frontend admin home
    const pendingApplications = await User.countDocuments({ creatorStatus: 'pending' });
    const totalTemplates = await Template.countDocuments();
    const pendingTemplates = await Template.countDocuments({ status: 'pending' });
    const totalBlogs = await Blog.countDocuments();
    const pendingBlogs = await Blog.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        googleUsers,
        regularUsers,
        activeUsers,
        googleUsersPercentage: totalUsers === 0 ? 0 : Math.round((googleUsers / totalUsers) * 100),
        pendingApplications,
        pendingTemplates,
        pendingBlogs,
        totalTemplates,
        totalBlogs
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/admin/creator-applications
// @desc    Get all creator applications
// @access  Private (Admin only)
router.get('/creator-applications', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const applications = await User.find({
      creatorStatus: { $in: ['pending', 'approved', 'rejected'] }
    }).select('-password').sort({ createdAt: -1 });

    // Format the data for better readability
    const formattedApplications = applications.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      creatorStatus: user.creatorStatus,
      appliedAt: user.createdAt,
      requestedName: user.requestedName,
      portfolio: user.portfolio,
      experience: user.experience,
      specialties: user.specialties,
      motivation: user.motivation,
      phone: user.phone,
      socialMedia: user.socialMedia,
      availability: user.availability,
      expectedEarnings: user.expectedEarnings,
      profilePicture: user.profilePicture
    }));

    res.json({
      success: true,
      applications: formattedApplications,
      stats: {
        total: applications.length,
        pending: applications.filter(app => app.creatorStatus === 'pending').length,
        approved: applications.filter(app => app.creatorStatus === 'approved').length,
        rejected: applications.filter(app => app.creatorStatus === 'rejected').length
      }
    });
  } catch (error) {
    console.error('Get creator applications error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   PUT /api/admin/creator-applications/:userId/status
// @desc    Update creator application status
// @access  Private (Admin only)
router.put('/creator-applications/:userId/status', auth, [
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('الحالة يجب أن تكون: pending, approved, أو rejected')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
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

    const { status } = req.body;
    const { userId } = req.params;

    // Get the user first to check for requested name change
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Prepare update data
    const updateData = { creatorStatus: status };

    // If approving and user has a requested name change, update the name
    if (status === 'approved' && userToUpdate.requestedName) {
      updateData.name = userToUpdate.requestedName;
      updateData.requestedName = null; // Clear the requested name after applying it
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    res.json({
      success: true,
      message: `تم تحديث حالة الطلب إلى ${status}`,
      user
    });
  } catch (error) {
    console.error('Update creator status error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/admin/templates
// @desc    Get all templates for admin review
// @access  Private (Admin only)
router.get('/templates', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const templates = await Template.find(filter)
      .populate('creator', 'name username displayName email profilePicture')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
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
    console.error('Get admin templates error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   PUT /api/admin/templates/:id/status
// @desc    Approve or reject template
// @access  Private (Admin only)
router.put('/templates/:id/status', auth, [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('الحالة يجب أن تكون: approved أو rejected'),
  body('adminNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('ملاحظات الإدارة لا يجب أن تتجاوز 500 حرف')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
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

    const { status, adminNotes = '' } = req.body;
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'القالب غير موجود'
      });
    }

    if (status === 'approved') {
      await template.approve(req.user._id, adminNotes);

      // Create notifications for followers of the creator
      try {
        const creatorId = template.creator;
        const followers = await User.find({ following: creatorId }).select('_id').lean();
        if (followers && followers.length > 0) {
          const creator = await User.findById(creatorId).select('name displayName');
          const notifications = followers.map(f => ({
            user: f._id,
            type: 'template_published',
            title: 'قالب جديد من مبدع تتابعه',
            message: `${creator?.displayName || creator?.name || 'مبدع'} نشر قالبًا جديدًا: ${template.title}`,
            link: `/templates/${template.slug || template._id}`,
            metadata: { templateId: template._id, creatorId }
          }));
          await Notification.insertMany(notifications);
        }
      } catch (notifyErr) {
        console.error('Notify followers error:', notifyErr);
      }
    } else {
      await template.reject(req.user._id, adminNotes);
    }

    await template.populate('creator', 'name username displayName email profilePicture');

    res.json({
      success: true,
      message: `تم ${status === 'approved' ? 'الموافقة على' : 'رفض'} القالب بنجاح`,
      template
    });
  } catch (error) {
    console.error('Update template status error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/admin/template-stats
// @desc    Get template statistics
// @access  Private (Admin only)
router.get('/template-stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const totalTemplates = await Template.countDocuments();
    const pendingTemplates = await Template.countDocuments({ status: 'pending' });
    const approvedTemplates = await Template.countDocuments({ status: 'approved' });
    const rejectedTemplates = await Template.countDocuments({ status: 'rejected' });

    const totalViews = await Template.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const totalDownloads = await Template.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);

    const totalSales = await Template.aggregate([
      { $group: { _id: null, total: { $sum: '$sales' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalTemplates,
        pendingTemplates,
        approvedTemplates,
        rejectedTemplates,
        totalViews: totalViews[0]?.total || 0,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalSales: totalSales[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get template stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/admin/blogs
// @desc    Get all blogs for admin review
// @access  Private (Admin only)
router.get('/blogs', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find(filter)
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      blogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   PUT /api/admin/blogs/:id/status
// @desc    Approve or reject blog post
// @access  Private (Admin only)
router.put('/blogs/:id/status', auth, [
  body('status')
    .isIn(['published', 'rejected'])
    .withMessage('الحالة يجب أن تكون: published أو rejected'),
  body('adminNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('ملاحظات الإدارة لا يجب أن تتجاوز 500 حرف')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
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

    const { status, adminNotes = '' } = req.body;
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    // Update blog status
    blog.status = status;
    if (status === 'published') {
      blog.publishedAt = Date.now();
    }
    if (adminNotes) {
      blog.adminNotes = adminNotes;
    }

    await blog.save();
    await blog.populate('author', 'name email profilePicture');

    res.json({
      success: true,
      message: `تم ${status === 'published' ? 'نشر' : 'رفض'} المقال بنجاح`,
      blog
    });
  } catch (error) {
    console.error('Update blog status error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/admin/blog-stats
// @desc    Get blog statistics
// @access  Private (Admin only)
router.get('/blog-stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const totalBlogs = await Blog.countDocuments();
    const pendingBlogs = await Blog.countDocuments({ status: 'pending' });
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    const rejectedBlogs = await Blog.countDocuments({ status: 'rejected' });
    const draftBlogs = await Blog.countDocuments({ status: 'draft' });

    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const totalLikes = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalBlogs,
        pendingBlogs,
        publishedBlogs,
        rejectedBlogs,
        draftBlogs,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get blog stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/admin/export/users
// @desc    Export user data as CSV (Admin only)
// @access  Private (Admin)
router.get('/export/users', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتصدير بيانات المستخدمين'
      });
    }

    // Get all users
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Convert to CSV format
    const csvHeader = 'الاسم,البريد الإلكتروني,الدور,حالة المنشئ,مفعل,مصور بالبريد,عدد القوالب,إجمالي الأرباح,إجمالي المبيعات,المتابعون,التقييم,تاريخ الإنشاء\n';

    const csvRows = users.map(user => {
      const name = `"${(user.name || '').replace(/"/g, '""')}"`;
      const email = `"${(user.email || '').replace(/"/g, '""')}"`;
      const role = `"${(user.role || '').replace(/"/g, '""')}"`;
      const creatorStatus = `"${(user.creatorStatus || '').replace(/"/g, '""')}"`;
      const isActive = user.isActive ? 'نعم' : 'لا';
      const isEmailVerified = user.isEmailVerified ? 'نعم' : 'لا';
      const templatesCount = user.templatesCount || 0;
      const totalEarnings = user.totalEarnings || 0;
      const totalSales = user.totalSales || 0;
      const followers = user.followers || 0;
      const rating = user.rating || 0;
      const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : '';

      return `${name},${email},${role},${creatorStatus},${isActive},${isEmailVerified},${templatesCount},${totalEarnings},${totalSales},${followers},${rating},${createdAt}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="users-data-${new Date().toISOString().split('T')[0]}.csv"`);

    // Add BOM for proper UTF-8 encoding in Excel
    res.write('\uFEFF');
    res.end(csvContent);

  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تصدير البيانات'
    });
  }
});

module.exports = router;

// Admin notifications placeholder routes (no persistence yet)
// @route   GET /api/admin/notifications
// @desc    Get admin notifications (placeholder returns empty list)
// @access  Private (Admin)
router.get('/notifications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Placeholder empty response structure expected by frontend
    res.json({
      success: true,
      notifications: [],
      unreadCount: 0
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @route   PUT /api/admin/notifications/:id/read
// @desc    Mark a notification as read (placeholder no-op)
// @access  Private (Admin)
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Placeholder success
    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @route   PUT /api/admin/notifications/read-all
// @desc    Mark all notifications as read (placeholder no-op)
// @access  Private (Admin)
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Placeholder success
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @route   POST /api/admin/fix-duplicate-usernames
// @desc    Fix duplicate username issues by removing null/undefined usernames
// @access  Private (Admin)
router.post('/fix-duplicate-usernames', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    console.log('Starting to fix duplicate username issues...');

    // Find all users with null or undefined usernames
    const usersWithNullUsernames = await User.find({
      $or: [
        { username: null },
        { username: undefined },
        { username: '' }
      ]
    });

    console.log(`Found ${usersWithNullUsernames.length} users with null/undefined usernames`);

    // Remove the username field entirely for these users
    let fixedCount = 0;
    for (let i = 0; i < usersWithNullUsernames.length; i++) {
      const user = usersWithNullUsernames[i];
      await User.updateOne(
        { _id: user._id },
        { $unset: { username: 1 } }
      );
      fixedCount++;
      console.log(`Fixed user ${i + 1}/${usersWithNullUsernames.length}: ${user.email}`);
    }

    console.log(`Successfully fixed ${fixedCount} duplicate username issues`);

    // Verify the fix
    const remainingNullUsernames = await User.find({
      $or: [
        { username: null },
        { username: undefined },
        { username: '' }
      ]
    });

    res.json({
      success: true,
      message: `تم إصلاح ${fixedCount} مشكلة في أسماء المستخدمين`,
      fixedCount,
      remainingIssues: remainingNullUsernames.length
    });

  } catch (error) {
    console.error('Fix duplicate usernames error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إصلاح أسماء المستخدمين',
      error: error.message
    });
  }
});