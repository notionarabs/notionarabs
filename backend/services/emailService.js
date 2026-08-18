const axios = require('axios');

/**
 * Resolves sender email, name, and reply-to based on category or explicit overrides
 */
const getSenderDetails = ({ from, fromName, replyTo, category } = {}) => {
  const accounts = {
    auth: {
      name: 'عرب نوشن - الحسابات',
      email: process.env.EMAIL_FROM_AUTH || process.env.EMAIL_FROM || 'noreply@notionarabs.com',
      replyTo: process.env.SUPPORT_EMAIL || 'support@notionarabs.com'
    },
    orders: {
      name: 'عرب نوشن - الطلبات والمدفوعات',
      email: process.env.EMAIL_FROM_ORDERS || process.env.EMAIL_FROM || 'orders@notionarabs.com',
      replyTo: process.env.SUPPORT_EMAIL || 'support@notionarabs.com'
    },
    creators: {
      name: 'عرب نوشن - فريق المبدعين',
      email: process.env.EMAIL_FROM_CREATORS || process.env.EMAIL_FROM || 'creators@notionarabs.com',
      replyTo: process.env.SUPPORT_EMAIL || 'support@notionarabs.com'
    },
    support: {
      name: 'عرب نوشن - الدعم والتواصل',
      email: process.env.EMAIL_FROM_SUPPORT || process.env.SUPPORT_EMAIL || 'support@notionarabs.com',
      replyTo: process.env.SUPPORT_EMAIL || 'support@notionarabs.com'
    },
    newsletter: {
      name: 'عرب نوشن - النشرة الإخبارية',
      email: process.env.EMAIL_FROM_NEWSLETTER || process.env.EMAIL_FROM || 'newsletter@notionarabs.com',
      replyTo: process.env.SUPPORT_EMAIL || 'support@notionarabs.com'
    },
    default: {
      name: 'عرب نوشن',
      email: process.env.EMAIL_FROM || 'support@notionarabs.com',
      replyTo: process.env.SUPPORT_EMAIL || 'support@notionarabs.com'
    }
  };

  const account = (category && accounts[category]) ? accounts[category] : accounts.default;
  const name = fromName || account.name;
  const email = from || account.email;
  const reply = replyTo || account.replyTo;

  return { name, email, replyTo: reply };
};

/**
 * Send an email using Resend API
 * @param {Object} options - Email options
 * @param {string|Array} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Text content
 * @param {string} options.from - Optional custom sender email
 * @param {string} options.fromName - Optional custom sender name
 * @param {string} options.replyTo - Optional custom reply-to
 * @param {string} options.category - Email category ('auth', 'orders', 'creators', 'support', 'newsletter')
 * @returns {Promise<Object>} - Response from Resend
 */
const sendViaResend = async ({ to, subject, html, text, from, fromName, replyTo, category }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const sender = getSenderDetails({ from, fromName, replyTo, category });
  const fromField = sender.email.includes('<') ? sender.email : `${sender.name} <${sender.email}>`;
  const primaryRecipient = Array.isArray(to) ? (typeof to[0] === 'string' ? to[0] : to[0].email) : to;

  const toList = Array.isArray(to)
    ? to.map(item => (typeof item === 'string' ? item : item.email))
    : [to];

  const payload = {
    from: fromField,
    to: toList,
    subject: subject,
    html: html,
    ...(text ? { text } : {}),
    reply_to: sender.replyTo,
    headers: {
      'List-Unsubscribe': `<https://www.notionarabs.com/unsubscribe?email=${encodeURIComponent(primaryRecipient)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    },
    tags: [
      { name: 'category', value: category || 'general' }
    ]
  };

  const response = await axios.post('https://api.resend.com/emails', payload, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    }
  });

  console.log(`✅ Resend [${category || 'default'}] email sent to ${primaryRecipient}:`, response.data.id);
  return {
    messageId: response.data.id,
    provider: 'resend',
    response: 'Email sent via Resend'
  };
};

/**
 * Send an email using Brevo API
 * @param {Object} options - Email options
 * @param {string|Array} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Text content
 * @param {string} options.from - Optional custom sender email
 * @param {string} options.fromName - Optional custom sender name
 * @param {string} options.replyTo - Optional custom reply-to
 * @param {string} options.category - Email category ('auth', 'orders', 'creators', 'support', 'newsletter')
 * @returns {Promise<Object>} - Response from Brevo
 */
const sendViaBrevo = async ({ to, subject, html, text, from, fromName, replyTo, category }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured.');
  }

  const sender = getSenderDetails({ from, fromName, replyTo, category });
  const primaryRecipient = Array.isArray(to) ? (typeof to[0] === 'string' ? to[0] : to[0].email) : to;
  const toList = Array.isArray(to)
    ? to.map(item => (typeof item === 'string' ? { email: item } : item))
    : [{ email: to }];

  const response = await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: {
        name: sender.name,
        email: sender.email
      },
      to: toList,
      subject: subject,
      htmlContent: html,
      textContent: text,
      headers: {
        'List-Unsubscribe': '<https://www.notionarabs.com/unsubscribe?email=' + encodeURIComponent(primaryRecipient) + '>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Mailer': 'Microsoft Outlook 16.0',
        'Reply-To': sender.replyTo
      },
      tags: ['notionarabs', category || 'notification']
    },
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      }
    }
  );

  console.log(`✅ Brevo [${category || 'default'}] email sent to ${primaryRecipient}:`, response.data.messageId);
  return {
    messageId: response.data.messageId,
    provider: 'brevo',
    response: 'Email sent via Brevo'
  };
};

/**
 * Universal email dispatcher with automatic fallback support
 * @param {Object} options - Email options
 * @param {string|Array} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Text content
 * @param {string} options.from - Optional custom sender email
 * @param {string} options.fromName - Optional custom sender name
 * @param {string} options.replyTo - Optional custom reply-to
 * @param {string} options.category - Email category ('auth', 'orders', 'creators', 'support', 'newsletter')
 * @returns {Promise<Object>} - Delivery response
 */
const sendEmail = async ({ to, subject, html, text, from, fromName, replyTo, category }) => {
  const provider = (process.env.EMAIL_PROVIDER || 'auto').toLowerCase();
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasBrevo = Boolean(process.env.BREVO_API_KEY);

  if (!hasResend && !hasBrevo) {
    console.warn('⚠️ Neither RESEND_API_KEY nor BREVO_API_KEY is configured!');
    if (process.env.NODE_ENV === 'development') {
      const sender = getSenderDetails({ from, fromName, replyTo, category });
      console.log('--- EMAIL MOCK ---');
      console.log(`From: ${sender.name} <${sender.email}> (Reply-To: ${sender.replyTo})`);
      console.log(`To: ${JSON.stringify(to)}`);
      console.log(`Category: ${category || 'general'}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text Content: ${text}`);
      if (html) {
        const linkMatch = html.match(/href="([^"]+)"/);
        if (linkMatch) console.log(`Detected Link: ${linkMatch[1]}`);
      }
      console.log('--- END EMAIL MOCK ---');
      return { messageId: 'mock-id', provider: 'mock', response: 'Email logged (dev mode)' };
    }
    throw new Error('Email service is not configured. Please set RESEND_API_KEY or BREVO_API_KEY.');
  }

  // Explicit provider choice
  if (provider === 'resend') {
    if (!hasResend) throw new Error('EMAIL_PROVIDER is set to resend, but RESEND_API_KEY is not configured.');
    try {
      return await sendViaResend({ to, subject, html, text, from, fromName, replyTo, category });
    } catch (err) {
      if (hasBrevo) {
        console.warn('⚠️ Resend failed, falling back to Brevo:', err.response?.data || err.message);
        return await sendViaBrevo({ to, subject, html, text, from, fromName, replyTo, category });
      }
      throw err;
    }
  }

  if (provider === 'brevo') {
    if (!hasBrevo) throw new Error('EMAIL_PROVIDER is set to brevo, but BREVO_API_KEY is not configured.');
    try {
      return await sendViaBrevo({ to, subject, html, text, from, fromName, replyTo, category });
    } catch (err) {
      if (hasResend) {
        console.warn('⚠️ Brevo failed, falling back to Resend:', err.response?.data || err.message);
        return await sendViaResend({ to, subject, html, text, from, fromName, replyTo, category });
      }
      throw err;
    }
  }

  // Auto mode: prioritize Resend if available, fallback to Brevo
  if (hasResend) {
    try {
      return await sendViaResend({ to, subject, html, text, from, fromName, replyTo, category });
    } catch (err) {
      if (hasBrevo) {
        console.warn('⚠️ Resend failed in auto mode, falling back to Brevo:', err.response?.data || err.message);
        return await sendViaBrevo({ to, subject, html, text, from, fromName, replyTo, category });
      }
      throw err;
    }
  }

  return await sendViaBrevo({ to, subject, html, text, from, fromName, replyTo, category });
};

/**
 * Master HTML Template for all emails
 * Aligned with Notion Arabs official website identity & brand aesthetics
 */
const getMasterTemplate = (content, title = 'عرب نوشن', preheader = '') => `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
    <style>
      :root {
        color-scheme: light;
      }
      body { 
        font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
        background-color: #f1f5f9; 
        margin: 0; 
        padding: 0; 
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        direction: rtl;
        text-align: right;
        width: 100% !important;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      .wrapper { 
        padding: 40px 16px; 
        direction: rtl;
        background-color: #f1f5f9;
      }
      .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: #ffffff; 
        border-radius: 20px; 
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04);
        border: 1px solid #e2e8f0;
        direction: rtl;
      }
      .header { 
        background: linear-gradient(160deg, #0d1527 0%, #132859 60%, #1a3675 100%); 
        padding: 36px 30px; 
        text-align: center; 
        color: #ffffff;
        border-top: 5px solid #f5631e;
        position: relative;
      }
      .brand-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 8px 18px;
        border-radius: 9999px;
        margin-bottom: 18px;
        text-decoration: none;
      }
      .brand-title {
        color: #ffffff;
        font-size: 20px;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.3px;
        vertical-align: middle;
      }
      .brand-dot {
        color: #f5631e;
      }
      .header h1 { 
        margin: 0; 
        font-size: 24px; 
        font-weight: 800; 
        letter-spacing: -0.5px; 
        color: #ffffff;
        line-height: 1.4;
      }
      .header-subtitle {
        margin: 8px 0 0;
        font-size: 13px;
        color: #94a3b8;
        font-weight: 500;
      }
      .body { 
        padding: 36px 32px; 
        text-align: right; 
        color: #1e293b; 
        line-height: 1.85; 
        direction: rtl; 
        font-size: 15px;
      }
      .body h2 {
        color: #0f172a;
        font-size: 20px;
        font-weight: 800;
        margin-top: 0;
        margin-bottom: 16px;
      }
      .body p {
        margin: 0 0 16px 0;
        color: #334155;
      }
      .footer { 
        background-color: #f8fafc; 
        padding: 32px 30px; 
        text-align: center; 
        color: #64748b; 
        font-size: 13px;
        border-top: 1px solid #e2e8f0;
        direction: rtl;
        line-height: 1.7;
      }
      .button { 
        display: inline-block; 
        background: linear-gradient(135deg, #f5631e 0%, #ff7a3d 100%); 
        color: #ffffff !important; 
        text-decoration: none !important; 
        padding: 14px 34px; 
        border-radius: 12px; 
        font-weight: 700; 
        font-size: 15px;
        margin: 20px 0;
        transition: all 0.25s ease;
        box-shadow: 0 4px 14px rgba(245, 99, 30, 0.3);
        text-align: center;
      }
      .secondary-button {
        display: inline-block;
        background-color: #ffffff;
        color: #1e293b !important;
        text-decoration: none !important;
        padding: 12px 26px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 14px;
        margin: 20px 8px;
        border: 1.5px solid #cbd5e1;
        text-align: center;
      }
      .secondary-text { color: #64748b; font-size: 13px; line-height: 1.6; }
      .divider { height: 1px; background-color: #e2e8f0; margin: 26px 0; }
      .social-links { margin: 18px 0 14px; }
      .social-links a { 
        color: #f5631e; 
        text-decoration: none; 
        margin: 0 8px; 
        font-weight: 700;
        font-size: 13px;
      }
      .footer-links { margin: 10px 0 16px; }
      .footer-links a {
        color: #475569;
        text-decoration: none;
        margin: 0 8px;
        font-size: 12px;
      }
      .footer-links a:hover {
        color: #f5631e;
      }
      .feature-box { 
        background: linear-gradient(180deg, #fffbf8 0%, #fff7f2 100%); 
        padding: 22px 24px; 
        border-radius: 14px; 
        margin: 24px 0; 
        border: 1px solid #fed7aa; 
        border-right: 4px solid #f5631e; 
        direction: rtl; 
        text-align: right; 
      }
      .feature-box strong { display: block; margin-bottom: 8px; color: #0f172a; font-size: 15px; }
      .feature-box ul { padding: 0 18px 0 0; margin: 0; list-style-position: inside; }
      .feature-box li { margin-bottom: 6px; color: #334155; }
      .price-tag { color: #f5631e; font-weight: 900; font-size: 22px; }
      .alert-box {
        background-color: #fffbeb;
        border: 1px solid #fef08a;
        border-right: 4px solid #eab308;
        padding: 18px 22px;
        border-radius: 12px;
        margin: 22px 0;
        color: #854d0e;
        font-size: 14px;
      }
      .preheader {
        display: none !important;
        visibility: hidden;
        mso-hide: all;
        font-size: 1px;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    ${preheader ? `<span class="preheader">${preheader}</span>` : ''}
    <div class="wrapper">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="center">
            <div class="container">
              <!-- Header with Official Branding & Logo -->
              <div class="header">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center">
                      <a href="https://www.notionarabs.com" target="_blank" style="text-decoration: none;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 16px auto;">
                          <tr>
                            <td style="vertical-align: middle; padding-left: 10px;">
                              <img src="https://www.notionarabs.com/icons/icon-192x192.png" alt="عرب نوشن" width="38" height="38" style="display: block; border-radius: 10px; border: 1.5px solid rgba(255, 255, 255, 0.2);" />
                            </td>
                            <td style="vertical-align: middle;">
                              <span class="brand-title">عرب نوشن</span>
                            </td>
                          </tr>
                        </table>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <h1>${title}</h1>
                      <p class="header-subtitle">مجتمع ومنصة نوشن الأولى في العالم العربي</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Main Content Body -->
              <div class="body">
                ${content}
              </div>

              <!-- Sleek Modern Footer -->
              <div class="footer">
                <div class="footer-links">
                  <a href="https://www.notionarabs.com/templates">تصفح القوالب</a> • 
                  <a href="https://www.notionarabs.com/blog">المدونة</a> • 
                  <a href="https://www.notionarabs.com/contact">الدعم الفني</a> • 
                  <a href="https://www.notionarabs.com/about">من نحن</a>
                </div>
                <div class="social-links">
                  <a href="https://twitter.com/notionarabs" target="_blank">منصة X (تويتر)</a> •
                  <a href="https://instagram.com/notionarabs" target="_blank">انستجرام</a> •
                  <a href="https://www.notionarabs.com" target="_blank">الموقع الرسمي</a>
                </div>
                <div class="divider" style="margin: 20px 0;"></div>
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                  © ${new Date().getFullYear()} عرب نوشن (Notion Arabs) - جميع الحقوق محفوظة.
                </p>
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                  تصلك هذه الرسالة لأنك مسجل في منصة عرب نوشن. 
                  <a href="https://www.notionarabs.com/user-settings" style="color: #64748b; text-decoration: underline;">إدارة التفضيلات</a>
                </p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
`;

/**
 * Send an email notification when a template is approved
 */
const sendTemplateApprovedEmail = async (user, template) => {
  if (!user || !user.email) return;

  const subject = `مبروك! تم قبول قالبك: ${template.title}`;
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

  await sendEmail({ to: user.email, subject, html, text, category: 'creators' });
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
    <div class="alert-box">
      <strong>${isUpdate ? 'سبب رفض التحديث:' : 'سبب الرفض:'}</strong><br>
      <div style="margin-top: 8px;">${reason}</div>
    </div>
    ` : ''}

    <p style="font-size: 16px;">يمكنك تعديل القالب بناءً على هذه الملاحظات وإعادة إرساله مرة أخرى للمراجعة. نحن هنا لمساعدتك!</p>
    
    <div style="text-align: center;">
      <a href="${dashboardLink}" class="button">الذهاب للوحة التحكم</a>
    </div>
  `, 'تحديث بخصوص قالبك');

  const text = `مرحباً ${user.name || 'مبدعنا'}،\n\nشكراً لإرسال قالبك "${template.title}" للمراجعة.\n\nنأسف لإخبارك بأنه لم يتم قبول القالب في الوقت الحالي.\n\n${reason ? `السبب: ${reason}\n\n` : ''}يمكنك التعديل وإعادة الإرسال من لوحة التحكم.\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text, category: 'creators' });
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

  await sendEmail({ to: user.email, subject, html, text, category: 'creators' });
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
    <div class="alert-box">
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

  await sendEmail({ to: user.email, subject, html, text, category: 'creators' });
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

  await sendEmail({ to: user.email, subject, html, text, category: 'creators' });
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
    <div class="alert-box">
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

  await sendEmail({ to: user.email, subject, html, text, category: 'creators' });
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

  await sendEmail({ to: user.email, subject, html, text, category: 'auth' });
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
      <strong style="font-size: 18px;">ماذا يمكنك أن تفعل الآن؟</strong>
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

  await sendEmail({ to: user.email, subject, html, text, category: 'auth' });
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
    
    <div class="alert-box">
      <strong>ملاحظة مهمة:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب هذا، يمكنك تجاهل البريد بأمان.
    </div>
    
    <p class="secondary-text" style="word-break: break-all;">أو انسخ هذا الرابط: ${resetUrl}</p>
  `, 'إعادة تعيين كلمة المرور');

  const text = `مرحباً ${user.name}،\n\nتلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في عرب نوشن.\n\nلإعادة تعيين كلمة المرور، زر الرابط التالي:\n${resetUrl}\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text, category: 'auth' });
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

  await sendEmail({ to: user.email, subject, html, text, category: 'orders' });
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

  await sendEmail({ to: user.email, subject, html, text, category: 'creators' });
};

/**
 * Send an email when a payout is approved/processed
 */
const sendPayoutApprovedEmail = async (user, payout) => {
  if (!user || !user.email) return;

  const subject = `تم تحويل أرباحك بنجاح!`;

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

  await sendEmail({ to: user.email, subject, html, text, category: 'creators' });
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

    <div class="alert-box">
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

  await sendEmail({ to: user.email, subject, html, text, category: 'orders' });
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
    <div class="alert-box">
      <strong>السبب:</strong><br>
      <div style="margin-top: 10px;">${reason}</div>
    </div>
    ` : ''}

    <p style="font-size: 16px;">لقد تمت إعادة المبلغ إلى رصيدك في لوحة التحكم. يمكنك مراجعة بيانات السحب الخاصة بك وإعادة الطلب مرة أخرى.</p>
  `, 'تحديث بخصوص طلب السحب');

  const text = `مرحباً ${user.name}،\n\nنأسف لإخبارك بأنه تم رفض طلب سحب الأرباح الخاص بك (${payout.amount} ج.م).\n\n${reason ? `السبب: ${reason}\n\n` : ''}تمت إعادة المبلغ لرصيدك.\n\nعرب نوشن`;

  await sendEmail({ to: user.email, subject, html, text, category: 'creators' });
};

module.exports = {
  sendEmail,
  sendViaResend,
  sendViaBrevo,
  getMasterTemplate,
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
