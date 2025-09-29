const axios = require('axios');

class PayPalGateway {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.baseURL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get access token
  async getAccessToken() {
    try {
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post(`${this.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));

      return this.accessToken;

    } catch (error) {
      console.error('PayPal access token error:', error.response?.data || error.message);
      throw new Error('Failed to get PayPal access token');
    }
  }

  // Create payment intent
  async createPaymentIntent(paymentData) {
    try {
      const { amount, currency, customer, metadata, billingAddress } = paymentData;

      const accessToken = await this.getAccessToken();

      const payload = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          },
          description: `Payment for ${metadata.type === 'template_purchase' ? 'Template' : 'Subscription'}`,
          custom_id: metadata.paymentId
        }],
        application_context: {
          brand_name: 'Notion Arabs',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL}/payment/callback?gateway=paypal`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
        }
      };

      const response = await axios.post(`${this.baseURL}/v2/checkout/orders`, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'CREATED') {
        const approvalUrl = response.data.links.find(link => link.rel === 'approve');

        return {
          success: true,
          transactionId: response.data.id,
          redirectUrl: approvalUrl.href,
          paymentUrl: approvalUrl.href
        };
      } else {
        throw new Error('Failed to create PayPal order');
      }

    } catch (error) {
      console.error('PayPal create payment error:', error.response?.data || error.message);
      throw new Error('فشل في إنشاء طلب الدفع');
    }
  }

  // Verify payment
  async verifyPayment(verificationData) {
    try {
      const { transactionId, payerId } = verificationData;

      const accessToken = await this.getAccessToken();

      // Capture the payment
      const captureResponse = await axios.post(
        `${this.baseURL}/v2/checkout/orders/${transactionId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (captureResponse.data.status === 'COMPLETED') {
        const purchaseUnit = captureResponse.data.purchase_units[0];
        const amount = parseFloat(purchaseUnit.payments.captures[0].amount.value);
        const currency = purchaseUnit.payments.captures[0].amount.currency_code;

        return {
          success: true,
          transactionId: captureResponse.data.id,
          amount: amount,
          currency: currency,
          gatewayResponse: captureResponse.data
        };
      } else {
        return {
          success: false,
          error: 'Payment capture failed'
        };
      }

    } catch (error) {
      console.error('PayPal verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Payment verification failed'
      };
    }
  }

  // Create connected account for creators
  async createAccount(creatorId) {
    try {
      // PayPal doesn't have direct account creation like Stripe Connect
      // We'll use their Mass Payments API instead
      return {
        id: `creator_${creatorId}`,
        status: 'active'
      };

    } catch (error) {
      console.error('PayPal create account error:', error);
      throw new Error('Failed to create creator account');
    }
  }

  // Process payout to creator (Mass Payments)
  async processPayout(payoutData) {
    try {
      const { accountId, amount, currency, creatorEmail } = payoutData;

      const accessToken = await this.getAccessToken();

      const payload = {
        sender_batch_header: {
          sender_batch_id: `payout_${Date.now()}`,
          email_subject: 'Payment from Notion Arabs'
        },
        items: [{
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency: currency
          },
          receiver: creatorEmail,
          note: 'Template sale payment',
          sender_item_id: accountId
        }]
      };

      const response = await axios.post(`${this.baseURL}/v1/payments/payouts`, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.batch_header.batch_status === 'PENDING') {
        return {
          success: true,
          payoutId: response.data.batch_header.payout_batch_id,
          status: response.data.batch_header.batch_status
        };
      } else {
        throw new Error('Payout failed');
      }

    } catch (error) {
      console.error('PayPal payout error:', error.response?.data || error.message);
      throw new Error('Payout processing failed');
    }
  }

  // Handle webhook
  async handleWebhook(webhookData) {
    try {
      const { event_type, resource } = webhookData;

      if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        return {
          success: true,
          transactionId: resource.id,
          status: 'completed'
        };
      } else if (event_type === 'PAYMENT.CAPTURE.DENIED') {
        return {
          success: false,
          transactionId: resource.id,
          status: 'failed'
        };
      }

      return {
        success: false,
        error: 'Unknown webhook event'
      };

    } catch (error) {
      console.error('PayPal webhook error:', error);
      throw error;
    }
  }
}

module.exports = new PayPalGateway();
