/**
 * Migration script to add slugs to existing templates
 */

const mongoose = require('mongoose');
const Template = require('../models/Template');
const { generateTemplateSlug } = require('../utils/slugGenerator');

async function addSlugsToExistingTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notion-arabs');
    console.log('Connected to MongoDB');

    // Find templates without slugs
    const templatesWithoutSlugs = await Template.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });

    console.log(`Found ${templatesWithoutSlugs.length} templates without slugs`);

    if (templatesWithoutSlugs.length === 0) {
      console.log('All templates already have slugs');
      return;
    }

    // Generate slugs for each template
    for (const template of templatesWithoutSlugs) {
      try {
        console.log(`Processing template: ${template.title} (${template._id})`);

        const slugExists = async (slug, excludeId = null) => {
          const query = { slug };
          if (excludeId) {
            query._id = { $ne: excludeId };
          }
          const existingTemplate = await Template.findOne(query);
          return !!existingTemplate;
        };

        const slug = await generateTemplateSlug(template.title, slugExists, template._id);

        // Update the template with the new slug
        await Template.findByIdAndUpdate(template._id, { slug });
        console.log(`✓ Added slug "${slug}" to template "${template.title}"`);

      } catch (error) {
        console.error(`✗ Error processing template ${template.title}:`, error.message);

        // Fallback to ID-based slug
        const fallbackSlug = `template-${template._id}`;
        await Template.findByIdAndUpdate(template._id, { slug: fallbackSlug });
        console.log(`✓ Added fallback slug "${fallbackSlug}" to template "${template.title}"`);
      }
    }

    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  addSlugsToExistingTemplates();
}

module.exports = addSlugsToExistingTemplates;
