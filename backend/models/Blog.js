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
    trim: true,
    maxlength: [50, 'الفئة لا يجب أن تتجاوز 50 حرف']
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

blogSchema.index({ featured: 1, status: 1 }); // For featured blogs
blogSchema.index({ tags: 1 }); // For tag search

// Virtual for reading time calculation
blogSchema.virtual('estimatedReadTime').get(function () {
  const wordsPerMinute = 200; // Average reading speed in Arabic
  const wordCount = this.content ? this.content.split(/\s+/).length : 0;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} دقائق`;
});

// Pre-save middleware to set category from first category in categories array
blogSchema.pre('save', function (next) {
  if (this.isModified('categories') && this.categories && this.categories.length > 0) {
    this.category = this.categories[0];
  } else if (this.isModified('category') && !this.category && this.categories && this.categories.length > 0) {
    this.category = this.categories[0];
  }
  next();
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

blogSchema.index({ tags: 1, status: 1 }); // For tag-based searches
blogSchema.index({ views: -1 }); // For popular blogs
blogSchema.index({ createdAt: -1 }); // For recent posts
// Indexes for category-based queries (for related blogs)
blogSchema.index({ category: 1, status: 1, publishedAt: -1 }); // For category queries
blogSchema.index({ categories: 1, status: 1, publishedAt: -1 }); // For categories array queries
// Text index for search functionality
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
