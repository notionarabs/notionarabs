const express = require('express');
const User = require('../models/User');
const Template = require('../models/Template');
const DownloadLog = require('../models/DownloadLog');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Fuse = require('fuse.js');

const router = express.Router();


// @route   GET /api/creators
// @desc    Get all approved creators with their stats
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search;
    const specialty = req.query.specialty;
    const sortBy = req.query.sortBy || 'popular';

    // Build query for approved creators only
    const query = {
      creatorStatus: 'approved',
      isActive: true,
      isEmailVerified: true
    };

    // Add specialty filter
    if (specialty && specialty !== 'all') {
      query.specialties = { $in: [specialty] };
    }

    // Get all creators first (for Fuse.js search)
    let creators = await User.find(query)
      .select('name username displayName email bio profilePicture specialties rating followers createdAt templateCount totalEarnings experience motivation')
      .lean();

    // Apply Fuse.js search if search term is provided
    if (search && search.trim()) {
      const fuseOptions = {
        keys: [
          { name: 'name', weight: 0.4 },
          { name: 'username', weight: 0.3 },
          { name: 'displayName', weight: 0.3 },
          { name: 'bio', weight: 0.2 },
          { name: 'specialties', weight: 0.2 },
          { name: 'experience', weight: 0.1 },
          { name: 'motivation', weight: 0.1 }
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

      const fuse = new Fuse(creators, fuseOptions);
      const searchResults = fuse.search(search.trim().toLowerCase());

      // Extract the items from Fuse results
      creators = searchResults.map(result => result.item);
    }

    // Get template counts for each creator
    const creatorsWithStats = await Promise.all(
      creators.map(async (creator) => {
        const templateStats = await Template.aggregate([
          { $match: { creator: creator._id, status: 'approved' } },
          {
            $group: {
              _id: null,
              totalTemplates: { $sum: 1 },
              totalDownloads: { $sum: '$downloads' },
              templateRatings: { $push: '$rating' }
            }
          }
        ]);

        const stats = templateStats[0] || {
          totalTemplates: 0,
          totalDownloads: 0,
          templateRatings: []
        };

        // Calculate median rating from template ratings
        let medianRating = 0;
        if (stats.templateRatings && stats.templateRatings.length > 0) {
          // Filter out null/undefined ratings and sort
          const validRatings = stats.templateRatings.filter(rating => rating && rating > 0).sort((a, b) => a - b);

          if (validRatings.length > 0) {
            const mid = Math.floor(validRatings.length / 2);
            if (validRatings.length % 2 === 0) {
              // Even number of ratings - average of two middle values
              medianRating = (validRatings[mid - 1] + validRatings[mid]) / 2;
            } else {
              // Odd number of ratings - middle value
              medianRating = validRatings[mid];
            }
          }
        }

        return {
          ...creator,
          id: creator._id,
          username: creator.username || creator.email?.split('@')[0], // Use email username part as fallback
          displayName: creator.displayName || creator.name, // Use name as fallback for displayName
          templates: stats.totalTemplates,
          downloads: stats.totalDownloads,
          rating: medianRating || creator.rating || 0,
          earnings: creator.totalEarnings || 0
        };
      })
    );

    // Apply sorting
    let sort = {};
    switch (sortBy) {
      case 'popular':
        sort = { followers: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'templates':
        sort = { templates: -1 };
        break;
      case 'earnings':
        sort = { earnings: -1 };
        break;
      default:
        sort = { followers: -1 };
    }

    // Sort the creators array
    creatorsWithStats.sort((a, b) => {
      const aValue = a[sortBy] || a.followers;
      const bValue = b[sortBy] || b.followers;

      if (sortBy === 'followers' || sortBy === 'rating' || sortBy === 'templates' || sortBy === 'earnings') {
        return bValue - aValue; // Descending order
      } else {
        return new Date(bValue) - new Date(aValue); // For dates, descending order
      }
    });

    // Apply pagination
    const total = creatorsWithStats.length;
    const skip = (page - 1) * limit;
    const paginatedCreators = creatorsWithStats.slice(skip, skip + limit);

    res.json({
      success: true,
      creators: paginatedCreators,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get creators error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/creators/:id
// @desc    Get single creator by ID with detailed stats
// @access  Public
router.get('/:id', async (req, res) => {

  try {
    const { id } = req.params;

    // Check if id is a valid ObjectId
    const mongoose = require('mongoose');
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

    let creator = null;

    if (isValidObjectId) {
      // Try to find by ID first
      creator = await User.findOne({
        _id: id,
        creatorStatus: 'approved',
        isActive: true,
        isEmailVerified: true
      }).select('-password -emailVerificationToken -resetToken');
    }

    // If not found by ID or id is not a valid ObjectId, try by username, name, displayName, or email username part
    if (!creator) {
      creator = await User.findOne({
        $or: [
          { username: id.toLowerCase() },
          { name: id },
          { displayName: id },
          { email: id.toLowerCase() + '@' }, // Search for email starting with the id
          { email: { $regex: `^${id.toLowerCase()}@`, $options: 'i' } } // More precise email username search
        ],
        creatorStatus: 'approved',
        isActive: true,
        isEmailVerified: true
      }).select('-password -emailVerificationToken -resetToken');
    }

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'المبدع غير موجود'
      });
    }

    // Check profile visibility
    if (creator.profileVisibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'هذا الملف الشخصي خاص'
      });
    }

    // Get creator's templates
    let templates = [];
    try {
      templates = await Template.find({
        creator: creator._id,
        status: 'approved'
      })
        .select('title price rating downloads category coverImage')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
    } catch (templateError) {
      console.error('Error fetching templates:', templateError);
      // Continue without templates if there's an error
    }

    // Get detailed stats
    let creatorStats = {
      totalTemplates: 0,
      totalDownloads: 0,
      medianRating: 0,
      totalRevenue: 0
    };

    try {
      const stats = await Template.aggregate([
        { $match: { creator: creator._id, status: 'approved' } },
        {
          $group: {
            _id: null,
            totalTemplates: { $sum: 1 },
            totalDownloads: { $sum: { $ifNull: ['$downloads', 0] } },
            templateRatings: { $push: { $ifNull: ['$rating', 0] } },
            totalRevenue: {
              $sum: {
                $multiply: [
                  { $ifNull: ['$price', 0] },
                  { $ifNull: ['$downloads', 0] }
                ]
              }
            }
          }
        }
      ]);

      const rawStats = stats[0] || {};

      // Calculate median rating from template ratings
      let medianRating = 0;
      if (rawStats.templateRatings && rawStats.templateRatings.length > 0) {
        // Filter out null/undefined ratings and sort
        const validRatings = rawStats.templateRatings.filter(rating => rating && rating > 0).sort((a, b) => a - b);

        if (validRatings.length > 0) {
          const mid = Math.floor(validRatings.length / 2);
          if (validRatings.length % 2 === 0) {
            // Even number of ratings - average of two middle values
            medianRating = (validRatings[mid - 1] + validRatings[mid]) / 2;
          } else {
            // Odd number of ratings - middle value
            medianRating = validRatings[mid];
          }
        }
      }

      creatorStats = {
        totalTemplates: rawStats.totalTemplates || 0,
        totalDownloads: rawStats.totalDownloads || 0,
        medianRating: medianRating,
        totalRevenue: rawStats.totalRevenue || 0
      };
    } catch (statsError) {
      console.error('Error fetching creator stats:', statsError);
      // Use default stats if there's an error
    }

    res.json({
      success: true,
      creator: {
        id: creator._id,
        name: creator.name,
        username: creator.username || creator.email?.split('@')[0], // Use email username part as fallback
        displayName: creator.displayName || creator.name, // Use name as fallback for displayName
        email: creator.contactEmail || creator.email, // Use contactEmail if available, fallback to regular email
        showEmail: creator.showEmail, // Include showEmail setting for display purposes
        phone: creator.showPhone ? creator.phone : null, // Only include phone if showPhone is true
        bio: creator.bio,
        profilePicture: creator.profilePicture,
        backgroundImage: creator.backgroundImage, // Include background image
        socialLinks: creator.socialLinks || [],
        specialties: creator.specialties || [],
        rating: creatorStats.medianRating || creator.rating || 0,
        followers: creator.followers || 0,
        templateCount: creator.showTemplateCount !== false ? (creatorStats.totalTemplates || creator.templateCount || 0) : null, // Only show if allowed
        joinDate: creator.showJoinDate ? creator.createdAt : null, // Only include join date if showJoinDate is true
        createdAt: creator.createdAt, // Always include for internal use
        allowMessages: creator.allowMessages !== false, // Default to true if not set
        showEmail: creator.showEmail,
        showPhone: creator.showPhone,
        showTemplateCount: creator.showTemplateCount !== false,
        showJoinDate: creator.showJoinDate !== false,
        description: creator.bio,
        stats: {
          totalDownloads: creatorStats.totalDownloads,
          averageRating: creatorStats.averageRating || 0,
          responseTime: 'ساعتين', // Default value
          completionRate: '98%' // Default value
        },
        templates: templates
      }
    });


  } catch (error) {
    console.error('Get creator error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/creators/:id/follow-status
// @desc    Check if current user is following a creator
// @access  Private
router.get('/:id/follow-status', auth, async (req, res) => {
  try {
    const creatorId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isFollowing = user.following && user.following.includes(creatorId);

    res.json({
      success: true,
      isFollowing: !!isFollowing
    });

  } catch (error) {
    console.error('Follow status check error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/creators/:id/follow
// @desc    Follow/Unfollow a creator
// @access  Private
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const creatorId = req.params.id;
    const userId = req.user._id;

    // Can't follow yourself
    if (creatorId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك متابعة نفسك'
      });
    }

    const creator = await User.findById(creatorId);
    if (!creator || creator.creatorStatus !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'المبدع غير موجود'
      });
    }

    // Check if user is already following
    const user = await User.findById(userId);
    const isFollowing = user.following && user.following.includes(creatorId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(userId, {
        $pull: { following: creatorId }
      });
      await User.findByIdAndUpdate(creatorId, {
        $inc: { followers: -1 }
      });

      res.json({
        success: true,
        message: 'تم إلغاء المتابعة',
        isFollowing: false
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(userId, {
        $addToSet: { following: creatorId }
      });
      await User.findByIdAndUpdate(creatorId, {
        $inc: { followers: 1 }
      });

      res.json({
        success: true,
        message: 'تم المتابعة بنجاح',
        isFollowing: true
      });
    }

  } catch (error) {
    console.error('Follow/Unfollow error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});


// @route   GET /api/creators/stats/specialties
// @desc    Get count of unique specialties
// @access  Public
router.get('/stats/specialties', async (req, res) => {
  try {
    // Get all unique specialties from approved creators
    const specialties = await User.aggregate([
      {
        $match: {
          creatorStatus: 'approved',
          isActive: true,
          isEmailVerified: true,
          specialties: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$specialties'
      },
      {
        $group: {
          _id: '$specialties'
        }
      },
      {
        $count: 'total'
      }
    ]);

    const count = specialties.length > 0 ? specialties[0].total : 0;

    res.json({
      success: true,
      count
    });

  } catch (error) {
    console.error('Get specialties count error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/creators/stats/downloads
// @desc    Get total template downloads count
// @access  Public
router.get('/stats/downloads', async (req, res) => {
  try {
    // Get total downloads from all approved templates
    const downloads = await Template.aggregate([
      {
        $match: {
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$downloads' }
        }
      }
    ]);

    const count = downloads.length > 0 ? downloads[0].total : 0;

    res.json({
      success: true,
      count
    });

  } catch (error) {
    console.error('Get downloads count error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/creators/me/downloads
// @desc    List downloads for current creator's templates
// @access  Private (Creator)
router.get('/me/downloads', auth, async (req, res) => {
  try {
    if (req.user.creatorStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'يجب أن تكون مبدعاً معتمداً' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const templateId = req.query.templateId;

    const filter = { creator: req.user._id };
    if (templateId) {
      filter.template = templateId;
    }

    const [rows, total] = await Promise.all([
      DownloadLog.find(filter)
        .populate('user', 'name email username')
        .populate('template', 'title previewImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DownloadLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      downloads: rows.map((r) => ({
        id: r._id,
        templateId: r.template?._id || r.template,
        templateTitle: r.template?.title || r.templateTitleSnapshot,
        previewImage: r.template?.previewImage || null,
        userId: r.user?._id || r.user,
        userName: r.user?.name || null,
        userEmail: r.user?.email || r.userEmailSnapshot || null,
        userUsername: r.user?.username || null,
        userAgent: r.userAgent || null,
        referrer: r.referrer || null,
        date: r.createdAt
      })),
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Creator downloads list error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// @route   GET /api/creators/me/downloads/export
// @desc    Export creator download logs as CSV
// @access  Private (Creator)
router.get('/me/downloads/export', auth, async (req, res) => {
  try {
    if (req.user.creatorStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'يجب أن تكون مبدعاً معتمداً' });
    }

    const templateId = req.query.templateId;
    const filter = { creator: req.user._id };
    if (templateId) {
      filter.template = templateId;
    }

    const rows = await DownloadLog.find(filter)
      .populate('user', 'name email username')
      .populate('template', 'title')
      .sort({ createdAt: -1 })
      .lean();

    const header = 'اسم المستخدم,البريد الإلكتروني,القالب,معرّف القالب,التاريخ\n';
    const csvRows = rows.map((r) => {
      const name = (r.user?.name || '').replace(/"/g, '""');
      const email = (r.user?.email || r.userEmailSnapshot || '').replace(/"/g, '""');
      const templateTitle = (r.template?.title || r.templateTitleSnapshot || '').replace(/"/g, '""');
      const templateIdStr = (r.template?._id?.toString?.() || r.template?.toString?.() || '').replace(/"/g, '""');
      const date = new Date(r.createdAt).toISOString();
      return `"${name}","${email}","${templateTitle}","${templateIdStr}","${date}"`;
    }).join('\n');

    const csv = header + csvRows;

    const creatorUser = await User.findById(req.user._id).select('username email');
    const baseName = creatorUser?.username || (creatorUser?.email ? creatorUser.email.split('@')[0] : 'creator');
    const filename = `${baseName}-downloads-${new Date().toISOString().split('T')[0]}.csv`;
    if (!res.headersSent) {
      res.set('Content-Type', 'text/csv; charset=utf-8');
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(`\uFEFF${csv}`);
    }
  } catch (error) {
    console.error('Creator downloads export error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'خطأ في تصدير البيانات' });
    }
  }
});

// @route   GET /api/creators/me/downloads/export-public?token=JWT
// @desc    Export creator download logs as CSV using token in query (for direct browser download)
// @access  Public (valid token required)
router.get('/me/downloads/export-public', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(401).json({ success: false, message: 'مصادقة مطلوبة' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (e) {
      return res.status(401).json({ success: false, message: 'رمز غير صالح' });
    }

    // Support tokens that use different claim names for the user id
    const requesterId = decoded.id || decoded.userId || decoded._id;
    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'رمز غير صالح' });
    }

    // Mimic creator-only access
    const user = await User.findById(requesterId).select('creatorStatus');
    if (!user || user.creatorStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'يجب أن تكون مبدعاً معتمداً' });
    }

    const templateId = req.query.templateId;
    const filter = { creator: requesterId };
    if (templateId) filter.template = templateId;

    const rows = await DownloadLog.find(filter)
      .populate('user', 'name email username')
      .populate('template', 'title')
      .sort({ createdAt: -1 })
      .lean();

    const header = 'اسم المستخدم,البريد الإلكتروني,القالب,معرّف القالب,التاريخ\n';
    const csvRows = rows.map((r) => {
      const name = (r.user?.name || '').replace(/"/g, '""');
      const email = (r.user?.email || r.userEmailSnapshot || '').replace(/"/g, '""');
      const templateTitle = (r.template?.title || r.templateTitleSnapshot || '').replace(/"/g, '""');
      const templateIdStr = (r.template?._id?.toString?.() || r.template?.toString?.() || '').replace(/"/g, '""');
      const date = new Date(r.createdAt).toISOString();
      return `"${name}","${email}","${templateTitle}","${templateIdStr}","${date}"`;
    }).join('\n');

    const csv = header + csvRows;
    const creatorUser = await User.findById(requesterId).select('username email');
    const baseName = creatorUser?.username || (creatorUser?.email ? creatorUser.email.split('@')[0] : 'creator');
    const filename = `${baseName}-downloads-${new Date().toISOString().split('T')[0]}.csv`;
    if (!res.headersSent) {
      res.set('Content-Type', 'text/csv; charset=utf-8');
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(`\uFEFF${csv}`);
    }
  } catch (error) {
    console.error('Creator downloads export-public error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'خطأ في تصدير البيانات' });
    }
  }
});

module.exports = router;
