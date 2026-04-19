const express = require('express');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Template = require('../models/Template');
const DownloadLog = require('../models/DownloadLog');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { cacheMiddleware, invalidateCache } = require('../utils/redis-cache');

const router = express.Router();

const ALLOWED_SORT_KEYS = new Set([
  'popular',
  'newest',
  'rating',
  'templates',
  'followers',
  'createdAt',
  'templatesCount'
]);

const getSortObject = (sortKey = 'popular', sortOrder = 'desc') => {
  const direction = sortOrder === 'asc' ? 'asc' : 'desc';

  const fieldMap = {
    popular: ['followers', 'rating', 'templatesCount'],
    newest: ['createdAt'],
    rating: ['rating', 'followers'],
    templates: ['templatesCount', 'followers']
  };

  const fields = fieldMap[sortKey] || [sortKey];

  const sort = fields.reduce((acc, field) => {
    if (typeof field === 'string' && /^[a-zA-Z0-9_]+$/.test(field)) {
      acc[field] = direction;
    }
    return acc;
  }, Object.create(null));

  if (Object.keys(sort).length === 0) {
    sort.followers = direction;
  }

  return sort;
};

// @route   GET /api/creators
// @desc    Get all approved creators with their stats
// @access  Public
router.get('/', cacheMiddleware(300), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search;
    const specialty = req.query.specialty;
    const rawSortBy = req.query.sortBy || 'popular';
    const sortBy = ALLOWED_SORT_KEYS.has(rawSortBy) ? rawSortBy : 'popular';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
    const sortObject = getSortObject(sortBy, sortOrder);

    const approvedCreatorIds = await Template.distinct('creator', { status: 'approved' });
    if (!approvedCreatorIds.length) {
      return res.json({
        success: true,
        creators: [],
        pagination: {
          current: page,
          pages: 0,
          total: 0,
          limit
        }
      });
    }

    // Build query for approved creators only
    const query = {
      creatorStatus: 'approved',
      isActive: true,
      isEmailVerified: true,
      _id: { $in: approvedCreatorIds }
    };

    // Add specialty filter
    if (specialty && specialty !== 'all') {
      query.specialties = { $in: [specialty] };
    }

    // Optimized: Use server-side search and pagination
    let creators;
    let totalCount;

    if (search && search.trim()) {
      // Server-side search using text index with regex fallback
      try {
        const searchQuery = {
          ...query,
          $text: { $search: search.trim() }
        };

        const sort = {
          score: { $meta: 'textScore' },
          ...sortObject
        };

        const skip = (page - 1) * limit;

        [creators, totalCount] = await Promise.all([
          User.find(searchQuery)
            .select('name username displayName email bio profilePicture specialties rating followers createdAt templatesCount totalEarnings experience motivation badges')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
          User.countDocuments(searchQuery)
        ]);
      } catch (textSearchError) {
        // Fallback to regex search if text search fails
        console.warn('Text search failed, falling back to regex search:', textSearchError.message);

        const searchQuery = {
          ...query,
          $or: [
            { name: { $regex: search.trim(), $options: 'i' } },
            { username: { $regex: search.trim(), $options: 'i' } },
            { displayName: { $regex: search.trim(), $options: 'i' } },
            { bio: { $regex: search.trim(), $options: 'i' } },
            { specialties: { $in: [new RegExp(search.trim(), 'i')] } }
          ]
        };

        const sort = { ...sortObject };
        const skip = (page - 1) * limit;

        [creators, totalCount] = await Promise.all([
          User.find(searchQuery)
            .select('name username displayName email bio profilePicture specialties rating followers createdAt templatesCount totalEarnings experience motivation badges')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
          User.countDocuments(searchQuery)
        ]);
      }
    } else {
      // Regular pagination without search
      const sort = { ...sortObject };

      const skip = (page - 1) * limit;

      [creators, totalCount] = await Promise.all([
        User.find(query)
          .select('name username displayName email bio profilePicture specialties rating followers createdAt templatesCount totalEarnings experience motivation badges')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(query)
      ]);
    }

    // Optimized: Get template stats for all creators in one aggregation
    const creatorIds = creators.map(c => c._id);
    const templateStatsMap = new Map();

    if (creatorIds.length > 0) {
      const templateStats = await Template.aggregate([
        { $match: { creator: { $in: creatorIds }, status: 'approved' } },
        {
          $group: {
            _id: '$creator',
            totalTemplates: { $sum: 1 },
            totalDownloads: { $sum: { $ifNull: ['$downloads', 0] } },
            templateRatings: { $push: { $ifNull: ['$rating', 0] } }
          }
        }
      ]);

      // Create a map for O(1) lookup
      templateStats.forEach(stat => {
        // Calculate average rating from template ratings
        let averageRating = 0;
        if (stat.templateRatings && stat.templateRatings.length > 0) {
          const validRatings = stat.templateRatings.filter(rating => rating && rating > 0);
          if (validRatings.length > 0) {
            averageRating = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
          }
        }

        templateStatsMap.set(stat._id.toString(), {
          totalTemplates: stat.totalTemplates,
          totalDownloads: stat.totalDownloads,
          medianRating: averageRating
        });
      });
    }

    let creatorsWithStats = creators.map(creator => {
      const stats = templateStatsMap.get(creator._id.toString()) || {
        totalTemplates: 0,
        totalDownloads: 0,
        medianRating: 0
      };

      return {
        ...creator,
        id: creator._id,
        username: creator.username || creator.email?.split('@')[0],
        displayName: creator.displayName || creator.name,
        templates: stats.totalTemplates,
        templatesCount: stats.totalTemplates ?? creator.templatesCount ?? 0,
        downloads: stats.totalDownloads,
        rating: stats.medianRating || creator.rating || 0,
        earnings: creator.totalEarnings || 0,
        badges: creator.badges || []
      };
    });

    const resolvedSortOrder = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'templates') {
      creatorsWithStats = creatorsWithStats.sort((a, b) => {
        const primaryDiff = (a.templates || 0) - (b.templates || 0);
        if (primaryDiff !== 0) {
          return resolvedSortOrder * primaryDiff;
        }
        const secondaryDiff = (a.followers || 0) - (b.followers || 0);
        return resolvedSortOrder * secondaryDiff;
      });
    } else if (sortBy === 'rating') {
      creatorsWithStats = creatorsWithStats.sort((a, b) => {
        const primaryDiff = (a.rating || 0) - (b.rating || 0);
        if (primaryDiff !== 0) {
          return resolvedSortOrder * primaryDiff;
        }
        const secondaryDiff = (a.followers || 0) - (b.followers || 0);
        return resolvedSortOrder * secondaryDiff;
      });
    }

    // Creators are already sorted and paginated by the database query
    res.json({
      success: true,
      creators: creatorsWithStats,
      pagination: {
        current: page,
        pages: Math.ceil(totalCount / limit),
        total: totalCount,
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
router.get('/:id', cacheMiddleware(600), async (req, res) => {

  try {
    const { id } = req.params;

    // Check if id is a valid ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

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

    const hasApprovedTemplates = await Template.exists({
      creator: creator._id,
      status: 'approved'
    });

    if (!hasApprovedTemplates) {
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

    // Get creator's templates and stats in parallel for better performance
    let templates = [];
    let creatorStats = {
      totalTemplates: 0,
      totalDownloads: 0,
      medianRating: 0,
      totalRevenue: 0
    };

    try {
      // Execute templates and stats queries in parallel
      const [templatesResult, statsResult] = await Promise.allSettled([
        Template.find({
          creator: creator._id,
          status: 'approved'
        })
          .select('title price rating downloads category coverImage isPaid purchaseLink')
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
        
        Template.aggregate([
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
        ])
      ]);

      // Process templates result
      if (templatesResult.status === 'fulfilled') {
        templates = templatesResult.value;
      }

      // Process stats result
      if (statsResult.status === 'fulfilled') {
        const rawStats = statsResult.value[0] || {};

        // Calculate average rating from template ratings
        let averageRating = 0;
        if (rawStats.templateRatings && rawStats.templateRatings.length > 0) {
          // Filter out null/undefined ratings
          const validRatings = rawStats.templateRatings.filter(rating => rating && rating > 0);

          if (validRatings.length > 0) {
            averageRating = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
          }
        }

        creatorStats = {
          totalTemplates: rawStats.totalTemplates || 0,
          totalDownloads: rawStats.totalDownloads || 0,
          medianRating: averageRating,
          totalRevenue: rawStats.totalRevenue || 0
        };
      }
    } catch (error) {
      console.error('Error fetching templates and stats:', error);
      // Continue with default values if there's an error
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
        templatesCount: creator.showTemplateCount !== false ? (creatorStats.totalTemplates || creator.templatesCount || 0) : null, // Only show if allowed
        joinDate: creator.showJoinDate ? creator.createdAt : null, // Only include join date if showJoinDate is true
        createdAt: creator.createdAt, // Always include for internal use
        allowMessages: creator.allowMessages !== false, // Default to true if not set
        showEmail: creator.showEmail,
        showPhone: creator.showPhone,
        showTemplateCount: creator.showTemplateCount !== false,
        showJoinDate: creator.showJoinDate !== false,
        description: creator.bio,
        badges: creator.badges || [],
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

      // Invalidate cache for creators
      await invalidateCache('creators');

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

      // Invalidate cache for creators
      await invalidateCache('creators');

      // Notify creator about new follower (non-blocking)
      try {
        const followerName = req.user.displayName || req.user.name || 'مستخدم';
        // Build a username-like fallback if username is missing
        const emailUser = (req.user.email && req.user.email.includes('@')) ? req.user.email.split('@')[0] : null;
        const nameSlug = (req.user.displayName || req.user.name || '').trim().replace(/\s+/g, '-');
        const followerUsername = req.user.username || emailUser || nameSlug || req.user._id;

        // Compute recipient (creator) username for linking to their page
        const creatorUser = creator; // already fetched above
        const creatorEmailUser = (creatorUser?.email && creatorUser.email.includes('@')) ? creatorUser.email.split('@')[0] : null;
        const creatorNameSlug = (creatorUser?.displayName || creatorUser?.name || '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase();
        const creatorUsername = creatorUser?.username || creatorEmailUser || creatorNameSlug || creatorId;

        await Notification.create({
          user: creatorId,
          type: 'creator_followed',
          title: 'متابع جديد',
          message: `${followerName} قام بمتابعتك`,
          link: `/creators/${creatorUsername}`,
          metadata: { followerId: req.user._id, followerUsername, actorProfilePicture: req.user.profilePicture || '' }
        });
      } catch (notifyErr) {
        console.error('Create follow notification error:', notifyErr?.message || notifyErr);
      }

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
    if (req.user.creatorStatus !== 'approved' || req.user.role !== 'creator') {
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
    if (req.user.creatorStatus !== 'approved' || req.user.role !== 'creator') {
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
