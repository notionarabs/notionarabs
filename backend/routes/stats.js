const express = require('express');
const { cacheMiddleware } = require('../utils/redis-cache');
const supabase = require('../utils/supabase');

const router = express.Router();

// @route   GET /api/stats/homepage
// @desc    Get all homepage statistics via Supabase RPCs (zero in-memory aggregation)
// @access  Public
router.get('/homepage', cacheMiddleware(3600), async (req, res) => {
  try {
    // Fire both RPCs in parallel — all math happens inside PostgreSQL
    const [statsResult, creatorsResult] = await Promise.all([
      supabase.rpc('get_homepage_stats'),
      supabase.rpc('get_top_creators', { p_limit: 4 })
    ]);

    if (statsResult.error) throw statsResult.error;
    if (creatorsResult.error) throw creatorsResult.error;

    const stats = statsResult.data;
    let topCreators = creatorsResult.data || [];

    if (topCreators.length > 0) {
      const creatorIds = topCreators.map(c => c.id).filter(Boolean);
      if (creatorIds.length > 0) {
        const { data: templates } = await supabase
          .from('Template')
          .select('creatorId, status')
          .in('creatorId', creatorIds);

        if (templates) {
          const counts = {};
          templates.forEach(t => {
            if (!t.status || t.status.toUpperCase() === 'APPROVED') {
              counts[t.creatorId] = (counts[t.creatorId] || 0) + 1;
            }
          });
          topCreators = topCreators.map(c => ({
            ...c,
            templatesCount: counts[c.id] ?? c.templatesCount ?? 0
          }));
        }
      }
    }

    // Edge + CDN caching (1 hour fresh, 24 hours stale)
    res.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    res.json({
      success: true,
      stats: {
        templates:   stats.templates   || 0,
        creators:    stats.creators    || 0,
        downloads:   stats.downloads   || 0,
        users:       stats.users       || 645,
        specialties: stats.specialties || 0,
      },
      status: 'operational',
      topCreators
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
