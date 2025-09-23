const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

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
      console.log('✅ Cloudinary configured successfully');
    } else {
      console.log('⚠️ Cloudinary credentials not found, using local storage fallback');
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
      console.log('Uploading to Cloudinary:', filename);

      const result = await cloudinary.uploader.upload(filepath, {
        public_id: `notion-arabs/screenshots/${filename.replace('.png', '')}`,
        folder: 'notion-arabs/screenshots',
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
          { format: 'auto' }
        ]
      });

      console.log('✅ Cloudinary upload successful:', result.secure_url);
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error.message);
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
          console.log('✅ Using Cloudinary URL:', cloudinaryUrl);
          return cloudinaryUrl;
        }
      } catch (error) {
        console.log('⚠️ Cloudinary image not found, falling back to local');
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
    console.log(`Starting screenshot capture for URL: ${url}`);

    let browser;
    try {
      // Launch browser with Windows-compatible options
      const launchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      };

      console.log('Launching browser with options:', launchOptions);
      browser = await puppeteer.launch(launchOptions);
      console.log('Browser launched successfully');

      const page = await browser.newPage();

      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      console.log('User agent set, navigating to URL...');

      // Navigate to the URL
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      console.log('Page loaded successfully');

      // Wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Waiting for dynamic content...');

      // Wait for Notion content
      await page.waitForSelector('[data-block-id]', { timeout: 10000 });
      console.log('Notion content detected');

      // Simple scroll to get past any header/banner
      await page.evaluate(() => {
        window.scrollTo(0, 100); // Simple scroll down 100px
      });

      // Wait for scroll to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate unique filename
      const filename = this.generateFilename(url);
      const filepath = path.join(this.screenshotsDir, filename);
      console.log(`Taking screenshot, saving to: ${filepath}`);

      // Take a simple viewport screenshot
      await page.screenshot({
        path: filepath,
        fullPage: false,
        type: 'png'
      });
      console.log('Screenshot captured successfully');

      // Verify file was created
      if (!fs.existsSync(filepath)) {
        throw new Error('Screenshot file was not created');
      }

      // Try to upload to Cloudinary first
      let screenshotUrl;
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const uploadResult = await this.uploadToCloudinary(filepath, filename);
        if (uploadResult.success) {
          screenshotUrl = uploadResult.url;
          console.log('✅ Using Cloudinary URL:', screenshotUrl);

          // Clean up local file after successful upload
          try {
            fs.unlinkSync(filepath);
            console.log('🗑️ Local file cleaned up');
          } catch (cleanupError) {
            console.warn('⚠️ Failed to clean up local file:', cleanupError.message);
          }
        } else {
          console.log('⚠️ Cloudinary upload failed, using local storage:', uploadResult.error);
          screenshotUrl = await this.getScreenshotUrl(filename, req);
        }
      } else {
        // No Cloudinary configured, use local storage
        screenshotUrl = await this.getScreenshotUrl(filename, req);
      }

      console.log(`🔧 Screenshot Service Debug:`);
      console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
      console.log(`   Cloudinary configured: ${!!process.env.CLOUDINARY_CLOUD_NAME}`);
      console.log(`   Screenshot URL: ${screenshotUrl}`);

      return {
        success: true,
        screenshotUrl,
        filename
      };

    } catch (error) {
      console.error('Screenshot capture error:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (browser) {
        await browser.close();
        console.log('Browser closed');
      }
    }
  }
}

module.exports = new ScreenshotService();