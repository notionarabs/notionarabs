'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

const statusOptions = [
  { name: 'الكل', value: 'all' },
  { name: 'قيد المراجعة', value: 'pending' },
  { name: 'منشور', value: 'published' },
  { name: 'مرفوض', value: 'rejected' },
  { name: 'مسودة', value: 'draft' }
];

export default function AdminBlogsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBlogDetails, setSelectedBlogDetails] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      showError('غير مصرح لك بالوصول لهذه الصفحة.');
      router.push('/');
    }
  }, [user, authLoading, router, showError]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBlogs();
      fetchStats();
    }
  }, [selectedStatus, currentPage, user]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await api.get(`/admin/blogs?${params.toString()}`);

      if (response.data.success) {
        setBlogs(response.data.blogs);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      // Set empty state if API fails (API endpoint not implemented yet)
      setBlogs([]);
      setPagination({ currentPage: 1, totalPages: 0, totalItems: 0, hasNext: false, hasPrev: false });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/blog-stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if API fails (API endpoint not implemented yet)
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    }
  };

  const handleStatusChange = (blogId, status) => {
    setSelectedBlog(blogId);
    setNewStatus(status);
    setAdminNotes('');
    setShowModal(true);
    setActionLoading(false);
  };

  const handleViewDetails = (blog) => {
    setSelectedBlogDetails(blog);
    setShowDetailsModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedBlog) return;

    try {
      setActionLoading(true);
      const response = await api.put(`/admin/blogs/${selectedBlog}/status`, {
        status: newStatus,
        adminNotes: adminNotes.trim() || undefined
      });

      if (response.data.success) {
        showSuccess(response.data.message);
        setShowModal(false);
        fetchBlogs();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating blog status:', error);
      showError('فشل في تحديث حالة المقال');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'قيد المراجعة' },
      published: { color: 'bg-green-100 text-green-800', text: 'منشور' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'مرفوض' },
      draft: { color: 'bg-gray-100 text-gray-800', text: 'مسودة' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStatusActions = (blog) => {
    const actions = [];

    // View Details button (always available)
    actions.push(
      <button
        key="view-details"
        onClick={() => handleViewDetails(blog)}
        className="btn-outline text-sm px-3 py-1 text-blue-600 border-blue-600 hover:bg-blue-50"
      >
        عرض التفاصيل
      </button>
    );

    // Status-specific actions
    if (blog.status === 'pending') {
      actions.push(
        <button
          key="approve"
          onClick={() => handleStatusChange(blog._id, 'published')}
          className="btn-primary text-sm px-3 py-1"
        >
          موافقة
        </button>
      );
      actions.push(
        <button
          key="reject"
          onClick={() => handleStatusChange(blog._id, 'rejected')}
          className="btn-outline text-sm px-3 py-1 text-red-600 border-red-600 hover:bg-red-50"
        >
          رفض
        </button>
      );
    } else if (blog.status === 'rejected') {
      actions.push(
        <button
          key="approve"
          onClick={() => handleStatusChange(blog._id, 'published')}
          className="btn-primary text-sm px-3 py-1"
        >
          موافقة
        </button>
      );
    } else if (blog.status === 'published') {
      actions.push(
        <button
          key="reject"
          onClick={() => handleStatusChange(blog._id, 'rejected')}
          className="btn-outline text-sm px-3 py-1 text-red-600 border-red-600 hover:bg-red-50"
        >
          رفض
        </button>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {actions}
      </div>
    );
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
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="heading-1 mb-2">إدارة المقالات</h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">
                مراجعة وموافقة على المقالات المقدمة من المبدعين
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="btn-outline"
              >
                العودة للوحة الإدارة
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-interactive p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">إجمالي المقالات</p>
                <p className="text-2xl font-bold text-accent-900 dark:text-dark-text-primary">
                  {stats.totalBlogs || 0}
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
                  {stats.pendingBlogs || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card-interactive p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">منشور</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.publishedBlogs || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card-interactive p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-1">مرفوض</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejectedBlogs || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-interactive p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <label htmlFor="status-filter" className="text-sm font-medium text-accent-700 dark:text-dark-text-primary">
                فلترة حسب الحالة:
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-accent-600 dark:text-dark-text-secondary">
              <span>عرض {blogs.length} من {pagination.total} مقال</span>
            </div>
          </div>
        </div>

        {/* Blogs Table */}
        <div className="card-interactive overflow-hidden">
          {loading ? (
            <div className="p-8">
              <LoadingIndicator />
            </div>
          ) : blogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-tertiary">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      المقال
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      المؤلف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      الفئة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-card-border">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-dark-tertiary rounded-lg flex items-center justify-center overflow-hidden">
                            {blog.featuredImage ? (
                              <Image
                                src={blog.featuredImage}
                                alt={blog.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-accent-900 dark:text-dark-text-primary line-clamp-1">
                              {blog.title}
                            </p>
                            <p className="text-xs text-accent-600 dark:text-dark-text-secondary line-clamp-1">
                              {blog.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                            {blog.author?.profilePicture ? (
                              <Image
                                src={blog.author.profilePicture}
                                alt={`صورة ${blog.author.name}`}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                quality={100}
                              />
                            ) : (
                              <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                                {blog.author?.name?.charAt(0) || 'م'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-accent-900 dark:text-dark-text-primary">
                              {blog.author?.name || 'غير معروف'}
                            </p>
                            <p className="text-xs text-accent-600 dark:text-dark-text-secondary">
                              {blog.author?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded-full">
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(blog.status)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                          {formatDate(blog.createdAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusActions(blog)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 dark:text-dark-text-quaternary mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                لا توجد مقالات
              </h3>
              <p className="text-accent-600 dark:text-dark-text-secondary">
                لم يتم العثور على مقالات تطابق المعايير المحددة
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>

              <span className="px-4 py-2 text-sm text-accent-600 dark:text-dark-text-secondary">
                صفحة {pagination.current} من {pagination.pages}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-4">
              {newStatus === 'published' ? 'موافقة على المقال' : 'رفض المقال'}
            </h3>

            <div className="mb-4">
              <label htmlFor="admin-notes" className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                ملاحظات الإدارة (اختياري)
              </label>
              <textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="form-input"
                placeholder="اكتب ملاحظاتك هنا..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="btn-outline"
                disabled={actionLoading}
              >
                إلغاء
              </button>
              <button
                onClick={confirmStatusChange}
                className={`${newStatus === 'published' ? 'btn-primary' : 'btn-danger'}`}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <LoadingIndicator small />
                ) : (
                  newStatus === 'published' ? 'موافقة' : 'رفض'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Details Modal */}
      {showDetailsModal && selectedBlogDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-card-border flex justify-between items-center">
              <h3 className="text-xl font-semibold text-accent-900 dark:text-dark-text-primary">
                تفاصيل المقال
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-text-secondary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Blog Title and Meta */}
                  <div>
                    <h1 className="text-2xl font-bold text-accent-900 dark:text-dark-text-primary mb-4">
                      {selectedBlogDetails.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedBlogDetails.status).props.className}`}>
                        {getStatusBadge(selectedBlogDetails.status).props.children}
                      </span>
                      <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                        تاريخ الإنشاء: {formatDate(selectedBlogDetails.createdAt)}
                      </span>
                      {selectedBlogDetails.updatedAt && (
                        <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                          آخر تحديث: {formatDate(selectedBlogDetails.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Featured Image */}
                  {selectedBlogDetails.featuredImage && (
                    <div className="rounded-lg overflow-hidden">
                      <Image
                        src={selectedBlogDetails.featuredImage}
                        alt={selectedBlogDetails.title}
                        width={800}
                        height={400}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Excerpt */}
                  {selectedBlogDetails.excerpt && (
                    <div>
                      <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                        الملخص
                      </h3>
                      <p className="text-accent-700 dark:text-dark-text-secondary leading-relaxed">
                        {selectedBlogDetails.excerpt}
                      </p>
                    </div>
                  )}

                  {/* Content */}
                  {selectedBlogDetails.content && (
                    <div>
                      <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-3">
                        المحتوى
                      </h3>
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <div
                          className="text-accent-700 dark:text-dark-text-secondary leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: selectedBlogDetails.content }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Author Info */}
                  <div className="card p-4">
                    <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-4">
                      معلومات المؤلف
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                        {selectedBlogDetails.author?.profilePicture ? (
                          <Image
                            src={selectedBlogDetails.author.profilePicture}
                            alt={`صورة ${selectedBlogDetails.author.name}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            quality={100}
                          />
                        ) : (
                          <span className="text-primary-600 dark:text-primary-400 font-medium text-lg">
                            {selectedBlogDetails.author?.name?.charAt(0) || 'م'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-accent-900 dark:text-dark-text-primary">
                          {selectedBlogDetails.author?.name || 'غير معروف'}
                        </p>
                        <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                          {selectedBlogDetails.author?.email}
                        </p>
                        {selectedBlogDetails.author?.bio && (
                          <p className="text-xs text-accent-500 dark:text-dark-text-tertiary mt-1 line-clamp-2">
                            {selectedBlogDetails.author.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Blog Metadata */}
                  <div className="card p-4">
                    <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-4">
                      معلومات المقال
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-accent-600 dark:text-dark-text-secondary">
                          الفئة
                        </label>
                        <p className="text-accent-900 dark:text-dark-text-primary">
                          {selectedBlogDetails.category}
                        </p>
                      </div>

                      {selectedBlogDetails.tags && selectedBlogDetails.tags.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-accent-600 dark:text-dark-text-secondary">
                            العلامات
                          </label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedBlogDetails.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedBlogDetails.readTime && (
                        <div>
                          <label className="text-sm font-medium text-accent-600 dark:text-dark-text-secondary">
                            وقت القراءة
                          </label>
                          <p className="text-accent-900 dark:text-dark-text-primary">
                            {selectedBlogDetails.readTime} دقيقة
                          </p>
                        </div>
                      )}

                      {selectedBlogDetails.views && (
                        <div>
                          <label className="text-sm font-medium text-accent-600 dark:text-dark-text-secondary">
                            المشاهدات
                          </label>
                          <p className="text-accent-900 dark:text-dark-text-primary">
                            {selectedBlogDetails.views}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {selectedBlogDetails.adminNotes && (
                    <div className="card p-4">
                      <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-4">
                        ملاحظات الإدارة
                      </h3>
                      <p className="text-accent-700 dark:text-dark-text-secondary text-sm">
                        {selectedBlogDetails.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-card-border flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-primary"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
