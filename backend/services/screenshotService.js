const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ScreenshotService {
  constructor() {
    this.screenshotsDir = path.join(__dirname, '..', 'uploads', 'screenshots');
    this.ensureScreenshotsDir();
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

      // Return the full URL for the screenshot
      let baseUrl;
      if (req && req.get('host')) {
        // Prefer X-Forwarded-Proto/Host when behind a proxy
        const forwardedProto = req.get('x-forwarded-proto');
        const forwardedHost = req.get('x-forwarded-host');
        const host = forwardedHost || req.get('host');
        // If trust proxy is enabled, req.secure reflects forwarded proto
        const protocol = forwardedProto || (req.secure ? 'https' : 'http');
        baseUrl = `${protocol}://${host}`;
      } else {
        // Fallback to environment-based URL
        baseUrl = process.env.BACKEND_URL ||
          (process.env.NODE_ENV === 'production'
            ? 'https://notion-arabs.onrender.com'
            : 'http://localhost:5000');
      }
      const timestamp = Date.now();
      const screenshotUrl = `${baseUrl}/uploads/screenshots/${filename}?t=${timestamp}`;

      console.log(`🔧 Screenshot Service Debug:`);
      console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
      console.log(`   Base URL: ${baseUrl}`);
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