const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Template = require('../models/Template');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
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

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

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

    res.json({
      success: true,
      stats: {
        totalUsers,
        googleUsers,
        regularUsers,
        activeUsers,
        googleUsersPercentage: Math.round((googleUsers / totalUsers) * 100)
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

    const user = await User.findByIdAndUpdate(
      userId,
      { creatorStatus: status },
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
      .populate('creator', 'name email profilePicture')
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
      await template.approve(req.user.id, adminNotes);
    } else {
      await template.reject(req.user.id, adminNotes);
    }

    await template.populate('creator', 'name email profilePicture');

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

module.exports = router;
