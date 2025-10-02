const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Email configuration
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS environment variables in your .env file.');
  }

  try {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Add timeout and retry options
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw new Error('Failed to initialize email service. Please check your email configuration.');
  }
};

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Contact route is working',
    timestamp: new Date().toISOString()
  });
});

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
    .isMongoId()
    .withMessage('معرف المبدع غير صحيح')
], async (req, res) => {
  try {
    console.log('Contact creator route called with data:', {
      body: req.body,
      headers: req.headers
    });

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

    // Log the message for testing
    console.log('=== MESSAGE TO CREATOR ===');
    console.log('Creator:', creator.displayName || creator.name, `(${creator.email})`);
    console.log('From:', name, `(${email})`);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('========================');

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration missing. Message logged but not sent via email.');
      console.log('To enable email sending, set EMAIL_USER and EMAIL_PASS environment variables.');

      // Log admin notification for manual follow-up
      console.log('=== ADMIN NOTIFICATION (NO EMAIL) ===');
      console.log('Creator Contact Message:');
      console.log('Creator:', creator.displayName || creator.name, `(${creator.email})`);
      console.log('From:', name, `(${email})`);
      console.log('Subject:', subject);
      console.log('Message:', message);
      console.log('=====================================');

      // Return success but with a note that email wasn't sent
      res.json({
        success: true,
        message: 'تم استلام رسالتك بنجاح (لم يتم إرسالها بالبريد الإلكتروني - تحتاج إعداد البريد الإلكتروني)'
      });
      return;
    }

    // Send email to creator with overall timeout
    try {
      const emailPromise = (async () => {
        let transporter;
        try {
          transporter = createTransporter();
        } catch (configError) {
          console.error('Email configuration error:', configError.message);
          throw new Error('Email configuration is missing. Please contact the administrator.');
        }

        // Verify transporter connection with timeout
        await Promise.race([
          transporter.verify(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Email verification timeout')), 10000))
        ]);

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: creator.email,
          subject: `رسالة جديدة من ${name} - ${subject}`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #333; text-align: center;">رسالة جديدة من موقع عرب نوشن</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-bottom: 15px;">تفاصيل الرسالة:</h3>
              <p><strong>المرسل:</strong> ${name}</p>
              <p><strong>البريد الإلكتروني:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
              <p><strong>الموضوع:</strong> ${subject}</p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-bottom: 15px;">محتوى الرسالة:</h3>
              <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${email}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">الرد على الرسالة</a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">عرب نوشن - منصة القوالب العربية</p>
          </div>
        `
        };

        await transporter.sendMail(mailOptions);

        // Send notification to admin (hazemyasser911@gmail.com)
        const adminNotificationOptions = {
          from: process.env.EMAIL_USER,
          to: 'hazemyasser911@gmail.com',
          subject: `[عرب نوشن] رسالة جديدة من ${name} إلى ${creator.displayName || creator.name}`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #333; text-align: center;">إشعار: رسالة جديدة من موقع عرب نوشن</h2>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>نوع الرسالة:</strong> تواصل مع مبدع</p>
              <p><strong>المبدع المستهدف:</strong> ${creator.displayName || creator.name} (${creator.email})</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-bottom: 15px;">تفاصيل الرسالة:</h3>
              <p><strong>المرسل:</strong> ${name}</p>
              <p><strong>البريد الإلكتروني:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
              <p><strong>الموضوع:</strong> ${subject}</p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-bottom: 15px;">محتوى الرسالة:</h3>
              <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${email}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-left: 10px;">الرد على المرسل</a>
              <a href="mailto:${creator.email}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">الرد على المبدع</a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">عرب نوشن - منصة القوالب العربية</p>
          </div>
        `
        };

        await transporter.sendMail(adminNotificationOptions);

        // Also send a copy to the sender for confirmation
        const confirmationMailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: `تأكيد إرسال رسالتك إلى ${creator.displayName || creator.name}`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #333; text-align: center;">تم إرسال رسالتك بنجاح!</h2>
            <p>مرحباً ${name}،</p>
            <p>تم إرسال رسالتك إلى <strong>${creator.displayName || creator.name}</strong> بنجاح.</p>
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>تفاصيل الرسالة المرسلة:</strong></p>
              <p><strong>الموضوع:</strong> ${subject}</p>
              <p><strong>المبدع:</strong> ${creator.displayName || creator.name}</p>
            </div>
            <p>سنتواصل معك قريباً عبر البريد الإلكتروني إذا كان هناك رد من المبدع.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">عرب نوشن - منصة القوالب العربية</p>
          </div>
        `
        };

        await transporter.sendMail(confirmationMailOptions);

        return {
          success: true,
          message: 'تم إرسال رسالتك بنجاح للمبدع'
        };
      })();

      // Add overall timeout for the entire email operation
      const result = await Promise.race([
        emailPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Email operation timeout')), 30000))
      ]);

      res.json(result);

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      console.error('Email error details:', {
        message: emailError.message,
        code: emailError.code,
        stack: emailError.stack
      });
      res.status(500).json({
        success: false,
        message: 'تم استلام رسالتك لكن حدث خطأ في إرسالها للمبدع. سنتواصل معك قريباً.'
      });
    }

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

    // Log the general contact message
    console.log('=== GENERAL CONTACT MESSAGE ===');
    console.log('From:', name, `(${email})`);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('================================');

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration missing. Message logged but not sent via email.');
      console.log('To enable email sending, set EMAIL_USER and EMAIL_PASS environment variables.');

      // Log admin notification for manual follow-up
      console.log('=== ADMIN NOTIFICATION (NO EMAIL) ===');
      console.log('General Contact Message:');
      console.log('From:', name, `(${email})`);
      console.log('Subject:', subject);
      console.log('Category:', req.body.category || 'عام');
      console.log('Message:', message);
      console.log('=====================================');

      // Return success but with a note that email wasn't sent
      res.json({
        success: true,
        message: 'تم استلام رسالتك بنجاح (لم يتم إرسالها بالبريد الإلكتروني - تحتاج إعداد البريد الإلكتروني)'
      });
      return;
    }

    // Send email to support team
    try {
      let transporter;
      try {
        transporter = createTransporter();
      } catch (configError) {
        console.error('Email configuration error:', configError.message);
        throw new Error('Email configuration is missing. Please contact the administrator.');
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER, // Use support email or fallback to main email
        subject: `رسالة جديدة من موقع عرب نوشن - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #333; text-align: center;">رسالة جديدة من موقع عرب نوشن</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-bottom: 15px;">تفاصيل الرسالة:</h3>
              <p><strong>المرسل:</strong> ${name}</p>
              <p><strong>البريد الإلكتروني:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
              <p><strong>الموضوع:</strong> ${subject}</p>
              <p><strong>نوع الاستفسار:</strong> ${req.body.category || 'عام'}</p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-bottom: 15px;">محتوى الرسالة:</h3>
              <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${email}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">الرد على الرسالة</a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">عرب نوشن - منصة القوالب العربية</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      // Send notification to admin (hazemyasser911@gmail.com)
      const adminNotificationOptions = {
        from: process.env.EMAIL_USER,
        to: 'hazemyasser911@gmail.com',
        subject: `[عرب نوشن] رسالة جديدة من ${name} - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #333; text-align: center;">إشعار: رسالة جديدة من موقع عرب نوشن</h2>
            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>نوع الرسالة:</strong> استفسار عام</p>
              <p><strong>نوع الاستفسار:</strong> ${req.body.category || 'عام'}</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-bottom: 15px;">تفاصيل الرسالة:</h3>
              <p><strong>المرسل:</strong> ${name}</p>
              <p><strong>البريد الإلكتروني:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
              <p><strong>الموضوع:</strong> ${subject}</p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-bottom: 15px;">محتوى الرسالة:</h3>
              <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${email}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">الرد على المرسل</a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">عرب نوشن - منصة القوالب العربية</p>
          </div>
        `
      };

      await transporter.sendMail(adminNotificationOptions);

      // Send confirmation to the sender
      const confirmationMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `تأكيد استلام رسالتك - عرب نوشن`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #333; text-align: center;">تم استلام رسالتك بنجاح!</h2>
            <p>مرحباً ${name}،</p>
            <p>شكراً لتواصلك معنا. تم استلام رسالتك وسنرد عليك خلال 24 ساعة.</p>
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>تفاصيل الرسالة المرسلة:</strong></p>
              <p><strong>الموضوع:</strong> ${subject}</p>
              <p><strong>نوع الاستفسار:</strong> ${req.body.category || 'عام'}</p>
            </div>
            <p>إذا كان لديك أي استفسارات أخرى، لا تتردد في التواصل معنا.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">عرب نوشن - منصة القوالب العربية</p>
          </div>
        `
      };

      await transporter.sendMail(confirmationMailOptions);

      res.json({
        success: true,
        message: 'تم إرسال رسالتك بنجاح وسنرد عليك قريباً'
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'تم استلام رسالتك لكن حدث خطأ في إرسالها. سنتواصل معك قريباً.'
      });
    }

  } catch (error) {
    console.error('General contact error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;