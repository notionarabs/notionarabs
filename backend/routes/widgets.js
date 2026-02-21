const express = require('express');
const router = express.Router();
const WidgetUsage = require('../models/WidgetUsage');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// @route   GET /api/widgets
// @desc    Get all widgets
// @access  Public
router.get('/', async (req, res) => {
    try {
        const widgetsPath = path.join(__dirname, '../data/widgets.json');
        const widgetsData = fs.readFileSync(widgetsPath, 'utf8');
        const widgets = JSON.parse(widgetsData);
        res.json({ success: true, widgets });
    } catch (error) {
        console.error('Error fetching widgets:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// @route   POST /api/widgets/track
// @desc    Track widget usage
// @access  Public
router.post('/track', async (req, res) => {
    const { widgetId } = req.body;

    if (!['quran', 'prayer', 'countdown'].includes(widgetId)) {
        return res.status(400).json({ success: false, message: 'Invalid widget ID' });
    }

    try {
        const origin = req.headers.referer || req.headers.origin || 'unknown';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Create a unique identifier for this user/origin combination
        const identifier = crypto.createHash('sha256')
            .update(`${widgetId}-${origin}-${ip}-${userAgent}`)
            .digest('hex');

        // Upsert to count unique users per widget (roughly)
        await WidgetUsage.findOneAndUpdate(
            { widgetId, identifier },
            {
                $set: { lastUsed: new Date(), origin },
                $setOnInsert: { widgetId, identifier }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Widget tracking error:', error);
        res.status(500).json({ success: false });
    }
});

// @route   GET /api/widgets/stats
// @desc    Get widget usage stats
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        const stats = await WidgetUsage.aggregate([
            {
                $group: {
                    _id: '$widgetId',
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            quran: 0,
            prayer: 0,
            countdown: 0
        };

        stats.forEach(s => {
            if (result.hasOwnProperty(s._id)) {
                result[s._id] = s.count;
            }
        });

        res.json({ success: true, stats: result });
    } catch (error) {
        console.error('Widget stats error:', error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
