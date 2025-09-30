'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '../../../lib/api';
import SuccessModal from '../../../components/SuccessModal';

export default function CreateTemplatePage() {
  const { user, isAuthenticated, loading, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    notionLink: '',
    features: '',
    tags: '',
    previewImage: '',
    previewImages: [],
    difficulty: 'beginner'
  });

  useEffect(() => {
    // Ensure token is set in headers when component mounts
    ensureTokenInHeaders();

    // Only redirect if we've finished loading and user is not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    // Redirect if user is not an approved creator
    if (!loading && isAuthenticated && user && user.creatorStatus !== 'approved') {
      router.push('/');
    }
  }, [isAuthenticated, loading, user, router, ensureTokenInHeaders]);

  // Show loading only if we're actually loading and don't have user data
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg text-accent-600 dark:text-dark-text-secondary">جاري تحميل صفحة إنشاء القالب...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render anything (will redirect)
  if (!loading && !isAuthenticated) {
    return null;
  }

  // Redirect if user is not an approved creator
  if (!loading && isAuthenticated && user && user.creatorStatus !== 'approved') {
    return null;
  }

  const categories = [
    'الإنتاجية',
    'الدراسة',
    'الأعمال',
    'الحياة الشخصية',
    'الإبداع',
    'التقنية',
    'الصحة',
    'المالية',
    'التنظيم',
    'التخطيط',
    'ديني'
  ];

  const difficulties = [
    { value: 'beginner', label: 'مبتدئ' },
    { value: 'intermediate', label: 'متوسط' },
    { value: 'advanced', label: 'متقدم' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('يرجى اختيار ملف صورة صالح');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    // No dimension validation - accept any image resolution

    setIsUploadingImage(true);

    try {
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
          previewImage: imageUrl
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

  // تم إزالة إنشاء لقطة الشاشة تلقائياً. الرجاء رفع صورة يدوياً.

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle multiple image uploads
  const handleMultipleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showError(`الملف ${file.name} ليس صورة صالحة`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showError(`الملف ${file.name} كبير جداً (أكثر من 10 ميجابايت)`);
        return;
      }
    }

    setIsUploadingImage(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          return response.data.data.imageUrl;
        }
        throw new Error('فشل في رفع الصورة');
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setUploadedImages(prev => [...prev, ...uploadedUrls]);
      setFormData(prev => ({
        ...prev,
        previewImages: [...prev.previewImages, ...uploadedUrls]
      }));

      showSuccess(`تم رفع ${uploadedUrls.length} صورة بنجاح`);

      // Clear the input
      e.target.value = '';

    } catch (error) {
      console.error('Error uploading images:', error);
      const errorMessage = error.response?.data?.message || 'فشل في رفع الصور';
      showError(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Remove image from multiple images
  const removeMultipleImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      previewImages: prev.previewImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure token is set in headers before making API call
      const hasToken = ensureTokenInHeaders();
      if (!hasToken) {
        showError('يجب تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }
      // Client-side validation
      if (!formData.title.trim()) {
        showError('يرجى إدخال عنوان القالب');
        setIsSubmitting(false);
        return;
      }
      if (!formData.description.trim()) {
        showError('يرجى إدخال وصف القالب');
        setIsSubmitting(false);
        return;
      }
      if (!formData.category) {
        showError('يرجى اختيار فئة القالب');
        setIsSubmitting(false);
        return;
      }
      // Price validation removed - all templates are free
      if (!formData.notionLink.trim()) {
        showError('يرجى إدخال رابط قالب نوشن');
        setIsSubmitting(false);
        return;
      }
      if (!formData.previewImage.trim()) {
        showError('يرجى رفع لقطة شاشة للصفحة الرئيسية للقالب كصورة مصغرة');
        setIsSubmitting(false);
        return;
      }

      // Convert tags string to array
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      // Clean up the form data - remove empty strings for optional fields
      const templateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        notionLink: formData.notionLink.trim(),
        difficulty: formData.difficulty,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        features: formData.features.trim() || undefined,
        previewImage: formData.previewImage || undefined,
        previewImages: formData.previewImages.length > 0 ? formData.previewImages : undefined
      };

      // Remove undefined values
      Object.keys(templateData).forEach(key => {
        if (templateData[key] === undefined || templateData[key] === '') {
          delete templateData[key];
        }
      });

      const response = await api.post('/templates', templateData);

      if (response.data.success) {
        // Clear all form fields
        setFormData({
          title: '',
          description: '',
          category: '',
          notionLink: '',
          features: '',
          tags: '',
          previewImage: '',
          previewImages: [],
          difficulty: 'beginner'
        });
        setUploadedImage(null);
        setUploadedImages([]);

        // Show success modal
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error creating template:', error);

      // Handle duplicate template error specifically
      if (error.response?.status === 409) {
        const duplicateField = error.response?.data?.duplicateField;
        let errorMessage = error.response?.data?.message;

        if (duplicateField === 'title') {
          errorMessage += '\n\nيرجى تغيير عنوان القالب ليصبح مختلفاً عن القوالب السابقة.';
        } else if (duplicateField === 'notionLink') {
          errorMessage += '\n\nيرجى التأكد من أن رابط نوشن مختلف عن القوالب السابقة.';
        }

        showError(errorMessage);
      } else {
        // Show more specific error message for other errors
        let errorMessage = error.response?.data?.message || 'حدث خطأ أثناء إرسال القالب. يرجى المحاولة مرة أخرى.';

        // If there are validation errors, show them
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const validationErrors = error.response.data.errors.map(err => err.msg).join('\n');
          errorMessage = `أخطاء في البيانات:\n${validationErrors}`;
        }

        showError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-tertiary transition-colors duration-300" dir="rtl">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-sm border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300 shadow-sm">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-orange-500 dark:to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h1 className="heading-1 mb-2 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                    إنشاء قالب جديد
                  </h1>
                  <p className="body-large text-accent-600 dark:text-dark-text-secondary">
                    أضف قالبك المبتكر وشاركه مع المجتمع العربي
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2 text-sm text-accent-600 dark:text-dark-text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>املأ النموذج أدناه لإرسال قالبك للمراجعة</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/profile')}
                className="btn-outline inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة للبروفايل
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="card p-8 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary-500 dark:bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="heading-2 text-primary-600 dark:text-orange-400">المعلومات الأساسية</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    عنوان القالب *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                      placeholder="مثال: مخطط الدراسة الشامل"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    وصف القالب *
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400 resize-none"
                      placeholder="اكتب وصفاً مفصلاً عن القالب ومميزاته..."
                    />
                    <div className="absolute right-4 top-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    الفئة *
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-full"
                    >
                      <option value="" disabled className="text-gray-400">اختر الفئة</option>
                      {categories.map((category) => (
                        <option key={category} value={category} className="text-gray-900 dark:text-white">
                          {category}
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

                <div>
                  <label className="flex items-center text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    مستوى الصعوبة
                  </label>
                  <div className="relative">
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-full"
                    >
                      {difficulties.map((difficulty) => (
                        <option key={difficulty.value} value={difficulty.value} className="text-gray-900 dark:text-white">
                          {difficulty.label}
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
            </div>

            {/* Link & Image */}
            <div className="card p-8 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h2 className="heading-2 text-green-600">الرابط والصورة</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="flex items-center text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-green-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    رابط قالب نوشن *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="notionLink"
                      value={formData.notionLink}
                      onChange={handleInputChange}
                      required
                      className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-green-500 dark:focus:border-green-500 rounded-xl transition-all duration-200 hover:border-green-300 dark:hover:border-green-400"
                      placeholder="https://notion.so/your-template-link"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    تأكد من أن الرابط قابل للوصول العام
                  </p>
                </div>

                <div>
                  {/* Image Upload */}
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-green-500 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    لقطة شاشة للقالب (مطلوب) *
                  </label>

                  {/* تمت إزالة إنشاء لقطة الشاشة تلقائياً */}

                  {/* Manual Upload Option */}

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
                                اضغط لرفع لقطة شاشة للصفحة الرئيسية للقالب
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                PNG, JPG, GIF حتى 5 ميجابايت - مطلوب كصورة مصغرة
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
                          alt="صورة المعاينة"
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          onError={() => {
                            showError('فشل في تحميل الصورة');
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImage(null);
                            setFormData(prev => ({ ...prev, previewImage: '' }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          title="إزالة الصورة"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        هذه اللقطة ستكون الصورة المصغرة الرسمية للقالب
                      </p>
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                          💡 نصائح لتحسين الصورة:
                        </p>
                        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                          <li>• تأكد من وضوح النص والعناصر في الصورة</li>
                          <li>• اختر لقطة شاشة تعرض أفضل ما في القالب</li>
                          <li>• استخدم دقة عالية للحصول على أفضل جودة</li>
                          <li>• تجنب الصور الضبابية أو غير الواضحة</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Multiple Images Upload Section */}
            <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-card-border">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-accent-600 dark:text-dark-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-accent-700 dark:text-dark-text-primary">
                  صور إضافية للقالب (اختياري)
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-3">
                  يمكنك إضافة صور إضافية لعرض جوانب مختلفة من القالب. هذه الصور ستظهر في صفحة تفاصيل القالب.
                </p>

                {!uploadedImages.length ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleFileChange}
                      className="hidden"
                      id="multiple-image-upload"
                      disabled={isUploadingImage}
                    />
                    <label
                      htmlFor="multiple-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      {isUploadingImage ? (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="loading-spinner"></div>
                          <span>جاري رفع الصور...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              اضغط لرفع صور إضافية للقالب
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              يمكنك اختيار عدة صور مرة واحدة - PNG, JPG, GIF حتى 10 ميجابايت
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`معاينة ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            onError={() => {
                              showError('فشل في تحميل الصورة');
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeMultipleImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="إزالة الصورة"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add more images button */}
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleFileChange}
                        className="hidden"
                        id="add-more-images"
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="add-more-images"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        إضافة صور أخرى
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features & Details */}
            <div className="card p-8 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="heading-2 text-blue-600">المميزات والتفاصيل</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-blue-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    مميزات القالب
                  </label>
                  <div className="relative">
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      rows={4}
                      className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-blue-500 dark:focus:border-blue-500 rounded-xl transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-400 resize-none"
                      placeholder="اكتب مميزات القالب، كل ميزة في سطر منفصل..."
                    />
                    <div className="absolute right-4 top-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    اكتب كل ميزة في سطر منفصل لسهولة القراءة
                  </p>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-blue-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    الكلمات المفتاحية (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-blue-500 dark:focus:border-blue-500 rounded-xl transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-400"
                      placeholder="إنتاجية, دراسة, تنظيم (مفصولة بفواصل)"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    تساعد الكلمات المفتاحية في العثور على قالبك بسهولة
                  </p>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-blue-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    صورة المعاينة
                  </label>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300 mb-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-lg">رفع صورة المعاينة يدوياً</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      يمكنك رفع صورة المعاينة يدوياً في قسم الرابط والصورة أعلاه
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="card p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="heading-3 text-amber-800 dark:text-amber-200">إرشادات مهمة</h3>
              </div>
              <ul className="space-y-4 text-amber-700 dark:text-amber-300">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <span className="text-sm leading-relaxed">تأكد من أن قالبك أصلي ولا ينتهك حقوق الملكية الفكرية</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <span className="text-sm leading-relaxed">رابط نوشن يجب أن يكون قابل للوصول العام</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <span className="text-sm leading-relaxed">سيتم مراجعة القالب من قبل الإدارة قبل النشر</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  <span className="text-sm leading-relaxed">تأكد من دقة المعلومات المقدمة</span>
                </li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="btn-outline inline-flex items-center justify-center gap-2 px-8 py-4 text-lg"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء
              </button>
              <button
                type="submit"
                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    إرسال للمراجعة
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={() => {
          setShowSuccessModal(false);
          router.push('/profile');
        }}
      />
    </div>
  );
}