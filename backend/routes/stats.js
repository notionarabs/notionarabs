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
    // Get all approved template data in ONE query to minimize round-trips
    const { data: templates, error: templateError } = await require('../utils/supabase')
      .from('Template')
      .select('downloads, categories')
      .eq('status', 'APPROVED');
      
    if (templateError) throw templateError;

    const totalTemplates = templates.length;
    let totalDownloads = 0;
    const categoryCounts = {};
    
    templates.forEach(t => {
      totalDownloads += (t.downloads || 0);
      if (t.categories && Array.isArray(t.categories)) {
        t.categories.forEach(cat => {
          if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      }
    });

    const categoryStats = Object.keys(categoryCounts).map(cat => ({
      category: cat,
      count: categoryCounts[cat]
    }));

    const [
      totalCreatorsResult,
      topCreatorsResult,
      totalUsers
    ] = await Promise.all([
      // Total creators count (approved creators)
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
        downloads: totalDownloads || 0,
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
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

