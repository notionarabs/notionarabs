const Redis = require('ioredis');

// Initialize Redis client
let redis = null;

// Check if Redis is configured
const isRedisConfigured = process.env.REDIS_URL || process.env.REDIS_HOST;

if (isRedisConfigured) {
  try {
    redis = new Redis(process.env.REDIS_URL || {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true
    });

    // Connect to Redis
    redis.connect().catch(err => {
      console.warn('Redis connection failed, continuing without cache:', err.message);
      redis = null;
    });

    redis.on('error', (err) => {
      console.warn('Redis error:', err.message);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  } catch (error) {
    console.warn('Redis initialization failed, continuing without cache:', error.message);
    redis = null;
  }
} else {
  console.log('ℹ️  Redis not configured, caching disabled');
}

/**
 * Cache middleware for Express routes
 * @param {number} duration - Cache duration in seconds
 * @param {function} keyGenerator - Optional custom key generator function
 */
const cacheMiddleware = (duration = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not available or method is not GET
    if (!redis || req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req)
        : `cache:${req.originalUrl}_${req.user?.id || 'anonymous'}`;

      // Try to get from cache
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        res.set('X-Cache', 'HIT');
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the response
        redis.setex(cacheKey, duration, JSON.stringify(data)).catch(err => {
          console.warn('Redis cache write failed:', err.message);
        });

        res.set('X-Cache', 'MISS');
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.warn('Cache middleware error:', error.message);
      next();
    }
  };
};

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached data or null
 */
const getCache = async (key) => {
  if (!redis) return null;

  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Cache get error:', error.message);
    return null;
  }
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} duration - Cache duration in seconds (default: 300)
 * @returns {Promise<boolean>} - Success status
 */
const setCache = async (key, value, duration = 300) => {
  if (!redis) return false;

  try {
    await redis.setex(key, duration, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Cache set error:', error.message);
    return false;
  }
};

/**
 * Delete cache by key
 * @param {string} key - Cache key or pattern
 * @returns {Promise<boolean>} - Success status
 */
const deleteCache = async (key) => {
  if (!redis) return false;

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn('Cache delete error:', error.message);
    return false;
  }
};

/**
 * Delete multiple cache keys by pattern
 * @param {string} pattern - Pattern to match keys (e.g., 'cache:templates:*')
 * @returns {Promise<number>} - Number of deleted keys
 */
const deleteCacheByPattern = async (pattern) => {
  if (!redis) return 0;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    const deleted = await redis.del(...keys);
    return deleted;
  } catch (error) {
    console.warn('Cache pattern delete error:', error.message);
    return 0;
  }
};

/**
 * Clear all cache
 * @returns {Promise<boolean>} - Success status
 */
const clearCache = async () => {
  if (!redis) return false;

  try {
    await redis.flushdb();
    return true;
  } catch (error) {
    console.warn('Cache clear error:', error.message);
    return false;
  }
};

/**
 * Invalidate cache for specific resources
 * @param {string} resource - Resource type (e.g., 'template', 'blog', 'user')
 * @param {string} id - Optional resource ID
 */
const invalidateCache = async (resource, id = null) => {
  if (!redis) return;

  try {
    const patterns = [
      `cache:*/${resource}*`,
      `cache:*templates*`,
      `cache:*blogs*`,
      `cache:*creators*`,
      `cache:*stats*`
    ];

    if (id) {
      patterns.push(`cache:*/${resource}/${id}*`);
    }

    for (const pattern of patterns) {
      await deleteCacheByPattern(pattern);
    }

    console.log(`✅ Cache invalidated for ${resource}${id ? `/${id}` : ''}`);
  } catch (error) {
    console.warn('Cache invalidation error:', error.message);
  }
};

module.exports = {
  redis,
  cacheMiddleware,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  clearCache,
  invalidateCache,
  isRedisAvailable: () => redis !== null && redis.status === 'ready'
};

