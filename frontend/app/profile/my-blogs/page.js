'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ExportButton from '../../../components/ExportButton';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import Navigation from '../../../components/Navigation';

const statusConfig = {
  draft: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    text: 'مسودة',
    icon: '📝'
  },
  pending: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    text: 'قيد المراجعة',
    icon: '⏳'
  },
  published: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    text: 'منشور',
    icon: '✅'
  },
  rejected: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    text: 'مرفوض',
    icon: '❌'
  }
};

export default function MyBlogsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.creatorStatus !== 'approved')) {
      showError('غير مصرح لك بالوصول لهذه الصفحة.');
      router.push('/creators/apply');
    }
  }, [user, authLoading, router, showError]);

  useEffect(() => {
    if (user?.creatorStatus === 'approved') {
      fetchMyBlogs();
    }
  }, [user]);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/blogs/user/my-blogs');

      if (response.data.success) {
        setBlogs(response.data.blogs);
      } else {
        setError('فشل في تحميل مقالاتك');
        showError('فشل في تحميل مقالاتك');
      }
    } catch (error) {
      console.error('Error fetching my blogs:', error);
      setError('فشل في تحميل مقالاتك');
      showError('فشل في تحميل مقالاتك');
    } finally {
      setLoading(false);
    }
  };

  const submitForReview = async (blogId) => {
    try {
      const response = await api.put(`/blogs/${blogId}`, {
        status: 'pending'
      });

      if (response.data.success) {
        showSuccess('تم إرسال المقال للمراجعة بنجاح!');
        fetchMyBlogs(); // Refresh the list
      }
    } catch (error) {
      console.error('Error submitting blog for review:', error);
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('فشل في إرسال المقال للمراجعة');
      }
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getStatusMessage = (status, adminNotes) => {
    switch (status) {
      case 'draft':
        return 'المقال محفوظ كمسودة ولم يتم إرساله للمراجعة بعد.';
      case 'pending':
        return 'المقال قيد المراجعة من قبل فريقنا المتخصص. سيتم إشعارك بالنتيجة قريباً.';
      case 'published':
        return 'تم الموافقة على المقال ونشره بنجاح! يمكنك مشاهدته في صفحة المدونة.';
      case 'rejected':
        return adminNotes ? `تم رفض المقال: ${adminNotes}` : 'تم رفض المقال من قبل فريق المراجعة.';
      default:
        return '';
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-primary">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      <Navigation activePage="profile" />
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 mb-2">مقالاتي</h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">
                تتبع حالة مقالاتك المرسلة والمقبولة
              </p>
            </div>
            <div className="flex gap-3">
              <ExportButton
                endpoint={`/blogs/export-public?token=${typeof window !== 'undefined' ? (require('js-cookie').get('authToken') || '') : ''}`}
                filename={`${(user?.username || (user?.email ? user.email.split('@')[0] : 'blogs'))}-blogs-${new Date().toISOString().split('T')[0]}.csv`}
                label="تصدير مقالاتي"
                direct={true}
              />
              <Link
                href="/blog/create"
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                مقال جديد
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-interactive p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">إجمالي المقالات</p>
                  <p className="text-2xl font-bold text-accent-900 dark:text-dark-text-primary">
                    {blogs.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card-interactive p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">قيد المراجعة</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {blogs.filter(blog => blog.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="card-interactive p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">منشور</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {blogs.filter(blog => blog.status === 'published').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="card-interactive p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">مرفوض</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {blogs.filter(blog => blog.status === 'rejected').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blogs List */}
          <div className="card-interactive overflow-hidden">
            {loading ? (
              <div className="p-8">
                <LoadingIndicator />
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-red-400 dark:text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                  خطأ في تحميل المقالات
                </h3>
                <p className="text-accent-600 dark:text-dark-text-secondary mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchMyBlogs}
                  className="btn-primary"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : blogs.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-accent-400 dark:text-dark-text-quaternary mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                  لا توجد مقالات بعد
                </h3>
                <p className="text-accent-600 dark:text-dark-text-secondary mb-6">
                  ابدأ بإنشاء أول مقال لك ومشاركته مع مجتمع نوشن العرب
                </p>
                <Link href="/blog/create" className="btn-primary">
                  إنشاء مقال جديد
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-dark-card-border">
                {blogs.map((blog) => (
                  <div key={blog._id} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusBadge(blog.status)}
                          <span className="text-sm text-accent-500 dark:text-dark-text-tertiary">
                            {formatDate(blog.createdAt)}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                          {blog.title}
                        </h3>

                        <p className="text-accent-600 dark:text-dark-text-secondary mb-3 line-clamp-2">
                          {blog.excerpt}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-accent-500 dark:text-dark-text-tertiary mb-3">
                          <div className="flex flex-wrap gap-1">
                            {(blog.categories && blog.categories.length > 0 ? blog.categories : [blog.category]).slice(0, 2).map((category, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded-full text-xs">
                                {category}
                              </span>
                            ))}
                            {((blog.categories && blog.categories.length > 2) || (!blog.categories && blog.category)) && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded-full text-xs">
                                +{((blog.categories && blog.categories.length) || 1) - 2} أخرى
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            {blog.views || 0} مشاهدة
                          </span>
                          {blog.publishedAt && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              منشور في {formatDate(blog.publishedAt)}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                          {getStatusMessage(blog.status, blog.adminNotes)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {blog.status === 'published' && (
                          <Link
                            href={`/blog/${blog.slug}`}
                            className="btn-outline text-sm"
                          >
                            عرض المقال
                          </Link>
                        )}
                        {blog.status === 'draft' && (
                          <>
                            <Link
                              href={`/blog/edit/${blog._id}`}
                              className="btn-outline text-sm"
                            >
                              تعديل
                            </Link>
                            <button
                              onClick={() => submitForReview(blog._id)}
                              className="btn-primary text-sm"
                            >
                              إرسال للمراجعة
                            </button>
                          </>
                        )}
                        {(blog.status === 'rejected' || blog.status === 'pending') && (
                          <Link
                            href={`/blog/edit/${blog._id}`}
                            className="btn-outline text-sm"
                          >
                            تعديل وإعادة الإرسال
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
