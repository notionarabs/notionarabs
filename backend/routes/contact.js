const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const User = require('../models/User');

const router = express.Router();

// Email configuration
const createTransporter = () => {
  // If Resend API key is available, use Resend
  if (process.env.RESEND_API_KEY) {
    console.log('Using Resend for email service');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    return {
      sendMail: async (mailOptions) => {
        try {
          const result = await resend.emails.send({
            from: mailOptions.from || `فريق عرب نوشن <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html
          });
          
          return {
            messageId: result.data?.id,
            response: 'OK'
          };
        } catch (error) {
          console.error('Resend error:', error);
          throw error;
        }
      }
    };
  }
  
  // Fallback to Gmail SMTP
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS environment variables in your .env file.');
  }

  try {
    // Use direct SMTP configuration with SSL port
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // Use SSL port instead of TLS
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      pool: false
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

    // Log the message immediately for manual follow-up
    console.log('=== CREATOR CONTACT MESSAGE ===');
    console.log('Creator:', creator.displayName || creator.name, `(${creator.email})`);
    console.log('From:', name, `(${email})`);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('===============================');

    // Return success immediately - no email sending to avoid delays
    res.json({
      success: true,
      message: 'تم استلام رسالتك بنجاح! سنتواصل معك قريباً.'
    });

    // Try to send email in background (non-blocking)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      setImmediate(async () => {
        try {
          const transporter = createTransporter();
          await transporter.verify();

          const mailOptions = {
            from: `"فريق عرب نوشن" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
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
          console.log('✅ Email sent successfully to creator:', creator.email);
        } catch (emailError) {
          console.log('❌ Email sending failed (background):', emailError.message);
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

    // Log the general contact message immediately
    console.log('=== GENERAL CONTACT MESSAGE ===');
    console.log('From:', name, `(${email})`);
    console.log('Subject:', subject);
    console.log('Category:', req.body.category || 'عام');
    console.log('Message:', message);
    console.log('================================');

    // Return success immediately - no email sending to avoid delays
    res.json({
      success: true,
      message: 'تم استلام رسالتك بنجاح! سنتواصل معك قريباً.'
    });

    // Try to send email in background (non-blocking)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      setImmediate(async () => {
        try {
          const transporter = createTransporter();
          await transporter.verify();

          const mailOptions = {
            from: `"فريق عرب نوشن" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
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
          console.log('✅ Email sent successfully to support team');
        } catch (emailError) {
          console.log('❌ Email sending failed (background):', emailError.message);
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

module.exports = router;