const mongoose = require('mongoose');

// In-memory cache for settings to improve performance and avoid DB timeouts
let cachedSettings = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

const settingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'عرب نوشن' },
  platformDescription: { type: String, default: 'منصة قوالب Notion العربية' },
  maintenanceMode: { type: Boolean, default: false },
  registrationEnabled: { type: Boolean, default: true },
  creatorApplicationsEnabled: { type: Boolean, default: true },
  autoApproveTemplates: { type: Boolean, default: false },
  autoApproveBlogs: { type: Boolean, default: false },
  contactInfo: {
    email: { type: String, default: 'support@notionarabs.com' },
    phone: { type: String, default: '+201050505673' },
    address: { type: String, default: 'القاهرة، جمهورية مصر العربية' }
  }
}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  const now = Date.now();
  
  // Return cached settings if they are fresh
  if (cachedSettings && (now - lastCacheUpdate < CACHE_TTL)) {
    return cachedSettings;
  }

  try {
    let settings = await this.findOne();
    if (!settings) {
      settings = await this.create({});
    }
    
    // Update cache
    cachedSettings = settings;
    lastCacheUpdate = now;
    
    return settings;
  } catch (error) {
    console.error('Error fetching settings from DB:', error);
    
    // Hardcoded fallback for public settings (avoids total site paralysis if DB is down)
    const fallbackSettings = {
      platformName: 'عرب نوشن',
      platformDescription: 'منصة قوالب Notion العربية',
      maintenanceMode: false,
      registrationEnabled: true,
      creatorApplicationsEnabled: true,
      autoApproveTemplates: false,
      autoApproveBlogs: false,
      contactInfo: {
        email: 'support@notionarabs.com',
        phone: '+201050505673',
        address: 'القاهرة، جمهورية مصر العربية'
      }
    };

    // If we have a cache (even if old), return it as fallback. Otherwise, return the hardcoded fallback.
    return cachedSettings || fallbackSettings;
  }
};

settingsSchema.statics.updateSettings = async function (updateData) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updateData);
  } else {
    settings = await this.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );
  }
  
  // Update cache immediately after update
  cachedSettings = settings;
  lastCacheUpdate = Date.now();
  
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
