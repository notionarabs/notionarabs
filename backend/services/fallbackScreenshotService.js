const axios = require('axios');

class FallbackScreenshotService {
  constructor() {
    this.apiKey = process.env.SCREENSHOT_API_KEY;
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

      const response = await axios.get(this.apiUrl, {
        params: {
          access_key: this.apiKey,
          url: url,
          viewport_width: 1200,
          viewport_height: 800,
          device_scale_factor: 1,
          format: 'png',
          full_page: false,
          delay: 3,
          cache: 3600
        },
        responseType: 'arraybuffer',
        timeout: 30000
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
