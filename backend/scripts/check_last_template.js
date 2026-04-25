const path = require('path');
const dotenv = require('dotenv');
const Template = require('../models/Template');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkLastTemplate() {
  try {
    const templates = await Template.find().sort({ createdAt: -1 }).limit(1);
    if (templates.length > 0) {
      const t = templates[0];
      console.log('--- Last Template Found ---');
      console.log(`Title: ${t.title}`);
      console.log(`Status: ${t.status}`);
      console.log(`Preview Image URL: ${t.previewImage}`);
      console.log(`Notion Link: ${t.notionLink}`);
      console.log('---------------------------');
      
      if (!t.previewImage) {
        console.warn('⚠️ Warning: This template has NO preview image URL!');
      } else if (!t.previewImage.startsWith('http')) {
        console.warn('⚠️ Warning: The image URL seems invalid (not starting with http).');
      }
    } else {
      console.log('No templates found in database.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

checkLastTemplate();
