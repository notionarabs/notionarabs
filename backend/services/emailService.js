const axios = require('axios');

/**
 * Send an email using Brevo API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Text content
 * @returns {Promise<Object>} - Response from Brevo
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.BREVO_API_KEY) {
    console.warn('⚠️ BREVO_API_KEY is not configured! Email will not be sent.');
    // In development, just log the email content
    if (process.env.NODE_ENV === 'development') {
      console.log('--- EMAIL MOCK ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('--- END EMAIL MOCK ---');
      return { messageId: 'mock-id', response: 'Email logged (dev mode)' };
    }
    throw new Error('Email service is not configured. Please set BREVO_API_KEY.');
  }

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'عرب نوشن',
          email: process.env.EMAIL_FROM || process.env.BREVO_FROM_EMAIL || 'noreply@notionarabs.com'
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text,
        headers: {
          'List-Unsubscribe': '<https://www.notionarabs.com/unsubscribe?email=' + encodeURIComponent(to) + '>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'X-Mailer': 'Microsoft Outlook 16.0',
          'Reply-To': process.env.EMAIL_FROM || process.env.BREVO_FROM_EMAIL || 'support@notionarabs.com'
        },
        tags: ['notionarabs', 'notification']
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        }
      }
    );

    console.log('✅ Brevo email sent successfully:', response.data.messageId);
    return {
      messageId: response.data.messageId,
      response: 'Email sent via Brevo'
    };
  } catch (error) {
    console.error('❌ Brevo error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send an email notification when a template is approved
 * @param {Object} user - The user object (creator)
 * @param {Object} template - The template object
 */
const sendTemplateApprovedEmail = async (user, template) => {
  if (!user || !user.email) {
    console.warn('⚠️ Cannot send template approved email: User or email not found', user);
    return;
  }

  const subject = `مبروك! تم قبول قالبك: ${template.title}`;
  const templateLink = `https://www.notionarabs.com/templates/${template.slug || template._id}`;

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: right; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <div class="container">
          <div class="header">
            <h1 style="color: #f5631e;">تم قبول قالبك!</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.name || 'مبدعنا'}،</h2>
            <p>يسعدنا إخبارك بأنه تمت مراجعة وقبول قالبك <strong>"${template.title}"</strong> بنجاح.</p>
            <p>قالبك الآن منشور ومتاح للجميع على منصة عرب نوشن.</p>
            <div style="text-align: center;">
              <a href="${templateLink}" class="button" style="color: #ffffff;">مشاهدة القالب</a>
            </div>
            <p>شكراً لمساهمتك معنا، ونتطلع لرؤية المزيد من إبداعاتك!</p>
          </div>
          <div class="footer">
            <p>عرب نوشن - منصة القوالب العربية</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nيسعدنا إخبارك بأنه تمت مراجعة وقبول قالبك "${template.title}" بنجاح.\n\nيمكنك مشاهدة القالب هنا: ${templateLink}\n\nشكراً لمساهمتك معنا!\n\nعرب نوشن`;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * Send an email notification when a creator application is approved
 * @param {Object} user - The user object (creator)
 */
const sendCreatorApprovedEmail = async (user) => {
  if (!user || !user.email) {
    console.warn('⚠️ Cannot send creator approved email: User or email not found', user);
    return;
  }

  const subject = `مبروك! تم قبول انضمامك كمبدع`;
  const dashboardLink = `https://www.notionarabs.com/dashboard/creator`;

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: right; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <div class="container">
          <div class="header">
            <h1 style="color: #f5631e;">أهلاً بك في فريق المبدعين!</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.name || 'مبدعنا'}،</h2>
            <p>يسعدنا إخبارك بأنه تم قبول طلب انضمامك كمبدع في منصة عرب نوشن.</p>
            <p>يمكنك الآن الدخول إلى لوحة التحكم الخاصة بالمبدعين والبدء في نشر قوالبك.</p>
            <div style="text-align: center;">
              <a href="${dashboardLink}" class="button" style="color: #ffffff;">الذهاب للوحة التحكم</a>
            </div>
            <p>نحن متحمسون لرؤية إبداعاتك!</p>
          </div>
          <div class="footer">
            <p>عرب نوشن - منصة القوالب العربية</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nيسعدنا إخبارك بأنه تم قبول طلب انضمامك كمبدع في منصة عرب نوشن.\n\nيمكنك الدخول إلى لوحة التحكم من هنا: ${dashboardLink}\n\nنحن متحمسون لرؤية إبداعاتك!\n\nعرب نوشن`;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * Send an email notification when a blog post is approved/published
 * @param {Object} user - The user object (author)
 * @param {Object} blog - The blog object
 */
const sendBlogApprovedEmail = async (user, blog) => {
  if (!user || !user.email) {
    console.warn('⚠️ Cannot send blog approved email: User or email not found', user);
    return;
  }

  const subject = `تم نشر مقالك: ${blog.title}`;
  const blogLink = `https://www.notionarabs.com/blog/${blog.slug || blog._id}`;

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: right; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <div class="container">
          <div class="header">
            <h1 style="color: #f5631e;">تم نشر مقالك!</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.name || 'مبدعنا'}،</h2>
            <p>يسعدنا إخبارك بأنه تمت مراجعة ونشر مقالك <strong>"${blog.title}"</strong> بنجاح.</p>
            <p>مقالك الآن متاح للقراءة للجميع على مدونة عرب نوشن.</p>
            <div style="text-align: center;">
              <a href="${blogLink}" class="button" style="color: #ffffff;">قراءة المقال</a>
            </div>
            <p>شكراً لمشاركتنا معرفتك!</p>
          </div>
          <div class="footer">
            <p>عرب نوشن - منصة القوالب العربية</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nيسعدنا إخبارك بأنه تمت مراجعة ونشر مقالك "${blog.title}" بنجاح.\n\nيمكنك قراءة المقال هنا: ${blogLink}\n\nشكراً لمشاركتنا معرفتك!\n\nعرب نوشن`;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * Send a password reset email
 * @param {Object} user - The user object
 * @param {string} resetUrl - The password reset URL
 */
const sendResetPasswordEmail = async (user, resetUrl) => {
  if (!user || !user.email) {
    console.warn('⚠️ Cannot send reset password email: User or email not found', user);
    return;
  }

  const subject = `إعادة تعيين كلمة المرور`;

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: right; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
        .warning { background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <div class="container">
          <div class="header">
            <h1 style="color: #f5631e;">إعادة تعيين كلمة المرور</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.name}،</h2>
            <p>تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في عرب نوشن.</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button" style="color: #ffffff;">إعادة تعيين كلمة المرور</a>
            </div>
            <p style="margin-top: 20px;">أو انسخ هذا الرابط:</p>
            <p style="font-family: monospace; background: #f1f1f1; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>
            
            <div class="warning">
              ملاحظة مهمة: هذا الرابط صالح لمدة ساعة واحدة فقط.
            </div>
            
            <p style="color: #999; font-size: 14px;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد بأمان.</p>
          </div>
          <div class="footer">
            <p>عرب نوشن - منصة القوالب العربية</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `مرحباً ${user.name}،\n\nتلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في عرب نوشن.\n\nلإعادة تعيين كلمة المرور، زر الرابط التالي:\n${resetUrl}\n\nهذا الرابط صالح لمدة ساعة واحدة فقط.\n\nإذا لم تطلب هذا، تجاهل هذا البريد.\n\nعرب نوشن`;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * Send an email verification email
 * @param {Object} user - The user object (contains name and email)
 * @param {string} verificationUrl - The verification URL
 */
const sendVerificationEmail = async (user, verificationUrl) => {
  if (!user || !user.email) {
    console.warn('⚠️ Cannot send verification email: User or email not found', user);
    return;
  }

  const subject = `تأكيد البريد الإلكتروني`;

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: right; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <div class="container">
          <div class="header">
            <h1 style="color: #f5631e;">تأكيد بريدك الإلكتروني</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.name}،</h2>
            <p>شكراً لتسجيلك في عرب نوشن! يرجى تأكيد بريدك الإلكتروني لتفعيل حسابك.</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button" style="color: #ffffff;">تأكيد البريد الإلكتروني</a>
            </div>
            <p style="margin-top: 20px;">أو انسخ هذا الرابط:</p>
            <p style="font-family: monospace; background: #f1f1f1; padding: 10px; border-radius: 4px; word-break: break-all;">${verificationUrl}</p>
            
            <p style="color: #999; font-size: 14px;">هذا الرابط صالح لمدة 24 ساعة.</p>
          </div>
          <div class="footer">
            <p>عرب نوشن - منصة القوالب العربية</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `مرحباً ${user.name}،\n\nشكراً لتسجيلك في عرب نوشن! يرجى تأكيد بريدك الإلكتروني لتفعيل حسابك عبر الرابط التالي:\n${verificationUrl}\n\nهذا الرابط صالح لمدة 24 ساعة.\n\nعرب نوشن`;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * Send an order confirmation email
 * @param {Object} user - The user object
 * @param {Object} order - The order object
 */
const sendOrderConfirmationEmail = async (user, order) => {
  if (!user || !user.email) {
    console.warn('⚠️ Cannot send order confirmation email: User or email not found', user);
    return;
  }

  const subject = `تأكيد طلبك #${order._id.toString().slice(-6).toUpperCase()}`;
  const orderLink = `https://www.notionarabs.com/dashboard/orders/${order._id}`;
  let itemsList = '';

  if (order.items && order.items.length > 0) {
    itemsList = order.items.map(item => `
            <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                ${item.template ? item.template.title : 'قالب'} 
                <span style="float: left;">${item.price} ر.س</span>
            </li>
        `).join('');
  }

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: right; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
        .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right; }
        .total { font-weight: bold; font-size: 18px; margin-top: 15px; color: #f5631e; border-top: 2px solid #ddd; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <div class="container">
          <div class="header">
            <h1 style="color: #f5631e;">شكراً لطلبك!</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.name}،</h2>
            <p>تم استلام طلبك بنجاح. شكراً لثقتك بنا!</p>
            
            <div class="order-details">
              <h3 style="margin-top: 0;">رقم الطلب: #${order._id.toString().slice(-6).toUpperCase()}</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${itemsList}
              </ul>
              <div class="total">
                المجموع: ${order.total} ر.س
              </div>
            </div>

            <p>يمكنك الوصول إلى القوالب التي اشتريتها من خلال لوحة التحكم.</p>

            <div style="text-align: center;">
              <a href="${orderLink}" class="button" style="color: #ffffff;">عرض مشترياتي</a>
            </div>
          </div>
          <div class="footer">
            <p>عرب نوشن - منصة القوالب العربية</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `مرحباً ${user.name}،\n\nشكراً لطلبك! تم استلام طلبك رقم #${order._id.toString().slice(-6).toUpperCase()} بنجاح.\n\nالمجموع الكلي: ${order.total} ر.س\n\nيمكنك عرض مشترياتك هنا: ${orderLink}\n\nعرب نوشن`;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * Send an email notification when a template is rejected
 * @param {Object} user - The user object (creator)
 * @param {Object} template - The template object
 * @param {string} reason - The rejection reason
 */
const sendTemplateRejectedEmail = async (user, template, reason) => {
  if (!user || !user.email) {
    console.warn('⚠️ Cannot send template rejected email: User or email not found', user);
    return;
  }

  const subject = `تحديث بخصوص قالبك: ${template.title}`;
  const dashboardLink = `https://www.notionarabs.com/dashboard/creator`;

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: right; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #132859; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
        .reason { background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <div class="container">
          <div class="header">
            <h1 style="color: #5f6368;">تحديث بخصوص قالبك</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.name || 'مبدعنا'}،</h2>
            <p>شكراً لإرسال قالبك <strong>"${template.title}"</strong> للمراجعة.</p>
            <p>نأسف لإخبارك بأنه لم يتم قبول القالب في الوقت الحالي.</p>
            
            ${reason ? `
            <div class="reason">
              <strong>سبب الرفض:</strong><br>
              ${reason}
            </div>
            ` : ''}

            <p>يمكنك تعديل القالب بناءً على الملاحظات وإعادة إرساله مرة أخرى، أو التواصل معنا لمزيد من التوضيح.</p>
            
            <div style="text-align: center;">
              <a href="${dashboardLink}" class="button" style="color: #ffffff;">الذهاب للوحة التحكم</a>
            </div>
          </div>
          <div class="footer">
            <p>عرب نوشن - منصة القوالب العربية</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nنأسف لإخبارك بأنه لم يتم قبول قالبك "${template.title}".\n\n${reason ? `سبب الرفض: ${reason}\n\n` : ''}يمكنك تعديل القالب وإعادة إرساله من خلال لوحة التحكم: ${dashboardLink}\n\nعرب نوشن`;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * Send an email notification when a creator application is rejected
 * @param {Object} user - The user object
 * @param {string} reason - The rejection reason
 */
const sendCreatorRejectedEmail = async (user, reason) => {
  if (!user || !user.email) {
    console.warn('⚠️ Cannot send creator rejected email: User or email not found', user);
    return;
  }

  const subject = `تحديث بخصوص طلب انضمامك كمبدع`;
  const contactLink = `https://www.notionarabs.com/contact`;

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: right; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #132859; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
        .reason { background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <div class="container">
          <div class="header">
            <h1 style="color: #5f6368;">تحديث طلب الانضمام</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.name || 'صديقنا'}،</h2>
            <p>شكراً لاهتمامك بالانضمام إلى فريق مبدعي عرب نوشن.</p>
            <p>بعد مراجعة طلبك، نأسف لإخبارك بأنه لم يتم قبوله في الوقت الحالي.</p>
            
            ${reason ? `
            <div class="reason">
              <strong>السبب:</strong><br>
              ${reason}
            </div>
            ` : ''}

            <p>يمكنك العمل على تحسين ملفك الشخصي أو نماذج أعمالك وإعادة المحاولة في المستقبل.</p>
            
            <div style="text-align: center;">
              <a href="${contactLink}" class="button" style="color: #ffffff;">تواصل معنا</a>
            </div>
          </div>
          <div class="footer">
            <p>عرب نوشن - منصة القوالب العربية</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `مرحباً ${user.name || 'صديقنا'}،\n\nنأسف لإخبارك بأنه لم يتم قبول طلب انضمامك كمبدع في الوقت الحالي.\n\n${reason ? `السبب: ${reason}\n\n` : ''}يمكنك المحاولة مرة أخرى في المستقبل.\n\nعرب نوشن`;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * Send an email notification when a blog post is rejected
 * @param {Object} user - The user object (author)
 * @param {Object} blog - The blog object
 * @param {string} reason - The rejection reason
 */
const sendBlogRejectedEmail = async (user, blog, reason) => {
  if (!user || !user.email) {
    console.warn('⚠️ Cannot send blog rejected email: User or email not found', user);
    return;
  }

  const subject = `تحديث بخصوص مقالك: ${blog.title}`;
  const dashboardLink = `https://www.notionarabs.com/dashboard/creator`;

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: right; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #132859; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
        .reason { background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <div class="container">
          <div class="header">
            <h1 style="color: #5f6368;">تحديث بخصوص مقالك</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.name || 'مبدعنا'}،</h2>
            <p>شكراً لمشاركة مقالك <strong>"${blog.title}"</strong>.</p>
            <p>بعد المراجعة، نأسف لإخبارك بأنه لم يتم قبول نشره في الوقت الحالي.</p>
            
            ${reason ? `
            <div class="reason">
              <strong>السبب:</strong><br>
              ${reason}
            </div>
            ` : ''}

            <p>يمكنك تعديل المقال وإعادة إرساله، أو التواصل معنا للاستفسار.</p>
            
            <div style="text-align: center;">
              <a href="${dashboardLink}" class="button" style="color: #ffffff;">الذهاب للوحة التحكم</a>
            </div>
          </div>
          <div class="footer">
            <p>عرب نوشن - منصة القوالب العربية</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nنأسف لإخبارك بأنه لم يتم قبول نشر مقالك "${blog.title}".\n\n${reason ? `السبب: ${reason}\n\n` : ''}يمكنك تعديل المقال وإعادة إرساله من لوحة التحكم.\n\nعرب نوشن`;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

/**
 * Send a welcome email after successful verification
 * @param {Object} user - The user object
 */
const sendWelcomeEmail = async (user) => {
  if (!user || !user.email) {
    console.warn('⚠️ Cannot send welcome email: User or email not found', user);
    return;
  }

  const subject = `مرحباً بك في مجتمع عرب نوشن!`;
  const dashboardLink = `https://www.notionarabs.com/dashboard`;
  const browseLink = `https://www.notionarabs.com/templates`;

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tajawal', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .content { text-align: right; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #f5631e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; margin-left: 10px; }
        .secondary-button { display: inline-block; background-color: #fff; color: #f5631e; border: 1px solid #f5631e; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; color: #888; font-size: 12px; }
        .feature-box { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div style="padding: 40px;">
        <div class="container">
          <div class="header">
            <h1 style="color: #f5631e;">أهلاً بك في عرب نوشن! 🚀</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.name}،</h2>
            <p>سعداء جداً بانضمامك إلينا! تم تفعيل حسابك بنجاح.</p>
            <p>أنت الآن جزء من أكبر مجتمع عربي لمستخدمي ومبدعي Notion.</p>
            
            <div class="feature-box">
              <strong>ماذا يمكنك أن تفعل الآن؟</strong>
              <ul style="padding-right: 20px;">
                <li>تصفح مئات القوالب العربية المميزة.</li>
                <li>تحميل القوالب المجانية والمدفوعة.</li>
                <li>الانضمام كمبدع وبيع قوالبك الخاصة.</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${browseLink}" class="button" style="color: #ffffff;">تصفح القوالب</a>
              <a href="${dashboardLink}" class="secondary-button">لوحة التحكم</a>
            </div>
          </div>
          <div class="footer">
            <p>عرب نوشن - منصة القوالب العربية</p>
            <p>تابعنا على وسائل التواصل الاجتماعي للحصول على آخر التحديثات</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `مرحباً ${user.name}،\n\nأهلاً بك في عرب نوشن! تم تفعيل حسابك بنجاح.\n\nيمكنك الآن تصفح القوالب: ${browseLink}\n\nأو الذهاب للوحة التحكم: ${dashboardLink}\n\nعرب نوشن`;

  await sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

module.exports = {
  sendEmail,
  sendTemplateApprovedEmail,
  sendCreatorApprovedEmail,
  sendBlogApprovedEmail,
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendTemplateRejectedEmail,
  sendCreatorRejectedEmail,
  sendBlogRejectedEmail,
  sendWelcomeEmail
};
