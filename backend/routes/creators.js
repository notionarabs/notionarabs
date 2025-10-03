const express = require('express');
const User = require('../models/User');
const Template = require('../models/Template');
const auth = require('../middleware/auth');

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

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { specialties: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Add specialty filter
    if (specialty && specialty !== 'all') {
      query.specialties = { $in: [specialty] };
    }

    // Build sort object
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
        sort = { templateCount: -1 };
        break;
      case 'earnings':
        sort = { totalEarnings: -1 };
        break;
      default:
        sort = { followers: -1 };
    }

    const skip = (page - 1) * limit;

    // Get creators with pagination
    const creators = await User.find(query)
      .select('name username displayName email bio profilePicture specialties rating followers createdAt templateCount totalEarnings experience motivation')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

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
              averageRating: { $avg: '$rating' }
            }
          }
        ]);

        const stats = templateStats[0] || {
          totalTemplates: 0,
          totalDownloads: 0,
          averageRating: 0
        };

        return {
          ...creator,
          id: creator._id,
          username: creator.username || creator.email?.split('@')[0], // Use email username part as fallback
          displayName: creator.displayName || creator.name, // Use name as fallback for displayName
          templates: stats.totalTemplates,
          downloads: stats.totalDownloads,
          rating: stats.averageRating || creator.rating || 0,
          earnings: creator.totalEarnings || 0
        };
      })
    );

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      creators: creatorsWithStats,
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
      averageRating: 0,
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
            averageRating: { $avg: { $ifNull: ['$rating', 0] } },
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

      creatorStats = stats[0] || creatorStats;
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
        email: creator.showEmail ? creator.email : null, // Only include email if showEmail is true
        phone: creator.showPhone ? creator.phone : null, // Only include phone if showPhone is true
        bio: creator.bio,
        profilePicture: creator.profilePicture,
        backgroundImage: creator.backgroundImage, // Include background image
        socialLinks: creator.socialLinks || [],
        specialties: creator.specialties || [],
        rating: creatorStats.averageRating || creator.rating || 0,
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

module.exports = router;
