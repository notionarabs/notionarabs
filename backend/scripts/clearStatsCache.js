const Redis = require('ioredis');
require('dotenv').config();

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

async function clearStatsCache() {
  try {
    console.log('🔄 Clearing stats cache...');

    // Clear all cache keys related to stats/homepage
    const patterns = [
      'cache:*/api/stats/homepage*',
      'cache:*/stats/homepage*'
    ];

    let totalDeleted = 0;

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        const deleted = await redis.del(...keys);
        totalDeleted += deleted;
        console.log(`✅ Deleted ${deleted} keys matching: ${pattern}`);
      }
    }

    if (totalDeleted === 0) {
      console.log('ℹ️  No cached keys found');
    } else {
      console.log(`✅ Total keys deleted: ${totalDeleted}`);
    }

    console.log('✅ Stats cache cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  }
}

clearStatsCache();

