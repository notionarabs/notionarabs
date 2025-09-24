'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '../../../lib/api';

export default function CreateTemplatePage() {
  const { user, isAuthenticated, loading, ensureTokenInHeaders } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    notionLink: '',
    features: '',
    tags: '',
    previewImage: '',
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
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="loading-text">جاري التحميل...</p>
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
    'التخطيط'
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

    // Auto-capture screenshot when Notion link is entered
    if (name === 'notionLink' && value.trim()) {
      handleScreenshotCapture(value.trim());
    }
  };

  const handleScreenshotCapture = async (url) => {
    // Validate if it's a Notion URL
    if (!url.includes('notion.so')) {
      return;
    }

    setIsCapturingScreenshot(true);
    setScreenshotPreview(null);

    try {
      const response = await api.post('/screenshot', { url });

      if (response.data.success) {
        const screenshotUrl = response.data.data.screenshotUrl;
        setScreenshotPreview(screenshotUrl);

        // Auto-fill the preview image field
        setFormData(prev => ({
          ...prev,
          previewImage: screenshotUrl
        }));
      }
    } catch (error) {
      console.error('Screenshot capture error:', error);

      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || 'فشل في التقاط صورة للقالب';
      alert(`⚠️ ${errorMessage}\n\nيمكنك المتابعة بدون صورة أو إضافة رابط صورة يدوياً.`);
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure token is set in headers before making API call
      const hasToken = ensureTokenInHeaders();
      if (!hasToken) {
        alert('يجب تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }
      // Client-side validation
      if (!formData.title.trim()) {
        alert('يرجى إدخال عنوان القالب');
        setIsSubmitting(false);
        return;
      }
      if (!formData.description.trim()) {
        alert('يرجى إدخال وصف القالب');
        setIsSubmitting(false);
        return;
      }
      if (!formData.category) {
        alert('يرجى اختيار فئة القالب');
        setIsSubmitting(false);
        return;
      }
      if (!formData.price || isNaN(parseFloat(formData.price))) {
        alert('يرجى إدخال سعر صحيح للقالب');
        setIsSubmitting(false);
        return;
      }
      if (!formData.notionLink.trim()) {
        alert('يرجى إدخال رابط قالب نوتيون');
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
        price: parseFloat(formData.price),
        notionLink: formData.notionLink.trim(),
        difficulty: formData.difficulty,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        features: formData.features.trim() || undefined,
        previewImage: formData.previewImage || undefined // Only set if screenshot was captured
      };

      // Remove undefined values
      Object.keys(templateData).forEach(key => {
        if (templateData[key] === undefined || templateData[key] === '') {
          delete templateData[key];
        }
      });

      const response = await api.post('/templates', templateData);

      if (response.data.success) {
        // Show success message with screenshot status
        let successMessage = 'تم إرسال القالب بنجاح! سيتم مراجعته من قبل الإدارة قريباً.';

        if (response.data.screenshotStatus) {
          if (response.data.screenshotStatus.success) {
            successMessage += '\n\n✅ تم التقاط صورة المعاينة بنجاح.';
          } else {
            successMessage += `\n\n⚠️ ${response.data.screenshotStatus.message}`;
          }
        }

        alert(successMessage);
        router.push('/profile');
      }
    } catch (error) {
      console.error('Error creating template:', error);

      // Show more specific error message
      let errorMessage = error.response?.data?.message || 'حدث خطأ أثناء إرسال القالب. يرجى المحاولة مرة أخرى.';

      // If there are validation errors, show them
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join('\n');
        errorMessage = `أخطاء في البيانات:\n${validationErrors}`;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 mb-2">إنشاء قالب جديد</h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">
                أضف قالبك المبتكر وابدأ في كسب المال من إبداعك
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="btn-outline"
            >
              العودة
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="card p-8">
              <h2 className="heading-2 mb-6">المعلومات الأساسية</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    عنوان القالب *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="مثال: مخطط الدراسة الشامل"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    وصف القالب *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="form-input"
                    placeholder="اكتب وصفاً مفصلاً عن القالب ومميزاته..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    الفئة *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    مستوى الصعوبة
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Link */}
            <div className="card p-8">
              <h2 className="heading-2 mb-6">السعر والرابط</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    السعر (ريال سعودي) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="form-input"
                    placeholder="25.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    رابط قالب نوتيون *
                  </label>
                  <input
                    type="url"
                    name="notionLink"
                    value={formData.notionLink}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="https://notion.so/your-template-link"
                  />
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary mt-1">
                    تأكد من أن الرابط قابل للوصول العام
                  </p>

                  {/* Screenshot Preview */}
                  {isCapturingScreenshot && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">جاري التقاط صورة للقالب...</span>
                      </div>
                    </div>
                  )}

                  {screenshotPreview && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">تم التقاط صورة المعاينة بنجاح</span>
                      </div>
                      <div className="relative">
                        <img
                          src={screenshotPreview}
                          alt="صورة المعاينة التلقائية"
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          onError={() => {
                            alert(`فشل في تحميل الصورة: ${screenshotPreview}\n\nيرجى المحاولة مرة أخرى.`);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotPreview(null);
                            setFormData(prev => ({ ...prev, previewImage: '' }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          title="إزالة الصورة"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        هذه الصورة ستكون صورة المعاينة الرسمية للقالب
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features & Details */}
            <div className="card p-8">
              <h2 className="heading-2 mb-6">المميزات والتفاصيل</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    مميزات القالب
                  </label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    rows={4}
                    className="form-input"
                    placeholder="اكتب مميزات القالب، كل ميزة في سطر منفصل..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    الكلمات المفتاحية (اختياري)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="إنتاجية, دراسة, تنظيم (مفصولة بفواصل)"
                  />
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary mt-1">
                    تساعد الكلمات المفتاحية في العثور على قالبك بسهولة
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    صورة المعاينة
                  </label>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">سيتم التقاط صورة تلقائياً من قالب نوتيون</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      عند إدخال رابط قالب نوتيون، سيتم التقاط صورة للمعاينة تلقائياً
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="card p-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h3 className="heading-3 text-blue-800 dark:text-blue-200 mb-4">إرشادات مهمة</h3>
              <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>تأكد من أن قالبك أصلي ولا ينتهك حقوق الملكية الفكرية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>رابط نوتيون يجب أن يكون قابل للوصول العام</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>سيتم مراجعة القالب من قبل الإدارة قبل النشر</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>تأكد من دقة المعلومات المقدمة</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-outline"
                disabled={isSubmitting}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال للمراجعة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
