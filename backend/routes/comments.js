const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Template = require('../models/Template');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/comments
// @desc    Submit a comment for a template or creator
// @access  Private
router.post('/', auth, [
  body('targetType')
    .isIn(['template', 'creator'])
    .withMessage('نوع الهدف يجب أن يكون template أو creator'),
  body('targetId')
    .isMongoId()
    .withMessage('معرف الهدف غير صحيح'),
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('التعليق يجب أن يكون بين 1 و 1000 حرف')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { targetType, targetId, content } = req.body;
    const userId = req.user._id;

    // Check if target exists
    let target;
    if (targetType === 'template') {
      target = await Template.findById(targetId);
    } else if (targetType === 'creator') {
      target = await User.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: targetType === 'template' ? 'القالب غير موجود' : 'المبدع غير موجود'
      });
    }

    // Check if user already commented on this target
    const existingComment = await Comment.findOne({
      user: userId,
      targetType,
      targetId
    });

    let savedComment;
    if (existingComment) {
      // Update existing comment
      existingComment.content = content;
      savedComment = await existingComment.save();
    } else {
      // Create new comment
      savedComment = new Comment({
        user: userId,
        targetType,
        targetId,
        content
      });
      await savedComment.save();
    }

    // Populate user data for response
    await savedComment.populate('user', 'name username displayName profilePicture');

    res.json({
      success: true,
      message: existingComment ? 'تم تحديث التعليق بنجاح' : 'تم إضافة التعليق بنجاح',
      comment: savedComment
    });

  } catch (error) {
    console.error('Comment submission error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/comments/:targetType/:targetId
// @desc    Get comments for a specific template or creator
// @access  Public
router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Validate targetType
    if (!['template', 'creator'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الهدف غير صحيح'
      });
    }

    // Check if target exists
    let target;
    if (targetType === 'template') {
      target = await Template.findById(targetId);
    } else if (targetType === 'creator') {
      target = await User.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: targetType === 'template' ? 'القالب غير موجود' : 'المبدع غير موجود'
      });
    }

    // Get comments
    const { comments, totalComments, pagination } = await Comment.getCommentsForTarget(
      targetType, 
      targetId, 
      page, 
      limit
    );

    res.json({
      success: true,
      comments,
      totalComments,
      pagination
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/comments/user/:targetType/:targetId
// @desc    Get user's comment for a specific template or creator
// @access  Private
router.get('/user/:targetType/:targetId', auth, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user._id;

    // Validate targetType
    if (!['template', 'creator'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الهدف غير صحيح'
      });
    }

    const comment = await Comment.getUserComment(userId, targetType, targetId);

    res.json({
      success: true,
      comment
    });

  } catch (error) {
    console.error('Get user comment error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   DELETE /api/comments/:targetType/:targetId
// @desc    Delete user's comment for a specific template or creator
// @access  Private
router.delete('/:targetType/:targetId', auth, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.user._id;

    // Validate targetType
    if (!['template', 'creator'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الهدف غير صحيح'
      });
    }

    // Find and delete the comment
    const comment = await Comment.findOneAndDelete({
      user: userId,
      targetType,
      targetId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'التعليق غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف التعليق بنجاح'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/comments/:commentId/like
// @desc    Like or unlike a comment
// @access  Private
router.post('/:commentId/like', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'التعليق غير موجود'
      });
    }

    const existingLikeIndex = comment.likes.findIndex(
      like => like.user.toString() === userId.toString()
    );

    if (existingLikeIndex > -1) {
      // Remove like
      comment.likes.splice(existingLikeIndex, 1);
    } else {
      // Add like
      comment.likes.push({ user: userId });
    }

    await comment.save();

    res.json({
      success: true,
      message: existingLikeIndex > -1 ? 'تم إلغاء الإعجاب' : 'تم الإعجاب بالتعليق',
      likesCount: comment.likes.length
    });

  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;
