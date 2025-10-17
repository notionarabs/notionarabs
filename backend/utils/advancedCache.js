/**
 * Advanced caching utilities with cache warming and invalidation strategies
 */

const { cacheMiddleware, invalidateCache } = require('./redis-cache');

/**
 * Cache warming utility - preload frequently accessed data
 */
const cacheWarmer = {
  /**
   * Warm up creator stats cache
   */
  async warmCreatorStats() {
    try {
      const User = require('../models/User');
      const Template = require('../models/Template');

      console.log('🔥 Warming up creator stats cache...');

      // Get top 50 creators
      const creators = await User.find({
        creatorStatus: 'approved',
        role: 'creator'
      })
        .limit(50)
        .lean();

      // Warm up cache for each creator
      for (const creator of creators) {
        const creatorId = creator._id.toString();

        // Calculate stats
        const templateStats = await Template.aggregate([
          { $match: { creator: creator._id, status: 'approved' } },
          {
            $group: {
              _id: '$creator',
              totalTemplates: { $sum: 1 },
              totalDownloads: { $sum: { $ifNull: ['$downloads', 0] } },
              templateRatings: { $push: { $ifNull: ['$rating', 0] } }
            }
          }
        ]);

        if (templateStats.length > 0) {
          const stats = templateStats[0];
          const validRatings = stats.templateRatings.filter(r => r > 0);
          const averageRating = validRatings.length > 0
            ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
            : 0;

          // Cache the stats
          await this.setCache(`creator_stats_${creatorId}`, {
            totalTemplates: stats.totalTemplates,
            totalDownloads: stats.totalDownloads,
            medianRating: averageRating
          }, 600); // 10 minutes
        }
      }

      console.log(`✅ Creator stats cache warmed up for ${creators.length} creators`);
    } catch (error) {
      console.error('❌ Error warming creator stats cache:', error);
    }
  },

  /**
   * Warm up template counts cache
   */
  async warmTemplateCounts() {
    try {
      const Template = require('../models/Template');

      console.log('🔥 Warming up template counts cache...');

      // Cache total template count
      const totalTemplates = await Template.countDocuments({ status: 'approved' });
      await this.setCache('total_templates', totalTemplates, 300); // 5 minutes

      // Cache category counts
      const categories = [
        'المنتجاتية', 'التسويق', 'المبيعات', 'التطوير الوظيفي',
        'التطوير الشخصي', 'التطوير الذاتي', 'التعليم', 'الإدارة',
        'المالية', 'الموارد البشرية', 'المشاريع', 'العمليات'
      ];

      for (const category of categories) {
        const count = await Template.countDocuments({
          status: 'approved',
          $or: [
            { category: category },
            { categories: category }
          ]
        });

        await this.setCache(`template_count_${category}`, count, 300); // 5 minutes
      }

      console.log(`✅ Template counts cache warmed up for ${categories.length} categories`);
    } catch (error) {
      console.error('❌ Error warming template counts cache:', error);
    }
  },

  /**
   * Warm up blog stats cache
   */
  async warmBlogStats() {
    try {
      const Blog = require('../models/Blog');

      console.log('🔥 Warming up blog stats cache...');

      // Cache total blog count
      const totalBlogs = await Blog.countDocuments({ status: 'published' });
      await this.setCache('total_blogs', totalBlogs, 300); // 5 minutes

      // Cache category counts
      const categories = [
        'نصائح', 'دروس', 'أدوات', 'موارد', 'تحديات', 'قصص نجاح',
        'أخبار', 'تحليلات', 'مقارنات', 'مراجعات', 'توقعات', 'اتجاهات'
      ];

      for (const category of categories) {
        const count = await Blog.countDocuments({
          status: 'published',
          category: category
        });

        await this.setCache(`blog_count_${category}`, count, 300); // 5 minutes
      }

      console.log(`✅ Blog stats cache warmed up for ${categories.length} categories`);
    } catch (error) {
      console.error('❌ Error warming blog stats cache:', error);
    }
  },

  /**
   * Warm up all caches
   */
  async warmAllCaches() {
    console.log('🔥 Starting comprehensive cache warming...');

    await Promise.allSettled([
      this.warmCreatorStats(),
      this.warmTemplateCounts(),
      this.warmBlogStats()
    ]);

    console.log('✅ All caches warmed up successfully');
  },

  /**
   * Helper method to set cache
   */
  async setCache(key, value, ttl) {
    const redis = require('./redis-cache');
    if (redis.client) {
      await redis.client.setex(key, ttl, JSON.stringify(value));
    }
  }
};

/**
 * Smart cache invalidation strategies
 */
const smartInvalidation = {
  /**
   * Invalidate related caches when a template is updated
   */
  async invalidateTemplateCaches(templateId, creatorId) {
    const patterns = [
      'templates*',
      `creator_stats_${creatorId}`,
      'total_templates',
      'template_count_*'
    ];

    for (const pattern of patterns) {
      await invalidateCache(pattern);
    }
  },

  /**
   * Invalidate related caches when a blog is updated
   */
  async invalidateBlogCaches(blogId, authorId) {
    const patterns = [
      'blogs*',
      `author_blogs_${authorId}`,
      'total_blogs',
      'blog_count_*'
    ];

    for (const pattern of patterns) {
      await invalidateCache(pattern);
    }
  },

  /**
   * Invalidate related caches when a creator is updated
   */
  async invalidateCreatorCaches(creatorId) {
    const patterns = [
      'creators*',
      `creator_stats_${creatorId}`,
      `creator_${creatorId}*`
    ];

    for (const pattern of patterns) {
      await invalidateCache(pattern);
    }
  }
};

/**
 * Cache analytics and monitoring
 */
const cacheAnalytics = {
  /**
   * Get cache hit/miss statistics
   */
  async getCacheStats() {
    try {
      const redis = require('./redis-cache');
      if (!redis.client) return null;

      const info = await redis.client.info('stats');
      const lines = info.split('\r\n');
      const stats = {};

      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          stats[key] = value;
        }
      });

      return {
        hits: parseInt(stats.keyspace_hits) || 0,
        misses: parseInt(stats.keyspace_misses) || 0,
        hitRate: stats.keyspace_hits && stats.keyspace_misses
          ? (parseInt(stats.keyspace_hits) / (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses)) * 100).toFixed(2)
          : '0.00'
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  },

  /**
   * Log cache performance
   */
  async logCachePerformance() {
    const stats = await this.getCacheStats();
    if (stats) {
      console.log(`📊 Cache Performance - Hit Rate: ${stats.hitRate}%, Hits: ${stats.hits}, Misses: ${stats.misses}`);
    }
  }
};

/**
 * Cache warming scheduler
 */
const scheduleCacheWarming = () => {
  // Warm caches every 5 minutes
  setInterval(async () => {
    try {
      await cacheWarmer.warmAllCaches();
      await cacheAnalytics.logCachePerformance();
    } catch (error) {
      console.error('Error in scheduled cache warming:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  // Initial cache warming on startup
  setTimeout(async () => {
    try {
      await cacheWarmer.warmAllCaches();
    } catch (error) {
      console.error('Error in initial cache warming:', error);
    }
  }, 10000); // 10 seconds after startup
};

module.exports = {
  cacheWarmer,
  smartInvalidation,
  cacheAnalytics,
  scheduleCacheWarming
};
