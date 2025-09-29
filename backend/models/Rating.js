const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['template', 'creator'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'التقييم يجب أن يكون رقماً صحيحاً'
    }
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'التعليق لا يجب أن يتجاوز 500 حرف']
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one rating per user per target
ratingSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for efficient queries
ratingSchema.index({ targetType: 1, targetId: 1 });
ratingSchema.index({ user: 1 });

// Static method to get average rating for a target
ratingSchema.statics.getAverageRating = async function (targetType, targetId) {
  const result = await this.aggregate([
    {
      $match: {
        targetType,
        targetId: new mongoose.Types.ObjectId(targetId)
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { averageRating: 0, totalRatings: 0 };
};

// Static method to get user's rating for a target
ratingSchema.statics.getUserRating = async function (userId, targetType, targetId) {
  return await this.findOne({
    user: userId,
    targetType,
    targetId
  });
};

module.exports = mongoose.model('Rating', ratingSchema);
