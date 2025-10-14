require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

async function updateBlogSlugs() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notion-arabs');
    console.log('✅ Connected to MongoDB');

    // Get all blogs
    const blogs = await Blog.find({});
    console.log(`📝 Found ${blogs.length} blogs to update`);

    let updated = 0;
    let skipped = 0;
    const slugMap = new Map(); // Track slug usage for uniqueness

    for (const blog of blogs) {
      const oldSlug = blog.slug;

      // Generate new English slug
      let newSlug = blog.generateSlug();

      // Ensure slug is not empty
      if (!newSlug || newSlug.trim() === '') {
        newSlug = `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Handle duplicates
      let finalSlug = newSlug;
      let counter = 1;
      while (slugMap.has(finalSlug)) {
        finalSlug = `${newSlug}-${counter}`;
        counter++;
      }
      slugMap.set(finalSlug, true);

      // Update if slug changed
      if (oldSlug !== finalSlug) {
        // Check if new slug already exists in database
        const existingBlog = await Blog.findOne({ slug: finalSlug, _id: { $ne: blog._id } });
        if (existingBlog) {
          // If it exists, append a unique identifier
          finalSlug = `${newSlug}-${blog._id.toString().slice(-6)}`;
        }

        blog.slug = finalSlug;
        await blog.save();

        console.log(`✅ Updated: "${blog.title}"`);
        console.log(`   Old slug: ${oldSlug}`);
        console.log(`   New slug: ${finalSlug}`);
        updated++;
      } else {
        skipped++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated} blogs`);
    console.log(`   ⏭️  Skipped: ${skipped} blogs (already in English)`);
    console.log('✨ Done!');

  } catch (error) {
    console.error('❌ Error updating blog slugs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run the script
updateBlogSlugs();

