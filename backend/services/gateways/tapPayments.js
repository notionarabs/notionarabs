const axios = require('axios');

class TapPaymentsGateway {
  constructor() {
    this.apiKey = process.env.TAP_PAYMENTS_API_KEY;
    this.baseURL = process.env.TAP_PAYMENTS_BASE_URL || 'https://api.tap.company/v2';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Create payment intent
  async createPaymentIntent(paymentData) {
    try {
      const { amount, currency, customer, metadata, billingAddress } = paymentData;

      const payload = {
        amount: amount,
        currency: currency,
        customer: {
          first_name: customer.name.split(' ')[0],
          last_name: customer.name.split(' ').slice(1).join(' '),
          email: customer.email,
          phone: {
            country_code: this.getCountryCode(billingAddress.country),
            number: customer.phone || '000000000'
          }
        },
        merchant: {
          id: process.env.TAP_PAYMENTS_MERCHANT_ID
        },
        source: {
          id: 'src_all'
        },
        redirect: {
          url: `${process.env.FRONTEND_URL}/payment/callback?gateway=tap_payments`
        },
        post: {
          url: `${process.env.BACKEND_URL}/api/payments/webhook/tap_payments`
        },
        metadata: metadata,
        description: `Payment for ${metadata.type === 'template_purchase' ? 'Template' : 'Subscription'}`
      };

      const response = await axios.post(`${this.baseURL}/charges`, payload, {
        headers: this.headers
      });

      if (response.data.status === 'INITIATED') {
        return {
          success: true,
          transactionId: response.data.id,
          redirectUrl: response.data.redirect.url,
          paymentUrl: response.data.redirect.url
        };
      } else {
        throw new Error('Failed to create payment intent');
      }

    } catch (error) {
      console.error('Tap Payments create payment error:', error.response?.data || error.message);
      throw new Error('فشل في إنشاء طلب الدفع');
    }
  }

  // Verify payment
  async verifyPayment(verificationData) {
    try {
      const { transactionId } = verificationData;

      const response = await axios.get(`${this.baseURL}/charges/${transactionId}`, {
        headers: this.headers
      });

      const charge = response.data;

      if (charge.status === 'CAPTURED') {
        return {
          success: true,
          transactionId: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          gatewayResponse: charge
        };
      } else if (charge.status === 'FAILED') {
        return {
          success: false,
          error: 'Payment failed'
        };
      } else {
        return {
          success: false,
          error: 'Payment not completed'
        };
      }

    } catch (error) {
      console.error('Tap Payments verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Payment verification failed'
      };
    }
  }

  // Create connected account for creators
  async createAccount(creatorId) {
    try {
      const payload = {
        type: 'individual',
        country: 'SA', // Default to Saudi Arabia, should be dynamic
        email: 'creator@example.com', // Should get from creator data
        individual: {
          first_name: 'Creator',
          last_name: 'Name'
        }
      };

      const response = await axios.post(`${this.baseURL}/accounts`, payload, {
        headers: this.headers
      });

      return {
        id: response.data.id,
        status: response.data.status
      };

    } catch (error) {
      console.error('Tap Payments create account error:', error.response?.data || error.message);
      throw new Error('Failed to create creator account');
    }
  }

  // Process payout to creator
  async processPayout(payoutData) {
    try {
      const { accountId, amount, currency } = payoutData;

      const payload = {
        amount: amount,
        currency: currency,
        destination: {
          id: accountId
        },
        description: 'Creator payout from Notion Arabs'
      };

      const response = await axios.post(`${this.baseURL}/transfers`, payload, {
        headers: this.headers
      });

      if (response.data.status === 'INITIATED' || response.data.status === 'PENDING') {
        return {
          success: true,
          payoutId: response.data.id,
          status: response.data.status
        };
      } else {
        throw new Error('Payout failed');
      }

    } catch (error) {
      console.error('Tap Payments payout error:', error.response?.data || error.message);
      throw new Error('Payout processing failed');
    }
  }

  // Get country code for phone number
  getCountryCode(country) {
    const countryCodes = {
      'AE': '+971',
      'SA': '+966',
      'KW': '+965',
      'BH': '+973',
      'QA': '+974',
      'OM': '+968'
    };
    return countryCodes[country] || '+966';
  }

  // Handle webhook
  async handleWebhook(webhookData) {
    try {
      const { id, status } = webhookData;

      if (status === 'CAPTURED') {
        return {
          success: true,
          transactionId: id,
          status: 'completed'
        };
      } else if (status === 'FAILED') {
        return {
          success: false,
          transactionId: id,
          status: 'failed'
        };
      }

      return {
        success: false,
        error: 'Unknown webhook status'
      };

    } catch (error) {
      console.error('Tap Payments webhook error:', error);
      throw error;
    }
  }
}

module.exports = new TapPaymentsGateway();
