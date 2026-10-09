const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Optional auth helper to attach req.user if token is present
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      if (userId) {
        const user = await User.findById(userId);
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
  } catch (err) {
    // Ignore invalid token for public endpoints
  }
  next();
};

// @route   GET /api/courses
// @desc    Get all published courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الدورات التدريبية'
    });
  }
});

// @route   GET /api/courses/:slug
// @desc    Get course details with modules & lessons
// @access  Public (with optional user progress)
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findBySlug(slug);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'الدورة غير موجودة'
      });
    }

    let userProgress = { completedLessonIds: [] };
    if (req.user) {
      const userId = req.user.id || req.user._id;
      userProgress = await Course.getUserProgress(userId, course.id);
    }

    res.json({
      success: true,
      course,
      userProgress
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب تفاصيل الدورة'
    });
  }
});

// @route   GET /api/courses/:slug/lessons/:lessonId
// @desc    Get single lesson player details + stream URL + nav
// @access  Public / Optional Auth
router.get('/:slug/lessons/:lessonId', optionalAuth, async (req, res) => {
  try {
    const { slug, lessonId } = req.params;
    const lessonData = await Course.findLesson(slug, lessonId);

    if (!lessonData) {
      return res.status(404).json({
        success: false,
        message: 'الدرس غير موجود'
      });
    }

    let isCompleted = false;
    let completedLessonIds = [];
    if (req.user) {
      const userId = req.user.id || req.user._id;
      const progress = await Course.getUserProgress(userId, lessonData.course.id);
      completedLessonIds = progress.completedLessonIds || [];
      isCompleted = completedLessonIds.includes(lessonData.lesson.id);
    }

    res.json({
      success: true,
      ...lessonData,
      isCompleted,
      completedLessonIds
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات الدرس'
    });
  }
});

// @route   POST /api/courses/:slug/lessons/:lessonId/progress
// @desc    Toggle lesson completion
// @access  Private (Authenticated user)
router.post('/:slug/lessons/:lessonId/progress', auth, async (req, res) => {
  try {
    const { slug, lessonId } = req.params;
    const { isCompleted = true } = req.body;

    const course = await Course.findBySlug(slug);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'الدورة غير موجودة'
      });
    }

    const userId = req.user.id || req.user._id;
    const result = await Course.toggleLessonProgress(userId, course.id, lessonId, isCompleted);

    res.json({
      success: true,
      isCompleted: result.isCompleted,
      completedCount: result.completedCount
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث تقدم الدرس'
    });
  }
});

module.exports = router;
