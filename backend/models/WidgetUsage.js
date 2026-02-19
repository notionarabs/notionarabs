const mongoose = require('mongoose');

const WidgetUsageSchema = new mongoose.Schema({
    widgetId: {
        type: String,
        required: true,
        enum: ['quran', 'prayer']
    },
    origin: {
        type: String,
        default: 'unknown'
    },
    identifier: {
        type: String, // Can be hash of IP + UserAgent + Origin for unique counting
        required: false
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for quick count by widgetId
WidgetUsageSchema.index({ widgetId: 1 });
// Unique composite index to avoid double counting same user/origin for a widget
WidgetUsageSchema.index({ widgetId: 1, identifier: 1 }, { unique: true });

module.exports = mongoose.model('WidgetUsage', WidgetUsageSchema);
