const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validatePayment = [
  body('templateId').optional().isMongoId().withMessage('معرف القالب غير صحيح'),
  body('subscription').optional().isIn(['creator', 'professional']).withMessage('نوع الاشتراك غير صحيح'),
  body('country').isLength({ min: 2, max: 2 }).withMessage('رمز البلد مطلوب'),
  body('billingAddress.city').optional().isLength({ min: 2, max: 50 }).withMessage('اسم المدينة غير صحيح'),
  body('billingAddress.postalCode').optional().isLength({ min: 3, max: 10 }).withMessage('الرمز البريدي غير صحيح')
];

// Create payment intent
router.post('/create-intent', auth, validatePayment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { templateId, subscription, country, billingAddress } = req.body;
    const buyerId = req.user.id;

    // Validate that either templateId or subscription is provided
    if (!templateId && !subscription) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد قالب أو نوع اشتراك'
      });
    }

    const paymentData = {
      buyerId,
      templateId,
      subscription,
      country,
      billingAddress: {
        ...billingAddress,
        country
      }
    };

    const result = await paymentService.createPaymentIntent(paymentData);

    res.json({
      success: true,
      message: 'تم إنشاء طلب الدفع بنجاح',
      data: result
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في إنشاء طلب الدفع'
    });
  }
});

// Confirm payment
router.post('/confirm', auth, async (req, res) => {
  try {
    const { paymentId, gatewayData } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الدفع مطلوب'
      });
    }

    const result = await paymentService.confirmPayment(paymentId, gatewayData);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          payment: result.payment,
          redirectUrl: `${process.env.FRONTEND_URL}/payment/success`
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'فشل في تأكيد الدفع'
      });
    }

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في تأكيد الدفع'
    });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const result = await paymentService.getPaymentHistory(userId, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في جلب تاريخ المدفوعات'
    });
  }
});

// Get creator earnings
router.get('/earnings', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a creator
    if (req.user.creatorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'يجب أن تكون مبدعاً معتمداً لعرض الأرباح'
      });
    }

    const earnings = await paymentService.getCreatorEarnings(userId);

    res.json({
      success: true,
      data: earnings
    });

  } catch (error) {
    console.error('Get creator earnings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في جلب الأرباح'
    });
  }
});

// Process payout request
router.post('/payout', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    // Check if user is a creator
    if (req.user.creatorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'يجب أن تكون مبدعاً معتمداً لطلب الدفع'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ المطلوب غير صحيح'
      });
    }

    const result = await paymentService.processPayout(userId, amount);

    res.json({
      success: true,
      message: result.message,
      data: {
        payoutId: result.payoutId
      }
    });

  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ في معالجة طلب الدفع'
    });
  }
});

// Webhook handlers for each gateway
router.post('/webhook/tap_payments', async (req, res) => {
  try {
    const tapPayments = require('../services/gateways/tapPayments');
    const result = await tapPayments.handleWebhook(req.body);

    if (result.success) {
      // Update payment status
      const payment = await paymentService.confirmPayment(result.transactionId, {
        transactionId: result.transactionId
      });
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Tap Payments webhook error:', error);
    res.status(500).json({ success: false });
  }
});

// Removed Paymob and HyperPay webhooks per configuration change

router.post('/webhook/paypal', async (req, res) => {
  try {
    const paypal = require('../services/gateways/paypal');
    const result = await paypal.handleWebhook(req.body);

    if (result.success) {
      // Update payment status
      const payment = await paymentService.confirmPayment(result.transactionId, {
        transactionId: result.transactionId
      });
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({ success: false });
  }
});

// Get supported countries and currencies
router.get('/supported-countries', (req, res) => {
  const supportedCountries = {
    'AE': { name: 'الإمارات العربية المتحدة', currency: 'AED', gateway: 'tap_payments' },
    'SA': { name: 'المملكة العربية السعودية', currency: 'SAR', gateway: 'tap_payments' },
    'KW': { name: 'الكويت', currency: 'KWD', gateway: 'tap_payments' },
    'BH': { name: 'البحرين', currency: 'BHD', gateway: 'tap_payments' },
    'QA': { name: 'قطر', currency: 'QAR', gateway: 'tap_payments' },
    'OM': { name: 'عُمان', currency: 'OMR', gateway: 'tap_payments' },
    'EG': { name: 'مصر', currency: 'EGP', gateway: 'paypal' },
    'JO': { name: 'الأردن', currency: 'JOD', gateway: 'paypal' },
    'LB': { name: 'لبنان', currency: 'LBP', gateway: 'paypal' },
    'MA': { name: 'المغرب', currency: 'MAD', gateway: 'paypal' },
    'TN': { name: 'تونس', currency: 'TND', gateway: 'paypal' },
    'DZ': { name: 'الجزائر', currency: 'DZD', gateway: 'paypal' },
    'LY': { name: 'ليبيا', currency: 'LYD', gateway: 'paypal' },
    'SY': { name: 'سوريا', currency: 'SYP', gateway: 'paypal' },
    'IQ': { name: 'العراق', currency: 'IQD', gateway: 'paypal' },
    'PS': { name: 'فلسطين', currency: 'USD', gateway: 'paypal' }
  };

  res.json({
    success: true,
    data: supportedCountries
  });
});

module.exports = router;
