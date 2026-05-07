const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { cacheMiddleware } = require('../utils/redis-cache');

const router = express.Router();

// Get current user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error details:', JSON.stringify(error, null, 2) || error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Mark one notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;

