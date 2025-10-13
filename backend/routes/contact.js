const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Email configuration - Brevo only
const createTransporter = () => {
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is not configured!');
    throw new Error('Email service is not configured. Please set BREVO_API_KEY.');
  }

  console.log('✅ Using Brevo for email service');

  return {
    sendMail: async (mailOptions) => {
      try {
        const fetch = require('node-fetch');
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
          },
          body: JSON.stringify({
            sender: {
              email: process.env.EMAIL_FROM || process.env.BREVO_FROM_EMAIL
            },
            to: [{ email: mailOptions.to }],
            subject: mailOptions.subject,
            htmlContent: mailOptions.html
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Brevo error: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log('✅ Brevo email sent successfully:', result.messageId);
        return {
          messageId: result.messageId,
          response: 'Email sent via Brevo'
        };
      } catch (error) {
        console.error('❌ Brevo error:', error);
        throw error;
      }
    },
    verify: (callback) => {
      console.log('✅ Brevo API key is configured');
      callback(null, true);
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
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>رسالة جديدة من موقع عرب نوشن</title>
              <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Tajawal', sans-serif; background-color: #f8f9fa;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                      
                      <!-- Header -->
                      <tr>
                      <td style="padding: 40px; text-align: center; background-color: #f5631e; border-radius: 12px 12px 0 0;">
                        <img src="https://www.notionarabs.com/notionarabsemailimage.png" alt="عرب نوشن" style="height: 40px; width: auto;" />
                        <h1 style="color: #ffffff; margin: 20px 0 10px; font-size: 24px; font-weight: 700;">رسالة جديدة</h1>
                        <p style="color: #ffffff; margin: 0; font-size: 16px;">من موقع عرب نوشن</p>
                      </td>
                      </tr>
                      
                      <!-- Body -->
                      <tr>
                        <td style="padding: 40px; text-align: right; direction: rtl;">
                          <h2 style="color: #132859; font-size: 20px; margin: 0 0 20px; font-weight: 600; text-align: right;">تفاصيل الرسالة</h2>
                          
                          <!-- Message Details -->
                          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
                            <div style="margin-bottom: 15px;">
                              <p style="color: #5f6368; font-size: 14px; margin: 0 0 5px; font-weight: 500; text-align: right;">المرسل:</p>
                              <p style="color: #132859; font-size: 16px; margin: 0; font-weight: 600; text-align: right;">${name}</p>
                            </div>
                            <div style="margin-bottom: 15px;">
                              <p style="color: #5f6368; font-size: 14px; margin: 0 0 5px; font-weight: 500; text-align: right;">البريد الإلكتروني:</p>
                              <p style="color: #132859; font-size: 16px; margin: 0; font-weight: 600; text-align: right;"><a href="mailto:${email}" style="color: #f5631e; text-decoration: none;">${email}</a></p>
                            </div>
                            <div>
                              <p style="color: #5f6368; font-size: 14px; margin: 0 0 5px; font-weight: 500; text-align: right;">الموضوع:</p>
                              <p style="color: #132859; font-size: 16px; margin: 0; font-weight: 600; text-align: right;">${subject}</p>
                            </div>
                          </div>
                          
                          <!-- Message Content -->
                          <h2 style="color: #132859; font-size: 20px; margin: 20px 0; font-weight: 600; text-align: right;">محتوى الرسالة</h2>
                          <div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
                            <p style="line-height: 1.6; color: #132859; font-size: 16px; margin: 0; text-align: right;">${message.replace(/\n/g, '<br>')}</p>
                          </div>
                          
                          <!-- Reply Button -->
                          <div style="text-align: center; margin: 30px 0;">
                            <a href="mailto:${email}" style="display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              الرد على الرسالة
                            </a>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px; background-color: #132859; text-align: center; border-radius: 0 0 12px 12px;">
                          <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 10px; font-weight: 700;">عرب نوشن</h3>
                          <p style="color: #9aa0a6; font-size: 14px; margin: 0 0 15px;">منصة القوالب العربية</p>
                          <a href="https://www.notionarabs.com" style="color: #f5631e; text-decoration: none; font-weight: 600;">www.notionarabs.com</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
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