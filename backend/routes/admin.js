const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Template = require('../models/Template');
const Notification = require('../models/Notification');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const { cacheMiddleware, invalidateCache } = require('../utils/redis-cache');

const router = express.Router();

const {
  sendTemplateApprovedEmail,
  sendCreatorApprovedEmail,
  sendBlogApprovedEmail,
  sendTemplateRejectedEmail,
  sendCreatorRejectedEmail,
  sendBlogRejectedEmail,
  sendEmail
} = require('../services/emailService');

// @route   GET /api/settings/public
// @desc    Get public settings (maintenance mode, etc.)
// @access  Public
router.get('/settings/public', cacheMiddleware(300), async (req, res) => {
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
router.get('/public', cacheMiddleware(300), async (req, res) => {
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

    const { search, role, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

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

    // Get total count and users in parallel for better performance
    const [totalCount, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('-password -resetToken')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    res.json({
      success: true,
      count: totalCount,
      displayedCount: users.length,
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
router.get('/stats', auth, cacheMiddleware(60), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Run all stats aggregations and counts in parallel for maximum performance
    const [userStats, templateStats, blogStats, unreadNotifications] = await Promise.all([
      User.aggregate([
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
      ]),
      Template.aggregate([
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
      ]),
      Blog.aggregate([
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
      ]),
      Notification.countDocuments({
        type: { $in: ['admin_creator_application', 'admin_template_pending', 'admin_blog_pending', 'admin_user_registered', 'admin_system_alert'] },
        isRead: false
      })
    ]);

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
    .withMessage('الحالة يجب أن تكون: pending, approved, أو rejected'),
  body('adminNotes').optional().isString().isLength({ max: 500 })
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

    // Sync to Notion database when creator is approved
    if (status === 'approved') {
      try {
        console.log('🔵 Attempting to sync creator to Notion:', user.name);
        const { addCreatorToNotion } = require('../services/notionService');
        const notionResult = await addCreatorToNotion(user);
        if (notionResult) {
          console.log('✅ Creator synced to Notion successfully');
        } else {
          console.warn('⚠️ Creator sync to Notion returned null');
        }
      } catch (notionError) {
        console.error('❌ Notion sync error (non-blocking):', notionError.message);
        console.error('❌ Error stack:', notionError.stack);
        // Continue - don't block approval if Notion sync fails
      }

      // Send approval email
      try {
        console.log('📧 Sending approval email to creator:', user.email);
        await sendCreatorApprovedEmail(user);
        console.log('✅ Creator approval email sent successfully');
      } catch (emailErr) {
        console.error('❌ Failed to send creator approval email:', emailErr.message);
      }
    } else if (status === 'rejected') {
      // Send rejection email
      try {
        console.log('📧 Sending rejection email to creator:', user.email);
        const { adminNotes } = req.body;
        await sendCreatorRejectedEmail(user, adminNotes);
        console.log('✅ Creator rejection email sent successfully');
      } catch (emailErr) {
        console.error('❌ Failed to send creator rejection email:', emailErr.message);
      }
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

    const { status, page = 1, limit = 50, search } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };

      // We need to handle search for creator fields too
      // Since creator is a reference, we might need a more complex query or first find users matching search
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { username: searchRegex },
          { displayName: searchRegex }
        ]
      }).select('_id');

      const userIds = matchingUsers.map(u => u._id);

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { creator: { $in: userIds } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Use aggregation to sort by status priority (pending first) then by date
    const templates = await Template.aggregate([
      { $match: filter },
      {
        $addFields: {
          statusPriority: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'pending'] }, then: 0 },
                { case: { $eq: ['$status', 'approved'] }, then: 1 },
                { case: { $eq: ['$status', 'rejected'] }, then: 2 }
              ],
              default: 3
            }
          }
        }
      },
      { $sort: { statusPriority: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    ]);

    // Populate the results (aggregation returns plain objects)
    await Template.populate(templates, [
      { path: 'creator', select: 'name username displayName email profilePicture' },
      { path: 'approvedBy', select: 'name' }
    ]);

    const total = await Template.countDocuments(filter);

    res.json({
      success: true,
      templates,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      },
      // Keep legacy structure if needed, but pagination object is better
      totalPages: Math.ceil(total / parseInt(limit))
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
      // Check if this is a template update (was previously approved) or a new template
      const isTemplateUpdate = template.approvedAt !== null || template.updatePending;

      await template.approve(req.user._id, adminNotes);

      // Clear update flags if any
      template.updatePending = false;
      template.previousData = null;
      await template.save();

      // Sync to Notion database (only for new approvals, not updates)
      if (!isTemplateUpdate) {
        try {
          console.log('🔵 Attempting to sync template to Notion:', template.title);
          const { addTemplateToNotion } = require('../services/notionService');
          // Reload template with creator populated to get fresh data
          await template.populate('creator', 'name username email displayName');
          const notionResult = await addTemplateToNotion(template);
          if (notionResult) {
            console.log('✅ Template synced to Notion successfully');
          } else {
            console.warn('⚠️ Template sync to Notion returned null');
          }
        } catch (notionError) {
          console.error('❌ Notion sync error (non-blocking):', notionError.message);
          console.error('❌ Error stack:', notionError.stack);
          // Continue - don't block approval if Notion sync fails
        }
      } else {
        console.log('⏭️ Skipping Notion sync for template update');
      }

      // Notify the creator that their template was approved
      try {
        if (template.creator) {
          const notificationTitle = isTemplateUpdate ? 'تمت الموافقة على تحديث قالبك' : 'تمت الموافقة على قالبك';
          const notificationMessage = isTemplateUpdate
            ? `تمت الموافقة على تحديث قالبك: ${template.title}`
            : `تمت الموافقة على قالبك: ${template.title}`;

          await Notification.create({
            user: template.creator,
            type: 'template_published',
            title: notificationTitle,
            message: notificationMessage,
            link: `/templates/${template.slug || template._id}`,
            metadata: { templateId: template._id, isUpdate: isTemplateUpdate }
          });

          // SEND EMAIL VERIFICATION HERE
          // We need the full creator details (email) to send the email
          const creatorUser = await User.findById(template.creator).select('email name');
          if (creatorUser) {
            console.log('📧 Sending approval email to creator:', creatorUser.email);
            // Verify this is not an update (user requested "when accept template pending for a creator")
            // But logic for updates is also here.
            // Usually emails are more critical for new approvals.
            // I will send for both, or check isTemplateUpdate. 
            // The prompt implied initial acceptance, but let's be generous and send for both or just new.
            // "when the admin accepts template that is pending for a creator" -> usually implies the initial flow.
            // But existing code handles updates too.
            // Let's send for NEW approvals for now as that's the main "pending" state transition.
            if (!isTemplateUpdate) {
              try {
                await sendTemplateApprovedEmail(creatorUser, template);
                console.log('📧 Email sent successfully');
              } catch (emailErr) {
                console.error('❌ Failed to send approval email:', emailErr.message);
              }
            }
          }
        }
      } catch (creatorNotifyErr) {
        console.error('Notify creator approval error:', creatorNotifyErr);
      }

      // Create notifications for followers of the creator
      // Only send follower notifications for truly new templates, not updates
      if (!isTemplateUpdate) {
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
        // For template updates, send a different notification to followers
        try {
          const creatorId = template.creator;
          const followers = await User.find({ following: creatorId }).select('_id').lean();
          if (followers && followers.length > 0) {
            const creator = await User.findById(creatorId).select('name displayName profilePicture');
            const notifications = followers.map(f => ({
              user: f._id,
              type: 'template_updated',
              title: 'تم تحديث قالب من مبدع تتابعه',
              message: `${creator?.displayName || creator?.name || 'مبدع'} قام بتحديث قالب: ${template.title}`,
              link: `/templates/${template.slug || template._id}`,
              metadata: { templateId: template._id, creatorId, creatorProfilePicture: creator?.profilePicture || '', isUpdate: true }
            }));
            await Notification.insertMany(notifications);
          }
        } catch (notifyErr) {
          console.error('Notify followers update error:', notifyErr);
        }
      }
    } else {
      let isUpdateRejection = false;

      if (template.updatePending && template.previousData) {
        // Revert to previous approved state
        Object.assign(template, template.previousData);
        template.status = 'approved';
        // We keep the original approvedAt
        template.previousData = null;
        template.updatePending = false;
        await template.save();
        isUpdateRejection = true;
      } else {
        await template.reject(req.user._id, adminNotes);
      }

      // Notify the creator that their template was rejected
      try {
        if (template.creator) {
          const notificationTitle = isUpdateRejection ? 'تم رفض تحديث قالبك' : 'تم رفض قالبك';
          const notificationMessage = isUpdateRejection
            ? `تم رفض التحديثات التي أجريتها على قالب: ${template.title}. يظل القالب بنسخته السابقة متاحاً على المنصة.${adminNotes ? `\n\nملاحظات الإدارة: ${adminNotes}` : ''}`
            : `تم رفض قالبك: ${template.title}${adminNotes ? `\n\nملاحظات الإدارة: ${adminNotes}` : ''}`;

          await Notification.create({
            user: template.creator,
            type: 'template_rejected',
            title: notificationTitle,
            message: notificationMessage,
            link: isUpdateRejection ? `/templates/${template.slug || template._id}` : '/profile/templates',
            metadata: {
              templateId: template._id,
              adminNotes: adminNotes || '',
              rejectedBy: req.user._id,
              isUpdateRejection
            }
          });

          // Send rejection email
          const creatorUser = await User.findById(template.creator).select('email name');
          if (creatorUser) {
            console.log('📧 Sending rejection email to creator:', creatorUser.email);
            await sendTemplateRejectedEmail(creatorUser, template, adminNotes, isUpdateRejection);
          }
        }
      } catch (creatorNotifyErr) {
        console.error('Notify creator rejection error:', creatorNotifyErr);
      }
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
    await blog.save();

    // We already populated author in a previous query or we need to ensure it's populated now
    // The previous populate was on 'blogs' list, not this single 'blog' instance if we just did findById without populate
    // Let's populate author to get name and email
    await blog.populate('author', 'name email profilePicture');

    // Send email if published
    if (status === 'published') {
      try {
        if (blog.author) {
          console.log('📧 Sending blog publication email to author:', blog.author.email);
          await sendBlogApprovedEmail(blog.author, blog);
          console.log('✅ Blog publication email sent successfully');
        }
      } catch (emailErr) {
        console.error('❌ Failed to send blog publication email:', emailErr.message);
      }
    } else if (status === 'rejected') {
      try {
        if (blog.author) {
          console.log('📧 Sending blog rejection email to author:', blog.author.email);
          await sendBlogRejectedEmail(blog.author, blog, adminNotes);
          console.log('✅ Blog rejection email sent successfully');
        }
      } catch (emailErr) {
        console.error('❌ Failed to send blog rejection email:', emailErr.message);
      }
    }

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
// @route   POST /api/admin/send-bulk-emails
// @desc    Send bulk emails to a list of users or all users
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

    let { emails, subject, message } = req.body;

    // Validation
    if (!emails || (!Array.isArray(emails) && emails !== 'all')) {
      return res.status(400).json({
        success: false,
        message: 'يرجى توفير قائمة بالبريد الإلكتروني أو اختيار الكل'
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

    let targetUsers = [];
    if (emails === 'all') {
      // Fetch all active users who are subscribed to notifications
      const users = await User.find({ isActive: true, emailNotifications: { $ne: false } }).select('email name');
      targetUsers = users.map(u => ({ email: u.email, name: u.name || 'صديقنا المبدع' }));
    } else {
      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = emails.filter(email => emailRegex.test(email));

      // Fetch names for these specific emails to support dynamic variables
      const usersInDb = await User.find({ email: { $in: validEmails } }).select('email name');
      const userMap = usersInDb.reduce((acc, u) => {
        acc[u.email.toLowerCase()] = u.name;
        return acc;
      }, {});

      targetUsers = validEmails.map(email => ({
        email,
        name: userMap[email.toLowerCase()] || 'صديقنا المبدع'
      }));
    }

    if (targetUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد عناوين بريد إلكتروني صحيحة للإرسال'
      });
    }

    if (targetUsers.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إرسال أكثر من 5000 بريد إلكتروني في المرة الواحدة'
      });
    }

    // Process in batches
    const batchSize = 50;
    let successful = 0;
    let failed = 0;
    const failedDetails = [];

    // Run the process in background to avoid request timeout for large lists
    // but return an initial response to the client
    res.json({
      success: true,
      message: `بدأت عملية إرسال ${targetUsers.length} بريد إلكتروني في الخلفية.`,
      stats: { total: targetUsers.length }
    });

    // Background processing
    (async () => {
      for (let i = 0; i < targetUsers.length; i += batchSize) {
        const batch = targetUsers.slice(i, i + batchSize);

        await Promise.all(batch.map(async (u) => {
          try {
            const { email, name } = u;
            // Personalize the message
            let personalizedMessage = message.replace(/\{\{name\}\}/g, name);
            personalizedMessage = personalizedMessage.replace(/\{\{email\}\}/g, email);

            const html = `
              <!DOCTYPE html>
              <html lang="ar" dir="rtl">
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; background-color: #ffffff; margin: 0; padding: 0; color: #37352f; }
                  .container { max-width: 560px; margin: 40px auto; padding: 20px; }
                  .content { text-align: right; line-height: 1.6; font-size: 16px; margin-bottom: 40px; }
                  .footer { margin-top: 60px; text-align: right; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
                  .unsubscribe { color: #888; text-decoration: underline; }
                  a { color: #f5631e; text-decoration: none; border-bottom: 1px solid rgba(245, 99, 30, 0.2); }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="content">
                    ${personalizedMessage.replace(/\n/g, '<br>')}
                  </div>
                  <div class="footer">
                    <p>عرب نوشن — بيت عشّاق نوشن في العالم العربي</p>
                    <p>إذا كنت لا ترغب في تلقي هذه الرسائل، يمكنك <a href="https://www.notionarabs.com/unsubscribe?email=${encodeURIComponent(email)}" class="unsubscribe">إلغاء الاشتراك هنا</a>.</p>
                  </div>
                </div>
              </body>
              </html>
            `;

            await sendEmail({
              to: email,
              subject: subject,
              html: html,
              text: personalizedMessage
            });
            successful++;
          } catch (err) {
            failed++;
            failedDetails.push({ email: u.email, error: err.message });
            console.error(`Failed to send bulk email to ${u.email}:`, err.message);
          }
        }));

        // Small delay between batches
        if (i + batchSize < targetUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      console.log(`Bulk sending finished: ${successful} successful, ${failed} failed.`);
    })();

  } catch (error) {
    console.error('Bulk email error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'خطأ في معالجة إرسال البريد الجماعي'
      });
    }
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

    // Toggle pin status using findByIdAndUpdate to avoid validation issues
    const newPinStatus = !template.isPinned;
    const updateData = {
      isPinned: newPinStatus,
      pinnedAt: newPinStatus ? new Date() : null,
      pinnedBy: newPinStatus ? req.user._id : null
    };

    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    // Invalidate cache to reflect changes immediately (don't let cache errors break the request)
    try {
      await invalidateCache('template', id);
    } catch (cacheError) {
      console.warn('Cache invalidation error (non-critical):', cacheError.message);
    }

    try {
      await invalidateCache('stats');
    } catch (cacheError) {
      console.warn('Stats cache invalidation error (non-critical):', cacheError.message);
    }

    res.json({
      success: true,
      message: updatedTemplate.isPinned ? 'تم تثبيت القالب بنجاح' : 'تم إلغاء تثبيت القالب',
      template: {
        _id: updatedTemplate._id,
        isPinned: updatedTemplate.isPinned,
        pinnedAt: updatedTemplate.pinnedAt
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

// @route   GET /api/admin/notion-schema
// @desc    Get Notion database schema (property names)
// @access  Private (Admin only)
router.get('/notion-schema', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { database } = req.query; // 'templates' or 'creators'

    const { getNotionDatabaseSchema } = require('../services/notionService');

    let databaseId;
    if (database === 'templates') {
      databaseId = process.env.NOTION_TEMPLATES_DATABASE_ID;
    } else if (database === 'creators') {
      databaseId = process.env.NOTION_CREATORS_DATABASE_ID;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid database parameter. Use "templates" or "creators"'
      });
    }

    if (!databaseId) {
      return res.status(400).json({
        success: false,
        message: `Database ID not configured for ${database}`
      });
    }

    const schema = await getNotionDatabaseSchema(databaseId);

    res.json({
      success: true,
      database,
      databaseId,
      properties: schema,
      propertyNames: Object.keys(schema)
    });
  } catch (error) {
    console.error('Get Notion schema error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/admin/test-notion
// @desc    Test Notion integration (test sync)
// @access  Private (Admin only)
router.post('/test-notion', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { type } = req.body; // 'template' or 'creator'

    const { addTemplateToNotion, addCreatorToNotion, isNotionConfigured } = require('../services/notionService');

    if (!isNotionConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Notion API not configured. Please check NOTION_API_TOKEN and database IDs.',
        config: {
          hasToken: !!process.env.NOTION_API_TOKEN,
          hasTemplatesDb: !!process.env.NOTION_TEMPLATES_DATABASE_ID,
          hasCreatorsDb: !!process.env.NOTION_CREATORS_DATABASE_ID
        }
      });
    }

    if (type === 'template') {
      // Find a recent approved template to test
      const template = await Template.findOne({ status: 'approved' })
        .populate('creator', 'name username email displayName')
        .sort({ approvedAt: -1 })
        .limit(1)
        .lean();

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'No approved templates found to test with'
        });
      }

      console.log('🧪 Testing Notion template sync with:', template.title);
      console.log('🧪 Template data:', {
        id: template._id,
        title: template.title,
        hasCreator: !!template.creator,
        creatorName: template.creator?.name
      });

      const result = await addTemplateToNotion(template);

      if (result && result.id) {
        return res.json({
          success: true,
          message: 'Template synced to Notion successfully',
          notionPageId: result.id,
          template: template.title
        });
      } else if (result && result.error) {
        return res.status(500).json({
          success: false,
          message: 'Template sync to Notion failed',
          error: result.error,
          debug: {
            hasToken: !!process.env.NOTION_API_TOKEN,
            hasDatabaseId: !!process.env.NOTION_TEMPLATES_DATABASE_ID,
            templateTitle: template.title,
            templateId: template._id?.toString()
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Template sync to Notion returned null. Check your backend console logs for detailed error messages.',
          debug: {
            hasToken: !!process.env.NOTION_API_TOKEN,
            hasDatabaseId: !!process.env.NOTION_TEMPLATES_DATABASE_ID,
            templateTitle: template.title,
            templateId: template._id?.toString()
          }
        });
      }
    } else if (type === 'creator') {
      // Find a recent approved creator to test
      const creator = await User.findOne({
        creatorStatus: 'approved',
        role: 'creator'
      })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(1)
        .lean();

      if (!creator) {
        return res.status(404).json({
          success: false,
          message: 'No approved creators found to test with'
        });
      }

      console.log('🧪 Testing Notion creator sync with:', creator.name);
      const result = await addCreatorToNotion(creator);

      if (result && result.id) {
        return res.json({
          success: true,
          message: 'Creator synced to Notion successfully',
          notionPageId: result.id,
          creator: creator.name
        });
      } else if (result && result.error) {
        return res.status(500).json({
          success: false,
          message: 'Creator sync to Notion failed',
          error: result.error,
          debug: {
            hasToken: !!process.env.NOTION_API_TOKEN,
            hasDatabaseId: !!process.env.NOTION_CREATORS_DATABASE_ID,
            creatorName: creator.name,
            creatorId: creator._id?.toString()
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Creator sync to Notion returned null. Check your backend console logs for detailed error messages.',
          debug: {
            hasToken: !!process.env.NOTION_API_TOKEN,
            hasDatabaseId: !!process.env.NOTION_CREATORS_DATABASE_ID,
            creatorName: creator.name,
            creatorId: creator._id?.toString()
          }
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Use "template" or "creator"'
      });
    }
  } catch (error) {
    console.error('Test Notion error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
