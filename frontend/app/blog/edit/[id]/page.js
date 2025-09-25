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
  { name: "الحياة الشخصية", value: "الحياة الشخصية" },
  { name: "الإبداع", value: "الإبداع" },
  { name: "التقنية", value: "التقنية" },
  { name: "الصحة", value: "الصحة" },
  { name: "المالية", value: "المالية" },
  { name: "التنظيم", value: "التنظيم" },
  { name: "التخطيط", value: "التخطيط" },
  { name: "تعليم", value: "تعليم" }
];

const statusOptions = [
  { name: "مسودة", value: "draft" },
  { name: "مراجعة", value: "pending" }
];

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id;
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: categories[0].value,
    tags: '',
    featuredImage: '',
    status: 'draft'
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

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
          <h1 className="heading-1 text-white mb-4">تعديل المقال</h1>
          <p className="body-large text-primary-100 dark:text-dark-text-secondary max-w-2xl mx-auto">
            قم بتعديل مقالك وإرساله للمراجعة من قبل الإدارة
          </p>
        </div>
      </section>

      {/* Blog Edit Form */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium p-6 md:p-8">
            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                عنوان المقال <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="اكتب عنوان المقال هنا..."
                required
                maxLength={200}
              />
              <p className="text-xs text-accent-400 dark:text-dark-text-tertiary mt-1 text-left">
                {formData.title.length}/200 حرف
              </p>
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <label htmlFor="excerpt" className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                ملخص المقال <span className="text-red-500">*</span>
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="form-input"
                placeholder="اكتب ملخصاً قصيراً وجذاباً للمقال (سيظهر في صفحة المدونة)..."
                required
                maxLength={500}
              />
              <p className="text-xs text-accent-400 dark:text-dark-text-tertiary mt-1 text-left">
                {formData.excerpt.length}/500 حرف
              </p>
            </div>

            {/* Content */}
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                محتوى المقال <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={15}
                className="form-input"
                placeholder="اكتب محتوى المقال بالتفصيل هنا..."
                required
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                فئة المقال <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label htmlFor="tags" className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                العلامات (Tags)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="form-input"
                placeholder="نوشن, إنتاجية, تنظيم (افصل بينها بفاصلة)"
              />
              <p className="text-xs text-accent-400 dark:text-dark-text-tertiary mt-1">
                افصل بين العلامات بفاصلة (مثال: نوشن, إنتاجية, تنظيم)
              </p>
            </div>

            {/* Featured Image URL */}
            <div className="mb-6">
              <label htmlFor="featuredImage" className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                رابط الصورة المميزة
              </label>
              <input
                type="url"
                id="featuredImage"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-accent-400 dark:text-dark-text-tertiary mt-1">
                رابط مباشر للصورة التي ستظهر كصورة مميزة للمقال.
              </p>
            </div>

            {/* Status */}
            <div className="mb-8">
              <label htmlFor="status" className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                حالة المقال <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-accent-400 dark:text-dark-text-tertiary mt-1">
                المقالات المنشورة تحتاج إلى موافقة الإدارة.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="btn-primary flex-1 py-3 text-lg"
                disabled={submitting}
              >
                {submitting ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div> : 'حفظ التغييرات'}
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
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={() => {
          setShowSuccessModal(false);
          router.push('/profile/my-blogs');
        }}
        title="تم تحديث المقال بنجاح! ✅"
        message="تم حفظ التغييرات على مقالك بنجاح. إذا قمت بتغيير الحالة إلى 'مراجعة'، فسيتم إرساله للمراجعة من قبل الإدارة."
        continueButtonText="العودة لصفحة مقالاتي"
      />
    </div>
  );
}
