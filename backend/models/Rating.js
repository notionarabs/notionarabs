const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['template', 'creator', 'blog'],
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

// Static method to get median rating for a target
ratingSchema.statics.getMedianRating = async function (targetType, targetId) {
  const ratings = await this.find({
    targetType,
    targetId: new mongoose.Types.ObjectId(targetId)
  }).select('rating').lean();

  if (ratings.length === 0) {
    return { medianRating: 0, totalRatings: 0 };
  }

  // Sort ratings in ascending order
  const sortedRatings = ratings.map(r => r.rating).sort((a, b) => a - b);
  const totalRatings = sortedRatings.length;

  let medianRating;
  if (totalRatings % 2 === 0) {
    // Even number of ratings - average of two middle values
    const mid1 = sortedRatings[totalRatings / 2 - 1];
    const mid2 = sortedRatings[totalRatings / 2];
    medianRating = (mid1 + mid2) / 2;
  } else {
    // Odd number of ratings - middle value
    medianRating = sortedRatings[Math.floor(totalRatings / 2)];
  }

  return { medianRating, totalRatings };
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
