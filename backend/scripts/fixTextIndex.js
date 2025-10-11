const mongoose = require('mongoose');
require('dotenv').config();

async function fixTextIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notion-arabs');
    console.log('✅ Connected to MongoDB');

    const Template = mongoose.connection.collection('templates');

    // Get all indexes
    const indexes = await Template.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Find and drop the old text index
    const textIndexes = indexes.filter(idx =>
      idx.key && (idx.key._fts === 'text' || Object.values(idx.key).includes('text'))
    );

    if (textIndexes.length > 0) {
      console.log('\n🗑️  Dropping old text indexes...');
      for (const idx of textIndexes) {
        try {
          await Template.dropIndex(idx.name);
          console.log(`  ✅ Dropped: ${idx.name}`);
        } catch (err) {
          console.log(`  ⚠️  Could not drop ${idx.name}:`, err.message);
        }
      }
    } else {
      console.log('\n✅ No old text indexes to drop');
    }

    // Create new text index with proper configuration
    console.log('\n🔧 Creating new text index...');
    await Template.createIndex(
      { title: 'text', description: 'text', tags: 'text' },
      {
        name: 'template_text_search',
        default_language: 'none',
        language_override: 'textSearchLanguage'
      }
    );
    console.log('✅ New text index created successfully!');

    // Verify new indexes
    const newIndexes = await Template.indexes();
    console.log('\n📋 Updated indexes:');
    newIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
      if (idx.key._fts === 'text') {
        console.log(`    Language override field: ${idx.language_override || 'language (default)'}`);
      }
    });

    console.log('\n✅ Text index fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixTextIndex();

