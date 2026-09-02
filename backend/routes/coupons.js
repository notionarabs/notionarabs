const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Coupon = require('../models/Coupon');
const Template = require('../models/Template');
const { body, validationResult } = require('express-validator');

// Helper to verify creator status
const isCreatorOrAdmin = (req, res, next) => {
  const isCreator = req.user?.creatorStatus?.toUpperCase() === 'APPROVED';
  const isAdmin = req.user?.role?.toUpperCase() === 'ADMIN';
  if (!isCreator && !isAdmin) {
    return res.status(403).json({ success: false, message: 'غير مصرح: هذه الميزة متاحة فقط لصناع المحتوى المعتمدين' });
  }
  next();
};

/**
 * @route   POST /api/coupons/validate
 * @desc    Validate a promo code for a given template
 * @access  Public
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, templateId } = req.body;

    if (!code || !templateId) {
      return res.status(400).json({ success: false, message: 'الرجاء توفير كود الخصم ومعرّف القالب' });
    }

    const cleanCode = code.toString().trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'كود الخصم غير موجود أو غير صالح' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'كود الخصم غير مفعل حالياً' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'انتهت صلاحية كود الخصم هذا' });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'تم استنفاد الحد الأقصى لاستخدام كود الخصم هذا' });
    }

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'القالب غير موجود' });
    }

    if (!template.isPaid || !template.price || template.price <= 0) {
      return res.status(400).json({ success: false, message: 'كود الخصم لا ينطبق إلا على القوالب المدفوعة' });
    }

    // Check template scope
    if (coupon.templateId && String(coupon.templateId) !== String(template._id || template.id)) {
      return res.status(400).json({ success: false, message: 'كود الخصم هذا مخصص لقالب آخر' });
    }

    // Check creator scope
    const templateCreatorId = String(template.creator?._id || template.creator?.id || template.creator);
    if (String(coupon.creatorId) !== templateCreatorId) {
      return res.status(400).json({ success: false, message: 'كود الخصم غير متاح لقوالب هذا الصانع' });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round(((template.price * coupon.discountValue) / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), template.price);
    }
    const finalPrice = Math.max(0, Math.round((template.price - discountAmount) * 100) / 100);

    return res.json({
      success: true,
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        originalPrice: template.price,
        finalPrice
      }
    });

  } catch (error) {
    console.error('Validate Coupon Error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ أثناء التحقق من كود الخصم' });
  }
});

/**
 * @route   GET /api/coupons/creator
 * @desc    Get all coupons created by current creator
 * @access  Private (Creator/Admin)
 */
router.get('/creator', auth, isCreatorOrAdmin, async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const coupons = await Coupon.find({ creatorId: userId });

    // Populate template titles if applicable
    const enrichedCoupons = await Promise.all(
      coupons.map(async (coupon) => {
        let templateTitle = 'جميع القوالب';
        if (coupon.templateId) {
          try {
            const template = await Template.findById(coupon.templateId);
            if (template) {
              templateTitle = template.title;
            }
          } catch (_) {}
        }
        return {
          ...coupon,
          templateTitle
        };
      })
    );

    return res.json({ success: true, coupons: enrichedCoupons });
  } catch (error) {
    console.error('Get Creator Coupons Error:', error);
    return res.status(500).json({ success: false, message: 'فشل في جلب قائمة الكوبونات' });
  }
});

/**
 * @route   POST /api/coupons/creator
 * @desc    Create a new coupon
 * @access  Private (Creator/Admin)
 */
router.post(
  '/creator',
  auth,
  isCreatorOrAdmin,
  [
    body('code')
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage('يجب أن يتراوح طول كود الخصم بين 3 و 25 حرفاً')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('يجب أن يحتوي كود الخصم على أحرف وأرقام وشرطات فقط'),
    body('discountType')
      .isIn(['percentage', 'fixed'])
      .withMessage('نوع الخصم يجب أن يكون percentage أو fixed'),
    body('discountValue')
      .isFloat({ min: 1 })
      .withMessage('قيمة الخصم يجب أن تكون أكبر من أو تساوي 1')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const userId = (req.user.id || req.user._id).toString();
      const { code, templateId, discountType, discountValue, maxUses, expiresAt } = req.body;
      const cleanCode = code.trim().toUpperCase();

      // Check for code uniqueness
      const existing = await Coupon.findOne({ code: cleanCode });
      if (existing) {
        return res.status(400).json({ success: false, message: 'كود الخصم هذا مستخدم بالفعل، اختر كوداً آخر' });
      }

      // Check discount value validity
      const numValue = Number(discountValue);
      if (discountType === 'percentage' && (numValue < 1 || numValue > 100)) {
        return res.status(400).json({ success: false, message: 'نسبة الخصم يجب أن تكون بين 1% و 100%' });
      }

      // If templateId provided, verify template belongs to creator and is paid
      if (templateId) {
        const template = await Template.findById(templateId);
        if (!template) {
          return res.status(404).json({ success: false, message: 'القالب المحدد غير موجود' });
        }
        const templateCreatorId = String(template.creator?._id || template.creator?.id || template.creator);
        if (templateCreatorId !== userId && req.user.role?.toUpperCase() !== 'ADMIN') {
          return res.status(403).json({ success: false, message: 'لا يمكنك إنشاء كود خصم لقالب لا تملكه' });
        }
        if (!template.isPaid || !template.price) {
          return res.status(400).json({ success: false, message: 'لا يمكن إنشاء كود خصم لقالب مجاني' });
        }
        if (discountType === 'fixed' && numValue > template.price) {
          return res.status(400).json({ success: false, message: `قيمة الخصم (${numValue} ج.م) لا يمكن أن تتجاوز سعر القالب (${template.price} ج.م)` });
        }
      }

      // Check expiration date
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        return res.status(400).json({ success: false, message: 'تاريخ انتهاء الكوبون يجب أن يكون في المستقبل' });
      }

      const coupon = await Coupon.create({
        code: cleanCode,
        creatorId: userId,
        templateId: templateId || null,
        discountType,
        discountValue: numValue,
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        isActive: true
      });

      return res.status(201).json({
        success: true,
        message: 'تم إنشاء كود الخصم بنجاح 🎉',
        coupon
      });

    } catch (error) {
      console.error('Create Coupon Error:', error);
      if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
        return res.status(400).json({
          success: false,
          message: 'جدول الكوبونات غير منشأ في قاعدة البيانات بعد. يرجى تشغيل سكربت coupons_migration.sql في Supabase SQL Editor.'
        });
      }
      return res.status(500).json({ success: false, message: error.message || 'فشل في إنشاء كود الخصم' });
    }
  }
);

/**
 * @route   PATCH /api/coupons/creator/:id
 * @desc    Update coupon status or properties
 * @access  Private (Creator/Admin)
 */
router.patch('/creator/:id', auth, isCreatorOrAdmin, async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'كود الخصم غير موجود' });
    }

    if (String(coupon.creatorId) !== userId && req.user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بتعديل هذا الكوبون' });
    }

    const { isActive, maxUses, expiresAt } = req.body;

    if (isActive !== undefined) coupon.isActive = Boolean(isActive);
    if (maxUses !== undefined) coupon.maxUses = maxUses ? parseInt(maxUses, 10) : null;
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt ? new Date(expiresAt).toISOString() : null;

    await coupon.save();

    return res.json({
      success: true,
      message: 'تم تحديث كود الخصم بنجاح',
      coupon
    });
  } catch (error) {
    console.error('Update Coupon Error:', error);
    return res.status(500).json({ success: false, message: 'فشل في تحديث كود الخصم' });
  }
});

/**
 * @route   DELETE /api/coupons/creator/:id
 * @desc    Delete a coupon
 * @access  Private (Creator/Admin)
 */
router.delete('/creator/:id', auth, isCreatorOrAdmin, async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'كود الخصم غير موجود' });
    }

    if (String(coupon.creatorId) !== userId && req.user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بحذف هذا الكوبون' });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'تم حذف كود الخصم بنجاح'
    });
  } catch (error) {
    console.error('Delete Coupon Error:', error);
    return res.status(500).json({ success: false, message: 'فشل في حذف كود الخصم' });
  }
});

module.exports = router;
