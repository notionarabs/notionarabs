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
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowRight,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft,
  Layout,
  MessageCircle,
  MoreVertical,
  Calendar,
  User as UserIcon,
  Tag
} from 'lucide-react';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb.js';

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

  const breadcrumbItems = [
    { name: 'لوحة الإدارة', url: '/admin' },
    { name: 'إدارة المقالات', url: '/admin/blogs' }
  ];

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300 pb-20" dir="rtl">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-green-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] -left-[5%] w-[30%] h-[30%] bg-primary-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <BreadcrumbWrapper items={breadcrumbItems} />
      </div>

      <div className="container-custom relative z-10 pt-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-950/40 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-500" />
              </div>
              <h1 className="heading-2 mb-0">إدارة المقالات</h1>
            </div>
            <p className="text-accent-600 dark:text-dark-text-secondary pr-1">
              مراجعة وموافقة على المقالات المقدمة من المبدعين والتحقق من جودتها.
            </p>
          </div>

          <Link href="/admin" className="btn-secondary py-2.5 px-5 text-sm flex items-center gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" />
            العودة للوحة الإدارة
          </Link>
        </motion.div>

        {/* Bento Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'إجمالي المقالات', value: stats.totalBlogs || 0, color: 'blue', icon: Layout },
            { label: 'قيد المراجعة', value: stats.pendingBlogs || 0, color: 'yellow', icon: Clock, pulse: true },
            { label: 'منشور', value: stats.publishedBlogs || 0, color: 'green', icon: CheckCircle },
            { label: 'مرفوض', value: stats.rejectedBlogs || 0, color: 'red', icon: XCircle }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-dark-secondary rounded-2xl p-6 border border-gray-200 dark:border-dark-card-border shadow-soft relative overflow-hidden group"
            >
              <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-${item.color}-500 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full`} />
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2.5 rounded-xl bg-${item.color}-50 dark:bg-${item.color}-900/20`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                </div>
                {item.pulse && item.value > 0 && (
                  <span className="flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full bg-${item.color}-400 opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 bg-${item.color}-500`}></span>
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-accent-500 dark:text-dark-text-tertiary">{item.label}</p>
              <p className={`text-3xl font-bold text-accent-500 dark:text-dark-text-primary mt-1`}>
                {loading ? '...' : item.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filters Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/70 dark:bg-dark-secondary/70 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-200 dark:border-dark-card-border shadow-medium"
        >
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="w-full md:w-1/3">
              <label className="form-label flex items-center gap-2">
                <Filter className="w-4 h-4" />
                تصفية حسب الحالة
              </label>
              <select
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

            <div className="text-sm text-accent-500 dark:text-dark-text-secondary font-medium mb-3">
              عرض {blogs.length} من أصل {pagination.total || 0} مقال
            </div>
          </div>
        </motion.div>

        {/* Blogs Table Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-dark-secondary rounded-2xl border border-gray-200 dark:border-dark-card-border shadow-medium overflow-hidden mb-8"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-tertiary/50 border-b border-gray-100 dark:border-dark-card-border">
                  <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">المقال</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">المؤلف</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">التصنيف</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-card-border">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-8">
                        <div className="h-10 bg-gray-100 dark:bg-dark-tertiary rounded-xl w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : blogs.length > 0 ? (
                  blogs.map((blog, idx) => (
                    <motion.tr
                      key={blog._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gray-50/80 dark:hover:bg-dark-card-hover transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-dark-tertiary rounded-xl overflow-hidden relative border border-gray-100 dark:border-dark-card-border">
                            {blog.featuredImage ? (
                              <Image
                                src={blog.featuredImage}
                                alt={blog.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-accent-200 dark:text-dark-text-quaternary" />
                              </div>
                            )}
                          </div>
                          <div className="max-w-[200px]">
                            <p className="text-sm font-bold text-accent-500 dark:text-dark-text-primary truncate">
                              {blog.title}
                            </p>
                            <p className="text-[11px] text-accent-400 dark:text-dark-text-secondary line-clamp-1">
                              {blog.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden border border-white dark:border-dark-card-border">
                            {blog.author?.profilePicture ? (
                              <Image
                                src={blog.author.profilePicture}
                                alt=""
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            ) : (
                              <UserIcon className="w-4 h-4 text-primary-600" />
                            )}
                          </div>
                          <div className="text-xs font-medium text-accent-500 dark:text-dark-text-primary">
                            {blog.author?.name || 'مبدع غير معروف'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-dark-tertiary text-accent-500 dark:text-dark-text-primary border border-gray-200 dark:border-dark-card-border">
                          <Tag className="w-3 h-3" />
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const status = blog.status || 'draft';
                          const config = {
                            pending: { bg: 'bg-yellow-50', darkBg: 'bg-yellow-900/20', text: 'text-yellow-600', darkText: 'text-yellow-400', label: 'قيد المراجعة', icon: Clock },
                            published: { bg: 'bg-green-50', darkBg: 'bg-green-900/20', text: 'text-green-600', darkText: 'text-green-400', label: 'منشور', icon: CheckCircle },
                            rejected: { bg: 'bg-red-50', darkBg: 'bg-red-900/20', text: 'text-red-600', darkText: 'text-red-400', label: 'مرفوض', icon: XCircle },
                            draft: { bg: 'bg-gray-50', darkBg: 'bg-dark-tertiary', text: 'text-gray-500', darkText: 'text-dark-text-secondary', label: 'مسودة', icon: FileText }
                          }[status];

                          return (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${config.bg} dark:${config.darkBg} ${config.text} dark:${config.darkText}`}>
                              <config.icon className="w-3.5 h-3.5" />
                              {config.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-accent-500 dark:text-dark-text-secondary flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 opacity-50" />
                          {formatDate(blog.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(blog)}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors group/btn"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>

                          {blog.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(blog._id, 'published')}
                                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors group/btn"
                                title="موافقة"
                              >
                                <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(blog._id, 'rejected')}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors group/btn"
                                title="رفض"
                              >
                                <XCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              </button>
                            </>
                          )}

                          {blog.status === 'published' && (
                            <button
                              onClick={() => handleStatusChange(blog._id, 'rejected')}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-tertiary text-accent-500 dark:text-dark-text-secondary rounded-lg transition-colors group/btn"
                              title="إلغاء النشر"
                            >
                              <XCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          )}

                          {blog.status === 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(blog._id, 'published')}
                              className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors group/btn"
                              title="موافقة مجدداً"
                            >
                              <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="w-20 h-20 bg-gray-50 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-accent-200 dark:text-dark-text-quaternary" />
                      </div>
                      <h3 className="heading-3 mb-2">لا توجد مقالات</h3>
                      <p className="body-large">لم يتم العثور على أي مقالات حسب الفلتر المختار.</p>
                      <button
                        onClick={() => setSelectedStatus('all')}
                        className="mt-4 text-primary-500 font-bold hover:underline"
                      >
                        إزالة الفلاتر
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination Section */}
        {pagination.pages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center gap-1 bg-white dark:bg-dark-secondary p-1.5 rounded-2xl border border-gray-200 dark:border-dark-card-border shadow-soft">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-xl disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1 px-4">
                <span className="text-sm font-bold text-accent-500 dark:text-dark-text-primary">
                  {pagination.current}
                </span>
                <span className="text-sm text-accent-400">/</span>
                <span className="text-sm text-accent-400">
                  {pagination.pages}
                </span>
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-xl disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Confirmation Modal Redesigned */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-dark-secondary rounded-3xl p-8 max-w-md w-full relative z-10 shadow-large"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${newStatus === 'published' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                {newStatus === 'published' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>

              <h3 className="text-2xl font-bold text-center text-accent-500 dark:text-dark-text-primary mb-2">
                {newStatus === 'published' ? 'الموافقة على المقال' : 'رفض المقال'}
              </h3>
              <p className="text-center text-accent-600 dark:text-dark-text-secondary mb-8">
                {newStatus === 'published'
                  ? 'هل أنت متأكد من الموافقة على نشر هذا المقال؟ سيظهر لجميع المستخدمين فوراً.'
                  : 'هل أنت متأكد من رفض هذا المقال؟ يمكنك كتابة ملاحظات للمبدع.'}
              </p>

              <div className="mb-8">
                <label className="form-label">ملاحظات الإدارة (اختياري)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="اكتب سبب الرفض أو أي ملاحظات إدارية هنا..."
                  rows={3}
                  className="form-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary py-3 px-6"
                  disabled={actionLoading}
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmStatusChange}
                  className={`${newStatus === 'published' ? 'btn-primary bg-green-500 hover:bg-green-600' : 'btn-primary bg-red-500 hover:bg-red-600 pulse-glow'} py-3 px-6`}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'جاري المعالجة...' : 'تأكيد الإجراء'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blog Details Modal Redesigned */}
      <AnimatePresence>
        {showDetailsModal && selectedBlogDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-dark-secondary rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden relative z-10 shadow-large border border-gray-100 dark:border-dark-card-border"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-100 dark:border-dark-card-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-tertiary/20 backdrop-blur-sm">
                <div>
                  <h3 className="text-xl font-bold text-accent-500 dark:text-dark-text-primary">
                    تفاصيل المقال
                  </h3>
                  <p className="text-xs text-accent-400 dark:text-dark-text-tertiary mt-0.5">
                    معلومات كاملة عن المقال المقدم للمراجعة
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6 text-accent-400" />
                </button>
              </div>

              {/* Modal Content Scrollable */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Main Article Content */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Header Image or Placeholder */}
                    <div className="rounded-3xl overflow-hidden aspect-video relative border border-gray-100 dark:border-dark-card-border shadow-medium">
                      {selectedBlogDetails.featuredImage ? (
                        <Image
                          src={selectedBlogDetails.featuredImage}
                          alt={selectedBlogDetails.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-dark-tertiary flex flex-col items-center justify-center gap-4">
                          <FileText className="w-16 h-16 text-accent-200 dark:text-dark-text-quaternary" />
                          <p className="text-sm font-medium text-accent-400">لا توجد صورة بارزة</p>
                        </div>
                      )}
                    </div>

                    {/* Title & Meta */}
                    <div>
                      <h1 className="text-3xl font-bold text-accent-500 dark:text-dark-text-primary leading-tight mb-4">
                        {selectedBlogDetails.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                          <Tag className="w-3.5 h-3.5" />
                          {selectedBlogDetails.category}
                        </span>
                        <div className="h-4 w-px bg-gray-200 dark:bg-dark-card-border" />
                        <div className="flex items-center gap-1.5 text-xs text-accent-400">
                          <Clock className="w-3.5 h-3.5" />
                          {selectedBlogDetails.readTime || 5} دقائق قراءة
                        </div>
                        <div className="h-4 w-px bg-gray-200 dark:bg-dark-card-border" />
                        <div className="flex items-center gap-1.5 text-xs text-accent-400">
                          <Calendar className="w-3.5 h-3.5" />
                          نشر في {formatDate(selectedBlogDetails.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Excerpt */}
                    {selectedBlogDetails.excerpt && (
                      <div className="p-6 bg-gray-50 dark:bg-dark-tertiary/30 rounded-3xl border-r-4 border-primary-500">
                        <p className="text-accent-600 dark:text-dark-text-secondary leading-relaxed font-medium italic">
                          "{selectedBlogDetails.excerpt}"
                        </p>
                      </div>
                    )}

                    {/* Full Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <div
                        className="text-accent-700 dark:text-dark-text-secondary leading-loose whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: selectedBlogDetails.content }}
                      />
                    </div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    {/* Author Box */}
                    <div className="bg-white dark:bg-dark-tertiary/20 rounded-3xl p-6 border border-gray-100 dark:border-dark-card-border shadow-soft">
                      <h4 className="text-sm font-bold text-accent-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        المؤلف
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden border-2 border-white dark:border-dark-card-border shadow-medium">
                          {selectedBlogDetails.author?.profilePicture ? (
                            <Image
                              src={selectedBlogDetails.author.profilePicture}
                              alt=""
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-primary-600">
                              {selectedBlogDetails.author?.name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-accent-500 dark:text-dark-text-primary">
                            {selectedBlogDetails.author?.name}
                          </p>
                          <p className="text-xs text-accent-400 truncate max-w-[150px]">
                            {selectedBlogDetails.author?.email}
                          </p>
                        </div>
                      </div>
                      {selectedBlogDetails.author?.bio && (
                        <p className="mt-4 text-xs text-accent-500 dark:text-dark-text-secondary leading-relaxed line-clamp-3">
                          {selectedBlogDetails.author.bio}
                        </p>
                      )}
                    </div>

                    {/* Article Details Box */}
                    <div className="bg-white dark:bg-dark-tertiary/20 rounded-3xl p-6 border border-gray-100 dark:border-dark-card-border shadow-soft">
                      <h4 className="text-sm font-bold text-accent-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        إحصائيات وبيانات
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-card-border">
                          <span className="text-xs text-accent-400">الحالة الحالية</span>
                          <span className="text-xs font-bold text-primary-500">{getStatusBadge(selectedBlogDetails.status).props.children}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-card-border">
                          <span className="text-xs text-accent-400">المشاهدات</span>
                          <span className="text-xs font-bold text-accent-500 dark:text-dark-text-primary">{selectedBlogDetails.views || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-card-border">
                          <span className="text-xs text-accent-400">التعليقات</span>
                          <span className="text-xs font-bold text-accent-500 dark:text-dark-text-primary">{selectedBlogDetails.commentsCount || 0}</span>
                        </div>
                      </div>

                      {selectedBlogDetails.tags && selectedBlogDetails.tags.length > 0 && (
                        <div className="mt-6">
                          <p className="text-[10px] font-bold text-accent-400 uppercase tracking-widest mb-3">الوسوم</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedBlogDetails.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-dark-tertiary rounded-lg text-[10px] text-accent-500 dark:text-dark-text-secondary">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Admin Notes Box */}
                    {selectedBlogDetails.adminNotes && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-3xl p-6 border border-yellow-100 dark:border-yellow-900/20 shadow-soft">
                        <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          ملاحظات إدارية
                        </h4>
                        <p className="text-xs text-yellow-800/80 dark:text-yellow-400/80 leading-relaxed italic">
                          "{selectedBlogDetails.adminNotes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-gray-100 dark:border-dark-card-border flex justify-end gap-4 bg-gray-50/50 dark:bg-dark-tertiary/20 backdrop-blur-sm">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-secondary py-2.5 px-8"
                >
                  إغلاق
                </button>
                {selectedBlogDetails.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleStatusChange(selectedBlogDetails._id, 'published');
                    }}
                    className="btn-primary py-2.5 px-8"
                  >
                    الموافقة الآن
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
