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
      const result = await cloudinary.uploader.upload(filepath, {
        public_id: `notion-arabs/screenshots/${filename.replace('.png', '')}`,
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
      console.error('Cloudinary upload failed:', error.message);
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
    let browser;
    try {
      // Windows-optimized launch options
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
          '--disable-renderer-backgrounding',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-pings',
          '--disable-background-networking',
          '--disable-component-extensions-with-background-pages',
          '--disable-ipc-flooding-protection',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI,BlinkGenPropertyTrees',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-domain-reliability',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-features=TranslateUI,BlinkGenPropertyTrees',
          '--force-color-profile=srgb',
          '--metrics-recording-only',
          '--safebrowsing-disable-auto-update',
          '--enable-automation',
          '--password-store=basic',
          '--use-mock-keychain'
        ],
        // Windows-specific options
        timeout: 45000,
        protocolTimeout: 45000,
        slowMo: 100 // Small delay for stability
      };

      // Try to use system Chrome if available (especially on Windows)
      const chromePaths = [
        // Windows paths
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
        // Linux paths
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        // macOS paths
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      ];

      for (const chromePath of chromePaths) {
        try {
          const fs = require('fs');
          if (fs.existsSync(chromePath)) {
            launchOptions.executablePath = chromePath;
            console.log('Using Chrome at:', chromePath);
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }

      try {
        browser = await puppeteer.launch(launchOptions);
      } catch (launchError) {
        console.error('Browser launch error:', launchError.message);
        throw new Error(`Browser launch failed: ${launchError.message}`);
      }

      const page = await browser.newPage();

      // Set viewport for consistent screenshots
      await page.setViewport({ width: 1200, height: 800 });

      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      // Navigate to the URL with better options for Notion pages
      await page.goto(url, {
        waitUntil: 'networkidle2', // Wait for network to be idle
        timeout: 45000
      });

      // Wait for basic content to load
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Try to wait for Notion content, but don't fail if not found
      try {
        await page.waitForSelector('[data-block-id]', { timeout: 10000 });
        console.log('Notion content detected');
      } catch (error) {
        console.log('Notion content not detected, continuing anyway');
        // Try alternative selectors
        try {
          await page.waitForSelector('.notion-page-content', { timeout: 3000 });
        } catch (e) {
          // Continue without Notion-specific content detection
        }
      }

      // Scroll to get past any header/banner and load more content
      await page.evaluate(() => {
        window.scrollTo(0, 200);
      });

      // Wait for scroll to complete and content to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try to scroll back to top to capture the main content
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate unique filename
      const filename = this.generateFilename(url);
      const filepath = path.join(this.screenshotsDir, filename);

      // Take a simple viewport screenshot
      await page.screenshot({
        path: filepath,
        fullPage: false,
        type: 'png'
      });

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

          // Clean up local file after successful upload
          try {
            fs.unlinkSync(filepath);
          } catch (cleanupError) {
            console.warn('Failed to clean up local file:', cleanupError.message);
          }
        } else {
          screenshotUrl = await this.getScreenshotUrl(filename, req);
        }
      } else {
        // No Cloudinary configured, use local storage
        screenshotUrl = await this.getScreenshotUrl(filename, req);
      }

      return {
        success: true,
        screenshotUrl,
        filename
      };

    } catch (error) {
      console.error('Screenshot capture error:', {
        message: error.message,
        stack: error.stack,
        url: url,
        environment: process.env.NODE_ENV
      });

      // Return more specific error information
      let errorMessage = 'Failed to capture screenshot';
      let userMessage = 'فشل في التقاط صورة المعاينة تلقائياً. يمكنك إضافة صورة يدوياً لاحقاً.';

      if (error.message.includes('Browser closed unexpectedly')) {
        errorMessage = 'Browser closed unexpectedly - possible memory/resource issue';
        userMessage = 'تعذر فتح المتصفح. يرجى المحاولة مرة أخرى أو إضافة صورة يدوياً.';
      } else if (error.message.includes('Navigation timeout')) {
        errorMessage = 'Page took too long to load';
        userMessage = 'استغرق تحميل الصفحة وقتاً طويلاً. يرجى التحقق من الرابط وإضافة صورة يدوياً.';
      } else if (error.message.includes('Cannot reach the website')) {
        errorMessage = 'Cannot reach the website';
        userMessage = 'لا يمكن الوصول إلى الموقع. يرجى التحقق من الرابط وإضافة صورة يدوياً.';
      } else if (error.message.includes('Invalid URL')) {
        errorMessage = 'Invalid URL provided';
        userMessage = 'رابط غير صحيح. يرجى التحقق من الرابط وإضافة صورة يدوياً.';
      } else if (error.message.includes('ENOENT')) {
        errorMessage = 'Chrome/Chromium not found - installation issue';
        userMessage = 'مشكلة في تثبيت المتصفح. يرجى إضافة صورة يدوياً.';
      } else if (error.message.includes('Protocol error')) {
        errorMessage = 'Protocol error - browser communication issue';
        userMessage = 'مشكلة في الاتصال بالمتصفح. يرجى إضافة صورة يدوياً.';
      } else if (error.message.includes('Target closed')) {
        errorMessage = 'Browser target closed unexpectedly';
        userMessage = 'تم إغلاق المتصفح بشكل غير متوقع. يرجى إضافة صورة يدوياً.';
      }

      return {
        success: false,
        error: errorMessage,
        userMessage: userMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Error closing browser:', closeError.message);
        }
      }
    }
  }
}

module.exports = new ScreenshotService();