const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'المستخدم مطلوب']
  },
  items: [{
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    downloaded: {
      type: Boolean,
      default: false
    },
    previewImage: {
      type: String,
      default: ''
    },
    notionLink: {
      type: String,
      default: ''
    }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  source: {
    type: String,
    enum: ['download', 'purchase', 'gift'],
    default: 'download'
  },
  downloaded: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    default: 'free'
  },
  paymentId: {
    type: String,
    default: null
  },
  paymobOrderId: {
    type: String,
    default: null,
    index: true
  },

  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'الملاحظات لا يجب أن تتجاوز 500 حرف']
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'items.templateId': 1 });

module.exports = mongoose.model('Order', orderSchema);
