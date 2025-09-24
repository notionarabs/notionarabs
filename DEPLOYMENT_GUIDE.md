# Screenshot Service Deployment Guide

## Problem

Screenshots are not being captured in production when creators submit template links.

## Root Causes Identified

1. **Puppeteer Dependencies**: Missing Chrome/Chromium in production environment
2. **Memory Constraints**: Production environments have limited resources
3. **Configuration Issues**: Missing production-specific settings
4. **Error Handling**: Screenshot failures were silently ignored

## Solutions Implemented

### 1. Updated Dependencies

- Downgraded Puppeteer to version 21.11.0 (more stable in production)
- Added puppeteer-core for better production support

### 2. Production-Optimized Screenshot Service

- Added production-specific Chrome executable path detection
- Optimized browser launch options for memory efficiency
- Improved error handling and logging
- Added fallback mechanisms

### 3. Docker Configuration

- Created Dockerfile with Chrome dependencies
- Configured for Alpine Linux (smaller image)
- Set proper environment variables

### 4. Render.com Configuration

- Created render.yaml for easy deployment
- Configured environment variables
- Set up proper build commands

## Deployment Steps

### Option 1: Render.com (Recommended)

1. **Update Environment Variables**:

   ```bash
   NODE_ENV=production
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
   ```

2. **Deploy using render.yaml**:
   - The render.yaml file is already configured
   - Just add your environment variables in Render dashboard

### Option 2: Docker Deployment

1. **Build the Docker image**:

   ```bash
   cd backend
   docker build -t notion-arabs-backend .
   ```

2. **Run the container**:
   ```bash
   docker run -p 5000:5000 \
     -e NODE_ENV=production \
     -e MONGODB_URI=your_mongodb_uri \
     -e JWT_SECRET=your_jwt_secret \
     notion-arabs-backend
   ```

### Option 3: Manual Server Deployment

1. **Install Chrome/Chromium**:

   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install -y chromium-browser

   # CentOS/RHEL
   sudo yum install -y chromium
   ```

2. **Set environment variables**:

   ```bash
   export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
   export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   ```

3. **Install dependencies and start**:
   ```bash
   cd backend
   npm install
   npm start
   ```

## Testing the Fix

### 1. Health Check

Visit: `https://your-backend-url.com/api/screenshot/health`

Expected response:

```json
{
  "success": true,
  "message": "Screenshot service is healthy",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Screenshot Capture

1. Go to template creation page
2. Enter a Notion URL
3. Check browser console for debug logs
4. Verify screenshot is captured and displayed

### 3. Monitor Logs

Check your hosting platform logs for:

- Screenshot capture success/failure messages
- Browser launch status
- Memory usage warnings

## Troubleshooting

### Common Issues

1. **"Chrome/Chromium not found"**

   - Solution: Install Chrome/Chromium on your server
   - Set PUPPETEER_EXECUTABLE_PATH environment variable

2. **"Browser closed unexpectedly"**

   - Solution: Increase memory allocation or use a more powerful server
   - Check server resource limits

3. **"Navigation timeout"**

   - Solution: Check if the Notion URL is accessible
   - Verify network connectivity

4. **"Screenshot file was not created"**
   - Solution: Check file permissions in uploads/screenshots directory
   - Ensure sufficient disk space

### Debug Commands

1. **Test Puppeteer locally**:

   ```bash
   node -e "const puppeteer = require('puppeteer'); puppeteer.launch().then(b => { console.log('Success'); b.close(); }).catch(e => console.error(e));"
   ```

2. **Check Chrome installation**:

   ```bash
   which google-chrome-stable
   which chromium-browser
   ```

3. **Test screenshot service**:
   ```bash
   curl -X POST https://your-backend-url.com/api/screenshot \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"url": "https://notion.so/your-template"}'
   ```

## Monitoring

### Key Metrics to Monitor

1. Screenshot capture success rate
2. Average screenshot capture time
3. Memory usage during screenshot capture
4. Error rates and types

### Log Patterns to Watch

- `✅ Auto-captured screenshot for template`
- `❌ Screenshot capture failed`
- `Browser launched successfully`
- `Screenshot service is healthy`

## Performance Optimization

### For High Traffic

1. Consider using a screenshot service like Puppeteer-as-a-Service
2. Implement screenshot caching
3. Use a queue system for screenshot processing
4. Consider using a headless Chrome service

### Memory Optimization

1. Limit concurrent screenshot operations
2. Implement screenshot cleanup
3. Use smaller viewport sizes
4. Optimize image compression

## Security Considerations

1. Validate all input URLs
2. Implement rate limiting for screenshot requests
3. Sanitize file names and paths
4. Monitor for abuse patterns

## Backup Plan

If screenshots continue to fail:

1. Allow manual image uploads
2. Use a third-party screenshot service
3. Implement a fallback to placeholder images
4. Notify users when screenshots fail

## Support

If you encounter issues:

1. Check the health endpoint first
2. Review server logs
3. Test with a simple Notion URL
4. Verify all environment variables are set correctly
