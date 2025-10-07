const mongoose = require('mongoose');

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
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
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
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
