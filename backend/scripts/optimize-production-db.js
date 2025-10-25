// Production database optimization script
// Run this with your production MongoDB connection string

const mongoose = require('mongoose');
require('dotenv').config();

// Use production MongoDB URI
const PRODUCTION_MONGODB_URI = process.env.PRODUCTION_MONGODB_URI || process.env.MONGODB_URI;

console.log('🔧 Optimizing production database...');
console.log('⚠️  Make sure you\'re connected to the PRODUCTION database!');

// Connect to production MongoDB
mongoose.connect(PRODUCTION_MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to production MongoDB');
  
  try {
    console.log('Creating production indexes...');
    
    // Templates collection indexes
    await db.collection('templates').createIndex({ creator: 1, status: 1 });
    await db.collection('templates').createIndex({ categories: 1, status: 1 });
    await db.collection('templates').createIndex({ rating: -1, status: 1 });
    await db.collection('templates').createIndex({ downloads: -1, status: 1 });
    await db.collection('templates').createIndex({ createdAt: -1, status: 1 });
    await db.collection('templates').createIndex({ 
      creator: 1, 
      status: 1, 
      createdAt: -1 
    });
    
    // Users collection indexes
    await db.collection('users').createIndex({ 
      creatorStatus: 1, 
      isActive: 1, 
      isEmailVerified: 1 
    });
    await db.collection('users').createIndex({ displayName: 1 });
    await db.collection('users').createIndex({ name: 1 });
    
    // Ratings collection indexes
    await db.collection('ratings').createIndex({ templateId: 1, createdAt: -1 });
    await db.collection('ratings').createIndex({ creatorId: 1, createdAt: -1 });
    await db.collection('ratings').createIndex({ userId: 1, templateId: 1 });
    await db.collection('ratings').createIndex({ userId: 1, creatorId: 1 });
    
    // Comments collection indexes
    await db.collection('comments').createIndex({ templateId: 1, createdAt: -1 });
    await db.collection('comments').createIndex({ userId: 1, templateId: 1 });
    
    // Orders collection indexes
    await db.collection('orders').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ 'items.templateId': 1 });
    
    console.log('🎉 Production database optimized successfully!');
    console.log('✅ All performance indexes created');
    
  } catch (error) {
    console.error('❌ Error optimizing production database:', error);
  } finally {
    mongoose.connection.close();
  }
});
