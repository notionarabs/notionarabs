const mongoose = require('mongoose');

const downloadLogSchema = new mongoose.Schema({
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmailSnapshot: { type: String, default: null },
  templateTitleSnapshot: { type: String, default: null },
  userAgent: { type: String, default: null },
  referrer: { type: String, default: null }
}, {
  timestamps: true
});

downloadLogSchema.index({ creator: 1, createdAt: -1 });
downloadLogSchema.index({ template: 1, createdAt: -1 });

module.exports = mongoose.model('DownloadLog', downloadLogSchema);


