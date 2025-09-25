const mongoose = require('mongoose');

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
      'نصائح',
      'تصميم',
      'الدراسة',
      'الأعمال',
      'الإنتاجية',
      'التقنية',
      'المراجعات',
      'التعليم',
      'الأخبار',
      'عام'
    ]
  },
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
blogSchema.index({ status: 1, publishedAt: -1 }); // For published blogs
blogSchema.index({ author: 1, createdAt: -1 }); // For author's blogs
blogSchema.index({ category: 1, status: 1 }); // For category filtering
blogSchema.index({ slug: 1 }); // For slug lookup
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

// Method to generate slug from title
blogSchema.methods.generateSlug = function () {
  return this.title
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
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

// Pre-save middleware to set publishedAt when status changes to published
blogSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
