const mongoose = require('mongoose');
const Template = require('../models/Template');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notionarabs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    console.log('🔍 Analyzing database performance...\n');

    // Test creator profile query performance
    console.log('Testing Creator Profile Query Performance:');
    const startTime = Date.now();
    
    const creator = await User.findOne({
      creatorStatus: 'approved',
      isActive: true,
      isEmailVerified: true
    }).select('-password -emailVerificationToken -resetToken');
    
    if (creator) {
      // Test parallel queries
      const [templatesResult, statsResult] = await Promise.allSettled([
        Template.find({
          creator: creator._id,
          status: 'approved'
        })
          .select('title price rating downloads category coverImage isPaid purchaseLink')
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
        
        Template.aggregate([
          { $match: { creator: creator._id, status: 'approved' } },
          {
            $group: {
              _id: null,
              totalTemplates: { $sum: 1 },
              totalDownloads: { $sum: { $ifNull: ['$downloads', 0] } },
              templateRatings: { $push: { $ifNull: ['$rating', 0] } },
              totalRevenue: {
                $sum: {
                  $multiply: [
                    { $ifNull: ['$price', 0] },
                    { $ifNull: ['$downloads', 0] }
                  ]
                }
              }
            }
          }
        ])
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Creator profile query completed in ${duration}ms`);
      console.log(`   - Templates found: ${templatesResult.status === 'fulfilled' ? templatesResult.value.length : 0}`);
      console.log(`   - Stats calculated: ${statsResult.status === 'fulfilled' ? 'Yes' : 'No'}`);
      
      if (duration > 1000) {
        console.log(`⚠️  WARNING: Query took longer than 1 second (${duration}ms)`);
      } else if (duration > 500) {
        console.log(`⚠️  Query is slow (${duration}ms) - consider optimization`);
      } else {
        console.log(`✅ Query performance is good (${duration}ms)`);
      }
    }

    console.log('\n');

    // Test template detail query performance
    console.log('Testing Template Detail Query Performance:');
    const templateStartTime = Date.now();
    
    const template = await Template.findOne({
      status: 'approved'
    }).populate('creator', 'name username displayName profilePicture bio');
    
    if (template) {
      const templateEndTime = Date.now();
      const templateDuration = templateEndTime - templateStartTime;
      
      console.log(`✅ Template detail query completed in ${templateDuration}ms`);
      
      if (templateDuration > 500) {
        console.log(`⚠️  WARNING: Template query is slow (${templateDuration}ms)`);
      } else {
        console.log(`✅ Template query performance is good (${templateDuration}ms)`);
      }
    }

    console.log('\n');

    // Check database indexes
    console.log('Checking Database Indexes:');
    
    const templateIndexes = await db.collection('templates').indexes();
    const userIndexes = await db.collection('users').indexes();
    
    console.log(`📊 Templates collection has ${templateIndexes.length} indexes`);
    console.log(`📊 Users collection has ${userIndexes.length} indexes`);
    
    // Check for critical indexes
    const criticalTemplateIndexes = [
      { creator: 1, status: 1 },
      { slug: 1 },
      { categories: 1, status: 1 },
      { rating: -1, status: 1 }
    ];
    
    const criticalUserIndexes = [
      { username: 1 },
      { email: 1 },
      { creatorStatus: 1, isActive: 1, isEmailVerified: 1 }
    ];
    
    console.log('\n🔍 Checking for critical indexes...');
    
    criticalTemplateIndexes.forEach(index => {
      const exists = templateIndexes.some(idx => 
        JSON.stringify(idx.key) === JSON.stringify(index)
      );
      console.log(`${exists ? '✅' : '❌'} Template index ${JSON.stringify(index)}`);
    });
    
    criticalUserIndexes.forEach(index => {
      const exists = userIndexes.some(idx => 
        JSON.stringify(idx.key) === JSON.stringify(index)
      );
      console.log(`${exists ? '✅' : '❌'} User index ${JSON.stringify(index)}`);
    });

    console.log('\n📈 Performance Recommendations:');
    console.log('1. Run the optimize-indexes.js script to create missing indexes');
    console.log('2. Monitor slow queries using MongoDB profiler');
    console.log('3. Consider implementing query result caching');
    console.log('4. Use database connection pooling for better performance');
    console.log('5. Implement pagination for large result sets');
    
  } catch (error) {
    console.error('Error during performance analysis:', error);
  } finally {
    mongoose.connection.close();
  }
});
