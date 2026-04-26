const axios = require('axios');
const crypto = require('crypto');

class FallbackScreenshotService {
  constructor() {
    this.apiKey = process.env.SCREENSHOT_API_KEY;
    this.apiSecret = process.env.SCREENSHOT_SECRET_KEY;
    this.apiUrl = process.env.SCREENSHOT_API_URL || 'https://api.screenshotone.com/take';
  }

  async takeScreenshot(url) {
    try {
      // If no API key is provided, return a placeholder service
      if (!this.apiKey) {
        return {
          success: false,
          error: 'No screenshot API configured',
          userMessage: 'خدمة لقطة الشاشة غير متاحة حالياً. يرجى إضافة صورة يدوياً.'
        };
      }

      const params = {
        access_key: this.apiKey,
        url: url,
        viewport_width: 1200,
        viewport_height: 800,
        device_scale_factor: 1,
        format: 'png',
        full_page: false,
        delay: 5,
        cache: true,
        block_ads: true,
        block_cookie_banners: true,
        block_trackers: true,
        dark_mode: true
      };

      // Prepare parameters and sort them for consistency
      const sortedKeys = Object.keys(params).sort();
      const searchParams = new URLSearchParams();
      sortedKeys.forEach(key => {
        searchParams.append(key, params[key]);
      });

      // Add signature if secret key is available
      if (this.apiSecret) {
        const queryString = searchParams.toString();
        const signature = crypto
          .createHmac('sha256', this.apiSecret)
          .update(queryString)
          .digest('hex');
        searchParams.append('signature', signature);
      }

      const finalUrl = `${this.apiUrl}?${searchParams.toString()}`;
      console.log('Final screenshot request URL (obfuscated):', finalUrl.replace(this.apiKey, '***').split('signature=')[0] + 'signature=***');

      const response = await axios.get(finalUrl, {
        responseType: 'arraybuffer',
        timeout: 45000 // Increased timeout for better reliability
      });

      // Convert buffer to base64
      const base64 = Buffer.from(response.data).toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      return {
        success: true,
        screenshotUrl: dataUrl,
        filename: `fallback_${Date.now()}.png`
      };

    } catch (error) {
      if (error.response) {
        const errorData = Buffer.isBuffer(error.response.data) 
          ? error.response.data.toString() 
          : JSON.stringify(error.response.data);
        console.error('ScreenshotOne API Error Response:', errorData);
      }
      console.error('Fallback screenshot service error:', error.message);
      
      return {
        success: false,
        error: error.message,
        userMessage: 'فشل في إنشاء لقطة الشاشة. يرجى إضافة صورة يدوياً.'
      };
    }
  }
}

module.exports = new FallbackScreenshotService();
