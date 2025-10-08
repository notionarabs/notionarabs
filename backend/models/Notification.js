const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  type: { 
    type: String, 
    enum: [
      'template_published', 'template_rated', 'template_commented', 'template_downloaded', 'creator_followed',
      'admin_creator_application', 'admin_template_pending', 'admin_blog_pending', 'admin_user_registered', 'admin_system_alert',
      'badge_added', 'template_badge_added'
    ], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  metadata: { type: Object, default: {} },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

