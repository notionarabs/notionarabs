const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان القالب مطلوب'],
    trim: true,
    maxlength: [100, 'عنوان القالب لا يجب أن يتجاوز 100 حرف']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true,
    lowercase: true,
    required: false // Make optional for existing templates
  },
  description: {
    type: String,
    required: [true, 'وصف القالب مطلوب'],
    trim: true,
    maxlength: [1000, 'وصف القالب لا يجب أن يتجاوز 1000 حرف']
  },
  category: {
    type: String,
    required: [true, 'فئة القالب مطلوبة'],
    enum: [
      'الإنتاجية', 'الدراسة', 'الأعمال', 'الحياة الشخصية', 'الإبداع', 'التقنية', 'الصحة', 'المالية', 'التنظيم', 'التخطيط', 'ديني',
      'التسويق', 'التصميم', 'التطوير', 'التعليم', 'السفر', 'الطعام', 'الرياضة', 'الترفيه', 'الموضة', 'الجمال', 'المنزل',
      'الحديقة', 'الحيوانات الأليفة', 'السيارات', 'التكنولوجيا', 'البرمجة', 'قواعد البيانات', 'الأمان السيبراني', 'الذكاء الاصطناعي',
      'البلوك تشين', 'التجارة الإلكترونية', 'المبيعات', 'خدمة العملاء', 'الموارد البشرية', 'المحاسبة', 'الاستثمار', 'العقارات',
      'التأمين', 'القانون', 'الطب', 'التمريض', 'العلاج الطبيعي', 'التغذية', 'الطبخ', 'الحلويات', 'المشروبات', 'المطاعم',
      'الفنون', 'الموسيقى', 'الرسم', 'النحت', 'التصوير', 'الفيديو', 'الكتابة', 'الترجمة', 'اللغات', 'التاريخ', 'الجغرافيا',
      'العلوم', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'علم النفس', 'علم الاجتماع', 'الفلسفة', 'الأدب', 'الشعر',
      'المسرح', 'السينما', 'الألعاب', 'الرياضة الإلكترونية', 'السياحة', 'الفندقة', 'النقل', 'الطيران', 'البحرية', 'الزراعة',
      'البيئة', 'الطاقة', 'البناء', 'الهندسة', 'العمارة', 'الديكور', 'الأثاث', 'الأدوات', 'الأجهزة', 'البرامج', 'التطبيقات',
      'المواقع', 'التطوير الويب', 'تطوير التطبيقات', 'التعليم الإلكتروني', 'الاجتماعات', 'التواصل', 'الشبكات الاجتماعية', 'المحتوى',
      'الإعلان', 'العلاقات العامة', 'العلامة التجارية', 'الاستراتيجية', 'القيادة', 'الإدارة', 'المشاريع', 'العمليات', 'الجودة',
      'الابتكار', 'البحث والتطوير', 'التحليل', 'الإحصاء', 'البيانات', 'التقارير', 'العروض التقديمية', 'التدريب', 'التطوير المهني',
      'الاستشارات', 'الخدمات', 'المنتجات', 'التصنيع', 'التوزيع', 'المخازن', 'اللوجستيات'
    ]
  },
  categories: [{
    type: String,
    trim: true,
    enum: [
      'الإنتاجية', 'الدراسة', 'الأعمال', 'الحياة الشخصية', 'الإبداع', 'التقنية', 'الصحة', 'المالية', 'التنظيم', 'التخطيط', 'ديني',
      'التسويق', 'التصميم', 'التطوير', 'التعليم', 'السفر', 'الطعام', 'الرياضة', 'الترفيه', 'الموضة', 'الجمال', 'المنزل',
      'الحديقة', 'الحيوانات الأليفة', 'السيارات', 'التكنولوجيا', 'البرمجة', 'قواعد البيانات', 'الأمان السيبراني', 'الذكاء الاصطناعي',
      'البلوك تشين', 'التجارة الإلكترونية', 'المبيعات', 'خدمة العملاء', 'الموارد البشرية', 'المحاسبة', 'الاستثمار', 'العقارات',
      'التأمين', 'القانون', 'الطب', 'التمريض', 'العلاج الطبيعي', 'التغذية', 'الطبخ', 'الحلويات', 'المشروبات', 'المطاعم',
      'الفنون', 'الموسيقى', 'الرسم', 'النحت', 'التصوير', 'الفيديو', 'الكتابة', 'الترجمة', 'اللغات', 'التاريخ', 'الجغرافيا',
      'العلوم', 'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'علم النفس', 'علم الاجتماع', 'الفلسفة', 'الأدب', 'الشعر',
      'المسرح', 'السينما', 'الألعاب', 'الرياضة الإلكترونية', 'السياحة', 'الفندقة', 'النقل', 'الطيران', 'البحرية', 'الزراعة',
      'البيئة', 'الطاقة', 'البناء', 'الهندسة', 'العمارة', 'الديكور', 'الأثاث', 'الأدوات', 'الأجهزة', 'البرامج', 'التطبيقات',
      'المواقع', 'التطوير الويب', 'تطوير التطبيقات', 'التعليم الإلكتروني', 'الاجتماعات', 'التواصل', 'الشبكات الاجتماعية', 'المحتوى',
      'الإعلان', 'العلاقات العامة', 'العلامة التجارية', 'الاستراتيجية', 'القيادة', 'الإدارة', 'المشاريع', 'العمليات', 'الجودة',
      'الابتكار', 'البحث والتطوير', 'التحليل', 'الإحصاء', 'البيانات', 'التقارير', 'العروض التقديمية', 'التدريب', 'التطوير المهني',
      'الاستشارات', 'الخدمات', 'المنتجات', 'التصنيع', 'التوزيع', 'المخازن', 'اللوجستيات'
    ],
    maxlength: [50, 'كل فئة لا يجب أن تتجاوز 50 حرف']
  }],
  language: {
    type: String,
    enum: ['ar', 'en', 'fr', 'ar-en', 'ar-fr'],
    default: 'ar'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    min: [0, 'السعر لا يمكن أن يكون سالباً'],
    validate: {
      validator: function (value) {
        // If isPaid is true, price must be greater than 0
        if (this.isPaid && (!value || value <= 0)) {
          return false;
        }
        return true;
      },
      message: 'السعر مطلوب للقوالب المدفوعة'
    }
  },
  purchaseLink: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        // If isPaid is true, purchaseLink is required
        if (this.isPaid && (!v || v.trim() === '')) {
          return false;
        }
        // If purchaseLink is provided, it must be a valid URL
        if (v && v.trim() !== '') {
          return /^https?:\/\/.+/.test(v);
        }
        return true;
      },
      message: 'رابط الشراء مطلوب للقوالب المدفوعة ويجب أن يكون رابطاً صحيحاً'
    }
  },
  notionLink: {
    type: String,
    required: [true, 'رابط نوشن مطلوب'],
    trim: true,
    validate: {
      validator: function (v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'رابط نوشن غير صحيح'
    }
  },
  features: {
    type: String,
    trim: true,
    maxlength: [2000, 'المميزات لا يجب أن تتجاوز 2000 حرف']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'الكلمة المفتاحية لا يجب أن تتجاوز 50 حرف']
  }],
  previewImage: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'رابط الصورة غير صحيح'
    }
  },
  previewImages: [{
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'رابط الصورة غير صحيح'
    }
  }],
  explanationVideo: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'رابط الفيديو غير صحيح'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'ملاحظات الإدارة لا يجب أن تتجاوز 500 حرف']
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Template performance metrics
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  // Admin pin feature for home page
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: {
    type: Date,
    default: null
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Pre-save hook to generate slug if not provided
templateSchema.pre('save', async function (next) {
  if (!this.slug && this.title) {
    try {
      const { generateTemplateSlug } = require('../utils/slugGenerator');

      const slugExists = async (slug, excludeId = null) => {
        const query = { slug };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existingTemplate = await Template.findOne(query);
        return !!existingTemplate;
      };

      this.slug = await generateTemplateSlug(this.title, slugExists, this._id);
    } catch (error) {
      console.error('Error generating slug:', error);
      // Fallback to ID-based slug if generation fails
      this.slug = `template-${this._id}`;
    }
  }
  next();
});

// Enhanced indexes for better query performance
// Note: slug index is automatically created by unique: true property
templateSchema.index({ status: 1, createdAt: -1 });
templateSchema.index({ creator: 1, status: 1 });
templateSchema.index({ creator: 1, title: 1 }); // For duplicate title checking
templateSchema.index({ creator: 1, notionLink: 1 });
templateSchema.index({ category: 1, status: 1, createdAt: -1 }); // Compound index for category pages
templateSchema.index({ categories: 1, status: 1, createdAt: -1 }); // For multi-category queries
templateSchema.index({ tags: 1, status: 1 }); // For tag-based searches
templateSchema.index({ isPaid: 1, status: 1 }); // For filtering free/paid
templateSchema.index({ views: -1 }); // For popular templates
templateSchema.index({ downloads: -1 }); // For most downloaded
templateSchema.index({ rating: -1, reviewsCount: -1 }); // For best rated
templateSchema.index({ sales: -1 }); // For best sellers
templateSchema.index({ status: 1, isPaid: 1, category: 1 }); // Multi-field filtering
// Optimized compound indexes for common query patterns
templateSchema.index({ status: 1, rating: -1, reviewsCount: -1 }); // For fetching top-rated approved templates
templateSchema.index({ status: 1, downloads: -1 }); // For fetching popular approved templates
templateSchema.index({ status: 1, views: -1 }); // For fetching most viewed approved templates
templateSchema.index({ creator: 1, status: 1, downloads: -1 }); // For creator analytics
// Text index for search functionality with explicit language override field
// This prevents MongoDB from using the 'language' field as a text search language override
templateSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  {
    default_language: 'none',
    language_override: 'textSearchLanguage' // Use a different field name for language override
  }
);


// Virtual for status label in Arabic
templateSchema.virtual('statusLabel').get(function () {
  const labels = {
    'pending': 'قيد المراجعة',
    'approved': 'موافق عليه',
    'rejected': 'مرفوض'
  };
  return labels[this.status] || 'غير محدد';
});

// Method to approve template
templateSchema.methods.approve = function (adminId, notes = '') {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  this.adminNotes = notes;
  return this.save();
};

// Method to reject template
templateSchema.methods.reject = function (adminId, notes = '') {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.rejectedBy = adminId;
  this.adminNotes = notes;
  return this.save();
};

// Method to increment views
templateSchema.methods.incrementViews = async function () {
  // Use atomic update to avoid triggering validation
  await mongoose.model('Template').updateOne(
    { _id: this._id },
    { $inc: { views: 1 } }
  );
  this.views += 1;
  return this;
};

// Method to increment downloads
templateSchema.methods.incrementDownloads = async function () {
  // Use atomic update to avoid triggering validation
  await mongoose.model('Template').updateOne(
    { _id: this._id },
    { $inc: { downloads: 1 } }
  );
  this.downloads += 1;
  return this;
};

// Method to increment sales
templateSchema.methods.incrementSales = async function () {
  // Use atomic update to avoid triggering validation
  await mongoose.model('Template').updateOne(
    { _id: this._id },
    { $inc: { sales: 1 } }
  );
  this.sales += 1;
  return this;
};

// Method to update rating
templateSchema.methods.updateRating = async function (newRating) {
  const totalRating = (this.rating * this.reviewsCount) + newRating;
  const newReviewsCount = this.reviewsCount + 1;
  const newRatingValue = totalRating / newReviewsCount;

  // Use atomic update to avoid triggering validation
  await mongoose.model('Template').updateOne(
    { _id: this._id },
    {
      $set: {
        rating: newRatingValue,
        reviewsCount: newReviewsCount
      }
    }
  );

  this.rating = newRatingValue;
  this.reviewsCount = newReviewsCount;
  return this;
};

module.exports = mongoose.model('Template', templateSchema);
