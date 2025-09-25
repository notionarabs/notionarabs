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
      .select('name bio profilePicture specialties rating followers createdAt templateCount totalEarnings')
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
    const creator = await User.findOne({
      _id: req.params.id,
      creatorStatus: 'approved',
      isActive: true,
      isEmailVerified: true
    }).select('-password -emailVerificationToken -resetToken');

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'المبدع غير موجود'
      });
    }

    // Get creator's templates
    const templates = await Template.find({
      creator: creator._id,
      status: 'approved'
    })
      .select('title price rating downloads category coverImage')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Get detailed stats
    const stats = await Template.aggregate([
      { $match: { creator: creator._id, status: 'approved' } },
      {
        $group: {
          _id: null,
          totalTemplates: { $sum: 1 },
          totalDownloads: { $sum: '$downloads' },
          averageRating: { $avg: '$rating' },
          totalRevenue: { $sum: { $multiply: ['$price', '$downloads'] } }
        }
      }
    ]);

    const creatorStats = stats[0] || {
      totalTemplates: 0,
      totalDownloads: 0,
      averageRating: 0,
      totalRevenue: 0
    };

    res.json({
      success: true,
      creator: {
        id: creator._id,
        name: creator.name,
        bio: creator.bio,
        profilePicture: creator.profilePicture,
        specialties: creator.specialties || [],
        rating: creatorStats.averageRating || creator.rating || 0,
        followers: creator.followers || 0,
        joinDate: creator.createdAt,
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

module.exports = router;
