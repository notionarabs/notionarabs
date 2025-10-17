/**
 * Query optimization utilities for database performance
 */

/**
 * Optimized aggregation pipeline for creator stats
 */
const getCreatorStatsOptimized = async (creatorIds) => {
  const Template = require('../models/Template');

  if (!creatorIds || creatorIds.length === 0) {
    return new Map();
  }

  const templateStats = await Template.aggregate([
    { $match: { creator: { $in: creatorIds }, status: 'approved' } },
    {
      $group: {
        _id: '$creator',
        totalTemplates: { $sum: 1 },
        totalDownloads: { $sum: { $ifNull: ['$downloads', 0] } },
        templateRatings: { $push: { $ifNull: ['$rating', 0] } },
        totalViews: { $sum: { $ifNull: ['$views', 0] } }
      }
    }
  ]);

  const statsMap = new Map();

  templateStats.forEach(stat => {
    const ratings = stat.templateRatings.filter(r => r > 0);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    statsMap.set(stat._id.toString(), {
      totalTemplates: stat.totalTemplates,
      totalDownloads: stat.totalDownloads,
      medianRating: averageRating,
      totalViews: stat.totalViews
    });
  });

  return statsMap;
};

/**
 * Optimized aggregation pipeline for blog ratings
 */
const getBlogRatingsOptimized = async (blogIds) => {
  const Rating = require('../models/Rating');

  if (!blogIds || blogIds.length === 0) {
    return new Map();
  }

  const ratings = await Rating.aggregate([
    { $match: { targetType: 'blog', targetId: { $in: blogIds } } },
    {
      $group: {
        _id: '$targetId',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  const ratingsMap = new Map();

  ratings.forEach(rating => {
    ratingsMap.set(rating._id.toString(), {
      rating: rating.averageRating || 0,
      totalRatings: rating.totalRatings || 0,
      ratingDistribution: rating.ratingDistribution
    });
  });

  return ratingsMap;
};

/**
 * Optimized aggregation pipeline for template ratings
 */
const getTemplateRatingsOptimized = async (templateIds) => {
  const Rating = require('../models/Rating');

  if (!templateIds || templateIds.length === 0) {
    return new Map();
  }

  const ratings = await Rating.aggregate([
    { $match: { targetType: 'template', targetId: { $in: templateIds } } },
    {
      $group: {
        _id: '$targetId',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  const ratingsMap = new Map();

  ratings.forEach(rating => {
    ratingsMap.set(rating._id.toString(), {
      rating: rating.averageRating || 0,
      totalRatings: rating.totalRatings || 0,
      ratingDistribution: rating.ratingDistribution
    });
  });

  return ratingsMap;
};

/**
 * Optimized search with text indexing
 */
const getTextSearchOptimized = async (Model, searchQuery, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    additionalFilters = {}
  } = options;

  const skip = (page - 1) * limit;

  // Build search query
  const query = {
    ...additionalFilters,
    $text: { $search: searchQuery }
  };

  // Build sort object
  const sort = {
    score: { $meta: 'textScore' },
    [sortBy]: sortOrder === 'desc' ? -1 : 1
  };

  const [results, totalCount] = await Promise.all([
    Model.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Model.countDocuments(query)
  ]);

  return {
    results,
    pagination: {
      current: page,
      pages: Math.ceil(totalCount / limit),
      total: totalCount,
      limit: limit
    }
  };
};

/**
 * Optimized pagination with lean queries
 */
const getPaginatedResults = async (Model, query, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    select = '',
    populate = ''
  } = options;

  const skip = (page - 1) * limit;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  let queryBuilder = Model.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  if (populate) {
    queryBuilder = queryBuilder.populate(populate);
  }

  const [results, totalCount] = await Promise.all([
    queryBuilder,
    Model.countDocuments(query)
  ]);

  return {
    results,
    pagination: {
      current: page,
      pages: Math.ceil(totalCount / limit),
      total: totalCount,
      limit: limit
    }
  };
};

/**
 * Batch processing utility for large datasets
 */
const batchProcess = async (items, batchSize, processor) => {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(item => processor(item))
    );

    results.push(...batchResults.map(result =>
      result.status === 'fulfilled' ? result.value : null
    ).filter(Boolean));
  }

  return results;
};

/**
 * Query performance monitoring
 */
const monitorQueryPerformance = (queryName) => {
  return async (queryFn) => {
    const start = Date.now();
    try {
      const result = await queryFn();
      const duration = Date.now() - start;

      if (duration > 1000) {
        console.warn(`🐌 Slow query detected: ${queryName} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`❌ Query failed: ${queryName} after ${duration}ms`, error);
      throw error;
    }
  };
};

/**
 * Database index recommendations
 */
const getIndexRecommendations = () => {
  return {
    templates: [
      { status: 1, createdAt: -1 },
      { creator: 1, status: 1 },
      { category: 1, status: 1, createdAt: -1 },
      { categories: 1, status: 1, createdAt: -1 },
      { rating: -1, reviewsCount: -1 },
      { downloads: -1 },
      { views: -1 },
      { title: 'text', description: 'text' }, // Text search index
      { isPaid: 1, status: 1 },
      { isPinned: -1, pinnedAt: -1 }
    ],
    blogs: [
      { status: 1, publishedAt: -1 },
      { author: 1, status: 1 },
      { category: 1, status: 1, publishedAt: -1 },
      { views: -1 },
      { likes: -1 },
      { title: 'text', content: 'text', excerpt: 'text' }, // Text search index
      { tags: 1, status: 1 },
      { featured: 1, status: 1 }
    ],
    users: [
      { creatorStatus: 1, role: 1 },
      { email: 1 },
      { username: 1 },
      { createdAt: -1 },
      { lastLoginAt: -1 }
    ],
    ratings: [
      { user: 1, targetType: 1, targetId: 1 },
      { targetType: 1, targetId: 1 },
      { rating: -1 },
      { createdAt: -1 }
    ]
  };
};

module.exports = {
  getCreatorStatsOptimized,
  getBlogRatingsOptimized,
  getTemplateRatingsOptimized,
  getTextSearchOptimized,
  getPaginatedResults,
  batchProcess,
  monitorQueryPerformance,
  getIndexRecommendations
};
