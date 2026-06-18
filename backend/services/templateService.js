const Template = require('../models/Template');
const { invalidateCache } = require('../utils/redis-cache');

/**
 * Check for expired paid boosts and unpin them.
 * Called at the start of GET /api/templates to keep boost state fresh
 * without a dedicated cron job.
 */
async function checkAndExpireBoosts() {
  try {
    const pinnedTemplates = await Template.find({ isPinned: true });
    const now = new Date();
    let hasChanges = false;

    for (const t of pinnedTemplates) {
      if (t.pinnedById && t.pinnedById.startsWith('boost_')) {
        const durationDays = parseInt(t.pinnedById.split('_')[1], 10);
        if (durationDays) {
          const expiryDate = new Date(new Date(t.pinnedAt).getTime() + durationDays * 24 * 60 * 60 * 1000);
          if (now > expiryDate) {
            await Template.findByIdAndUpdate(t.id || t._id, {
              isPinned: false,
              pinnedAt: null,
              pinnedById: null
            });
            hasChanges = true;
            console.log(`ℹ️ Boost expired for template ${t.id || t._id}, successfully unpinned.`);
          }
        }
      }
    }

    if (hasChanges) {
      try {
        await invalidateCache('template');
      } catch (cacheErr) {
        console.warn('Non-critical cache invalidation error:', cacheErr.message);
      }
    }
  } catch (error) {
    console.error('Error in checkAndExpireBoosts:', error);
  }
}

/**
 * Optimized paginated query for template listings without full-text search.
 * Applies pinning priority, filters, and sorting in a single DB pass.
 */
async function handleOptimizedPagination(req, res, options) {
  const { category, creator, isPinned, sortBy, sortOrder, page, limit, isPaid, minRating, language, ids } = options;

  const filter = { status: 'approved' };

  if (ids) {
    const idArray = ids.split(',').map(id => id.trim()).filter(id => id);
    if (idArray.length > 0) {
      filter.id = { $in: idArray };
    } else {
      return res.json({
        success: true,
        templates: [],
        pagination: {
          current: parseInt(page),
          pages: 0,
          total: 0,
          limit: parseInt(limit)
        }
      });
    }
  }

  if (category && category !== 'all') filter.categories = category;
  if (creator) filter.creator = creator;

  if (language && language !== 'all') {
    if (language === 'en') filter.language = { $in: ['en', 'ar-en'] };
    else if (language === 'ar') filter.language = { $in: ['ar', 'ar-en', 'ar-fr'] };
    else if (language === 'fr') filter.language = { $in: ['fr', 'ar-fr'] };
    else filter.language = language;
  }

  if (isPinned === 'true') filter.isPinned = true;
  else if (isPinned === 'false') filter.isPinned = false;

  if (isPaid === 'true') filter.isPaid = true;
  else if (isPaid === 'false') filter.isPaid = false;

  if (minRating) filter.rating = { $gte: Number(minRating) };

  const sort = { isPinned: -1, pinnedAt: -1 };
  const sortFieldMap = { newest: 'createdAt', popular: 'downloads', rating: 'rating' };
  const actualSortBy = sortFieldMap[sortBy] || sortBy;
  sort[actualSortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [templates, totalCount] = await Promise.all([
    Template.find(filter)
      .select('title description categories tags creator previewImage slug rating reviewsCount downloads views isPaid price purchaseLink isPinned pinnedAt pinnedById')
      .populate('creator', 'name username displayName profilePicture badges')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Template.countDocuments(filter)
  ]);

  res.json({
    success: true,
    templates,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(totalCount / parseInt(limit)),
      total: totalCount,
      limit: parseInt(limit)
    }
  });
}

module.exports = { checkAndExpireBoosts, handleOptimizedPagination };
