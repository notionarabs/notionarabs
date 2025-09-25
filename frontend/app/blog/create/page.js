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
  const { user, loading: authLoading } = useAuth();
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showError('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      setSubmitting(true);

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

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-dark-secondary dark:to-dark-tertiary text-white py-16">
        <div className="container-custom text-center">
          <h1 className="heading-1 text-white mb-4">إنشاء مقال جديد</h1>
          <p className="body-large text-primary-100 dark:text-dark-text-secondary max-w-2xl mx-auto">
            شارك معرفتك وخبرتك مع مجتمع نوتيون العرب من خلال إنشاء مقال مفيد ومفيد
          </p>
        </div>
      </section>

      {/* Blog Creation Form */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                  عنوان المقال *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="اكتب عنوان المقال هنا..."
                  required
                  maxLength={200}
                />
                <p className="text-xs text-accent-500 dark:text-dark-text-tertiary mt-1">
                  {formData.title.length}/200 حرف
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                  ملخص المقال *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-input"
                  placeholder="اكتب ملخص مختصر للمقال..."
                  required
                  maxLength={500}
                />
                <p className="text-xs text-accent-500 dark:text-dark-text-tertiary mt-1">
                  {formData.excerpt.length}/500 حرف
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                  محتوى المقال *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={15}
                  className="form-input"
                  placeholder="اكتب محتوى المقال هنا..."
                  required
                  minLength={100}
                />
                <p className="text-xs text-accent-500 dark:text-dark-text-tertiary mt-1">
                  {formData.content.length} حرف (الحد الأدنى: 100 حرف)
                </p>
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    فئة المقال *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    حالة المقال
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                  العلامات
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="اكتب العلامات مفصولة بفواصل (مثال: نوتيون، إنتاجية، تنظيم)"
                />
                <p className="text-xs text-accent-500 dark:text-dark-text-tertiary mt-1">
                  اكتب العلامات مفصولة بفواصل
                </p>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                  صورة المقال
                </label>
                <input
                  type="url"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-accent-500 dark:text-dark-text-tertiary mt-1">
                  رابط الصورة الرئيسية للمقال (اختياري)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 text-accent-600 dark:text-dark-text-secondary bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary py-3 px-6 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الإنشاء...</span>
                    </div>
                  ) : (
                    formData.status === 'published' ? 'إنشاء ونشر المقال' : 'إنشاء المقال'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={() => {
          setShowSuccessModal(false);
          router.push('/blog');
        }}
        title="تم إرسال المقال للمراجعة! ⏳"
        message="شكراً لك على مشاركة مقالك مع مجتمع نوتيون العرب. مقالك الآن في حالة 'قيد المراجعة' وسيتم مراجعته من قبل فريقنا المتخصص خلال 24-48 ساعة. سيتم إشعارك بالنتيجة عبر البريد الإلكتروني."
        continueButtonText="الذهاب للمدونة"
      />
    </div>
  );
}
