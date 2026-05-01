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
    // Parallel execution of all queries
    const [
      totalTemplates,
      totalCreatorsResult,
      totalDownloads,
      categoryStats,
      topCreatorsResult,
      totalUsers
    ] = await Promise.all([
      // Total templates count
      Template.countDocuments({ status: 'approved' }),

      // Total creators count (approved creators with at least one template)
      User.aggregate([
        {
          $match: {
            role: 'creator',
            creatorStatus: 'approved',
            isActive: true,
            isEmailVerified: true
          }
        },
        { $count: 'total' }
      ]),

      // Total downloads (sum all template downloads)
      Template.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }
      ]),

      // Get ALL categories with their counts using aggregation
      Template.aggregate([
        { $match: { status: 'approved' } },
        {
          $project: {
            allCategories: { $ifNull: ['$categories', []] }
          }
        },
        { $unwind: '$allCategories' },
        { $group: { _id: '$allCategories', count: { $sum: 1 } } },
        { $project: { category: '$_id', count: 1, _id: 0 } }
      ]),

      // Top creators with their stats (prioritizing pinned creators)
      User.aggregate([
        {
          $match: {
            role: 'creator',
            creatorStatus: 'approved',
            isActive: true,
            isEmailVerified: true
          }
        },
        {
          $addFields: {
            fameScore: 1 // Trigger Special Case 2 in User.js which calculates everything efficiently
          }
        },
        { $limit: 4 }
      ]),
      
      // Total users count
      User.countDocuments({ isActive: true, isEmailVerified: true })
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
        creators: totalCreatorsResult[0]?.total || 0,
        downloads: totalDownloads[0]?.totalDownloads || 0,
        users: totalUsers || 0,
        specialties: specialtiesCount
      },
      status: 'operational',
      categoryTotals,
      topCreators: topCreatorsResult
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

