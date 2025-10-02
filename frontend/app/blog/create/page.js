'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import api from '../../../lib/api';
import SuccessModal from '../../../components/SuccessModal';

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

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, loading: authLoading, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

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

  // Auto-save functionality
  useEffect(() => {
    const saveToLocalStorage = () => {
      const draftData = {
        ...formData,
        uploadedImage,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('blogDraft', JSON.stringify(draftData));
      setLastSaved(new Date());
    };

    // Save to localStorage every 30 seconds if there's content
    const interval = setInterval(() => {
      if (formData.title || formData.content || formData.excerpt) {
        saveToLocalStorage();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, uploadedImage]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('blogDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData({
          title: draftData.title || '',
          excerpt: draftData.excerpt || '',
          content: draftData.content || '',
          category: draftData.category || '',
          tags: draftData.tags || '',
          featuredImage: draftData.featuredImage || '',
          status: draftData.status || 'draft'
        });
        if (draftData.uploadedImage) {
          setUploadedImage(draftData.uploadedImage);
        }
        if (draftData.timestamp) {
          setLastSaved(new Date(draftData.timestamp));
        }
        showInfo('تم استعادة المسودة المحفوظة');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Clear draft when form is successfully submitted
  const clearDraft = () => {
    localStorage.removeItem('blogDraft');
    setLastSaved(null);
  };

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


      const response = await api.post('/blogs', blogData);

      if (response.data.success) {
        showSuccess(response.data.message);
        setShowSuccessModal(true);
        clearDraft();

        // Clear form
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          category: '',
          tags: '',
          featuredImage: '',
          status: 'draft'
        });
        setUploadedImage(null);
      }
    } catch (error) {
      console.error('Blog creation error:', error);

      if (error.response?.status === 409) {
        showError(error.response.data.message);
      } else if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('حدث خطأ أثناء إنشاء المقال. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-accent-600 dark:text-dark-text-secondary">جاري التحميل...</p>
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
          <h1 className="heading-1 text-white mb-4">إنشاء مقال جديد</h1>
          <p className="body-large text-primary-100 dark:text-dark-text-secondary max-w-2xl mx-auto">
            شارك معرفتك وخبرتك مع مجتمع نوشن العرب من خلال إنشاء مقال مفيد ومفيد
          </p>
        </div>
      </section>

      {/* Blog Creation Form */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 4h6" />
                  </svg>
                  عنوان المقال *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`form-input text-lg ${errors.title ? 'border-red-500 focus:border-red-500 ring-red-200' : 'focus:ring-primary-200'}`}
                  placeholder="اكتب عنوان المقال هنا..."
                  required
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.title.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                      {formData.title.length}/200 حرف
                    </p>
                  </div>
                  {errors.title && (
                    <p className="text-xs text-red-500 font-medium">{errors.title}</p>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  ملخص المقال *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className={`form-input resize-none ${errors.excerpt ? 'border-red-500 focus:border-red-500 ring-red-200' : 'focus:ring-primary-200'}`}
                  placeholder="اكتب ملخص مختصر للمقال..."
                  required
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.excerpt.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                      {formData.excerpt.length}/500 حرف
                    </p>
                  </div>
                  {errors.excerpt && (
                    <p className="text-xs text-red-500 font-medium">{errors.excerpt}</p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  محتوى المقال *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={15}
                  className={`form-input resize-y ${errors.content ? 'border-red-500 focus:border-red-500 ring-red-200' : 'focus:ring-primary-200'}`}
                  placeholder="اكتب محتوى المقال هنا..."
                  required
                  minLength={100}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.content.length >= 100 ? 'bg-green-500' : formData.content.length > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                      {formData.content.length} حرف (الحد الأدنى: 100 حرف)
                    </p>
                  </div>
                  {errors.content && (
                    <p className="text-xs text-red-500 font-medium">{errors.content}</p>
                  )}
                </div>
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    فئة المقال *
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-full ${errors.category ? 'border-red-500 focus:border-red-500 ring-red-200' : 'focus:ring-primary-200'}`}
                      required
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {/* Custom dropdown indicator */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.category && (
                    <p className="text-xs text-red-500 font-medium mt-1">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    حالة المقال
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-full"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                    {/* Custom dropdown indicator */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  العلامات
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="form-input focus:ring-primary-200"
                  placeholder="اكتب العلامات مفصولة بفواصل (مثال: نوشن، إنتاجية، تنظيم)"
                />
                <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                  اكتب العلامات مفصولة بفواصل
                </p>
              </div>

              {/* Featured Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">
                  <svg className="w-4 h-4 text-green-500 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  صورة المقال الرئيسية (اختياري)
                </label>

                {!uploadedImage ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                      disabled={isUploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      {isUploadingImage ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                          <span>جاري رفع الصورة...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              اضغط لرفع صورة المقال
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              PNG, JPG, GIF حتى 5 ميجابايت
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-3">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">تم رفع الصورة بنجاح</span>
                    </div>
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="صورة المقال"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={() => {
                          showError('فشل في تحميل الصورة');
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImage(null);
                          setFormData(prev => ({ ...prev, featuredImage: '' }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        title="إزالة الصورة"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      هذه الصورة ستكون الصورة الرئيسية للمقال
                    </p>
                  </div>
                )}
              </div>

              {/* Save Status */}
              {lastSaved && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">تم الحفظ تلقائياً! 💾</span>
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span>{lastSaved.toLocaleTimeString('en-US')}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 text-accent-600 dark:text-dark-text-secondary bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary py-3 px-6 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الإنشاء...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>{formData.status === 'published' ? 'إنشاء ونشر المقال' : 'إنشاء المقال'}</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={() => {
          setShowSuccessModal(false);
          router.push('/blog');
        }}
        title="تم إرسال المقال للمراجعة! ⏳"
        message="شكراً لك على مشاركة مقالك مع مجتمع عرب نوشن! مقالك الآن في حالة 'قيد المراجعة' وسيتم مراجعته من قبل فريقنا المتخصص خلال 24-48 ساعة. سيتم إشعارك بالنتيجة عبر البريد الإلكتروني. نتطلع لرؤية المزيد من مقالاتك الممتازة! 🎉"
        continueButtonText="الذهاب للمدونة"
      />
    </div>
  );
}
