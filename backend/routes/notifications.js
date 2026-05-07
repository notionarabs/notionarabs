const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Notification types that are for admins only and must NEVER appear in a user's feed
const ADMIN_ONLY_TYPES = [
  'admin_template_pending',
  'admin_user_registered',
  'admin_creator_application',
  'template_edited',
];

// Get current user's notifications (excluding admin-only types)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const notifications = await Notification.find({
      user: userId,
      type: { $nin: ADMIN_ONLY_TYPES }
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
      type: { $nin: ADMIN_ONLY_TYPES }
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error details:', JSON.stringify(error, null, 2) || error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Mark one notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, user: req.user._id.toString() },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Mark all as read (only marks user-visible notifications)
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id.toString(), isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
