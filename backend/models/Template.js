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
  // All templates are now free - price field removed
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
  // Sales field removed - all templates are free
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
  // Badge system
  badges: [{
    type: {
      type: String,
      enum: ['special'],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#3b82f6' // blue
    },
    icon: {
      type: String,
      default: '⭐'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
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

// Index for better query performance
templateSchema.index({ status: 1, createdAt: -1 });
templateSchema.index({ creator: 1, status: 1 });
templateSchema.index({ creator: 1, title: 1 }); // For duplicate title checking
templateSchema.index({ creator: 1, notionLink: 1 });
// Slug index is already defined in the schema field definition
templateSchema.index({ category: 1, status: 1 });
templateSchema.index({ categories: 1, status: 1 });
templateSchema.index({ tags: 1 });


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
templateSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to increment downloads
templateSchema.methods.incrementDownloads = function () {
  this.downloads += 1;
  return this.save();
};

// Sales method removed - all templates are free

// Method to update rating
templateSchema.methods.updateRating = function (newRating) {
  const totalRating = (this.rating * this.reviewsCount) + newRating;
  this.reviewsCount += 1;
  this.rating = totalRating / this.reviewsCount;
  return this.save();
};

module.exports = mongoose.model('Template', templateSchema);
