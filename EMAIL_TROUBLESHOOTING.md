# Email Verification Troubleshooting Guide

## Problem

Users not receiving verification emails when signing up to Notion Arabs platform.

## Root Cause Found

`FRONTEND_URL` environment variable in backend was set to `http://localhost:3000` instead of production URL.

## Solution

### 1. Update Backend Environment Variables

#### If Backend is Deployed on Railway/Render/Heroku:

1. Go to your backend hosting dashboard
2. Navigate to Environment Variables / Config Vars section
3. Update the following variable:
   ```
   FRONTEND_URL=https://notionarabs.com
   ```
4. Restart the backend service

#### If Running Backend Locally:

Edit `backend/.env` file and change:

```env
FRONTEND_URL=http://localhost:3000
```

To:

```env
FRONTEND_URL=https://notionarabs.com
```

### 2. Verify Email Configuration

The following environment variables should be set in your backend:

```env
# Email Configuration
EMAIL_USER=notionarabs.team@gmail.com
EMAIL_PASS=<your-gmail-app-password>
EMAIL_FROM=notionarabs.team@gmail.com

# Frontend URL
FRONTEND_URL=https://notionarabs.com
```

### 3. Gmail App Password Setup

If you haven't already, you need to create a Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security**
3. Under "How you sign in to Google," select **2-Step Verification** (enable if not already)
4. At the bottom, select **App passwords**
5. Select app: **Mail**
6. Select device: **Other** (enter "Notion Arabs Backend")
7. Click **Generate**
8. Copy the 16-character password
9. Use this as your `EMAIL_PASS` environment variable (no spaces)

### 4. Test Email Configuration

After updating the environment variables, test the email service:

#### Using the test endpoint:

```bash
# Replace with your actual backend URL
curl https://your-backend-url.com/api/auth/test-email
```

Expected response:

```json
{
  "success": true,
  "message": "Email configuration is working! Test email sent.",
  "emailSentTo": "notionarabs.team@gmail.com"
}
```

### 5. Common Issues & Solutions

#### Issue: Emails going to spam

**Solution:**

- Check Gmail spam folder
- Add sender to contacts
- Configure SPF/DKIM records for your domain (advanced)

#### Issue: Gmail blocking emails

**Solution:**

- Enable "Less secure app access" (if app password doesn't work)
- Check Gmail account limits (500 emails/day for free Gmail)
- Consider using professional email service (SendGrid, AWS SES, etc.)

#### Issue: "Invalid login" error

**Solution:**

- Make sure you're using an App Password, not your regular Gmail password
- Ensure 2-Step Verification is enabled on the Gmail account
- Check there are no spaces in the password

### 6. Verification Flow

Once fixed, the flow should work like this:

1. User signs up on https://notionarabs.com/signup
2. Backend receives signup request
3. Backend sends email via Gmail SMTP
4. Email contains link: `https://notionarabs.com/verify-email?token=xxx`
5. User clicks link
6. User is verified and automatically logged in

### 7. For Development vs Production

You can use different `.env` files:

**Development (`.env.development`)**:

```env
FRONTEND_URL=http://localhost:3000
EMAIL_USER=test@example.com
EMAIL_PASS=test-password
```

**Production (`.env.production` or environment variables in hosting platform)**:

```env
FRONTEND_URL=https://notionarabs.com
EMAIL_USER=notionarabs.team@gmail.com
EMAIL_PASS=<actual-app-password>
```

### 8. Alternative Email Services

If Gmail continues to have issues, consider:

**SendGrid** (Free: 100 emails/day):

```javascript
// Update backend/routes/auth.js createTransporter function
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

**AWS SES** (Free: 62,000 emails/month):

- More reliable for production
- Better deliverability
- Professional setup

**Resend** (Free: 100 emails/day):

- Modern API
- Easy to integrate
- Good deliverability

### 9. Monitoring

Add logging to track email sending:

```javascript
// In backend logs, check for:
console.log("Email sent successfully to:", email);
// Or
console.error("Email sending failed:", error);
```

### 10. Testing Checklist

- [ ] `FRONTEND_URL` is set to production domain
- [ ] `EMAIL_USER` and `EMAIL_PASS` are correct
- [ ] Gmail App Password is generated and used
- [ ] Backend service is restarted after env changes
- [ ] Test email endpoint returns success
- [ ] Check spam folder for test emails
- [ ] Try actual signup flow
- [ ] Verify email link works correctly

---

## Quick Test Commands

### Check current configuration:

```bash
cd backend
node -e "require('dotenv').config(); console.log('FRONTEND_URL:', process.env.FRONTEND_URL); console.log('EMAIL_USER:', process.env.EMAIL_USER);"
```

### Test email sending:

```bash
curl https://your-backend-url/api/auth/test-email
```

---

**Last Updated:** October 8, 2025  
**Issue Status:** Identified - FRONTEND_URL misconfiguration  
**Expected Fix Time:** 5 minutes after environment variable update
