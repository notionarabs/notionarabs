# Screenshot Feature Documentation

## Overview

This feature automatically captures screenshots of Notion template pages when creators enter their template links in the create template form.

## How It Works

### Backend Implementation

1. **Screenshot Service** (`backend/services/screenshotService.js`)

   - Uses Puppeteer to launch a headless browser
   - Navigates to the provided Notion URL
   - Captures a screenshot of the viewport (top portion of the page)
   - Saves the screenshot to `backend/uploads/screenshots/` directory
   - Returns the screenshot URL for frontend use

2. **API Endpoint** (`/api/screenshot`)

   - POST endpoint that accepts a Notion URL
   - Validates that the URL is from notion.so domain
   - Requires authentication (approved creators only)
   - Returns the screenshot URL and metadata

3. **Static File Serving**
   - Screenshots are served from `/uploads/screenshots/` path
   - Backend serves these files as static content

### Frontend Implementation

1. **Auto-Capture Trigger**

   - When user types in the "Notion Link" field
   - Validates that it's a Notion URL
   - Automatically calls the screenshot API

2. **Loading State**

   - Shows a loading spinner while capturing screenshot
   - Displays "جاري التقاط صورة للقالب..." message

3. **Screenshot Preview**

   - Shows the captured screenshot in a preview box
   - Automatically fills the "Preview Image" field
   - Allows user to remove the screenshot if needed

4. **Error Handling**
   - Gracefully handles screenshot failures
   - Doesn't interrupt the form submission process
   - Screenshot capture is optional, not required

## File Structure

```
backend/
├── services/
│   └── screenshotService.js    # Core screenshot functionality
├── routes/
│   └── screenshot.js          # API endpoint
├── uploads/
│   └── screenshots/           # Generated screenshots storage
└── index.js                   # Updated with screenshot routes

frontend/
├── app/templates/create/
│   └── page.js               # Updated with screenshot functionality
└── next.config.js            # Updated with image domains
```

## Usage Flow

1. Creator navigates to "Create Template" page
2. Creator enters a Notion template link
3. System automatically detects it's a Notion URL
4. Screenshot is captured in the background
5. Preview is shown to the creator
6. Creator can remove or keep the screenshot
7. Form submission includes the screenshot URL
8. If no screenshot was captured, backend automatically captures one during submission

## Technical Details

### Automatic Screenshot Capture

The system automatically captures screenshots without manual input from creators:

- **No Manual Input**: Creators cannot manually provide preview images
- **Automatic Detection**: Screenshots are captured when Notion URLs are entered
- **Backend Fallback**: If frontend capture fails, backend captures during submission
- **Guaranteed Preview**: Every template gets a preview image automatically

### Header Detection & Skipping

The screenshot service automatically detects and skips Notion headers to capture only the main content:

- **Dynamic Detection**: Uses multiple CSS selectors to find header elements
- **Smart Scrolling**: Automatically scrolls past the detected header
- **Content Clipping**: Screenshots are cropped to start after the header
- **Fallback**: If no header is detected, uses a reasonable default offset

### Screenshot Configuration

- Viewport size: 1280x800 pixels
- Image format: PNG
- Capture: Main content only (header automatically excluded)
- Header detection: Dynamic detection of Notion headers
- Content area: 1280x600 pixels starting after header
- Timeout: 30 seconds

### Security

- Only approved creators can capture screenshots
- URLs are validated to ensure they're from notion.so
- Screenshots are stored with unique filenames
- Old screenshots can be cleaned up automatically

### Performance

- Screenshots are captured asynchronously
- No blocking of form submission if screenshot fails
- Screenshots are cached by filename (URL hash)
- Cleanup service removes old screenshots

## Dependencies

### Backend

- `puppeteer`: For browser automation and screenshot capture
- `express`: For API endpoint
- `express-validator`: For URL validation

### Frontend

- No additional dependencies required
- Uses existing `api` utility for HTTP requests

## Environment Variables

No additional environment variables required. The feature works with existing configuration.

## Testing

To test the feature:

1. Start the backend server: `npm run dev` (in backend directory)
2. Start the frontend: `npm run dev` (in frontend directory)
3. Navigate to the create template page
4. Enter a valid Notion URL
5. Observe the automatic screenshot capture and preview

## Troubleshooting

### Common Issues

1. **Screenshot fails to capture**

   - Check if the Notion URL is publicly accessible
   - Verify backend server is running
   - Check browser console for errors

2. **Screenshots not displaying**

   - Verify Next.js image domains are configured
   - Check if backend is serving static files correctly
   - Ensure screenshot files are being saved to the correct directory

3. **Performance issues**
   - Screenshot capture can take 5-10 seconds
   - This is normal behavior for browser automation
   - Consider implementing a queue system for high traffic

## Future Enhancements

1. **Queue System**: Implement background job processing for screenshots
2. **Multiple Formats**: Support different image formats (JPEG, WebP)
3. **Custom Dimensions**: Allow users to specify screenshot dimensions
4. **Full Page Screenshots**: Option to capture entire page
5. **Batch Processing**: Process multiple URLs at once
6. **Cloud Storage**: Move screenshots to cloud storage (AWS S3, etc.)
