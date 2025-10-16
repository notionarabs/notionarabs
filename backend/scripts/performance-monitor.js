const mongoose = require('mongoose');
const User = require('../models/User');
const Template = require('../models/Template');
const Blog = require('../models/Blog');
const Rating = require('../models/Rating');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notion-arabs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function analyzePerformance() {
  console.log('🔍 Analyzing database performance...\n');

  try {
    // Check collection sizes
    const userCount = await User.countDocuments();
    const templateCount = await Template.countDocuments();
    const blogCount = await Blog.countDocuments();
    const ratingCount = await Rating.countDocuments();

    console.log('📊 Collection Sizes:');
    console.log(`Users: ${userCount.toLocaleString()}`);
    console.log(`Templates: ${templateCount.toLocaleString()}`);
    console.log(`Blogs: ${blogCount.toLocaleString()}`);
    console.log(`Ratings: ${ratingCount.toLocaleString()}\n`);

    // Check indexes
    console.log('🗂️  Database Indexes:');
    
    const userIndexes = await User.collection.getIndexes();
    console.log(`Users indexes: ${Object.keys(userIndexes).length}`);
    
    const templateIndexes = await Template.collection.getIndexes();
    console.log(`Templates indexes: ${Object.keys(templateIndexes).length}`);
    
    const blogIndexes = await Blog.collection.getIndexes();
    console.log(`Blogs indexes: ${Object.keys(blogIndexes).length}`);
    
    const ratingIndexes = await Rating.collection.getIndexes();
    console.log(`Ratings indexes: ${Object.keys(ratingIndexes).length}\n`);

    // Performance test queries
    console.log('⚡ Performance Tests:');
    
    const start1 = Date.now();
    await User.find({ creatorStatus: 'approved' }).limit(10).lean();
    const userQueryTime = Date.now() - start1;
    console.log(`User query (approved creators): ${userQueryTime}ms`);

    const start2 = Date.now();
    await Template.find({ status: 'approved' }).limit(10).lean();
    const templateQueryTime = Date.now() - start2;
    console.log(`Template query (approved): ${templateQueryTime}ms`);

    const start3 = Date.now();
    await Blog.find({ status: 'published' }).limit(10).lean();
    const blogQueryTime = Date.now() - start3;
    console.log(`Blog query (published): ${blogQueryTime}ms`);

    const start4 = Date.now();
    await Template.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$creator', count: { $sum: 1 } } },
      { $limit: 10 }
    ]);
    const aggQueryTime = Date.now() - start4;
    console.log(`Aggregation query (creator stats): ${aggQueryTime}ms\n`);

    // Recommendations
    console.log('💡 Performance Recommendations:');
    
    if (userQueryTime > 100) {
      console.log('⚠️  User queries are slow - consider adding more indexes');
    }
    
    if (templateQueryTime > 100) {
      console.log('⚠️  Template queries are slow - check category indexes');
    }
    
    if (blogQueryTime > 100) {
      console.log('⚠️  Blog queries are slow - check status indexes');
    }
    
    if (aggQueryTime > 200) {
      console.log('⚠️  Aggregation queries are slow - consider optimizing');
    }

    if (userQueryTime < 50 && templateQueryTime < 50 && blogQueryTime < 50 && aggQueryTime < 100) {
      console.log('✅ All queries are performing well!');
    }

    console.log('\n📈 Cache Recommendations:');
    console.log('- Enable Redis caching for frequently accessed data');
    console.log('- Cache creator stats and template counts');
    console.log('- Use CDN for static assets and images');
    console.log('- Implement database connection pooling');

  } catch (error) {
    console.error('❌ Error analyzing performance:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the analysis
analyzePerformance();
