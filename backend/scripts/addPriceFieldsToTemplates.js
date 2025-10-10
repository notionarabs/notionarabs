require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('../models/Template');

// Database connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const addPriceFields = async () => {
  try {
    await connectDB();

    console.log('🔄 Starting migration: Adding isPaid and price fields to templates...');

    // Update all templates that don't have isPaid field
    const result = await Template.updateMany(
      {
        $or: [
          { isPaid: { $exists: false } },
          { price: { $exists: false } }
        ]
      },
      {
        $set: {
          isPaid: false,
          sales: 0
        }
      }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`   - Updated ${result.modifiedCount} templates`);
    console.log(`   - Matched ${result.matchedCount} templates`);

    // Show summary of all templates
    const allTemplates = await Template.find({}).select('title isPaid price sales').lean();
    console.log('\n📊 Current templates status:');
    allTemplates.forEach(template => {
      console.log(`   - ${template.title}: ${template.isPaid ? `Paid ($${template.price})` : 'Free'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
addPriceFields();

