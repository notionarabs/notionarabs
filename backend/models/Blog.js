const mongoose = require('mongoose');
const { generateSlug } = require('../utils/slugGenerator');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان المقال مطلوب'],
    trim: true,
    maxlength: [200, 'عنوان المقال لا يجب أن يتجاوز 200 حرف']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: false
  },
  excerpt: {
    type: String,
    required: [true, 'ملخص المقال مطلوب'],
    trim: true,
    maxlength: [500, 'ملخص المقال لا يجب أن يتجاوز 500 حرف']
  },
  content: {
    type: String,
    required: [true, 'محتوى المقال مطلوب'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'كاتب المقال مطلوب']
  },
  category: {
    type: String,
    required: [true, 'فئة المقال مطلوبة'],
    enum: [
      'نصائح', 'تصميم', 'الدراسة', 'الأعمال', 'الإنتاجية', 'التقنية', 'المراجعات', 'التعليم', 'الأخبار', 'عام',
      'التخطيط', 'التسويق', 'التطوير', 'البرمجة', 'التصميم الجرافيكي', 'التصوير', 'الفيديو', 'الصوت', 'الكتابة', 'الترجمة',
      'المحاسبة', 'القانون', 'الطب', 'الهندسة', 'العلوم', 'التاريخ', 'الجغرافيا', 'الفلسفة', 'السياسة', 'الاقتصاد',
      'الرياضة', 'السفر', 'الطبخ', 'الموضة', 'الجمال', 'الترفيه', 'الألعاب', 'التكنولوجيا', 'الذكاء الاصطناعي', 'البيانات',
      'الأمن السيبراني', 'البلوك تشين', 'الواقع الافتراضي', 'الروبوتات', 'الطاقة المتجددة', 'البيئة', 'الاستدامة',
      'الصحة النفسية', 'العلاقات', 'الأسرة', 'الأطفال', 'المراهقين', 'كبار السن', 'النساء', 'الرجال',
      'التنمية الشخصية', 'القيادة', 'العمل الجماعي', 'التواصل', 'العرض والخطابة', 'إدارة الوقت', 'إدارة المشاريع',
      'التفاوض', 'حل المشاكل', 'الإبداع', 'الابتكار', 'ريادة الأعمال', 'الاستثمار', 'التداول', 'العقارات',
      'التأمين', 'البنوك', 'التمويل', 'الادخار', 'الاستهلاك', 'التسوق', 'البيع', 'الشراء', 'التوزيع',
      'الخدمة العملاء', 'المبيعات', 'التسويق الرقمي', 'وسائل التواصل', 'المحتوى', 'العلامة التجارية',
      'العلاقات العامة', 'الإعلان', 'الترويج', 'التحليل', 'الإحصائيات', 'البحث', 'الدراسات', 'الاستطلاعات',
      'الاستبيانات', 'المقابلات', 'التجارب', 'الاختبارات', 'التقييم', 'القياس', 'التتبع', 'المراقبة',
      'التحكم', 'الإدارة', 'التنظيم', 'التنسيق', 'التخطيط الاستراتيجي', 'التطوير التنظيمي', 'التغيير',
      'التحول', 'التحسين', 'الجودة', 'الأداء', 'الكفاءة', 'الفعالية', 'النتائج', 'الأهداف', 'المؤشرات',
      'المعايير', 'المقاييس', 'التقارير', 'الوثائق', 'السجلات', 'الأرشيف', 'قواعد البيانات', 'أنظمة المعلومات',
      'البرمجيات', 'التطبيقات', 'المواقع', 'التجارة الإلكترونية', 'التعليم الإلكتروني', 'العمل عن بعد',
      'الاجتماعات الافتراضية', 'التعاون', 'المشاركة', 'التفاعل', 'التواصل الاجتماعي', 'المجتمعات', 'الشبكات',
      'العلاقات المهنية', 'التواصل المهني', 'بناء الشبكات', 'التنمية المهنية', 'التدريب', 'التطوير المهني',
      'التحسين المهني', 'النمو المهني', 'التقدم المهني', 'النجاح المهني', 'التميز المهني', 'الإنجاز المهني',
      'الابتكار المهني', 'الإبداع المهني', 'القيادة المهنية', 'الإدارة المهنية', 'التخطيط المهني',
      'التطوير الوظيفي', 'التقدم الوظيفي', 'النمو الوظيفي', 'النجاح الوظيفي', 'التميز الوظيفي', 'الإنجاز الوظيفي',
      'الابتكار الوظيفي', 'الإبداع الوظيفي', 'القيادة الوظيفية', 'الإدارة الوظيفية', 'التخطيط الوظيفي',
      'التطوير الشخصي', 'النمو الشخصي', 'النجاح الشخصي', 'التميز الشخصي', 'الإنجاز الشخصي', 'الابتكار الشخصي',
      'الإبداع الشخصي', 'القيادة الشخصية', 'الإدارة الشخصية', 'التخطيط الشخصي', 'التطوير الذاتي', 'النمو الذاتي',
      'النجاح الذاتي', 'التميز الذاتي', 'الإنجاز الذاتي', 'الابتكار الذاتي', 'الإبداع الذاتي', 'القيادة الذاتية',
      'الإدارة الذاتية', 'التخطيط الذاتي'
    ]
  },
  categories: [{
    type: String,
    trim: true,
    maxlength: [50, 'كل فئة لا يجب أن تتجاوز 50 حرف']
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'كل علامة لا يجب أن تتجاوز 30 حرف']
  }],
  featuredImage: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'رابط الصورة غير صحيح'
    }
  },
  readTime: {
    type: String,
    default: '5 دقائق'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'ملاحظات الإدارة لا يجب أن تتجاوز 500 حرف']
  }
}, {
  timestamps: true
});

// Indexes for better performance
// Note: slug index is automatically created by unique: true property
blogSchema.index({ status: 1, publishedAt: -1 }); // For published blogs
blogSchema.index({ author: 1, createdAt: -1 }); // For author's blogs
blogSchema.index({ category: 1, status: 1 }); // For category filtering
blogSchema.index({ featured: 1, status: 1 }); // For featured blogs
blogSchema.index({ tags: 1 }); // For tag search

// Virtual for reading time calculation
blogSchema.virtual('estimatedReadTime').get(function () {
  const wordsPerMinute = 200; // Average reading speed in Arabic
  const wordCount = this.content ? this.content.split(/\s+/).length : 0;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} دقائق`;
});

// Method to increment views
blogSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to generate slug from title (transliterates Arabic to English)
blogSchema.methods.generateSlug = function () {
  return generateSlug(this.title);
};

// Pre-save middleware to generate slug if not provided
blogSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = this.generateSlug();

    // Ensure slug is not empty
    if (!baseSlug || baseSlug.trim() === '') {
      baseSlug = 'blog-' + Date.now();
    }

    this.slug = baseSlug;
  }
  next();
});

// Pre-save middleware to calculate reading time
blogSchema.pre('save', function (next) {
  if (this.isModified('content') || !this.readTime) {
    // Calculate reading time based on content
    if (this.content) {
      // Remove HTML tags and get plain text
      const plainText = this.content.replace(/<[^>]*>/g, '');

      // Count words (split by whitespace and filter out empty strings)
      const wordCount = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;

      // Average reading speed: 200 words per minute for Arabic text
      const wordsPerMinute = 200;
      const minutes = Math.ceil(wordCount / wordsPerMinute);

      // Minimum reading time is 1 minute
      const readingTime = Math.max(1, minutes);

      this.readTime = `${readingTime} ${readingTime === 1 ? 'دقيقة' : 'دقائق'}`;
    } else {
      this.readTime = '1 دقيقة';
    }
  }
  next();
});

// Pre-save middleware to set publishedAt when status changes to published
blogSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Additional compound indexes for efficient queries
blogSchema.index({ author: 1, status: 1 }); // For author's blogs by status
blogSchema.index({ category: 1, status: 1, publishedAt: -1 }); // For category pages
blogSchema.index({ tags: 1, status: 1 }); // For tag-based searches
blogSchema.index({ views: -1 }); // For popular blogs
blogSchema.index({ createdAt: -1 }); // For recent posts
// Text index for search functionality
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
