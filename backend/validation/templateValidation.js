const { z } = require('zod');

// Template validation schemas
const templateSchema = z.object({
  title: z.string()
    .min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'العنوان يجب أن يكون أقل من 100 حرف'),

  description: z.string()
    .min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل')
    .max(1000, 'الوصف يجب أن يكون أقل من 1000 حرف'),

  categories: z.array(z.string())
    .min(1, 'يجب اختيار فئة واحدة على الأقل')
    .max(3, 'لا يمكن اختيار أكثر من 3 فئات'),

  previewImage: z.string()
    .url('رابط الصورة غير صحيح')
    .optional(),

  notionLink: z.string()
    .url('رابط نوشن غير صحيح'),

  category: z.string().optional(),

  features: z.string()
    .max(2000, 'المميزات لا يجب أن تتجاوز 2000 حرف')
    .optional(),

  previewImages: z.array(z.string().url('رابط الصورة غير صحيح'))
    .max(4, 'لا يمكن إضافة أكثر من 4 صور')
    .optional(),

  explanationVideo: z.string()
    .url('رابط الفيديو غير صحيح')
    .optional(),

  tags: z.array(z.string())
    .max(10, 'لا يمكن إضافة أكثر من 10 علامات')
    .optional(),

  isPaid: z.boolean().default(false).optional(),

  price: z.number()
    .min(0, 'السعر يجب أن يكون أكبر من أو يساوي 0')
    .optional()
    .refine((val, ctx) => {
      // If isPaid is true, price must be provided and greater than 0
      const isPaid = ctx?.parent?.isPaid;
      if (isPaid && (!val || val <= 0)) {
        return false;
      }
      return true;
    }, {
      message: 'السعر مطلوب للقوالب المدفوعة ويجب أن يكون أكبر من 0'
    }),


});

const updateTemplateSchema = templateSchema.partial();

const templateQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)),
  category: z.string().optional(),
  categories: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'downloads', 'rating', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  isPaid: z.string().transform(val => val === 'true').optional(),
  creatorId: z.string().optional(),
});

// User validation schemas
const userSchema = z.object({
  username: z.string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(20, 'اسم المستخدم يجب أن يكون أقل من 20 حرف')
    .regex(/^[a-zA-Z0-9_]+$/, 'اسم المستخدم يمكن أن يحتوي على أحرف إنجليزية وأرقام و_ فقط'),

  email: z.string()
    .email('البريد الإلكتروني غير صحيح'),

  password: z.string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .max(100, 'كلمة المرور طويلة جداً'),

  firstName: z.string()
    .min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم الأول طويل جداً')
    .optional(),

  lastName: z.string()
    .min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل')
    .max(50, 'اسم العائلة طويل جداً')
    .optional(),

  bio: z.string()
    .max(500, 'السيرة الذاتية طويلة جداً')
    .optional(),

  avatar: z.string()
    .url('رابط الصورة الشخصية غير صحيح')
    .optional(),
});

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// Blog validation schemas
const blogSchema = z.object({
  title: z.string()
    .min(5, 'عنوان المقال يجب أن يكون 5 أحرف على الأقل')
    .max(200, 'عنوان المقال يجب أن يكون أقل من 200 حرف'),

  content: z.string()
    .min(100, 'محتوى المقال يجب أن يكون 100 حرف على الأقل'),

  excerpt: z.string()
    .max(300, 'الملخص يجب أن يكون أقل من 300 حرف')
    .optional(),

  tags: z.array(z.string())
    .max(10, 'لا يمكن إضافة أكثر من 10 علامات')
    .optional(),

  featuredImage: z.string()
    .url('رابط الصورة المميزة غير صحيح')
    .optional(),

  isPublished: z.boolean().default(false),
});

// Rating validation schemas
const ratingSchema = z.object({
  templateId: z.string().min(1, 'معرف القالب مطلوب'),
  rating: z.number()
    .min(1, 'التقييم يجب أن يكون بين 1 و 5')
    .max(5, 'التقييم يجب أن يكون بين 1 و 5'),

  comment: z.string()
    .max(500, 'التعليق يجب أن يكون أقل من 500 حرف')
    .optional(),
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'بيانات غير صحيحة',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'معاملات البحث غير صحيحة',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = {
  templateSchema,
  updateTemplateSchema,
  templateQuerySchema,
  userSchema,
  loginSchema,
  blogSchema,
  ratingSchema,
  validate,
  validateQuery,
};
