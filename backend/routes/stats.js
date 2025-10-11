const express = require('express');
const Template = require('../models/Template');
const User = require('../models/User');
const { cacheMiddleware } = require('../utils/redis-cache');

const router = express.Router();

// @route   GET /api/stats/homepage
// @desc    Get all homepage statistics in a single request
// @access  Public
router.get('/homepage', cacheMiddleware(600), async (req, res) => {
  try {
    const categoriesArabic = [
      'الإنتاجية',
      'الدراسة',
      'الأعمال',
      'الحياة الشخصية',
      'الإبداع',
      'التخطيط',
      'المراجعة',
      'التسويق'
    ];

    // Parallel execution of all queries
    const [
      totalTemplates,
      totalCreators,
      totalDownloads,
      categoryStats,
      topCreators
    ] = await Promise.all([
      // Total templates count
      Template.countDocuments({ status: 'approved' }),

      // Total creators count
      User.countDocuments({ role: 'creator', creatorStatus: 'approved' }),

      // Total downloads (sum all template downloads)
      Template.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }
      ]),

      // Category counts in parallel
      Promise.all(
        categoriesArabic.map(category =>
          Template.countDocuments({ status: 'approved', category })
            .then(count => ({ category, count }))
        )
      ),

      // Top creators with their stats
      User.aggregate([
        { $match: { role: 'creator', creatorStatus: 'approved' } },
        {
          $lookup: {
            from: 'templates',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$creator', '$$userId'] },
                  status: 'approved'
                }
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  totalDownloads: { $sum: '$downloads' },
                  avgRating: { $avg: '$rating' }
                }
              }
            ],
            as: 'templateStats'
          }
        },
        { $unwind: { path: '$templateStats', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            templatesCount: { $ifNull: ['$templateStats.count', 0] },
            templateCount: { $ifNull: ['$templateStats.count', 0] },
            totalDownloads: { $ifNull: ['$templateStats.totalDownloads', 0] },
            averageRating: { $ifNull: ['$templateStats.avgRating', 0] },
            followersCount: { $ifNull: ['$followers', 0] },
            // Calculate fame score
            fameScore: {
              $add: [
                { $multiply: [{ $ifNull: ['$followers', 0] }, 0.5] },
                { $multiply: [{ $ifNull: ['$templateStats.avgRating', 0] }, 10, 0.3] },
                { $multiply: [{ $min: [{ $ifNull: ['$templateStats.count', 0] }, 20] }, 0.2] }
              ]
            }
          }
        },
        // Remove the restrictive filter - just get all creators with at least some activity
        { $sort: { fameScore: -1, followers: -1 } },
        { $limit: 4 },
        {
          $project: {
            _id: 1,
            id: '$_id',
            name: 1,
            username: 1,
            displayName: 1,
            profilePicture: 1,
            bio: 1,
            experience: 1,
            motivation: 1,
            badges: 1,
            followers: 1,
            followersCount: 1,
            templatesCount: 1,
            templateCount: 1,
            averageRating: 1,
            totalDownloads: 1
          }
        }
      ])
    ]);

    // Count unique specialties (categories with at least 1 template)
    const specialtiesCount = categoryStats.filter(stat => stat.count > 0).length;

    // Format category stats
    const categoryTotals = {};
    categoryStats.forEach(({ category, count }) => {
      categoryTotals[category] = count;
    });

    res.json({
      success: true,
      stats: {
        templates: totalTemplates,
        creators: totalCreators,
        downloads: totalDownloads[0]?.totalDownloads || 0,
        specialties: specialtiesCount
      },
      categoryTotals,
      topCreators
    });
  } catch (error) {
    console.error('Get homepage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;

