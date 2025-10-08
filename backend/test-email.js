const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Testing email configuration...\n');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS set:', process.env.EMAIL_PASS ? 'Yes' : 'No');
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('\nAttempting to create transporter...');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('Transporter created. Verifying connection...\n');

transporter.verify(async (error, success) => {
  if (error) {
    console.error('❌ Email verification FAILED:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('\nFull error:', error);

    if (error.code === 'EAUTH') {
      console.log('\n🔑 AUTHENTICATION ERROR - Possible causes:');
      console.log('1. Using regular Gmail password instead of App Password');
      console.log('2. App Password is incorrect or expired');
      console.log('3. 2-Step Verification not enabled on Gmail account');
      console.log('\n📝 To fix:');
      console.log('   Go to: https://myaccount.google.com/apppasswords');
      console.log('   Generate a new App Password for "Mail"');
      console.log('   Update EMAIL_PASS in your environment variables');
    }
  } else {
    console.log('✅ Email configuration is VALID!\n');
    console.log('Attempting to send test email...');

    const mailOptions = {
      from: `"فريق عرب نوشن" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Test Email - Notion Arabs',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
          <h2 style="color: #333; text-align: center;">اختبار إرسال البريد الإلكتروني ✅</h2>
          <p>هذا اختبار لإرسال البريد الإلكتروني من منصة عرب نوشن.</p>
          <p>إذا تلقيت هذا البريد، فالإعداد يعمل بشكل صحيح!</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">عرب نوشن - منصة القوالب العربية</p>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Test email SENT successfully!');
      console.log('Message ID:', info.messageId);
      console.log('Email sent to:', process.env.EMAIL_USER);
      console.log('\n📧 Check your inbox (and spam folder)!');
    } catch (sendError) {
      console.error('❌ Failed to send test email:');
      console.error('Error:', sendError.message);
      console.error('\nFull error:', sendError);
    }
  }

  process.exit();
});
