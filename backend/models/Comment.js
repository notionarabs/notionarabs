const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'التعليق لا يجب أن يتجاوز 1000 حرف']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'الرد لا يجب أن يتجاوز 500 حرف']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
commentSchema.index({ targetType: 1, targetId: 1 });
commentSchema.index({ user: 1 });
commentSchema.index({ createdAt: -1 });

// Static method to get comments for a target
commentSchema.statics.getCommentsForTarget = async function (targetType, targetId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const comments = await this.find({
    targetType,
    targetId,
    isPublic: true
  })
    .populate('user', 'name username displayName profilePicture')
    .populate('likes.user', 'name username displayName profilePicture _id')
    .populate('replies.user', 'name username displayName profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalComments = await this.countDocuments({
    targetType,
    targetId,
    isPublic: true
  });

  return {
    comments,
    totalComments,
    pagination: {
      current: page,
      pages: Math.ceil(totalComments / limit),
      total: totalComments,
      limit
    }
  };
};

// Static method to get user's comment for a target
commentSchema.statics.getUserComment = async function (userId, targetType, targetId) {
  return await this.findOne({
    user: userId,
    targetType,
    targetId
  });
};

module.exports = mongoose.model('Comment', commentSchema);
