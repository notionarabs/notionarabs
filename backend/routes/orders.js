const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Template = require('../models/Template');
const User = require('../models/User');
const auth = require('../middleware/auth');


const router = express.Router();

// @route   GET /api/orders/me
// @desc    Get current user's orders
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id, status: 'COMPLETED' })
      .populate('items.templateId', 'title slug previewImage notionLink')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الطلبات'
    });
  }
});

// @route   POST /api/orders
// @desc    Create a new order for free template downloads only
// @access  Private
router.post('/', [
  auth,
  body('items').isArray({ min: 1 }).withMessage('العناصر مطلوبة'),
  body('items.*.templateId').isString().notEmpty().withMessage('معرف القالب غير صحيح'),
  body('notes').optional().isLength({ max: 500 }).withMessage('الملاحظات طويلة جداً')
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

    const { items, notes } = req.body;

    // Verify templates exist
    const templateIds = items.map(item => item.templateId);
    const templates = await Template.find({ _id: { $in: templateIds } });

    if (templates.length !== templateIds.length) {
      return res.status(400).json({
        success: false,
        message: 'بعض القوالب غير موجودة'
      });
    }

    // This endpoint is for free templates only — paid templates go through the payment flow
    const hasPaidTemplate = templates.some(t => t.isPaid && t.price > 0);
    if (hasPaidTemplate) {
      return res.status(400).json({
        success: false,
        message: 'القوالب المدفوعة تتطلب إتمام الدفع أولاً'
      });
    }

    // Compute total from actual DB prices — never trust client-provided values
    const total = templates.reduce((sum, t) => sum + (t.price || 0), 0);

    const order = new Order({
      user: req.user.id,
      items: items.map(item => {
        const template = templates.find(t => t._id.toString() === item.templateId);
        return { templateId: item.templateId, name: template?.title || '', price: template?.price || 0 };
      }),
      total,
      status: 'COMPLETED',
      source: 'download',
      notes,
      downloaded: true
    });

    await order.save();
    await order.populate('items.templateId', 'title slug previewImage notionLink');

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الطلب'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('items.templateId', 'title slug previewImage notionLink')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الطلب'
    });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order notes (status is managed by the payment system only)
// @access  Private
router.put('/:id', [
  auth,
  body('notes').optional().isLength({ max: 500 }).withMessage('الملاحظات طويلة جداً')
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

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    const { notes } = req.body;
    if (notes !== undefined) order.notes = notes;

    await order.save();

    res.json({
      success: true,
      message: 'تم تحديث الطلب بنجاح',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الطلب'
    });
  }
});

module.exports = router;
