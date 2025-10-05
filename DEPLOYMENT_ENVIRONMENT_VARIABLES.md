# Deployment Environment Variables

This document lists all the required environment variables for the Notion Arabs application deployment.

## Backend Environment Variables (Render/Railway)

### Required Variables

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notion-arabs

# JWT Secret
JWT_SECRET=your-very-secure-jwt-secret-key-here

# Email Configuration (Gmail)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password

# Frontend URL
FRONTEND_URL=https://notion-arabs.vercel.app

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Secret (for creating admin users)
ADMIN_SECRET=your-admin-secret-key
```

### Optional Variables

```bash
# Environment
NODE_ENV=production

# Port (usually set by hosting platform)
PORT=5000
```

## Frontend Environment Variables (Vercel)

### Required Variables

```bash
# API URL
NEXT_PUBLIC_API_URL=https://notion-arabs.onrender.com/api
```

### Optional Variables

```bash
# Environment
NODE_ENV=production
```

## Email Setup Instructions

### Gmail App-Specific Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings
3. Navigate to Security → 2-Step Verification → App passwords
4. Generate a new app password for "Mail"
5. Use this password as `EMAIL_PASS` (not your regular Gmail password)

### Alternative Email Services

If Gmail doesn't work, you can use other email services:

#### SendGrid

```bash
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailgun

```bash
EMAIL_SERVICE=mailgun
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-api-key
```

## Troubleshooting

### Common Issues

1. **Signup not working**: Check if `EMAIL_USER` and `EMAIL_PASS` are set correctly
2. **CORS errors**: Ensure `FRONTEND_URL` matches your deployed frontend URL
3. **Database connection**: Verify `MONGODB_URI` is correct and accessible
4. **JWT errors**: Make sure `JWT_SECRET` is set and secure

### Testing Email Configuration

You can test the email configuration by checking the backend logs after deployment. Look for:

- "Email transporter is ready to send messages" (success)
- "Email transporter verification failed" (failure)

## Security Notes

- Never commit environment variables to version control
- Use strong, unique passwords and secrets
- Rotate secrets regularly
- Monitor logs for any authentication failures
