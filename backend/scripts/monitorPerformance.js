/**
 * Performance Monitoring and Optimization Script
 * Monitors API performance and provides optimization recommendations
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Template = require('../models/Template');
const Blog = require('../models/Blog');
const User = require('../models/User');
const Rating = require('../models/Rating');

async function monitorPerformance() {
  try {
    console.log('📊 Starting performance monitoring...\n');

    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI environment variable is not set');
      console.log('💡 Please set your MongoDB Atlas connection string in the .env file:');
      console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notion-arabs');
      console.log('\n📋 To create a .env file:');
      console.log('1. Copy .env.example to .env');
      console.log('2. Add your MongoDB Atlas connection string');
      console.log('3. Run the script again');
      return;
    }

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      minPoolSize: 2,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 10000,
      readPreference: 'primaryPreferred',
      bufferCommands: false
    });

    console.log('✅ Connected to database');

    // Test common queries and measure performance
    const tests = [
      {
        name: 'Templates - Published Templates',
        query: () => Template.find({ status: 'approved' }).limit(20).lean(),
        threshold: 100
      },
      {
        name: 'Templates - By Category',
        query: () => Template.find({ category: 'productivity', status: 'approved' }).limit(20).lean(),
        threshold: 100
      },
      {
        name: 'Templates - Popular',
        query: () => Template.find({ status: 'approved' }).sort({ downloads: -1 }).limit(20).lean(),
        threshold: 150
      },
      {
        name: 'Blogs - Published',
        query: () => Blog.find({ status: 'published' }).limit(20).lean(),
        threshold: 100
      },
      {
        name: 'Blogs - By Category',
        query: () => Blog.find({ category: 'productivity', status: 'published' }).limit(20).lean(),
        threshold: 100
      },
      {
        name: 'Users - Creators',
        query: () => User.find({ creatorStatus: 'approved', role: 'creator' }).limit(20).lean(),
        threshold: 100
      },
      {
        name: 'Ratings - Recent',
        query: () => Rating.find().sort({ createdAt: -1 }).limit(20).lean(),
        threshold: 100
      },
      {
        name: 'Templates - Text Search',
        query: () => Template.find({ $text: { $search: 'productivity' } }).limit(20).lean(),
        threshold: 200
      }
    ];

    console.log('🧪 Running performance tests...\n');

    const results = [];
    for (const test of tests) {
      const start = Date.now();
      try {
        await test.query();
        const duration = Date.now() - start;
        results.push({
          name: test.name,
          duration,
          status: duration <= test.threshold ? '✅ GOOD' : '⚠️  SLOW',
          threshold: test.threshold
        });
        console.log(`${test.name}: ${duration}ms ${duration <= test.threshold ? '✅' : '⚠️'}`);
      } catch (error) {
        results.push({
          name: test.name,
          duration: -1,
          status: '❌ ERROR',
          threshold: test.threshold,
          error: error.message
        });
        console.log(`${test.name}: ERROR - ${error.message}`);
      }
    }

    // Database stats
    console.log('\n📈 Database Statistics:');
    const stats = await mongoose.connection.db.stats();
    console.log(`- Database Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Collections: ${stats.collections}`);
    console.log(`- Indexes: ${stats.indexes}`);

    // Collection counts
    console.log('\n📊 Collection Counts:');
    const templateCount = await Template.countDocuments();
    const blogCount = await Blog.countDocuments();
    const userCount = await User.countDocuments();
    const ratingCount = await Rating.countDocuments();

    console.log(`- Templates: ${templateCount}`);
    console.log(`- Blogs: ${blogCount}`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Ratings: ${ratingCount}`);

    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');

    const slowQueries = results.filter(r => r.duration > r.threshold);
    if (slowQueries.length > 0) {
      console.log('⚠️  Slow queries detected:');
      slowQueries.forEach(query => {
        console.log(`   - ${query.name}: ${query.duration}ms (threshold: ${query.threshold}ms)`);
      });
      console.log('\n🔧 Optimization suggestions:');
      console.log('   - Run optimizeDatabaseIndexes.js script');
      console.log('   - Check if indexes are being used with explain()');
      console.log('   - Consider adding compound indexes for complex queries');
    } else {
      console.log('✅ All queries are performing well!');
    }

    console.log('\n🚀 General Optimization Tips:');
    console.log('1. Enable Redis caching for frequently accessed data');
    console.log('2. Use lean() queries when you don\'t need Mongoose documents');
    console.log('3. Implement pagination for large result sets');
    console.log('4. Use select() to limit returned fields');
    console.log('5. Consider using aggregation pipelines for complex queries');
    console.log('6. Monitor memory usage and connection pool size');
    console.log('7. Use compression middleware for API responses');

    // Render-specific recommendations
    console.log('\n🌐 Render Free Tier Optimizations:');
    console.log('1. Reduce connection pool size (maxPoolSize: 5)');
    console.log('2. Use shorter timeouts (socketTimeoutMS: 20000)');
    console.log('3. Enable connection pooling');
    console.log('4. Use lean queries to reduce memory usage');
    console.log('5. Implement proper error handling for connection issues');
    console.log('6. Consider upgrading to paid tier for better performance');

  } catch (error) {
    console.error('❌ Error monitoring performance:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the monitoring
monitorPerformance();
