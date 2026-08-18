const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendEmail, getMasterTemplate } = require('../services/emailService');

const router = express.Router();

// Email transporter adapter delegating to unified emailService (Resend & Brevo)
const createTransporter = (defaultCategory = 'support') => {
  return {
    sendMail: async (mailOptions) => {
      return await sendEmail({
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text,
        from: mailOptions.from,
        replyTo: mailOptions.replyTo,
        category: mailOptions.category || defaultCategory
      });
    },
    verify: (callback) => {
      if (callback) callback(null, true);
      return Promise.resolve(true);
    }
  };
};

// @route   POST /api/contact/creator
// @desc    Send message to creator
// @access  Public
router.post('/creator', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('الموضوع يجب أن يكون بين 1 و 100 حرف'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('الرسالة يجب أن تكون بين 1 و 1000 حرف'),
  body('creatorId')
    .isString()
    .notEmpty()
    .withMessage('معرف المبدع غير صحيح')
], async (req, res) => {
  try {

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { name, email, subject, message, creatorId } = req.body;

    // Find creator
    const creator = await User.findById(creatorId);

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'المبدع غير موجود'
      });
    }

    // Check if creator allows messages
    if (creator.allowMessages === false) {
      return res.status(403).json({
        success: false,
        message: 'هذا المبدع لا يقبل الرسائل حالياً'
      });
    }


    // Return success immediately - no email sending to avoid delays
    res.json({
      success: true,
      message: 'تم استلام رسالتك بنجاح! سنتواصل معك قريباً.'
    });

    // Try to send email in background (non-blocking)
    if (process.env.RESEND_API_KEY || process.env.BREVO_API_KEY || (process.env.EMAIL_USER && process.env.EMAIL_PASS)) {
      setImmediate(async () => {
        try {
          const transporter = createTransporter();
          await transporter.verify();

          const mailContent = `
            <h2>رسالة جديدة من: ${name}</h2>
            <div class="feature-box">
              <p style="margin: 6px 0;"><strong>المرسل:</strong> ${name}</p>
              <p style="margin: 6px 0;"><strong>البريد الإلكتروني:</strong> <a href="mailto:${email}" style="color: #f5631e; text-decoration: none;">${email}</a></p>
              <p style="margin: 6px 0;"><strong>الموضوع:</strong> ${subject}</p>
            </div>
            
            <h3 style="color: #0f172a; font-size: 16px; margin: 24px 0 10px 0;">محتوى الرسالة:</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 15px 0; color: #334155; line-height: 1.8;">
              ${message.replace(/\n/g, "<br>")}
            </div>
            
            <div style="text-align: center; margin: 28px 0 10px 0;">
              <a href="mailto:${email}" class="button">الرد المباشر على المرسل</a>
            </div>
          `;

          const mailOptions = {
            from: process.env.EMAIL_FROM_SUPPORT || "support@notionarabs.com",
            replyTo: email,
            to: creator.email,
            subject: `رسالة جديدة من ${name}: ${subject}`,
            html: getMasterTemplate(mailContent, "رسالة جديدة من موقع عرب نوشن"),
            text: `رسالة جديدة من: ${name} (${email})\nالموضوع: ${subject}\n\n${message}`,
            category: "support"
          };
          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Email sending failed (background):', emailError.message);
        }
      });
    }
    return;


  } catch (error) {
    console.error('Contact creator error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/contact/general
// @desc    Send general contact message
// @access  Public
router.post('/general', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('الموضوع يجب أن يكون بين 1 و 100 حرف'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('الرسالة يجب أن تكون بين 1 و 1000 حرف')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;


    let notionResult = null;
    if (req.body.category === 'careers') {
      notionResult = await addCareerApplicationToNotion({
        name,
        email,
        whatsapp: req.body.whatsapp,
        basedIn: req.body.basedIn,
        linkedin: req.body.linkedin,
        experience: req.body.experience,
        coverLetter: req.body.coverLetter,
        resumeUrl: req.body.resumeUrl,
        startTime: req.body.startTime,
        message,
        source: 'website-careers'
      });
      if (notionResult?.error) {
        console.error('Careers Notion sync failed:', notionResult.error);
        return res.status(500).json({
          success: false,
          message: 'تعذر حفظ الطلب في نوشن. يرجى المحاولة لاحقاً.',
          error: process.env.NODE_ENV === 'development' ? notionResult.error : undefined
        });
      }
    }

    // Return success immediately - no email sending to avoid delays
    res.json({
      success: true,
      message: 'تم استلام رسالتك بنجاح! سنتواصل معك قريباً.'
    });

    // Try to send email in background (non-blocking)
    if (process.env.RESEND_API_KEY || process.env.BREVO_API_KEY || (process.env.EMAIL_USER && process.env.EMAIL_PASS)) {
      setImmediate(async () => {
        try {
          const transporter = createTransporter();
          await transporter.verify();

          const mailContent = `
            <h2>استفسار جديد عبر نموذج التواصل</h2>
            <div class="feature-box">
              <p style="margin: 6px 0;"><strong>المرسل:</strong> ${name}</p>
              <p style="margin: 6px 0;"><strong>البريد الإلكتروني:</strong> <a href="mailto:${email}" style="color: #f5631e; text-decoration: none;">${email}</a></p>
              <p style="margin: 6px 0;"><strong>الموضوع:</strong> ${subject}</p>
              <p style="margin: 6px 0;"><strong>نوع الاستفسار:</strong> ${req.body.category || 'عام'}</p>
            </div>
            
            <h3 style="color: #0f172a; font-size: 16px; margin: 24px 0 10px 0;">محتوى الاستفسار:</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 15px 0; color: #334155; line-height: 1.8;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <div style="text-align: center; margin: 28px 0 10px 0;">
              <a href="mailto:${email}" class="button">الرد على العميل</a>
            </div>
          `;

          const mailOptions = {
            from: process.env.EMAIL_FROM_SUPPORT || 'support@notionarabs.com',
            replyTo: email,
            to: process.env.SUPPORT_EMAIL || 'support@notionarabs.com',
            subject: `[تواصل] ${subject} - ${name}`,
            html: getMasterTemplate(mailContent, 'رسالة تواصل جديدة'),
            text: `استفسار جديد من: ${name} (${email})\nالموضوع: ${subject}\nالنوع: ${req.body.category || 'عام'}\n\n${message}`,
            category: 'support'
          };

          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Email sending failed (background):', emailError.message);
        }
      });
    }
    return;

  } catch (error) {
    console.error('General contact error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/contact/consultation
// @desc    Create a consultation booking and sync to Notion
// @access  Public
router.post('/consultation', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرف'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('companyType')
    .isIn(['Individual', 'Company'])
    .withMessage('نوع الشركة غير صحيح'),
  body('whatsapp')
    .isLength({ min: 6, max: 30 })
    .withMessage('رقم الواتساب غير صحيح'),
  body('serviceType')
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      if (Array.isArray(value)) {
        return value.length === 0 || value.every((item) => typeof item === 'string' && item.trim().length > 1);
      }
      return typeof value === 'string' && value.trim().length > 1;
    })
    .withMessage('نوع الخدمة غير صحيح'),
  body('details')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('النبذة يجب أن تكون بين 1 و 2000 حرف'),
  body('teamSize')
    .optional({ checkFalsy: true })
    .isLength({ min: 1, max: 100 })
    .withMessage('حجم الفريق غير صحيح'),
  body('role')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('الدور غير صحيح'),
  body('challenge')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 200 })
    .withMessage('التحدي غير صحيح'),
  body('projectHelp')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 300 })
    .withMessage('المشروع غير صحيح'),
  body('companyName')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 200 })
    .withMessage('اسم الشركة غير صحيح'),
  body('budget')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 200 })
    .withMessage('الميزانية غير صحيحة'),
  body('timeline')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 200 })
    .withMessage('موعد البدء غير صحيح'),
  body('referral')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 200 })
    .withMessage('مصدر التعرف غير صحيح'),
  body('companyWebsite')
    .optional({ checkFalsy: true })
    .isURL({ require_protocol: false, require_valid_protocol: false, require_tld: true })
    .withMessage('رابط الموقع غير صحيح'),
  body('ref').optional({ checkFalsy: true }).trim(),
  body('utm_source').optional({ checkFalsy: true }).trim(),
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

    if (req.body.companyType === 'Individual') {
      const requiredFields = ['serviceType', 'details', 'budget', 'timeline'];
      const missing = requiredFields.filter((field) => {
        const value = req.body[field];
        if (field === 'serviceType') {
          if (Array.isArray(value)) {
            return value.length === 0;
          }
          return !value || (typeof value === 'string' && value.trim().length === 0);
        }
        // For other fields, check if value is falsy or empty string after trim
        return !value || (typeof value === 'string' && value.trim().length === 0);
      });


      if (missing.length) {
        return res.status(400).json({
          success: false,
          message: 'يرجى تعبئة بيانات الأفراد المطلوبة.',
          missing
        });
      }
    }

    if (req.body.companyType === 'Company') {
      const requiredFields = ['projectHelp', 'companyName', 'role', 'teamSize', 'budget', 'timeline'];
      const missing = requiredFields.filter((field) => !req.body[field]);
      if (missing.length) {
        return res.status(400).json({
          success: false,
          message: 'يرجى تعبئة بيانات الشركات المطلوبة.',
          missing
        });
      }
    }

    const normalizeWebsite = (value) => {
      if (!value) {
        return '';
      }
      const trimmed = String(value).trim();
      if (!trimmed) {
        return '';
      }
      const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      return normalized.toLowerCase();
    };

    const payload = {
      name: req.body.name,
      email: req.body.email,
      whatsapp: req.body.whatsapp || '',
      companyType: req.body.companyType,
      teamSize: req.body.teamSize || '',
      role: req.body.role || '',
      challenge: req.body.challenge || '',
      projectHelp: req.body.projectHelp || '',
      companyName: req.body.companyName || '',
      budget: req.body.budget || '',
      timeline: req.body.timeline || '',
      companyWebsite: normalizeWebsite(req.body.companyWebsite),
      serviceType: Array.isArray(req.body.serviceType) ? req.body.serviceType : (req.body.serviceType ? [req.body.serviceType] : []),
      details: req.body.details,
      source: req.body.source || 'website-contact',
      ref: req.body.ref || '',
      utm_source: req.body.utm_source || ''
    };

    const result = await addConsultationToNotion(payload);
    if (result?.error) {
      console.error('Consultation Notion sync failed:', result.error);
      return res.status(500).json({
        success: false,
        message: 'تعذر حفظ الحجز في نوشن. يرجى المحاولة لاحقاً.',
        error: process.env.NODE_ENV === 'development' ? result.error : undefined
      });
    }

    // Try to send email to the user with the booking link
    if (process.env.RESEND_API_KEY || process.env.BREVO_API_KEY) {
      setImmediate(async () => {
        try {
          const transporter = createTransporter();
          await transporter.verify();

          const bookingContent = `
            <h2>أهلاً بك ${payload.name}،</h2>
            <p>شكراً لطلبك الحصول على استشارة مخصصة من فريق عرب نوشن. نحن متحمسون لمساعدتك في بناء وتطوير نظام عملك على نوشن!</p>
            
            <div class="feature-box">
              <strong>تفاصيل الاستشارة:</strong>
              <p style="margin: 6px 0;">جلسة استكشافية وتخطيطية مع مستشار معتمد في نوشن.</p>
              <p style="margin: 6px 0;">يرجى اختيار الموعد المناسب لجدولك من الرابط أدناه.</p>
            </div>
            
            <div style="text-align: center; margin: 28px 0;">
              <a href="https://calendar.notion.so/meet/notionarabs/discovery-call" class="button">
                احجز موعد الاستشارة الآن
              </a>
            </div>

            <p class="secondary-text" style="margin-top: 20px;">
              إذا واجهت أي استفسار أو رغبت في تعديل الموعد، يمكنك الرد على هذه الرسالة مباشرة وسيقوم فريقنا بمساعدتك.
            </p>
          `;

          const mailOptions = {
            from: process.env.EMAIL_FROM_SUPPORT || 'support@notionarabs.com',
            to: payload.email,
            subject: `حجز موعد الاستشارة - عرب نوشن`,
            html: getMasterTemplate(bookingContent, 'تأكيد حجز موعد الاستشارة'),
            text: `أهلاً ${payload.name}،\n\nشكراً لطلبك الحصول على استشارة من عرب نوشن.\nيرجى اختيار الموعد المناسب من الرابط:\nhttps://calendar.notion.so/meet/notionarabs/discovery-call\n\nعرب نوشن`,
            category: 'support'
          };

          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('Email sending failed (background consultation):', emailError.message);
        }
      });
    }

    return res.json({
      success: true,
      message: 'تم استلام طلب الاستشارة بنجاح! سنتواصل معك لتأكيد الموعد.'
    });
  } catch (error) {
    console.error('Consultation booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// @route   POST /api/contact/submit
// @desc    Submit contact form to Notion
// @access  Public
router.post('/submit', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('الاسم يجب أن يكون بين 2 و 100 حرف'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح'),
  body('whatsapp')
    .trim()
    .isLength({ min: 6, max: 30 })
    .withMessage('رقم الواتساب غير صحيح'),
  body('details')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('التفاصيل يجب أن تكون بين 10 و 2000 حرف')
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

    const { name, email, whatsapp, details } = req.body;


    // Send to Notion
    const result = await addContactToNotion({
      name,
      email,
      whatsapp,
      details
    });

    if (result?.error) {
      console.error('Contact Notion sync failed:', result.error);
      return res.status(500).json({
        success: false,
        message: 'تعذر حفظ الرسالة في نوشن. يرجى المحاولة لاحقاً.',
        error: process.env.NODE_ENV === 'development' ? result.error : undefined
      });
    }

    return res.json({
      success: true,
      message: 'تم استلام رسالتك بنجاح! سنتواصل معك قريباً.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;