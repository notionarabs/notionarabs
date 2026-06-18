'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Layout,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb.js';
import { getApiBaseUrl } from '../../../lib/apiConfig';

// Import subcomponents
import ConfirmationModal from './components/ConfirmationModal';
import BlogDetailsModal from './components/BlogDetailsModal';
import BlogTable from './components/BlogTable';
import BlogFilters from './components/BlogFilters';

const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const apiBase = getApiBaseUrl();
  const backendBase = apiBase.replace(/\/api\/?$/, '');

  if (trimmed.startsWith('http://localhost:5000') || trimmed.startsWith('http://127.0.0.1:5000')) {
    return trimmed.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/, backendBase);
  }

  if (/^(https?:)?\/\//i.test(trimmed) || /^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) {
    return trimmed;
  }

  const absoluteBase = typeof window !== 'undefined' ? window.location.origin : backendBase;
  if (trimmed.startsWith('/')) {
    return `${absoluteBase}${trimmed}`;
  }

  return `${absoluteBase}/${trimmed}`;
};

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
    if (!authLoading && (!user || user.role?.toLowerCase() !== 'admin')) {
      showError('غير مصرح لك بالوصول لهذه الصفحة.');
      router.push('/');
    }
  }, [user, authLoading, router, showError]);

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'admin') {
      fetchBlogs();
      fetchStats();
    }
  }, [selectedStatus, currentPage, user]);

  const fetchBlogs = useCallback(async () => {
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
      setBlogs([]);
      setPagination({ current: 1, pages: 0, total: 0, limit: 10 });
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/admin/blog-stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    }
  }, []);

  const handleStatusChange = useCallback((blogId, status) => {
    setSelectedBlog(blogId);
    setNewStatus(status);
    setAdminNotes('');
    setShowModal(true);
    setActionLoading(false);
  }, []);

  const handleViewDetails = useCallback((blog) => {
    setSelectedBlogDetails(blog);
    setShowDetailsModal(true);
  }, []);

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
        <BlogFilters
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          setCurrentPage={setCurrentPage}
          statusOptions={statusOptions}
          blogsLength={blogs.length}
          totalBlogs={pagination.total || 0}
        />

        {/* Blogs Table Card */}
        <BlogTable
          blogs={blogs}
          loading={loading}
          handleViewDetails={handleViewDetails}
          handleStatusChange={handleStatusChange}
          formatDate={formatDate}
          normalizeImageUrl={normalizeImageUrl}
          setSelectedStatus={setSelectedStatus}
        />

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

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        newStatus={newStatus}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        confirmStatusChange={confirmStatusChange}
        actionLoading={actionLoading}
      />

      <BlogDetailsModal
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        selectedBlogDetails={selectedBlogDetails}
        handleStatusChange={handleStatusChange}
        normalizeImageUrl={normalizeImageUrl}
        formatDate={formatDate}
      />
    </main>
  );
}
