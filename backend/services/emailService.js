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
      console.log(`Text Content: ${text}`);
      if (html) {
          // Extract link for convenience if possible, or just log first 200 chars
          const linkMatch = html.match(/href="([^"]+)"/);
          if (linkMatch) console.log(`Detected Link: ${linkMatch[1]}`);
      }
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
 * Master HTML Template for all emails
 * Ensures consistent branding and premium design
 */
const getMasterTemplate = (content, title = 'عرب نوشن') => `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
      body { 
        font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
        background-color: #f0f2f5; 
        margin: 0; 
        padding: 0; 
        -webkit-font-smoothing: antialiased;
        direction: rtl;
        text-align: right;
      }
      .wrapper { padding: 40px 20px; direction: rtl; }
      .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: #ffffff; 
        border-radius: 24px; 
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        border: 1px solid #eef0f2;
        direction: rtl;
      }
      .header { 
        background: linear-gradient(135deg, #f5631e 0%, #ff8c52 100%); 
        padding: 40px 30px; 
        text-align: center; 
        color: #ffffff;
      }
      .header h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
      .body { padding: 40px 30px; text-align: right; color: #1a1d21; line-height: 1.8; direction: rtl; }
      .footer { 
        background-color: #f8f9fa; 
        padding: 30px; 
        text-align: center; 
        color: #8b949e; 
        font-size: 13px;
        border-top: 1px solid #eef0f2;
        direction: rtl;
      }
      .button { 
        display: inline-block; 
        background-color: #f5631e; 
        color: #ffffff !important; 
        text-decoration: none; 
        padding: 16px 32px; 
        border-radius: 14px; 
        font-weight: 700; 
        margin: 25px 0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(245, 99, 30, 0.2);
      }
      .secondary-button {
        display: inline-block;
        background-color: #ffffff;
        color: #f5631e !important;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 14px;
        font-weight: 700;
        margin: 25px 10px;
        border: 2px solid #f5631e;
      }
      .secondary-text { color: #6e7681; font-size: 14px; }
      .divider { height: 1px; background-color: #eef0f2; margin: 30px 0; }
      .social-links { margin-top: 20px; }
      .social-links a { color: #f5631e; text-decoration: none; margin: 0 10px; font-weight: 600; }
      .feature-box { background-color: #f8f9fa; padding: 25px; border-radius: 18px; margin: 25px 0; border: 1px solid #eef0f2; direction: rtl; text-align: right; }
      .feature-box strong { display: block; margin-bottom: 10px; color: #1a1d21; }
      .feature-box ul { padding: 0 20px 0 0; margin: 0; list-style-position: inside; }
      .feature-box li { margin-bottom: 8px; }
      .price-tag { color: #f5631e; font-weight: 900; font-size: 20px; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="body">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} عرب نوشن (Notion Arabs). جميع الحقوق محفوظة.</p>
          <p>أكبر مجتمع ومحيط لمستخدمي نوشن في الوطن العربي.</p>
          <div class="social-links">
            <a href="https://twitter.com/notionarabs">تويتر</a>
            <a href="https://instagram.com/notionarabs">انستجرام</a>
            <a href="https://www.notionarabs.com">الموقع الإلكتروني</a>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

/**
 * Send an email notification when a template is approved
 */
const sendTemplateApprovedEmail = async (user, template) => {
  if (!user || !user.email) return;

  const subject = `🚀 مبروك! تم قبول قالبك: ${template.title}`;
  const templateLink = `https://www.notionarabs.com/templates/${template.slug || template._id}`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name || 'مبدعنا'}،</h2>
    <p style="font-size: 16px;">يسعدنا إخبارك بأنه تمت مراجعة وقبول قالبك <strong>"${template.title}"</strong> بنجاح.</p>
    <p style="font-size: 16px;">قالبك الآن منشور ومتاح للجميع على منصة عرب نوشن. نحن متحمسون لرؤية التفاعل معه!</p>
    
    <div style="text-align: center;">
      <a href="${templateLink}" class="button">مشاهدة القالب المباشر</a>
    </div>
    
    <div class="divider"></div>
    <p class="secondary-text">نصيحة: شارك رابط القالب على حساباتك في التواصل الاجتماعي لزيادة عدد التحميلات والمبيعات.</p>
  `, 'تم قبول قالبك!');

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nيسعدنا إخبارك بأنه تمت مراجعة وقبول قالبك "${template.title}" بنجاح.\n\nيمكنك مشاهدة القالب هنا: ${templateLink}\n\nشكراً لمساهمتك معنا!\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email notification when a template is rejected
 */
const sendTemplateRejectedEmail = async (user, template, reason, isUpdate = false) => {
  if (!user || !user.email) return;

  const subject = `تحديث بخصوص قالبك: ${template.title}`;
  const dashboardLink = `https://www.notionarabs.com/profile?tab=templates`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name || 'مبدعنا'}،</h2>
    <p style="font-size: 16px;">شكراً لإرسال ${isUpdate ? 'تحديثات' : ''} قالبك <strong>"${template.title}"</strong> للمراجعة.</p>
    <p style="font-size: 16px;">نأسف لإخبارك بأنه لم يتم قبول ${isUpdate ? 'تحديثات القالب' : 'القالب'} في الوقت الحالي للملاحظات التالية:</p>
    
    ${reason ? `
    <div style="background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 20px; border-radius: 12px; margin: 25px 0;">
      <strong style="color: #856404;">${isUpdate ? 'سبب رفض التحديث:' : 'سبب الرفض:'}</strong><br>
      <div style="margin-top: 10px; color: #856404;">${reason}</div>
    </div>
    ` : ''}

    <p style="font-size: 16px;">يمكنك تعديل القالب بناءً على هذه الملاحظات وإعادة إرساله مرة أخرى للمراجعة. نحن هنا لمساعدتك!</p>
    
    <div style="text-align: center;">
      <a href="${dashboardLink}" class="button">الذهاب للوحة التحكم</a>
    </div>
  `, 'تحديث بخصوص قالبك');

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nشكراً لإرسال قالبك "${template.title}" للمراجعة.\n\nنأسف لإخبارك بأنه لم يتم قبول القالب في الوقت الحالي.\n\n${reason ? `السبب: ${reason}\n\n` : ''}يمكنك التعديل وإعادة الإرسال من لوحة التحكم.\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email notification when a creator application is approved
 */
const sendCreatorApprovedEmail = async (user) => {
  if (!user || !user.email) return;

  const subject = `مبروك! تم قبول انضمامك كمبدع`;
  const dashboardLink = `https://www.notionarabs.com/profile?tab=earnings`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name || 'مبدعنا'}،</h2>
    <p style="font-size: 16px;">يسعدنا إخبارك بأنه تم قبول طلب انضمامك كمبدع في منصة عرب نوشن.</p>
    <p style="font-size: 16px;">يمكنك الآن الدخول إلى لوحة التحكم الخاصة بالمبدعين والبدء في نشر قوالبك ومشاركة إبداعاتك مع المجتمع.</p>
    
    <div style="text-align: center;">
      <a href="${dashboardLink}" class="button">الذهاب للوحة المبدعين</a>
    </div>
    
    <div class="divider"></div>
    <p class="secondary-text">نحن متحمسون جداً لرؤية ما ستقدمه لمجتمعنا العربي!</p>
  `, 'أهلاً بك في فريق المبدعين!');

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nيسعدنا إخبارك بأنه تم قبول طلب انضمامك كمبدع في منصة عرب نوشن.\n\nيمكنك الدخول إلى لوحة التحكم من هنا: ${dashboardLink}\n\nنحن متحمسون لرؤية إبداعاتك!\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email notification when a creator application is rejected
 */
const sendCreatorRejectedEmail = async (user, reason) => {
  if (!user || !user.email) return;

  const subject = `تحديث بخصوص طلب انضمامك كمبدع`;
  const contactLink = `https://www.notionarabs.com/contact`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name || 'صديقنا'}،</h2>
    <p style="font-size: 16px;">شكراً لاهتمامك بالانضمام إلى فريق مبدعي عرب نوشن.</p>
    <p style="font-size: 16px;">بعد مراجعة طلبك ونماذج أعمالك، نأسف لإخبارك بأنه لم يتم قبول الطلب في الوقت الحالي للملاحظات التالية:</p>
    
    ${reason ? `
    <div style="background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 20px; border-radius: 12px; margin: 25px 0; color: #856404;">
      <strong>السبب:</strong><br>
      <div style="margin-top: 10px;">${reason}</div>
    </div>
    ` : ''}

    <p style="font-size: 16px;">لا تقلق! يمكنك دائماً العمل على تحسين ملفك الشخصي وإعادة المحاولة في المستقبل. نحن نقدر شغفك.</p>
    
    <div style="text-align: center;">
      <a href="${contactLink}" class="button">تواصل مع الدعم</a>
    </div>
  `, 'تحديث بخصوص طلبك');

  const text = `مرحباً ${user.name || 'صديقنا'}،\n\nنأسف لإخبارك بأنه لم يتم قبول طلب انضمامك كمبدع في الوقت الحالي.\n\n${reason ? `السبب: ${reason}\n\n` : ''}يمكنك المحاولة مرة أخرى في المستقبل.\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email notification when a blog post is approved/published
 */
const sendBlogApprovedEmail = async (user, blog) => {
  if (!user || !user.email) return;

  const subject = `تم نشر مقالك: ${blog.title}`;
  const blogLink = `https://www.notionarabs.com/blog/${blog.slug || blog._id}`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name || 'مبدعنا'}،</h2>
    <p style="font-size: 16px;">يسعدنا إخبارك بأنه تمت مراجعة ونشر مقالك <strong>"${blog.title}"</strong> بنجاح.</p>
    <p style="font-size: 16px;">مقالك متاح الآن للقراء على مدونة عرب نوشن. شكراً لمشاركتك معرفتك القيمة معنا.</p>
    
    <div style="text-align: center;">
      <a href="${blogLink}" class="button">قراءة المقال الآن</a>
    </div>
  `, 'تم نشر مقالك!');

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nيسعدنا إخبارك بأنه تمت مراجعة ونشر مقالك "${blog.title}" بنجاح.\n\nيمكنك قراءة المقال هنا: ${blogLink}\n\nشكراً لمشاركتنا معرفتك!\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email notification when a blog post is rejected
 */
const sendBlogRejectedEmail = async (user, blog, reason) => {
  if (!user || !user.email) return;

  const subject = `تحديث بخصوص مقالك: ${blog.title}`;
  const dashboardLink = `https://www.notionarabs.com/profile?tab=blogs`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name || 'مبدعنا'}،</h2>
    <p style="font-size: 16px;">شكراً لمشاركة مقالك القوي <strong>"${blog.title}"</strong> معنا.</p>
    <p style="font-size: 16px;">بعد المراجعة، نعتذر عن عدم تمكننا من نشر المقال في الوقت الحالي للأسباب التالية:</p>
    
    ${reason ? `
    <div style="background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 20px; border-radius: 12px; margin: 25px 0; color: #856404;">
      <strong>سبب الرفض:</strong><br>
      <div style="margin-top: 10px;">${reason}</div>
    </div>
    ` : ''}

    <p style="font-size: 16px;">يمكنك تعديل محتوى المقال بناءً على هذه النقاط وإعادة إرساله مرة أخرى.</p>
    
    <div style="text-align: center;">
      <a href="${dashboardLink}" class="button">تعديل المقال</a>
    </div>
  `, 'تحديث بخصوص مقالك');

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nنأسف لإخبارك بأنه لم يتم قبول مقالك "${blog.title}" في الوقت الحالي.\n\n${reason ? `السبب: ${reason}\n\n` : ''}يمكنك تعديل المقال وإعادة إرساله من لوحة التحكم.\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email verification email
 */
const sendVerificationEmail = async (user, verificationUrl) => {
  if (!user || !user.email) return;

  const subject = `تأكيد البريد الإلكتروني`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name}،</h2>
    <p style="font-size: 16px;">شكراً لتسجيلك في عرب نوشن! يرجى تأكيد بريدك الإلكتروني لتفعيل حسابك والبدء في استكشاف عالم نوشن العربي.</p>
    
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">تأكيد البريد الإلكتروني</a>
    </div>
    
    <div class="divider"></div>
    <p class="secondary-text">إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد بأمان.</p>
    <p class="secondary-text" style="word-break: break-all;">أو انسخ هذا الرابط: ${verificationUrl}</p>
  `, 'تأكيد حسابك');

  const text = `مرحباً ${user.name}،\n\nشكراً لتسجيلك في عرب نوشن! يرجى تأكيد بريدك الإلكتروني من خلال الرابط التالي:\n${verificationUrl}\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send a welcome email after successful verification
 */
const sendWelcomeEmail = async (user) => {
  if (!user || !user.email) return;

  const subject = `مرحباً بك في مجتمع عرب نوشن!`;
  const isCreator = user.role?.toLowerCase() === 'creator' || user.role?.toLowerCase() === 'admin';
  const dashboardLink = `https://www.notionarabs.com/profile`;
  const browseLink = `https://www.notionarabs.com/templates`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name}،</h2>
    <p style="font-size: 16px;">سعداء جداً بانضمامك إلينا! تم تفعيل حسابك بنجاح وأصبحت الآن جزءاً من مجتمع عرب نوشن.</p>
    
    <div class="feature-box">
      <strong style="font-size: 18px;">ماذا يمكنك أن تفعل الآن؟ 🚀</strong>
      <ul style="padding-right: 20px; line-height: 2;">
        <li>تصفح مئات القوالب العربية المميزة.</li>
        <li>تحميل القوالب المجانية والمدفوعة.</li>
        ${!isCreator ? '<li>تخصيص ملفك الشخصي وإعدادات حسابك.</li>' : '<li>إدارة قوالبك ومبيعاتك من لوحة التحكم.</li>'}
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${browseLink}" class="button">تصفح القوالب</a>
      ${isCreator ? `<a href="${dashboardLink}" class="secondary-button">لوحة التحكم</a>` : ''}
    </div>
  `, 'أهلاً بك في عرب نوشن!');

  const text = `مرحباً ${user.name}،\n\nأهلاً بك في عرب نوشن! تم تفعيل حسابك بنجاح.\n\nيمكنك الآن تصفح القوالب: ${browseLink}${isCreator ? `\n\nأو الذهاب للوحة التحكم: ${dashboardLink}` : ''}\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send a password reset email
 */
const sendResetPasswordEmail = async (user, resetUrl) => {
  if (!user || !user.email) return;

  const subject = `إعادة تعيين كلمة المرور`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name}،</h2>
    <p style="font-size: 16px;">تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في عرب نوشن. إذا قمت بذلك، اضغط على الزر أدناه:</p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
    </div>
    
    <div style="background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 20px; border-radius: 12px; margin: 25px 0; font-size: 14px;">
      <strong>ملاحظة مهمة:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب هذا، يمكنك تجاهل البريد بأمان.
    </div>
    
    <p class="secondary-text" style="word-break: break-all;">أو انسخ هذا الرابط: ${resetUrl}</p>
  `, 'إعادة تعيين كلمة المرور');

  const text = `مرحباً ${user.name}،\n\nتلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في عرب نوشن.\n\nلإعادة تعيين كلمة المرور، زر الرابط التالي:\n${resetUrl}\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an order confirmation email
 */
const sendOrderConfirmationEmail = async (user, order) => {
  if (!user || !user.email) return;

  const subject = `شكراً لطلبك! تأكيد الطلب #${order._id.toString().slice(-6).toUpperCase()}`;
  const orderLink = `https://www.notionarabs.com/purchases`;

  const itemsList = order.items.map(item => `
    <li style="padding: 12px 0; border-bottom: 1px solid #eef0f2; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: 500;">${item.name}</span>
      <span style="font-weight: 700; color: #1a1d21;">${item.price} ج.م</span>
    </li>
  `).join('');

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name}،</h2>
    <p style="font-size: 16px;">تم استلام طلبك بنجاح. شكراً لثقتك بمتجر عرب نوشن!</p>
    
    <div class="feature-box">
      <h3 style="margin-top: 0; font-size: 14px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px;">تفاصيل الطلب</h3>
      <ul style="list-style: none; padding: 0; margin: 15px 0;">
        ${itemsList}
      </ul>
      <div style="font-weight: 900; font-size: 20px; color: #f5631e; border-top: 2px dashed #eef0f2; padding-top: 15px; margin-top: 15px; display: flex; justify-content: space-between;">
        <span>المجموع الكلي:</span>
        <span>${order.total} ج.م</span>
      </div>
    </div>

    <p style="font-size: 16px;">يمكنك الوصول إلى القوالب الخاصة بك وتحميلها في أي وقت من خلال لوحة التحكم.</p>

    <div style="text-align: center;">
      <a href="${orderLink}" class="button">عرض وتحميل مشترياتي</a>
    </div>
  `, 'شكراً لطلبك!');

  const text = `مرحباً ${user.name}،\n\nتم استلام طلبك بنجاح.\n\nالمجموع الكلي: ${order.total} ج.م\n\nيمكنك تحميل مشترياتك من هنا: ${orderLink}\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email when a payout is requested
 */
const sendPayoutRequestedEmail = async (user, payout) => {
  if (!user || !user.email) return;

  const subject = `تم استلام طلب سحب الأرباح`;
  const dashboardLink = `https://www.notionarabs.com/profile?tab=earnings`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name}،</h2>
    <p style="font-size: 16px;">لقد استلمنا طلبك لسحب الأرباح بقيمة <span class="price-tag">${payout.amount} ج.م</span>.</p>
    
    <div class="feature-box">
      <strong>تفاصيل الطلب:</strong>
      <p style="margin: 5px 0;">المبلغ: ${payout.amount} ج.م</p>
      <p style="margin: 5px 0;">وسيلة السحب: ${payout.method}</p>
      <p style="margin: 5px 0;">الحالة: قيد المراجعة</p>
    </div>

    <p style="font-size: 16px;">سيتم مراجعة طلبك ومعالجته خلال 3 أيام عمل. سنقوم بإرسال بريد إلكتروني فور إتمام العملية.</p>
    
    <div style="text-align: center;">
      <a href="${dashboardLink}" class="button">متابعة حالة الطلب</a>
    </div>
  `, 'تم استلام طلب السحب');

  const text = `مرحباً ${user.name}،\n\nلقد استلمنا طلبك لسحب الأرباح بقيمة ${payout.amount} ج.م.\n\nسيتم معالجة الطلب خلال 3 أيام عمل.\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email when a payout is approved/processed
 */
const sendPayoutApprovedEmail = async (user, payout) => {
  if (!user || !user.email) return;

  const subject = `✅ تم تحويل أرباحك بنجاح!`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مبروك ${user.name}!</h2>
    <p style="font-size: 16px;">يسعدنا إخبارك بأنه تم تحويل مبلغ <span class="price-tag">${payout.amount} ج.م</span> إلى حسابك بنجاح.</p>
    
    <div class="feature-box">
      <strong>تفاصيل العملية:</strong>
      <p style="margin: 5px 0;">المبلغ المحول: ${payout.amount} ج.م</p>
      <p style="margin: 5px 0;">الوسيلة: ${payout.method}</p>
      <p style="margin: 5px 0;">التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
    </div>

    <p style="font-size: 16px;">شكراً لإبداعك المستمر ومساهمتك في إثراء المحتوى العربي على نوشن.</p>
  `, 'تم تحويل الأرباح بنجاح');

  const text = `مبروك ${user.name}!\n\nتم تحويل مبلغ ${payout.amount} ج.م إلى حسابك بنجاح عبر ${payout.method}.\n\nشكراً لإبداعك!\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email when a payment fails
 */
const sendPaymentFailedEmail = async (user, order) => {
  if (!user || !user.email) return;

  const subject = `تنبيه: لم تكتمل عملية الدفع`;
  const supportLink = `https://www.notionarabs.com/contact`;
  const templatesLink = `https://www.notionarabs.com/templates`;
  const itemName = order?.items?.[0]?.name || 'القالب';

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name || 'عزيزنا'}،</h2>
    <p style="font-size: 16px;">نود إعلامك بأن عملية الدفع المتعلقة بـ <strong>"${itemName}"</strong> لم تكتمل بنجاح.</p>

    <div style="background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 20px; border-radius: 12px; margin: 25px 0; color: #856404;">
      <strong>ماذا يمكنك فعله؟</strong>
      <ul style="padding-right: 20px; margin: 10px 0;">
        <li>تأكد من صحة بيانات بطاقتك وتوفر الرصيد الكافي</li>
        <li>حاول مرة أخرى من صفحة القالب</li>
        <li>إذا استمرت المشكلة، تواصل مع الدعم الفني</li>
      </ul>
    </div>

    <p style="font-size: 16px;">لم يتم خصم أي مبلغ من حسابك.</p>

    <div style="text-align: center;">
      <a href="${templatesLink}" class="button">العودة للمتجر</a>
      <a href="${supportLink}" class="secondary-button">الدعم الفني</a>
    </div>
  `, 'تنبيه بشأن عملية الدفع');

  const text = `مرحباً ${user.name || 'عزيزنا'},\n\nلم تكتمل عملية الدفع الخاصة بـ "${itemName}".\n\nلم يتم خصم أي مبلغ من حسابك. يمكنك المحاولة مرة أخرى أو التواصل مع الدعم: ${supportLink}\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send an email when a payout is rejected
 */
const sendPayoutRejectedEmail = async (user, payout, reason) => {
  if (!user || !user.email) return;

  const subject = `تحديث بخصوص طلب سحب الأرباح`;

  const html = getMasterTemplate(`
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 20px;">مرحباً ${user.name}،</h2>
    <p style="font-size: 16px;">نعتذر لإخبارك بأنه لم نتمكن من معالجة طلب سحب الأرباح الخاص بك بقيمة <strong>${payout.amount} ج.م</strong>.</p>
    
    ${reason ? `
    <div style="background-color: #fff8e1; border-right: 4px solid #ffc107; padding: 20px; border-radius: 12px; margin: 25px 0; color: #856404;">
      <strong>السبب:</strong><br>
      <div style="margin-top: 10px;">${reason}</div>
    </div>
    ` : ''}

    <p style="font-size: 16px;">لقد تمت إعادة المبلغ إلى رصيدك في لوحة التحكم. يمكنك مراجعة بيانات السحب الخاصة بك وإعادة الطلب مرة أخرى.</p>
  `, 'تحديث بخصوص طلب السحب');

  const text = `مرحباً ${user.name}،\n\nنأسف لإخبارك بأنه تم رفض طلب سحب الأرباح الخاص بك (${payout.amount} ج.م).\n\n${reason ? `السبب: ${reason}\n\n` : ''}تمت إعادة المبلغ لرصيدك.\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text });
};

module.exports = {
  sendEmail,
  sendTemplateApprovedEmail,
  sendTemplateRejectedEmail,
  sendCreatorApprovedEmail,
  sendCreatorRejectedEmail,
  sendBlogApprovedEmail,
  sendBlogRejectedEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
  sendPayoutRequestedEmail,
  sendPayoutApprovedEmail,
  sendPayoutRejectedEmail
};
