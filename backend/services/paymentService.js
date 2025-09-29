const Payment = require('../models/Payment');
const Revenue = require('../models/Revenue');
const User = require('../models/User');
const Template = require('../models/Template');

class PaymentService {
  constructor() {
    this.gateways = {
      tap_payments: require('./gateways/tapPayments'),
      paypal: require('./gateways/paypal')
    };
  }

  // Get the best payment gateway for a country
  getPaymentGateway(country) {
    const countryGatewayMap = {
      // GCC Countries - Tap Payments
      'AE': 'tap_payments', // UAE
      'SA': 'tap_payments', // Saudi Arabia
      'KW': 'tap_payments', // Kuwait
      'BH': 'tap_payments', // Bahrain
      'QA': 'tap_payments', // Qatar
      'OM': 'tap_payments', // Oman

      // Other countries default to PayPal
      'EG': 'paypal', // Egypt
      'JO': 'paypal', // Jordan

      // Other Arab countries - PayPal
      'LB': 'paypal', // Lebanon
      'MA': 'paypal', // Morocco
      'TN': 'paypal', // Tunisia
      'DZ': 'paypal', // Algeria
      'LY': 'paypal', // Libya
      'SY': 'paypal', // Syria
      'IQ': 'paypal', // Iraq
      'PS': 'paypal'  // Palestine
    };

    return countryGatewayMap[country] || 'paypal';
  }

  // Get currency for country
  getCurrencyForCountry(country) {
    const currencyMap = {
      'AE': 'AED', // UAE Dirham
      'SA': 'SAR', // Saudi Riyal
      'KW': 'KWD', // Kuwaiti Dinar
      'BH': 'BHD', // Bahraini Dinar
      'QA': 'QAR', // Qatari Riyal
      'OM': 'OMR', // Omani Rial
      'EG': 'EGP', // Egyptian Pound
      'JO': 'JOD', // Jordanian Dinar
      'LB': 'LBP', // Lebanese Pound
      'MA': 'MAD', // Moroccan Dirham
      'TN': 'TND', // Tunisian Dinar
      'DZ': 'DZD', // Algerian Dinar
      'LY': 'LYD', // Libyan Dinar
      'SY': 'SYP', // Syrian Pound
      'IQ': 'IQD', // Iraqi Dinar
      'PS': 'USD'  // Palestine (USD)
    };

    return currencyMap[country] || 'USD';
  }

  // Create payment intent
  async createPaymentIntent(paymentData) {
    try {
      const { buyerId, templateId, subscription, country, billingAddress } = paymentData;

      // Get buyer information
      const buyer = await User.findById(buyerId);
      if (!buyer) {
        throw new Error('المشتري غير موجود');
      }

      // Determine payment type and amount
      let amount, currency, type, template, creator;

      if (templateId) {
        // Template purchase
        template = await Template.findById(templateId);
        if (!template) {
          throw new Error('القالب غير موجود');
        }

        if (template.status !== 'approved') {
          throw new Error('القالب غير متاح للشراء');
        }

        amount = template.price;
        type = 'template_purchase';
        creator = template.creator;
      } else if (subscription) {
        // Subscription payment
        const subscriptionPrices = {
          'creator': 29,
          'professional': 49
        };

        amount = subscriptionPrices[subscription];
        type = 'subscription';
        creator = null;
      } else {
        throw new Error('نوع الدفع غير صحيح');
      }

      // Get currency and gateway
      currency = this.getCurrencyForCountry(country);
      const gateway = this.getPaymentGateway(country);

      // Create payment record
      const payment = new Payment({
        amount,
        currency,
        type,
        buyer: buyerId,
        template: templateId,
        subscription,
        creator,
        gateway,
        billingAddress: {
          country,
          ...billingAddress
        }
      });

      // Calculate revenue sharing
      payment.calculateRevenueSharing();
      await payment.save();

      // Get gateway instance
      const gatewayInstance = this.gateways[gateway];
      if (!gatewayInstance) {
        throw new Error(`بوابة الدفع ${gateway} غير متاحة`);
      }

      // Create payment intent with gateway
      const gatewayResponse = await gatewayInstance.createPaymentIntent({
        amount,
        currency,
        customer: {
          email: buyer.email,
          name: buyer.name,
          phone: buyer.phone
        },
        metadata: {
          paymentId: payment._id.toString(),
          type,
          templateId: templateId?.toString(),
          subscription
        },
        billingAddress: payment.billingAddress
      });

      // Update payment with gateway response
      payment.gatewayTransactionId = gatewayResponse.transactionId;
      payment.gatewayResponse = gatewayResponse;
      await payment.save();

      return {
        success: true,
        paymentId: payment._id,
        gateway: gateway,
        gatewayResponse: gatewayResponse,
        amount: payment.formattedAmount
      };

    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  }

  // Confirm payment
  async confirmPayment(paymentId, gatewayData) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('الدفع غير موجود');
      }

      // Get gateway instance
      const gatewayInstance = this.gateways[payment.gateway];
      if (!gatewayInstance) {
        throw new Error(`بوابة الدفع ${payment.gateway} غير متاحة`);
      }

      // Verify payment with gateway
      const verificationResult = await gatewayInstance.verifyPayment({
        transactionId: payment.gatewayTransactionId,
        ...gatewayData
      });

      if (verificationResult.success) {
        // Mark payment as completed
        await payment.markAsCompleted(verificationResult);

        // Process revenue sharing
        await this.processRevenueSharing(payment);

        return {
          success: true,
          payment: payment,
          message: 'تم تأكيد الدفع بنجاح'
        };
      } else {
        // Mark payment as failed
        await payment.markAsFailed(verificationResult.error);

        return {
          success: false,
          error: verificationResult.error
        };
      }

    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }
  }

  // Process revenue sharing
  async processRevenueSharing(payment) {
    try {
      if (payment.type === 'template_purchase' && payment.creator) {
        // Add earnings to creator
        let revenue = await Revenue.findOne({ creator: payment.creator });

        if (!revenue) {
          // Create revenue record for creator
          revenue = new Revenue({
            creator: payment.creator,
            gateway: payment.gateway,
            gatewayAccountId: await this.getCreatorGatewayAccount(payment.creator, payment.gateway)
          });
        }

        // Add creator earnings
        await revenue.addEarnings(payment.revenueSharing.creatorAmount);

        // Update creator's total earnings in User model
        await User.findByIdAndUpdate(payment.creator, {
          $inc: {
            totalEarnings: payment.revenueSharing.creatorAmount,
            totalSales: 1
          }
        });

        // Update template sales count
        await Template.findByIdAndUpdate(payment.template, {
          $inc: { sales: 1 }
        });
      }

      // Update platform revenue (you can track this separately)
      console.log(`Platform revenue: ${payment.revenueSharing.platformAmount} ${payment.currency}`);

      return true;

    } catch (error) {
      console.error('Revenue sharing error:', error);
      throw error;
    }
  }

  // Get creator's gateway account
  async getCreatorGatewayAccount(creatorId, gateway) {
    try {
      const revenue = await Revenue.findOne({ creator: creatorId, gateway });

      if (revenue && revenue.gatewayAccountId) {
        return revenue.gatewayAccountId;
      }

      // If no account exists, create one
      const gatewayInstance = this.gateways[gateway];
      const account = await gatewayInstance.createAccount(creatorId);

      if (revenue) {
        revenue.gatewayAccountId = account.id;
        await revenue.save();
      }

      return account.id;

    } catch (error) {
      console.error('Gateway account creation error:', error);
      throw error;
    }
  }

  // Process payout to creator
  async processPayout(creatorId, amount) {
    try {
      const revenue = await Revenue.findOne({ creator: creatorId });
      if (!revenue) {
        throw new Error('سجل الإيرادات غير موجود');
      }

      if (!revenue.canPayout()) {
        throw new Error('لا يمكن معالجة الدفع في الوقت الحالي');
      }

      if (amount > revenue.pendingPayouts) {
        throw new Error('المبلغ المطلوب يتجاوز المبلغ المعلق');
      }

      // Get gateway instance
      const gatewayInstance = this.gateways[revenue.gateway];
      if (!gatewayInstance) {
        throw new Error(`بوابة الدفع ${revenue.gateway} غير متاحة`);
      }

      // Process payout
      const payoutResult = await gatewayInstance.processPayout({
        accountId: revenue.gatewayAccountId,
        amount,
        currency: revenue.currency || 'EGP'
      });

      if (payoutResult.success) {
        // Update revenue record
        await revenue.processPayout(amount);

        return {
          success: true,
          payoutId: payoutResult.payoutId,
          message: 'تم معالجة الدفع بنجاح'
        };
      } else {
        throw new Error(payoutResult.error);
      }

    } catch (error) {
      console.error('Payout processing error:', error);
      throw error;
    }
  }

  // Get payment history for user
  async getPaymentHistory(userId, page = 1, limit = 10) {
    try {
      const payments = await Payment.find({ buyer: userId })
        .populate('template', 'title price')
        .populate('creator', 'name username')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Payment.countDocuments({ buyer: userId });

      return {
        payments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };

    } catch (error) {
      console.error('Payment history error:', error);
      throw error;
    }
  }

  // Get creator earnings
  async getCreatorEarnings(creatorId) {
    try {
      const revenue = await Revenue.findOne({ creator: creatorId });
      if (!revenue) {
        return {
          totalEarnings: 0,
          pendingPayouts: 0,
          totalPayouts: 0,
          canPayout: false
        };
      }

      return {
        totalEarnings: revenue.totalEarnings,
        pendingPayouts: revenue.pendingPayouts,
        totalPayouts: revenue.totalPayouts,
        canPayout: revenue.canPayout(),
        nextPayoutDate: revenue.statistics.nextPayoutDate
      };

    } catch (error) {
      console.error('Creator earnings error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
