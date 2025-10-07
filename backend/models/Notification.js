const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  type: { type: String, enum: ['template_published'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  metadata: { type: Object, default: {} },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

