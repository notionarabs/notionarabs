const express = require('express');
const { body, validationResult } = require('express-validator');
const Rating = require('../models/Rating');
const Template = require('../models/Template');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const { cacheMiddleware } = require('../utils/redis-cache');
const supabase = require('../utils/supabase');

const router = express.Router();

// @route   POST /api/ratings
// @desc    Submit a rating for a template, creator, blog, or the platform
// @access  Private
router.post('/', auth, [
  body('targetType')
    .isIn(['template', 'creator', 'blog', 'platform'])
    .withMessage('نوع الهدف يجب أن يكون template أو creator أو blog أو platform'),
  body('targetId')
    .isString()
    .notEmpty()
    .withMessage('معرف الهدف غير صحيح'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('التقييم يجب أن يكون رقماً بين 1 و 5'),
  body('review')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('التعليق لا يجب أن يتجاوز 1000 حرف')
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
    } else if (targetType === 'platform') {
      target = { _id: 'platform' };
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: targetType === 'template' ? 'القالب غير موجود' : targetType === 'blog' ? 'المقال غير موجود' : targetType === 'platform' ? 'المنصة غير موجودة' : 'المبدع غير موجود'
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

    // Check if user has downloaded or purchased the template
    if (targetType === 'template') {
      const hasPurchased = await Order.existsForTemplate(userId, targetId);
      if (!hasPurchased) {
        return res.status(403).json({
          success: false,
          message: 'يجب تحميل القالب أو شراؤه أولاً لتتمكن من تقييمه أو التعليق عليه'
        });
      }
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

        // Calculate average rating from all template ratings
        let averageRating = 0;
        if (creatorTemplates.length > 0) {
          const validRatings = creatorTemplates
            .map(t => t.rating)
            .filter(rating => rating && rating > 0);

          if (validRatings.length > 0) {
            averageRating = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
          }
        }

        await User.findByIdAndUpdate(template.creator, {
          rating: averageRating
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
    } else if (targetType === 'blog') {
      const blog = await Blog.findById(targetId);
      if (blog && blog.author && blog.author.toString() !== req.user._id.toString()) {
        try {
          const raterName = req.user.displayName || req.user.name || 'مستخدم';
          await Notification.create({
            user: blog.author,
            type: 'blog_rated',
            title: 'تم تقييم مقالك',
            message: `${raterName} قيّم مقالك ${rating} نجوم${review ? `: ${review}` : ''}`,
            link: `/blog/${blog.slug || targetId}`,
            metadata: { blogId: targetId, ratingId: (existingRating?._id || savedRating?._id) || null, raterId: req.user._id, actorProfilePicture: req.user.profilePicture || '' }
          });
        } catch (notifyErr) {
          console.error('Create blog rating notification error:', notifyErr?.message || notifyErr);
        }
      }
    }

    res.json({
      success: true,
      message: existingRating ? 'تم تحديث التقييم بنجاح' : 'تم إضافة التقييم بنجاح',
      rating: savedRating,
      averageRating,
      totalRatings,
      summary: {
        averageRating,
        totalRatings
      }
    });

  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   GET /api/ratings/public/featured
// @desc    Get top featured public ratings/reviews (e.g. 4 and 5 stars) across all targets
// @access  Public
router.get('/public/featured', cacheMiddleware(120), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find all public template ratings
    const ratings = await Rating.find({
      isPublic: true,
      targetType: 'template'
    })
      .populate('user', 'name username displayName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // We populate templates if they are templates
    const populatedRatings = await Promise.all(ratings.map(async (r) => {
      let targetDetails = null;
      if (r.targetType === 'template' && r.targetId) {
        try {
          const template = await Template.findById(r.targetId);
          if (template) {
            targetDetails = {
              title: template.title,
              slug: template.slug,
              previewImage: template.previewImage,
              price: template.price,
              isPaid: template.isPaid
            };
          }
        } catch (e) {
          console.error('Error fetching template details for review:', e);
        }
      } else if (r.targetType === 'blog' && r.targetId) {
        try {
          const blog = await Blog.findById(r.targetId);
          if (blog) {
            targetDetails = {
              title: blog.title,
              slug: blog.slug,
              previewImage: blog.featuredImage
            };
          }
        } catch (e) {
          console.error('Error fetching blog details for review:', e);
        }
      }
      
      return {
        id: r.id || r._id,
        user: r.user,
        rating: r.rating,
        review: r.review,
        targetType: r.targetType,
        targetId: r.targetId,
        targetDetails,
        createdAt: r.createdAt
      };
    }));

    // Filter to only include reviews that have a written comment (not just blank stars)
    const filteredRatings = populatedRatings.filter(r => r.review && r.review.trim().length > 1);

    res.json({
      success: true,
      ratings: filteredRatings
    });
  } catch (error) {
    console.error('Get featured ratings error:', error);
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
    if (!['template', 'creator', 'blog', 'platform'].includes(targetType)) {
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
    } else if (targetType === 'platform') {
      target = { _id: 'platform' };
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: targetType === 'template' ? 'القالب غير موجود' : targetType === 'blog' ? 'المقال غير موجود' : targetType === 'platform' ? 'المنصة غير موجودة' : 'المبدع غير موجود'
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

    // Add verified purchase flag if target is a template
    const ratingsWithVerification = await Promise.all(ratings.map(async (r) => {
      let isVerified = false;
      if (targetType === 'template') {
        const { data: orderItems } = await supabase
          .from('OrderItem')
          .select('orderId')
          .eq('templateId', targetId);

        if (orderItems && orderItems.length > 0) {
          const orderIds = orderItems.map(item => item.orderId);
          const userId = r.user?._id || r.userId;
          
          // Chunk order IDs to prevent Supabase headers overflow
          const chunkSize = 100;
          let hasOrder = false;
          for (let i = 0; i < orderIds.length; i += chunkSize) {
            const chunk = orderIds.slice(i, i + chunkSize);
            const { data: order, error: orderErr } = await supabase
              .from('Order')
              .select('id')
              .in('id', chunk)
              .eq('userId', userId)
              .eq('status', 'COMPLETED')
              .limit(1)
              .maybeSingle();
            
            if (orderErr) throw orderErr;
            if (order) {
              hasOrder = true;
              break;
            }
          }
          isVerified = hasOrder;
        }
      }
      return { ...r, isVerified };
    }));

    res.json({
      success: true,
      averageRating, // Keep for backward compatibility
      totalRatings,  // Keep for backward compatibility
      summary: {
        averageRating,
        totalRatings
      },
      ratings: ratingsWithVerification,
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
    if (!['template', 'creator', 'blog', 'platform'].includes(targetType)) {
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
    if (!['template', 'creator', 'blog', 'platform'].includes(targetType)) {
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

// @route   POST /api/ratings/:ratingId/reply
// @desc    Reply to a rating (for creators/admins)
// @access  Private
router.post('/:ratingId/reply', auth, [
  body('reply')
    .notEmpty()
    .withMessage('الرد لا يمكن أن يكون فارغاً')
    .isLength({ max: 1000 })
    .withMessage('الرد لا يجب أن يتجاوز 1000 حرف')
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

    const { ratingId } = req.params;
    const { reply } = req.body;
    const userId = req.user._id;

    // Find the rating
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }

    // Check authorization
    // Only the creator of the target (template/blog) or the creator themselves (if targetType is creator) can reply
    let isAuthorized = false;
    
    if (rating.targetType === 'template') {
      const template = await Template.findById(rating.targetId);
      if (template && template.creator && template.creator.toString() === userId.toString()) {
        isAuthorized = true;
      }
    } else if (rating.targetType === 'creator') {
      if (rating.targetId === userId.toString()) {
        isAuthorized = true;
      }
    } else if (rating.targetType === 'blog') {
      const blog = await Blog.findById(rating.targetId);
      if (blog && blog.author && blog.author.toString() === userId.toString()) {
        isAuthorized = true;
      }
    }

    // Admins are always authorized
    if (req.user.role === 'admin') isAuthorized = true;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالرد على هذا التقييم'
      });
    }

    // Update the rating with reply
    const updatedRating = await Rating.findByIdAndUpdate(ratingId, {
      creatorReply: reply,
      repliedAt: new Date().toISOString()
    });

    // Notify the user who left the rating
    try {
      const targetName = rating.targetType === 'template' ? 'قالبك' : 'تقييمك';
      await Notification.create({
        user: rating.userId,
        type: 'comment_replied',
        title: 'رد جديد على تقييمك',
        message: `قام المبدع بالرد على تقييمك: "${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}"`,
        link: rating.targetType === 'template' ? `/templates/${rating.targetId}` : `/creators/${rating.targetId}`,
        metadata: { ratingId, reply, actorId: userId, actorProfilePicture: req.user.profilePicture || '' }
      });
    } catch (notifyErr) {
      console.error('Reply notification error:', notifyErr);
    }

    res.json({
      success: true,
      message: 'تم إضافة الرد بنجاح',
      rating: updatedRating
    });

  } catch (error) {
    console.error('Reply submission error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;
