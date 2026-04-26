const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fallbackScreenshotService = require('./fallbackScreenshotService');

class ScreenshotService {
  constructor() {
    this.screenshotsDir = path.join(__dirname, '..', 'uploads', 'screenshots');
    this.ensureScreenshotsDir();
    this.setupCloudinary();
  }

  setupCloudinary() {
    // Configure Cloudinary if credentials are available
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
    }
  }

  ensureScreenshotsDir() {
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  generateFilename(url) {
    const urlHash = require('crypto')
      .createHash('md5')
      .update(url)
      .digest('hex')
      .substring(0, 16);
    const timestamp = Date.now();
    return `screenshot_${urlHash}_${timestamp}.png`;
  }

  async uploadToCloudinary(filepath, filename) {
    try {
      const publicId = filename.replace('.png', '');
      const result = await cloudinary.uploader.upload(filepath, {
        public_id: publicId,
        folder: 'notion-arabs/screenshots',
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
          { format: 'auto' }
        ]
      });


      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getScreenshotUrl(filename, req = null) {
    // Try Cloudinary first if configured
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/notion-arabs/screenshots/${filename.replace('.png', '')}.png`;

      // Test if the image exists on Cloudinary
      try {
        const response = await fetch(cloudinaryUrl, { method: 'HEAD' });
        if (response.ok) {
          return cloudinaryUrl;
        }
      } catch (error) {
        // Fall back to local storage
      }
    }

    // Fallback to local storage
    let baseUrl;
    if (req && req.get('host')) {
      const forwardedProto = req.get('x-forwarded-proto');
      const forwardedHost = req.get('x-forwarded-host');
      const host = forwardedHost || req.get('host');
      const protocol = forwardedProto || (req.secure ? 'https' : 'http');
      baseUrl = `${protocol}://${host}`;
    } else {
      baseUrl = process.env.BACKEND_URL ||
        (process.env.NODE_ENV === 'production'
          ? 'https://notion-arabs.onrender.com'
          : 'http://localhost:5000');
    }

    const timestamp = Date.now();
    return `${baseUrl}/uploads/screenshots/${filename}?t=${timestamp}`;
  }

  async takeScreenshot(url, req = null) {
    try {
      console.log('Using ScreenshotOne (via fallback service) to capture:', url);
      
      const result = await fallbackScreenshotService.takeScreenshot(url);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to capture screenshot with ScreenshotOne');
      }

      // If we have a data URL (base64) from ScreenshotOne, we might want to upload it to Cloudinary
      // or save it locally if Cloudinary is not available.
      
      let screenshotUrl = result.screenshotUrl;
      const filename = this.generateFilename(url);
      const filepath = path.join(this.screenshotsDir, filename);

      // Save the base64 to a local file first so we can use existing upload logic
      if (screenshotUrl.startsWith('data:image')) {
        const base64Data = screenshotUrl.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(filepath, base64Data, 'base64');
      }

      // Try to upload to Cloudinary if configured
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const uploadResult = await this.uploadToCloudinary(filepath, filename);
        if (uploadResult.success) {
          screenshotUrl = uploadResult.url;
          
          // Clean up local file after successful upload
          try {
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        } else {
          console.warn('Cloudinary upload failed, using local/data URL');
          screenshotUrl = await this.getScreenshotUrl(filename, req);
        }
      } else {
        // No Cloudinary, use local storage URL
        screenshotUrl = await this.getScreenshotUrl(filename, req);
      }

      return {
        success: true,
        screenshotUrl,
        filename
      };

    } catch (error) {
      console.error('Screenshot capture error:', error.message);
      
      return {
        success: false,
        error: error.message,
        userMessage: 'فشل في التقاط صورة المعاينة تلقائياً. يمكنك إضافة صورة يدوياً.'
      };
    }
  }
}

module.exports = new ScreenshotService();