'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useToast } from '../../../../contexts/ToastContext';
import api from '../../../../lib/api';
import SuccessModal from '../../../../components/SuccessModal';

const categories = [
  { name: "نصائح", value: "نصائح" },
  { name: "تصميم", value: "تصميم" },
  { name: "الدراسة", value: "الدراسة" },
  { name: "الأعمال", value: "الأعمال" },
  { name: "الإنتاجية", value: "الإنتاجية" },
  { name: "التقنية", value: "التقنية" },
  { name: "المراجعات", value: "المراجعات" },
  { name: "التعليم", value: "التعليم" },
  { name: "الأخبار", value: "الأخبار" },
  { name: "عام", value: "عام" }
];

const statusOptions = [
  { name: "مسودة", value: "draft" },
  { name: "مراجعة", value: "pending" }
];

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id;
  const { user, loading: authLoading, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: '',
    status: 'draft'
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  // Redirect if not authenticated or not approved creator
  useEffect(() => {
    // Ensure token is set in headers when component mounts
    ensureTokenInHeaders();

    if (!authLoading && !user) {
      router.push('/login');
    }
    // Redirect if user is not an approved creator
    if (!authLoading && user && user.creatorStatus !== 'approved') {
      router.push('/');
    }
  }, [authLoading, user, router, ensureTokenInHeaders]);

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId || !user) return;

      try {
        setLoading(true);
        const response = await api.get(`/blogs/by-id/${blogId}`);

        if (response.data.success) {
          const blog = response.data.blog;
          setFormData({
            title: blog.title || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            category: blog.category || categories[0].value,
            tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
            featuredImage: blog.featuredImage || '',
            status: blog.status || 'draft'
          });
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        if (error.response?.status === 404) {
          showError('المقال غير موجود');
        } else if (error.response?.status === 403) {
          showError('غير مصرح لك بتعديل هذا المقال');
        } else {
          showError('فشل في تحميل المقال');
        }
        router.push('/profile/my-blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId, user, router, showError]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'عنوان المقال مطلوب';
        } else if (value.length > 200) {
          newErrors.title = 'العنوان يجب أن يكون أقل من 200 حرف';
        } else {
          delete newErrors.title;
        }
        break;
      case 'excerpt':
        if (!value.trim()) {
          newErrors.excerpt = 'ملخص المقال مطلوب';
        } else if (value.length > 500) {
          newErrors.excerpt = 'الملخص يجب أن يكون أقل من 500 حرف';
        } else {
          delete newErrors.excerpt;
        }
        break;
      case 'content':
        if (!value.trim()) {
          newErrors.content = 'محتوى المقال مطلوب';
        } else if (value.length < 100) {
          newErrors.content = 'المحتوى يجب أن يكون على الأقل 100 حرف';
        } else {
          delete newErrors.content;
        }
        break;
      case 'category':
        if (!value) {
          newErrors.category = 'فئة المقال مطلوبة';
        } else {
          delete newErrors.category;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    validateField(name, value);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('يرجى اختيار ملف صورة صالح');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const imageUrl = response.data.data.imageUrl;
        setUploadedImage(imageUrl);
        setFormData(prev => ({
          ...prev,
          featuredImage: imageUrl
        }));
        showSuccess('تم رفع الصورة بنجاح');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error.response?.data?.message || 'فشل في رفع الصورة';
      showError(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showError('يجب تسجيل الدخول أولاً');
      return;
    }

    // Validate all fields
    const isTitleValid = validateField('title', formData.title);
    const isExcerptValid = validateField('excerpt', formData.excerpt);
    const isContentValid = validateField('content', formData.content);
    const isCategoryValid = validateField('category', formData.category);

    if (!isTitleValid || !isExcerptValid || !isContentValid || !isCategoryValid) {
      showError('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      setSubmitting(true);

      // Ensure token is set in headers before making API call
      const hasToken = ensureTokenInHeaders();
      if (!hasToken) {
        showError('يجب تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }

      // Convert tags string to array
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const blogData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: tagsArray,
        featuredImage: formData.featuredImage.trim() || undefined,
        status: formData.status
      };

      // Remove undefined values
      Object.keys(blogData).forEach(key => {
        if (blogData[key] === undefined) {
          delete blogData[key];
        }
      });

      const response = await api.put(`/blogs/${blogId}`, blogData);

      if (response.data.success) {
        showSuccess(response.data.message || 'تم تحديث المقال بنجاح!');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Blog update error:', error);

      if (error.response?.status === 409) {
        showError(error.response.data.message);
      } else if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('حدث خطأ أثناء تحديث المقال. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        <div className="container-custom py-8 sm:py-12">
          {/* Header Skeleton */}
          <div className="mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32 sm:w-48"></div>
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 sm:w-64"></div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-6 sm:p-8">
              <div className="animate-pulse space-y-8">
                {/* Basic Info Section */}
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-32"></div>
                  <div className="space-y-6">
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-16"></div>
                      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-40"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-dashed"></div>
                </div>

                {/* SEO Section */}
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-28"></div>
                  <div className="space-y-4">
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-16"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex gap-4 justify-end">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if user is not an approved creator
  if (!authLoading && user && user.creatorStatus !== 'approved') {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-dark-secondary dark:to-dark-tertiary text-white py-16">
        <div className="container-custom text-center">
          <h1 className="heading-1 text-white mb-4">تعديل المقال</h1>
          <p className="body-large text-primary-100 dark:text-dark-text-secondary max-w-2xl mx-auto">
            قم بتعديل مقالك وإرساله للمراجعة من قبل الإدارة
          </p>
        </div>
      </section>

      {/* Blog Edit Form */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium p-6 md:p-8 space-y-8">
            {/* Title */}
            <div>
              <label htmlFor="title" className="text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                </svg>
                عنوان المقال <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input text-lg ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder="اكتب عنوان المقال هنا..."
                required
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${formData.title.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-accent-400 dark:text-dark-text-tertiary">
                    {formData.title.length}/200 حرف
                  </span>
                </div>
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title}</p>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ملخص المقال <span className="text-red-500">*</span>
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className={`form-input text-lg ${errors.excerpt ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder="اكتب ملخصاً قصيراً وجذاباً للمقال (سيظهر في صفحة المدونة)..."
                required
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${formData.excerpt.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-accent-400 dark:text-dark-text-tertiary">
                    {formData.excerpt.length}/500 حرف
                  </span>
                </div>
                {errors.excerpt && (
                  <p className="text-xs text-red-500">{errors.excerpt}</p>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                محتوى المقال <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={15}
                className={`form-input text-lg ${errors.content ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                placeholder="اكتب محتوى المقال بالتفصيل هنا..."
                required
              />
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${formData.content.length >= 100 ? 'bg-green-500' : formData.content.length > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-accent-400 dark:text-dark-text-tertiary">
                    {formData.content.length} حرف (الحد الأدنى: 100)
                  </span>
                </div>
                {errors.content && (
                  <p className="text-xs text-red-500">{errors.content}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                فئة المقال <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`form-select-with-icon text-lg ${errors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                العلامات (Tags)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="form-input text-lg"
                placeholder="نوشن, إنتاجية, تنظيم (افصل بينها بفاصلة)"
              />
              <p className="text-xs text-accent-400 dark:text-dark-text-tertiary mt-1">
                افصل بين العلامات بفاصلة (مثال: نوشن, إنتاجية, تنظيم)
              </p>
            </div>

            {/* Featured Image Upload */}
            <div>
              <label className="text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                صورة المقال المميزة
              </label>

              {/* Image Upload Input */}
              <div className="mb-4">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                <label
                  htmlFor="imageUpload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isUploadingImage
                    ? 'border-primary-300 bg-primary-50 dark:bg-dark-tertiary'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-primary-500 dark:hover:bg-dark-tertiary'
                    }`}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                      <p className="text-sm text-primary-600 dark:text-primary-400">جاري رفع الصورة...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">اضغط لرفع صورة</span> أو اسحب الصورة هنا
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        PNG, JPG, GIF حتى 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Image Preview */}
              {(uploadedImage || formData.featuredImage) && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">معاينة الصورة:</p>
                  <div className="relative inline-block">
                    <img
                      src={uploadedImage || formData.featuredImage}
                      alt="معاينة الصورة"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImage(null);
                        setFormData(prev => ({ ...prev, featuredImage: '' }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-accent-400 dark:text-dark-text-tertiary">
                اختر صورة مميزة للمقال. ستظهر هذه الصورة في قائمة المقالات وصفحة المقال.
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                حالة المقال <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select-with-icon text-lg"
                  required
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-accent-400 dark:text-dark-text-tertiary mt-1">
                المقالات المنشورة تحتاج إلى موافقة الإدارة.
              </p>
            </div>

            {/* Submit Section */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                className="btn-primary flex-1 py-3 text-lg flex items-center justify-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    حفظ التغييرات
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/profile/my-blogs')}
                className="btn-outline px-8 py-3 text-lg"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={() => {
          setShowSuccessModal(false);
          router.push('/profile/my-blogs');
        }}
        title="تم تحديث المقال بنجاح! 🎉"
        message="شكراً لك على تحديث مقالك في مجتمع عرب نوشن. تم حفظ جميع التغييرات بنجاح. إذا قمت بتغيير الحالة إلى 'مراجعة'، فسيتم إرساله للمراجعة من قبل فريقنا المتخصص خلال 24-48 ساعة."
        continueButtonText="العودة لصفحة مقالاتي"
      />
    </div>
  );
}
