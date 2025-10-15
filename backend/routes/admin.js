const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Template = require('../models/Template');
const Notification = require('../models/Notification');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const { invalidateCache } = require('../utils/redis-cache');

const router = express.Router();

// Email configuration - Brevo only
const createTransporter = () => {
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is not configured!');
    throw new Error('Email service is not configured. Please set BREVO_API_KEY.');
  }

  console.log('✅ Using Brevo for email service');

  return {
    sendMail: async (mailOptions) => {
      try {
        const fetch = require('node-fetch');
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
          },
          body: JSON.stringify({
            sender: {
              name: 'عرب نوشن',
              email: process.env.EMAIL_FROM || process.env.BREVO_FROM_EMAIL
            },
            to: [{ email: mailOptions.to }],
            subject: mailOptions.subject,
            htmlContent: mailOptions.html,
            textContent: mailOptions.text,
            headers: {
              'List-Unsubscribe': '<https://www.notionarabs.com/unsubscribe?email=' + encodeURIComponent(mailOptions.to) + '>',
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              'X-Mailer': 'NotionArabs Platform',
              'X-Priority': '3',
              'Precedence': 'bulk',
              'Reply-To': process.env.EMAIL_FROM || process.env.BREVO_FROM_EMAIL,
              'Return-Path': process.env.EMAIL_FROM || process.env.BREVO_FROM_EMAIL,
              'Message-ID': `<${Date.now()}-${Math.random().toString(36).substr(2, 9)}@notionarabs.com>`
            },
            tags: ['newsletter', 'notionarabs', 'arabic']
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Brevo error: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log('✅ Brevo email sent successfully:', result.messageId);
        return {
          messageId: result.messageId,
          response: 'Email sent via Brevo'
        };
      } catch (error) {
        console.error('❌ Brevo error:', error);
        throw error;
      }
    },
    verify: async () => {
      console.log('✅ Brevo API key is configured');
      return true;
    }
  };
};

// @route   GET /api/settings/public
// @desc    Get public settings (maintenance mode, etc.)
// @access  Public
router.get('/settings/public', async (req, res) => {
  try {
    console.log('Public settings route called');
    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();

    console.log('Settings retrieved:', settings);

    // Only return public settings
    res.json({
      success: true,
      settings: {
        maintenanceMode: settings.maintenanceMode,
        platformName: settings.platformName,
        platformDescription: settings.platformDescription,
        contactInfo: settings.contactInfo
      }
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// Simple public settings route
router.get('/public', async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();

    res.json({
      success: true,
      settings: {
        maintenanceMode: settings.maintenanceMode,
        platformName: settings.platformName,
        platformDescription: settings.platformDescription,
        contactInfo: settings.contactInfo
      }
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

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
      .select('-password -resetToken')
      .sort(sort);

    // Debug: Log profile pictures for troubleshooting
    console.log('Admin users query - Profile pictures:', users.map(u => ({
      name: u.name,
      email: u.email,
      profilePicture: u.profilePicture,
      googleId: !!u.googleId
    })));

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

    // Use aggregation for better performance
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          googleUsers: { $sum: { $cond: [{ $ifNull: ['$googleId', false] }, 1, 0] } },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
          pendingApplications: { $sum: { $cond: [{ $eq: ['$creatorStatus', 'pending'] }, 1, 0] } },
          approvedCreators: { $sum: { $cond: [{ $eq: ['$creatorStatus', 'approved'] }, 1, 0] } },
          rejectedApplications: { $sum: { $cond: [{ $eq: ['$creatorStatus', 'rejected'] }, 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          regularUsers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$role', 'admin'] },
                    { $ne: ['$creatorStatus', 'approved'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          recentUsers: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const templateStats = await Template.aggregate([
      {
        $group: {
          _id: null,
          totalTemplates: { $sum: 1 },
          pendingTemplates: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approvedTemplates: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejectedTemplates: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          recentTemplates: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const blogStats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          pendingBlogs: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          publishedBlogs: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          rejectedBlogs: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          draftBlogs: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          recentBlogs: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get notification count separately (simpler query)
    const unreadNotifications = await Notification.countDocuments({
      type: { $in: ['admin_creator_application', 'admin_template_pending', 'admin_blog_pending', 'admin_user_registered', 'admin_system_alert'] },
      isRead: false
    });

    // Extract results
    const userData = userStats[0] || {};
    const templateData = templateStats[0] || {};
    const blogData = blogStats[0] || {};

    const totalUsers = userData.totalUsers || 0;
    const googleUsers = userData.googleUsers || 0;
    const regularUsers = totalUsers - googleUsers;

    res.json({
      success: true,
      stats: {
        totalUsers,
        googleUsers,
        regularUsers,
        activeUsers: userData.activeUsers || 0,
        verifiedUsers: userData.verifiedUsers || 0,
        googleUsersPercentage: totalUsers === 0 ? 0 : Math.round((googleUsers / totalUsers) * 100),
        pendingApplications: userData.pendingApplications || 0,
        approvedCreators: userData.approvedCreators || 0,
        rejectedApplications: userData.rejectedApplications || 0,
        adminUsers: userData.adminUsers || 0,
        regularUsers: userData.regularUsers || 0,
        totalTemplates: templateData.totalTemplates || 0,
        pendingTemplates: templateData.pendingTemplates || 0,
        approvedTemplates: templateData.approvedTemplates || 0,
        rejectedTemplates: templateData.rejectedTemplates || 0,
        totalBlogs: blogData.totalBlogs || 0,
        pendingBlogs: blogData.pendingBlogs || 0,
        publishedBlogs: blogData.publishedBlogs || 0,
        rejectedBlogs: blogData.rejectedBlogs || 0,
        draftBlogs: blogData.draftBlogs || 0,
        recentUsers: userData.recentUsers || 0,
        recentTemplates: templateData.recentTemplates || 0,
        recentBlogs: blogData.recentBlogs || 0,
        unreadNotifications
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
      profilePicture: user.profilePicture,
      badges: user.badges || [],
      isPinned: user.isPinned || false,
      pinnedAt: user.pinnedAt || null
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

    // If approving, set role to 'creator' and handle name change
    if (status === 'approved') {
      updateData.role = 'creator';

      // If user has a requested name change, update the name
      if (userToUpdate.requestedName) {
        updateData.name = userToUpdate.requestedName;
        updateData.requestedName = null; // Clear the requested name after applying it
      }
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

      // Notify the creator that their template was approved
      try {
        if (template.creator) {
          await Notification.create({
            user: template.creator,
            type: 'template_published',
            title: 'تمت الموافقة على قالبك',
            message: `تمت الموافقة على قالبك: ${template.title}`,
            link: `/templates/${template.slug || template._id}`,
            metadata: { templateId: template._id }
          });
        }
      } catch (creatorNotifyErr) {
        console.error('Notify creator approval error:', creatorNotifyErr);
      }

      // Create notifications for followers of the creator
      try {
        const creatorId = template.creator;
        const followers = await User.find({ following: creatorId }).select('_id').lean();
        if (followers && followers.length > 0) {
          const creator = await User.findById(creatorId).select('name displayName profilePicture');
          const notifications = followers.map(f => ({
            user: f._id,
            type: 'template_published',
            title: 'قالب جديد من مبدع تتابعه',
            message: `${creator?.displayName || creator?.name || 'مبدع'} نشر قالبًا جديدًا: ${template.title}`,
            link: `/templates/${template.slug || template._id}`,
            metadata: { templateId: template._id, creatorId, creatorProfilePicture: creator?.profilePicture || '' }
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
// @route   GET /api/admin/notifications
// @desc    Get admin notifications
// @access  Private (Admin)
router.get('/notifications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get admin-specific notifications
    const notifications = await Notification.find({
      type: { $in: ['admin_creator_application', 'admin_template_pending', 'admin_blog_pending', 'admin_user_registered', 'admin_system_alert'] }
    })
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      type: { $in: ['admin_creator_application', 'admin_template_pending', 'admin_blog_pending', 'admin_user_registered', 'admin_system_alert'] },
      isRead: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(unreadCount / parseInt(limit)),
        total: unreadCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @route   PUT /api/admin/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private (Admin)
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود'
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @route   PUT /api/admin/notifications/read-all
// @desc    Mark all admin notifications as read
// @access  Private (Admin)
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    await Notification.updateMany(
      {
        type: { $in: ['admin_creator_application', 'admin_template_pending', 'admin_blog_pending', 'admin_user_registered', 'admin_system_alert'] },
        isRead: false
      },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @route   GET /api/admin/settings
// @desc    Get admin settings
// @access  Private (Admin)
router.get('/settings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update admin settings
// @access  Private (Admin)
router.put('/settings', auth, [
  body('platformName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('اسم المنصة يجب أن يكون بين 1 و 100 حرف'),
  body('platformDescription')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('وصف المنصة يجب أن يكون بين 1 و 500 حرف'),
  body('maintenanceMode')
    .optional()
    .isBoolean()
    .withMessage('وضع الصيانة يجب أن يكون true أو false'),
  body('registrationEnabled')
    .optional()
    .isBoolean()
    .withMessage('تفعيل التسجيل يجب أن يكون true أو false'),
  body('creatorApplicationsEnabled')
    .optional()
    .isBoolean()
    .withMessage('تفعيل طلبات المبدعين يجب أن يكون true أو false'),
  body('autoApproveTemplates')
    .optional()
    .isBoolean()
    .withMessage('الموافقة التلقائية على القوالب يجب أن تكون true أو false'),
  body('autoApproveBlogs')
    .optional()
    .isBoolean()
    .withMessage('الموافقة التلقائية على المقالات يجب أن تكون true أو false'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('contactInfo.phone')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('رقم الهاتف يجب أن يكون بين 1 و 20 حرف'),
  body('contactInfo.address')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('العنوان يجب أن يكون بين 1 و 200 حرف')
], async (req, res) => {
  try {
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

    const Settings = require('../models/Settings');
    const updatedSettings = await Settings.updateSettings(req.body);

    res.json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Update admin settings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/admin/toggle-maintenance
// @desc    Toggle maintenance mode (for quick access)
// @access  Private (Admin)
router.post('/toggle-maintenance', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();

    // Toggle maintenance mode
    const newMaintenanceMode = !settings.maintenanceMode;
    const updatedSettings = await Settings.updateSettings({
      maintenanceMode: newMaintenanceMode
    });

    res.json({
      success: true,
      message: `Maintenance mode ${newMaintenanceMode ? 'enabled' : 'disabled'}`,
      maintenanceMode: newMaintenanceMode,
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Toggle maintenance mode error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
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

// @route   POST /api/admin/send-bulk-emails
// @desc    Send bulk emails to a list of users
// @access  Private (Admin only)
router.post('/send-bulk-emails', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول لهذه الميزة'
      });
    }

    const { emails, subject, message } = req.body;

    // Validation
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يرجى توفير قائمة بالبريد الإلكتروني'
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'عنوان الرسالة مطلوب'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'محتوى الرسالة مطلوب'
      });
    }

    if (emails.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إرسال أكثر من 2000 بريد إلكتروني في المرة الواحدة'
      });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter(email => emailRegex.test(email));

    if (validEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد عناوين بريد إلكتروني صحيحة'
      });
    }

    // Check if Brevo is configured
    if (!process.env.BREVO_API_KEY) {
      // For development/testing - simulate email sending
      console.log(`[DEV MODE] Simulating email send to ${validEmails.length} emails`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log(`Recipients: ${validEmails.join(', ')}`);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      res.status(200).json({
        success: true,
        message: `[وضع التطوير] تم محاكاة إرسال ${validEmails.length} بريد إلكتروني بنجاح`,
        stats: {
          total: validEmails.length,
          successful: validEmails.length,
          failed: 0
        },
        devMode: true
      });
      return;
    }

    // Production mode - use actual email service
    try {
      console.log('Creating email transporter...');
      const transporter = createTransporter();

      // Verify transporter configuration before sending emails (if supported)
      if (transporter.verify && typeof transporter.verify === 'function') {
        console.log('Verifying email transporter configuration...');
        try {
          await transporter.verify();
          console.log('Email transporter verified successfully');
        } catch (verifyError) {
          console.log('Transporter verification skipped or not supported');
        }
      }

      // Send emails in batches to avoid overwhelming the server
      const batchSize = 50; // Process 50 emails at a time
      const results = [];
      let successful = 0;
      let failed = 0;

      for (let i = 0; i < validEmails.length; i += batchSize) {
        const batch = validEmails.slice(i, i + batchSize);

        console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(validEmails.length / batchSize)} (${batch.length} emails)`);

        const sendPromises = batch.map(async email => {
          // Check if user has unsubscribed from emails
          const user = await User.findOne({ email: email.toLowerCase().trim() });
          if (user && !user.emailNotifications) {
            console.log(`⚠️ Skipping ${email} - user has unsubscribed`);
            return { status: 'skipped', reason: 'unsubscribed', email };
          }
          // Create HTML email template with logo
          const htmlContent = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
              <style>
                body {
                  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background-color: #fafafa;
                  margin: 0;
                  padding: 0;
                  direction: rtl;
                }
                .email-container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
                }
                .email-header {
                  background: linear-gradient(135deg, #132859 0%, #1e3a8a 100%);
                  padding: 40px 20px;
                  text-align: center;
                  position: relative;
                }
                .email-header::after {
                  content: '';
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  height: 4px;
                  background: linear-gradient(90deg, #0f172a, #1e293b, #334155, #1e293b, #0f172a);
                  background-size: 200% 100%;
                }
                .email-logo {
                  width: 90px;
                  height: 90px;
                  margin: 0 auto 20px;
                  box-shadow: 0 8px 16px rgba(19, 40, 89, 0.4);
                }
                .email-logo img {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                }
                .email-title {
                  color: #ffffff;
                  font-size: 28px;
                  font-weight: bold;
                  margin: 0;
                  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .email-body {
                  padding: 40px 30px;
                  line-height: 1.9;
                  color: #132859;
                  font-size: 16px;
                  background-color: #ffffff;
                }
                .email-footer {
                  background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
                  padding: 30px 20px;
                  text-align: center;
                  color: #5f6368;
                  font-size: 14px;
                  border-top: 2px solid #fdeee0;
                }
                .email-footer p {
                  margin: 8px 0;
                }
                .footer-signature {
                  color: #132859;
                  font-weight: 700;
                  font-size: 18px;
                  margin: 15px 0 5px;
                }
                .footer-tagline {
                  color: #f5631e;
                  font-weight: 600;
                  font-size: 14px;
                  margin: 5px 0 20px;
                }
                .social-links {
                  margin-top: 20px;
                }
                .social-links a {
                  display: inline-block;
                  margin: 0 8px;
                  padding: 10px 20px;
                  background-color: #ffffff;
                  border: 2px solid #f5631e;
                  color: #f5631e;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 13px;
                  transition: all 0.3s ease;
                }
                .social-links a:hover {
                  background-color: #f5631e;
                  color: #ffffff;
                }
                @media only screen and (max-width: 600px) {
                  .email-container {
                    margin: 10px;
                    border-radius: 12px;
                  }
                  .email-body {
                    padding: 25px 20px;
                  }
                  .email-title {
                    font-size: 24px;
                  }
                  .social-links a {
                    margin: 5px;
                    padding: 8px 15px;
                    font-size: 12px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="email-header">
                  <div class="email-logo">
                    <img src="https://www.notionarabs.com/favicon.png" alt="عرب نوشن">
                  </div>
                  <h1 class="email-title">عرب نوشن</h1>
                </div>
                <div class="email-body">
                  <div style="text-align: right; margin-bottom: 30px;">
                    <h2 style="font-size: 26px; color: #132859; margin-bottom: 12px; font-weight: 700;">مرحبًا بك</h2>
                    <p style="font-size: 17px; color: #5f6368; margin: 0; line-height: 1.6;">نسعد بمشاركتك خبرًا مميزًا</p>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #132859 0%, #1e3a8a 100%); border-radius: 12px; padding: 30px; margin: 25px 0; text-align: center; box-shadow: 0 4px 15px rgba(19, 40, 89, 0.15);">
                    <p style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 10px; line-height: 1.6;">انطلقت رسميًا منصة</p>
                    <p style="font-size: 32px; font-weight: 900; color: #f5631e; margin: 10px 0; text-shadow: 0 2px 8px rgba(245, 99, 30, 0.3);">عرب نوشن</p>
                    <p style="font-size: 16px; color: #e2e8f0; margin-top: 10px; line-height: 1.6;">أول وأكبر منصة عربية مخصصة لعالم نوشن</p>
                  </div>
                  
                  <h3 style="margin: 35px 0 20px 0; font-weight: 700; color: #132859; font-size: 20px; text-align: right; border-right: 4px solid #f5631e; padding-right: 15px;">ما الذي يميز عرب نوشن؟</h3>
                  
                   <div style="display: flex; flex-direction: column; gap: 20px; margin: 30px 0;">
                     <!-- Feature 1 -->
                     <div style="background: linear-gradient(135deg, #ffffff 0%, #fef7f0 100%); border-radius: 16px; padding: 25px; box-shadow: 0 4px 20px rgba(245, 99, 30, 0.1); border: 1px solid #fdeee0;">
                       <div style="text-align: center; margin-bottom: 20px; display: flex; justify-content: center; align-items: center;">
                         <div style="display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: linear-gradient(135deg, #f5631e, #e55a1b); border-radius: 50%; font-size: 28px; color: white; box-shadow: 0 6px 16px rgba(245, 99, 30, 0.3);">📖</div>
                       </div>
                       <h4 style="color: #132859; font-size: 18px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">تعلّم وطوّر مهاراتك</h4>
                       <p style="color: #5f6368; font-size: 15px; line-height: 1.6; margin: 0; text-align: center;">قوالب تعليمية تفاعلية في مختلف المجالات</p>
                     </div>
                     
                     <!-- Feature 2 -->
                     <div style="background: linear-gradient(135deg, #ffffff 0%, #fef7f0 100%); border-radius: 16px; padding: 25px; box-shadow: 0 4px 20px rgba(245, 99, 30, 0.1); border: 1px solid #fdeee0;">
                       <div style="text-align: center; margin-bottom: 20px; display: flex; justify-content: center; align-items: center;">
                         <div style="display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: linear-gradient(135deg, #f5631e, #e55a1b); border-radius: 50%; font-size: 28px; color: white; box-shadow: 0 6px 16px rgba(245, 99, 30, 0.3);">⚡</div>
                       </div>
                       <h4 style="color: #132859; font-size: 18px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">اكتشف قوالب جاهزة</h4>
                       <p style="color: #5f6368; font-size: 15px; line-height: 1.6; margin: 0; text-align: center;">نظّم حياتك وعملك بسهولة وفعالية</p>
                     </div>
                     
                     <!-- Feature 3 -->
                     <div style="background: linear-gradient(135deg, #ffffff 0%, #fef7f0 100%); border-radius: 16px; padding: 25px; box-shadow: 0 4px 20px rgba(245, 99, 30, 0.1); border: 1px solid #fdeee0;">
                       <div style="text-align: center; margin-bottom: 20px; display: flex; justify-content: center; align-items: center;">
                         <div style="display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: linear-gradient(135deg, #f5631e, #e55a1b); border-radius: 50%; font-size: 28px; color: white; box-shadow: 0 6px 16px rgba(245, 99, 30, 0.3);">👥</div>
                       </div>
                       <h4 style="color: #132859; font-size: 18px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">انضم للمجتمع</h4>
                       <p style="color: #5f6368; font-size: 15px; line-height: 1.6; margin: 0; text-align: center;">تواصل مع المبدعين العرب وشارك خبرتك</p>
                     </div>
                   </div>
                  
                  <div style="background: linear-gradient(135deg, #fef7f0 0%, #fff8f0 100%); border-radius: 20px; padding: 35px; margin: 35px 0; text-align: center; box-shadow: 0 8px 25px rgba(245, 99, 30, 0.1); border: 2px solid #fdeee0; position: relative;">
                    <div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #f5631e, #e55a1b); border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; box-shadow: 0 4px 12px rgba(245, 99, 30, 0.3);">💡</div>
                    <h3 style="color: #132859; font-size: 20px; font-weight: 700; margin: 15px 0 20px 0;">رؤيتنا</h3>
                    <p style="color: #132859; line-height: 1.8; font-size: 16px; margin: 0; font-weight: 500;">أن نكون الوجهة العربية الأولى لعشّاق نوشن<br>حيث يتحوّل كل خبير إلى معلّم، وكل فكرة إلى قالب حيّ</p>
                  </div>
                  
                  <div style="text-align: center; margin: 45px 0; padding: 30px; background: linear-gradient(135deg, #fef7f0 0%, #ffffff 100%); border-radius: 20px; box-shadow: 0 6px 20px rgba(245, 99, 30, 0.08);">
                    <div style="margin-bottom: 25px;">
                      <p style="font-size: 20px; font-weight: 700; color: #132859; margin: 0 0 8px 0;">ابدأ رحلتك معنا الآن</p>
                      <p style="font-size: 15px; color: #5f6368; margin: 0;">واكتشف عالمًا جديدًا من الإبداع والتنظيم</p>
                    </div>
                    <a href="https://www.notionarabs.com" style="display: inline-block; padding: 20px 50px; background: linear-gradient(135deg, #f5631e 0%, #e55a1b 100%); color: #ffffff !important; text-decoration: none; border-radius: 15px; font-weight: 700; font-size: 18px; box-shadow: 0 10px 30px rgba(245, 99, 30, 0.4); transition: all 0.3s ease; position: relative; overflow: hidden;">
                      <span style="position: relative; z-index: 1;">استكشف عرب نوشن الآن →</span>
                    </a>
                    <p style="margin-top: 20px; color: #80868b; font-size: 14px; font-weight: 500;">اكتشف كيف يمكن لقالب واحد أن يغيّر طريقة عملك بالكامل</p>
                  </div>
                </div>
                <div class="email-footer">
                  <p class="footer-signature">تحيات فريق<br>عرب نوشن</p>
                  <p class="footer-tagline">"شارك. تعلّم. ابتكر."</p>
                   <div style="margin: 30px 0; text-align: center;">
                     <p style="color: #132859; font-size: 16px; font-weight: 600; margin-bottom: 20px;">تواصل معنا</p>
                     <div style="display: flex; justify-content: center; gap: 15px; align-items: center;">
                       <a href="https://www.notionarabs.com" style="display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: linear-gradient(135deg, #f5631e, #e55a1b); border-radius: 12px; text-decoration: none; color: white; font-size: 22px; box-shadow: 0 4px 12px rgba(245, 99, 30, 0.3); transition: all 0.3s ease;">🌐</a>
                       <a href="https://t.me/notionarabs" style="display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: linear-gradient(135deg, #0088cc, #0066aa); border-radius: 12px; text-decoration: none; color: white; font-size: 22px; box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3); transition: all 0.3s ease;">✈️</a>
                       <a href="https://twitter.com/notionarabs" style="display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: linear-gradient(135deg, #1da1f2, #0d7bb8); border-radius: 12px; text-decoration: none; color: white; font-size: 22px; box-shadow: 0 4px 12px rgba(29, 161, 242, 0.3); transition: all 0.3s ease;">𝕏</a>
                     </div>
                   </div>
                  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0 0 10px 0;">© 2025 عرب نوشن. جميع الحقوق محفوظة.</p>
                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                      <a href="https://www.notionarabs.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #94a3b8; text-decoration: underline;">إلغاء الاشتراك</a> 
                      | 
                      <a href="https://www.notionarabs.com/privacy" style="color: #94a3b8; text-decoration: underline;">سياسة الخصوصية</a>
                    </p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;

          // Create text version of the email
          const textContent = `
عرب نوشن - منصة المبدعين العرب في عالم نوشن

مرحباً!

نحن سعداء بمشاركتك خبر انطلاق منصة عرب نوشن - أول وأكبر منصة عربية مخصصة لعالم نوشن.

ما الذي يميز عرب نوشن؟
• تعلّم وطوّر مهاراتك من خلال قوالب تعليمية تفاعلية
• اكتشف قوالب جاهزة تساعدك على تنظيم حياتك وعملك
• انضم لمجتمع المبدعين العرب وشارك خبرتك

رؤيتنا: أن نكون الوجهة العربية الأولى لعشّاق نوشن حيث يتحوّل كل خبير إلى معلّم، وكل فكرة إلى قالب حيّ.

ابدأ رحلتك معنا الآن: https://www.notionarabs.com

تواصل معنا:
الموقع: https://www.notionarabs.com
تليجرام: https://t.me/notionarabs
تويتر: https://twitter.com/notionarabs

تحيات فريق عرب نوشن
"شارك. تعلّم. ابتكر."

إذا كنت لا ترغب في تلقي هذه الرسائل، يمكنك إلغاء الاشتراك هنا: https://www.notionarabs.com/unsubscribe?email=${encodeURIComponent(email)}
          `.trim();

          return transporter.sendMail({
            from: `"عرب نوشن" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: htmlContent,
            text: textContent
          });
        });

        // Execute batch email sends
        const batchResults = await Promise.allSettled(sendPromises);
        results.push(...batchResults);

        // Count successful and failed sends in this batch
        const batchSuccessful = batchResults.filter(result => result.status === 'fulfilled').length;
        const batchFailed = batchResults.filter(result => result.status === 'rejected').length;

        successful += batchSuccessful;
        failed += batchFailed;

        console.log(`Batch completed: ${batchSuccessful} successful, ${batchFailed} failed`);

        // Log detailed errors for failed emails in this batch
        if (batchFailed > 0) {
          batchResults.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`Email failed for ${batch[index]}:`, result.reason.message);
            }
          });
        }

        // Add a small delay between batches to prevent rate limiting
        if (i + batchSize < validEmails.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      // Log failed emails for debugging
      if (failed > 0) {
        const failedEmails = results
          .map((result, index) => ({ result, email: validEmails[index] }))
          .filter(({ result }) => result.status === 'rejected')
          .map(({ email, result }) => ({ email, error: result.reason.message }));

        console.error('Failed email sends:', failedEmails);
      }

      // Log the bulk email send activity
      console.log(`Bulk email sent by admin ${req.user.email}: ${successful} successful, ${failed} failed`);

      res.status(200).json({
        success: true,
        message: `تم إرسال ${successful} من أصل ${validEmails.length} بريد إلكتروني بنجاح`,
        stats: {
          total: validEmails.length,
          successful,
          failed
        },
        failedEmails: failed > 0 ? results
          .map((result, index) => ({ result, email: validEmails[index] }))
          .filter(({ result }) => result.status === 'rejected')
          .map(({ email, result }) => ({ email, error: result.reason.message })) : []
      });
    } catch (emailError) {
      console.error('Email service error:', emailError);
      throw new Error('خطأ في خدمة البريد الإلكتروني: ' + emailError.message);
    }

  } catch (error) {
    console.error('Send bulk emails error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال الرسائل',
      error: error.message
    });
  }
});

// Pin/Unpin Templates
// @route   PUT /api/admin/templates/:id/pin
// @desc    Pin or unpin a template on the home page
// @access  Private (Admin only)
router.put('/templates/:id/pin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'القالب غير موجود'
      });
    }

    // Toggle pin status
    template.isPinned = !template.isPinned;
    template.pinnedAt = template.isPinned ? new Date() : null;
    template.pinnedBy = template.isPinned ? req.user._id : null;

    await template.save();

    // Invalidate cache to reflect changes immediately
    await invalidateCache('template', id);
    await invalidateCache('stats');

    res.json({
      success: true,
      message: template.isPinned ? 'تم تثبيت القالب بنجاح' : 'تم إلغاء تثبيت القالب',
      template: {
        _id: template._id,
        isPinned: template.isPinned,
        pinnedAt: template.pinnedAt
      }
    });
  } catch (error) {
    console.error('Pin template error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   PUT /api/admin/users/:id/pin
// @desc    Pin or unpin a creator on the home page
// @access  Private (Admin only)
router.put('/users/:id/pin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    if (user.creatorStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'يمكن تثبيت المبدعين المعتمدين فقط'
      });
    }

    // Toggle pin status
    user.isPinned = !user.isPinned;
    user.pinnedAt = user.isPinned ? new Date() : null;
    user.pinnedBy = user.isPinned ? req.user._id : null;

    await user.save();

    // Invalidate cache to reflect changes immediately
    await invalidateCache('user', id);
    await invalidateCache('creators');
    await invalidateCache('stats');

    res.json({
      success: true,
      message: user.isPinned ? 'تم تثبيت المبدع بنجاح' : 'تم إلغاء تثبيت المبدع',
      user: {
        _id: user._id,
        isPinned: user.isPinned,
        pinnedAt: user.pinnedAt
      }
    });
  } catch (error) {
    console.error('Pin user error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// Badge Management Endpoints

// @route   POST /api/admin/users/:id/badges
// @desc    Add badge to a creator
// @access  Private (Admin only)
router.post('/users/:id/badges', auth, [
  body('type')
    .isIn(['verified', 'top-creator', 'best-creator', 'active', 'community-favorite', 'trusted'])
    .withMessage('نوع الشارة غير صحيح'),
  body('label')
    .notEmpty()
    .withMessage('تسمية الشارة مطلوبة')
    .isLength({ max: 50 })
    .withMessage('تسمية الشارة لا يجب أن تتجاوز 50 حرف'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('اللون يجب أن يكون بصيغة hex'),
  body('icon')
    .optional()
    .isLength({ max: 10 })
    .withMessage('الأيقونة لا يجب أن تتجاوز 10 أحرف')
], async (req, res) => {
  try {
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

    const { type, label, color, icon } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Check if badge type already exists
    const existingBadge = user.badges.find(badge => badge.type === type);
    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'هذه الشارة موجودة بالفعل على المستخدم'
      });
    }

    // Add badge
    user.badges.push({
      type,
      label,
      color: color || '#3b82f6',
      icon: icon || '✓',
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await user.save();

    // Create notification for the creator
    try {
      await Notification.create({
        user: user._id,
        type: 'badge_added',
        title: 'شارة جديدة',
        message: `تم منحك شارة "${label}"`,
        link: '/profile',
        metadata: {
          badgeType: type,
          badgeLabel: label,
          badgeIcon: icon
        }
      });
    } catch (notifyErr) {
      console.error('Create badge notification error:', notifyErr);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: 'تمت إضافة الشارة بنجاح',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Add user badge error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   DELETE /api/admin/users/:id/badges/:badgeId
// @desc    Remove badge from a creator
// @access  Private (Admin only)
router.delete('/users/:id/badges/:badgeId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { id, badgeId } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Remove badge
    user.badges = user.badges.filter(badge => badge._id.toString() !== badgeId);

    await user.save();

    res.json({
      success: true,
      message: 'تم حذف الشارة بنجاح',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Remove user badge error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/admin/badge-presets
// @desc    Get badge presets (available badge types)
// @access  Private (Admin only)
router.get('/badge-presets', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const userBadges = [
      { type: 'verified', label: 'مبدع معتمد', color: '#10b981', icon: '✔' },
      { type: 'top-creator', label: 'مبدع مميز', color: '#f59e0b', icon: '⭐' },
      { type: 'best-creator', label: 'المبدع الافضل', color: '#fbbf24', icon: '👑' },
      { type: 'active', label: 'مبدع نشط', color: '#8b5cf6', icon: '⚡' },
      { type: 'community-favorite', label: 'مبدع محبوب', color: '#ec4899', icon: '❤' },
      { type: 'trusted', label: 'مبدع موثوق', color: '#3b82f6', icon: '👍' }
    ];

    res.json({
      success: true,
      userBadges
    });
  } catch (error) {
    console.error('Get badge presets error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;
