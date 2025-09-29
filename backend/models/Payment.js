const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment details
  amount: {
    type: Number,
    required: [true, 'مبلغ الدفع مطلوب'],
    min: [0, 'المبلغ لا يمكن أن يكون سالباً']
  },
  currency: {
    type: String,
    required: [true, 'العملة مطلوبة'],
    enum: ['USD', 'EGP', 'SAR', 'AED', 'KWD', 'BHD', 'QAR', 'OMR', 'JOD', 'MAD', 'TND', 'DZD', 'LYD', 'LBP', 'IQD', 'SYP']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },

  // Payment gateway information
  gateway: {
    type: String,
    required: [true, 'بوابة الدفع مطلوبة'],
    enum: ['tap_payments', 'paymob', 'hyperpay', 'paypal']
  },
  gatewayTransactionId: {
    type: String,
    required: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // User and template information
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: function () {
      return this.type === 'template_purchase';
    }
  },
  subscription: {
    type: String,
    enum: ['creator', 'professional'],
    required: function () {
      return this.type === 'subscription';
    }
  },

  // Payment type
  type: {
    type: String,
    enum: ['template_purchase', 'subscription', 'upgrade'],
    required: true
  },

  // Revenue sharing
  revenueSharing: {
    platformFee: {
      type: Number,
      required: true,
      min: 0
    },
    creatorAmount: {
      type: Number,
      required: function () {
        return this.type === 'template_purchase';
      },
      min: 0
    },
    platformAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },

  // Creator information (for template purchases)
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function () {
      return this.type === 'template_purchase';
    }
  },

  // Payout information
  payout: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    gatewayPayoutId: String,
    payoutDate: Date,
    failureReason: String
  },

  // Billing information
  billingAddress: {
    country: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    postalCode: String,
    address: String
  },

  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Timestamps
  paidAt: Date,
  refundedAt: Date,
  refundAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
paymentSchema.index({ buyer: 1, createdAt: -1 });
paymentSchema.index({ creator: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gateway: 1, status: 1 });
paymentSchema.index({ type: 1, status: 1 });
paymentSchema.index({ gatewayTransactionId: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function () {
  return `${this.amount} ${this.currency}`;
});

// Virtual for status in Arabic
paymentSchema.virtual('statusLabel').get(function () {
  const labels = {
    'pending': 'قيد الانتظار',
    'processing': 'قيد المعالجة',
    'completed': 'مكتمل',
    'failed': 'فشل',
    'cancelled': 'ملغي',
    'refunded': 'مسترد'
  };
  return labels[this.status] || 'غير محدد';
});

// Method to calculate revenue sharing
paymentSchema.methods.calculateRevenueSharing = function () {
  const platformFeePercentage = 0.10; // 10%
  const creatorFeePercentage = 0.90; // 90%

  this.revenueSharing.platformFee = Math.round(this.amount * platformFeePercentage * 100) / 100;
  this.revenueSharing.creatorAmount = Math.round(this.amount * creatorFeePercentage * 100) / 100;
  this.revenueSharing.platformAmount = this.revenueSharing.platformFee;

  return this;
};

// Method to mark as completed
paymentSchema.methods.markAsCompleted = function (gatewayResponse = {}) {
  this.status = 'completed';
  this.paidAt = new Date();
  this.gatewayResponse = gatewayResponse;
  return this.save();
};

// Method to mark as failed
paymentSchema.methods.markAsFailed = function (failureReason) {
  this.status = 'failed';
  this.payout.failureReason = failureReason;
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = function (refundAmount) {
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.refundAmount = refundAmount;
  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);
