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
        previewImage: formData.previewImage.trim() || undefined
      };

      // Remove undefined values
      Object.keys(templateData).forEach(key => {
        if (templateData[key] === undefined || templateData[key] === '') {
          delete templateData[key];
        }
      });

      const response = await api.post('/templates', templateData);

      if (response.data.success) {
        // Show success message
        alert('تم إرسال القالب بنجاح! سيتم مراجعته من قبل الإدارة قريباً.');
        router.push('/profile');
      }
    } catch (error) {
      console.error('Error creating template:', error);

      // Show more specific error message
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء إرسال القالب. يرجى المحاولة مرة أخرى.';
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
                    رابط صورة المعاينة (اختياري)
                  </label>
                  <input
                    type="url"
                    name="previewImage"
                    value={formData.previewImage}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com/preview-image.jpg"
                  />
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary mt-1">
                    صورة تعرض مظهر القالب للمستخدمين
                  </p>
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
