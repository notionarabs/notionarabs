const express = require('express');
const { body, validationResult } = require('express-validator');
const Rating = require('../models/Rating');
const Template = require('../models/Template');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { cacheMiddleware } = require('../utils/redis-cache');

const router = express.Router();

// @route   POST /api/ratings
// @desc    Submit a rating for a template or creator
// @access  Private
router.post('/', auth, [
  body('targetType')
    .isIn(['template', 'creator', 'blog'])
    .withMessage('نوع الهدف يجب أن يكون template أو creator أو blog'),
  body('targetId')
    .isMongoId()
    .withMessage('معرف الهدف غير صحيح'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('التقييم يجب أن يكون رقماً بين 1 و 5'),
  body('review')
    .optional()
    .isLength({ max: 500 })
    .withMessage('التعليق لا يجب أن يتجاوز 500 حرف')
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

    const { targetType, targetId, rating, review } = req.body;
    const userId = req.user._id;

    // Check if target exists
    let target;
    if (targetType === 'template') {
      target = await Template.findById(targetId);
    } else if (targetType === 'creator') {
      target = await User.findById(targetId);
    } else if (targetType === 'blog') {
      target = await Blog.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: targetType === 'template' ? 'القالب غير موجود' : targetType === 'blog' ? 'المقال غير موجود' : 'المبدع غير موجود'
      });
    }

    // Check if user is trying to rate themselves (for creators)
    if (targetType === 'creator' && targetId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تقييم نفسك'
      });
    }

    // Check if user is trying to rate their own template
    if (targetType === 'template' && target.creator && target.creator.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تقييم قوالبك الخاصة'
      });
    }

    // Check if user is trying to rate their own blog
    if (targetType === 'blog' && target.author && target.author.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تقييم مقالاتك الخاصة'
      });
    }

    // Check if user already rated this target
    const existingRating = await Rating.findOne({
      user: userId,
      targetType,
      targetId
    });

    let savedRating;
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review || '';
      savedRating = await existingRating.save();
    } else {
      // Create new rating
      savedRating = new Rating({
        user: userId,
        targetType,
        targetId,
        rating,
        review: review || ''
      });
      await savedRating.save();
    }

    // Update target's average rating
    const { averageRating, totalRatings } = await Rating.getAverageRating(targetType, targetId);

    if (targetType === 'template') {
      await Template.findByIdAndUpdate(targetId, {
        rating: averageRating,
        reviewsCount: totalRatings
      });

      // Update creator's median rating based on all their template ratings
      const template = await Template.findById(targetId).select('creator title slug');
      if (template && template.creator) {
        const creatorTemplates = await Template.find({
          creator: template.creator,
          status: 'approved'
        }).select('rating');

        // Calculate median rating from all template ratings
        let medianRating = 0;
        if (creatorTemplates.length > 0) {
          const validRatings = creatorTemplates
            .map(t => t.rating)
            .filter(rating => rating && rating > 0)
            .sort((a, b) => a - b);

          if (validRatings.length > 0) {
            const mid = Math.floor(validRatings.length / 2);
            if (validRatings.length % 2 === 0) {
              // Even number of ratings - average of two middle values
              medianRating = (validRatings[mid - 1] + validRatings[mid]) / 2;
            } else {
              // Odd number of ratings - middle value
              medianRating = validRatings[mid];
            }
          }
        }

        await User.findByIdAndUpdate(template.creator, {
          rating: medianRating
        });

        // Notify creator about rating (non-blocking)
        try {
          if (template.creator.toString() !== req.user._id.toString()) {
            const raterName = req.user.displayName || req.user.name || 'مستخدم';
            await Notification.create({
              user: template.creator,
              type: 'template_rated',
              title: 'تم تقييم قالبك',
              message: `${raterName} قيّم قالبك ${rating} نجوم${review ? `: ${review}` : ''}`,
              link: `/templates/${template.slug || targetId}`,
              metadata: { templateId: targetId, ratingId: (existingRating?._id || savedRating?._id) || null, raterId: req.user._id, actorProfilePicture: req.user.profilePicture || '' }
            });
          }
        } catch (notifyErr) {
          console.error('Create rating notification error:', notifyErr?.message || notifyErr);
        }
      }
    } else if (targetType === 'creator') {
      await User.findByIdAndUpdate(targetId, {
        rating: averageRating
      });
    }

    res.json({
      success: true,
      message: existingRating ? 'تم تحديث التقييم بنجاح' : 'تم إضافة التقييم بنجاح',
      rating: savedRating,
      averageRating,
      totalRatings
    });

  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/ratings/:targetType/:targetId
// @desc    Get ratings for a specific template or creator
// @access  Public
router.get('/:targetType/:targetId', cacheMiddleware(300), async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Validate targetType
    if (!['template', 'creator', 'blog'].includes(targetType)) {
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
    } else if (targetType === 'blog') {
      target = await Blog.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: targetType === 'template' ? 'القالب غير موجود' : targetType === 'blog' ? 'المقال غير موجود' : 'المبدع غير موجود'
      });
    }

    // Get average rating and total count
    const { averageRating, totalRatings } = await Rating.getAverageRating(targetType, targetId);

    // Get paginated ratings
    const skip = (page - 1) * limit;
    const ratings = await Rating.find({
      targetType,
      targetId,
      isPublic: true
    })
      .populate('user', 'name username displayName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      averageRating,
      totalRatings,
      ratings,
      pagination: {
        current: page,
        pages: Math.ceil(totalRatings / limit),
        total: totalRatings,
        limit
      }
    });

  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/ratings/user/:targetType/:targetId
// @desc    Get user's rating for a specific template or creator
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

    const rating = await Rating.getUserRating(userId, targetType, targetId);

    res.json({
      success: true,
      rating
    });

  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   DELETE /api/ratings/:targetType/:targetId
// @desc    Delete user's rating for a specific template or creator
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

    // Find and delete the rating
    const rating = await Rating.findOneAndDelete({
      user: userId,
      targetType,
      targetId
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }

    // Update target's average rating
    const { averageRating, totalRatings } = await Rating.getAverageRating(targetType, targetId);

    if (targetType === 'template') {
      await Template.findByIdAndUpdate(targetId, {
        rating: averageRating,
        reviewsCount: totalRatings
      });
    } else if (targetType === 'creator') {
      await User.findByIdAndUpdate(targetId, {
        rating: averageRating
      });
    }

    res.json({
      success: true,
      message: 'تم حذف التقييم بنجاح',
      averageRating,
      totalRatings
    });

  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;
