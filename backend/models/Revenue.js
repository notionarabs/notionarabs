const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  // Creator information
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Revenue details
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingPayouts: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPayouts: {
    type: Number,
    default: 0,
    min: 0
  },

  // Platform revenue
  platformRevenue: {
    type: Number,
    default: 0,
    min: 0
  },

  // Payment gateway information
  gateway: {
    type: String,
    required: true,
    enum: ['tap_payments', 'paymob', 'hyperpay', 'paypal']
  },
  gatewayAccountId: {
    type: String,
    required: true
  },

  // Payout settings
  payoutSettings: {
    minimumPayout: {
      type: Number,
      default: 50 // Minimum amount for payout
    },
    payoutMethod: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe'],
      default: 'bank_transfer'
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      swiftCode: String,
      iban: String
    },
    paypalEmail: String,
    stripeAccountId: String
  },

  // Statistics
  statistics: {
    totalSales: {
      type: Number,
      default: 0
    },
    totalTemplates: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    lastPayoutDate: Date,
    nextPayoutDate: Date
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // KYC information
  kycStatus: {
    type: String,
    enum: ['not_started', 'pending', 'approved', 'rejected'],
    default: 'not_started'
  },
  kycDocuments: [{
    type: {
      type: String,
      enum: ['national_id', 'passport', 'bank_statement', 'utility_bill']
    },
    url: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Tax information
  taxInfo: {
    taxId: String,
    taxRate: {
      type: Number,
      default: 0
    },
    taxExempt: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
revenueSchema.index({ creator: 1 });
revenueSchema.index({ gateway: 1 });
revenueSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for formatted total earnings
revenueSchema.virtual('formattedTotalEarnings').get(function () {
  return `${this.totalEarnings.toFixed(2)} EGP`;
});

// Virtual for formatted pending payouts
revenueSchema.virtual('formattedPendingPayouts').get(function () {
  return `${this.pendingPayouts.toFixed(2)} EGP`;
});

// Method to add earnings
revenueSchema.methods.addEarnings = function (amount) {
  this.totalEarnings += amount;
  this.pendingPayouts += amount;
  this.statistics.totalSales += 1;
  this.statistics.averageOrderValue = this.totalEarnings / this.statistics.totalSales;
  return this.save();
};

// Method to process payout
revenueSchema.methods.processPayout = function (payoutAmount) {
  if (payoutAmount > this.pendingPayouts) {
    throw new Error('Payout amount exceeds pending payouts');
  }

  this.pendingPayouts -= payoutAmount;
  this.totalPayouts += payoutAmount;
  this.statistics.lastPayoutDate = new Date();

  // Set next payout date (monthly)
  const nextPayout = new Date();
  nextPayout.setMonth(nextPayout.getMonth() + 1);
  this.statistics.nextPayoutDate = nextPayout;

  return this.save();
};

// Method to update KYC status
revenueSchema.methods.updateKycStatus = function (status, documentType = null) {
  this.kycStatus = status;

  if (documentType && status === 'approved') {
    const document = this.kycDocuments.find(doc => doc.type === documentType);
    if (document) {
      document.status = 'approved';
    }
  }

  if (status === 'approved') {
    this.isVerified = true;
  }

  return this.save();
};

// Method to add KYC document
revenueSchema.methods.addKycDocument = function (type, url) {
  this.kycDocuments.push({
    type,
    url,
    status: 'pending',
    uploadedAt: new Date()
  });

  if (this.kycStatus === 'not_started') {
    this.kycStatus = 'pending';
  }

  return this.save();
};

// Method to check if payout is available
revenueSchema.methods.canPayout = function () {
  return this.pendingPayouts >= this.payoutSettings.minimumPayout &&
    this.isVerified &&
    this.isActive;
};

// Method to get payout history
revenueSchema.methods.getPayoutHistory = function () {
  return this.constructor.aggregate([
    { $match: { creator: this.creator } },
    { $unwind: '$payoutHistory' },
    { $sort: { 'payoutHistory.date': -1 } },
    { $limit: 10 }
  ]);
};

module.exports = mongoose.model('Revenue', revenueSchema);
