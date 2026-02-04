'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { formatDate } from '../../lib/dateUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthPersistence } from '../../hooks/useAuthPersistence';
import ExportButton from '../../components/ExportButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  Layout,
  Mail,
  Settings,
  Search,
  ArrowLeft,
  Download,
  Filter,
  CheckCircle,
  Clock,
  ExternalLink,
  Crown,
  TrendingUp,
  Activity
} from 'lucide-react';
import { BreadcrumbWrapper } from '../../components/Breadcrumb.js';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filteredUserCount, setFilteredUserCount] = useState(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { user: persistentUser, loading: persistentLoading } = useAuthPersistence();
  const router = useRouter();
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Don't redirect while authentication is still loading
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchUsers();
    fetchStats();
  }, [isAuthenticated, user, router, authLoading]);

  // Real-time updates for admin dashboard
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    let intervalId;
    const onFocus = () => {
      fetchStats();
      fetchUsers();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
        fetchUsers();
      }
    };

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        fetchStats();
        fetchUsers();
      }, 30000); // Poll every 30 seconds
    };

    startPolling();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isAuthenticated, user]);

  // Auto-apply filters when filter values change (except search term)
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [filterRole, sortBy, sortOrder]);

  // Debounced search effect
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      const timeoutId = setTimeout(() => {
        fetchUsers();
      }, 300); // reduced to 300ms for better responsiveness

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole !== 'all') params.append('role', filterRole);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      // Reduce limit on mobile for faster initial load
      params.append('limit', isMobile ? '15' : '50');

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users);

      // Update filtered user count based on API response for accuracy
      const { count } = response.data;
      if (typeof count === 'number') {
        setFilteredUserCount(count);
      } else {
        setFilteredUserCount(response.data.users?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setFilteredUserCount(0);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats', { timeout: 30000 }); // 30 second timeout
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if API fails
      setStats({
        totalUsers: 0,
        googleUsers: 0,
        regularUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        googleUsersPercentage: 0,
        pendingApplications: 0,
        approvedCreators: 0,
        rejectedApplications: 0,
        adminUsers: 0,
        regularUsers: 0,
        totalTemplates: 0,
        pendingTemplates: 0,
        approvedTemplates: 0,
        rejectedTemplates: 0,
        totalBlogs: 0,
        pendingBlogs: 0,
        publishedBlogs: 0,
        rejectedBlogs: 0,
        draftBlogs: 0,
        recentUsers: 0,
        recentTemplates: 0,
        recentBlogs: 0,
        unreadNotifications: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // CSV Export function for filtered users
  const exportUsersCSV = async () => {
    try {
      setExportLoading(true);

      // Fetch all users match existing filters without the default view limit
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole !== 'all') params.append('role', filterRole);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      // Request a high enough limit to get all filtered users (up to 2000 for safety)
      params.append('limit', Math.min(filteredUserCount || 1000, 2000).toString());

      const response = await api.get(`/admin/users?${params.toString()}`);
      const usersToExport = response.data.users || [];

      const csvData = usersToExport.map(user => ({
        id: user._id,
        name: user.name || '',
        username: user.username || '---',
        email: user.email || '',
        role: user.role === 'admin' ? 'مدير' : user.role === 'creator' ? 'مبدع' : 'مستخدم',
        creatorStatus: {
          'approved': 'مبدع معتمد',
          'pending': 'قيد المراجعة',
          'rejected': 'مرفوض',
          'none': '---'
        }[user.creatorStatus] || '---',
        registrationType: user.googleId ? 'Google' : 'البريد الإلكتروني',
        createdAt: formatDate(user.createdAt),
        verified: user.isEmailVerified ? 'مفعل' : 'غير مفعل',
        bio: (user.bio || '').replace(/\n/g, ' ')
      }));

      // Create CSV content
      const headers = ['المعرف', 'الاسم', 'اسم المستخدم', 'البريد الإلكتروني', 'نوع المستخدم', 'حالة المبدع', 'نوع التسجيل', 'تاريخ الإنشاء', 'تفعيل البريد', 'النبذة'];
      const csvContent = [
        headers.join(','),
        ...csvData.map(row =>
          Object.values(row).map(value =>
            `"${value.toString().replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\n');

      // Add BOM for proper Arabic display in Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      // Generate filename with current filters
      const filterSuffix = filterRole !== 'all' ? `_${filterRole}` : '';
      const searchSuffix = searchTerm ? `_search_${searchTerm.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
      const filename = `notion_arabs_users${filterSuffix}${searchSuffix}_${new Date().toISOString().split('T')[0]}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('حدث خطأ أثناء تصدير البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading || authLoading || persistentLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        <div className="container-custom pt-12">
          <div className="flex flex-col gap-8">
            <div className="h-8 bg-gray-200 dark:bg-dark-tertiary rounded-lg w-1/4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-dark-tertiary rounded-2xl animate-pulse"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-dark-tertiary rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white dark:bg-dark-secondary rounded-2xl shadow-large"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="heading-2 mb-4">غير مصرح لك بالوصول</h1>
          <p className="body-large mb-6">هذه الصفحة مخصصة للمديرين فقط</p>
          <Link href="/" className="btn-primary inline-flex">
            العودة للرئيسية
          </Link>
        </motion.div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: 'لوحة الإدارة', url: '/admin' }
  ];

  const statsCards = [
    {
      title: 'طلبات المبدعين',
      count: stats?.pendingApplications || 0,
      label: 'طلب قيد المراجعة',
      href: '/admin/creator-applications',
      icon: Users,
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'إدارة القوالب',
      count: stats?.pendingTemplates || 0,
      label: 'قالب قيد المراجعة',
      href: '/admin/templates',
      icon: Layout,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'إدارة المقالات',
      count: stats?.pendingBlogs || 0,
      label: 'مقال قيد المراجعة',
      href: '/admin/blogs',
      icon: FileText,
      color: 'green',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'إدارة المستخدمين',
      count: stats?.totalUsers || 0,
      label: 'إجمالي المستخدمين',
      href: '#users-list',
      icon: Crown,
      color: 'orange',
      gradient: 'from-orange-500 to-red-600',
    }
  ];

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 pb-20" dir="rtl">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary-500/5 dark:bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-accent-500/5 dark:bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header section with Breadcrumbs */}
      <div className="relative z-10">
        <BreadcrumbWrapper items={breadcrumbItems} />
      </div>

      <main className="container-custom relative z-10">
        {/* Page Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-100 dark:bg-orange-950/40 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary-600 dark:text-orange-500" />
              </div>
              <h1 className="heading-2 mb-0">لوحة الإدارة</h1>
            </div>
            <p className="text-accent-600 dark:text-dark-text-secondary pr-1">
              مرحباً بك في لوحة التحكم، يمكنك إدارة المستخدمين والمحتوى من هنا.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/email-import" className="btn-secondary py-2.5 px-5 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" />
              استيراد البريد
            </Link>
            <Link href="/admin/settings" className="btn-secondary py-2.5 px-5 text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              الإعدادات
            </Link>
            <Link href="/" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              عرض الموقع
            </Link>
          </div>
        </motion.div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsCards.map((card, index) => (
            <motion.div
              key={index}
              initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={isMobile ? { duration: 0 } : { delay: index * 0.1 }}
            >
              <Link href={card.href} className="group block h-full">
                <div className="h-full bg-white dark:bg-dark-secondary rounded-2xl p-6 border border-gray-200 dark:border-dark-card-border shadow-soft hover:shadow-large transition-all duration-300 relative overflow-hidden">
                  {/* Card Background Gradient Pattern */}
                  <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full`} />

                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/20 group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
                    </div>
                    {card.count > 0 && (
                      <span className="flex h-2 w-2 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${card.color}-400 opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 bg-${card.color}-500`}></span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-accent-500 dark:text-dark-text-tertiary mb-1">
                      {card.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-accent-500 dark:text-dark-text-primary">
                        {card.count}
                      </span>
                      <span className="text-xs text-accent-600 dark:text-dark-text-secondary font-medium">
                        {card.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-xs font-semibold text-accent-500 dark:text-dark-text-tertiary group-hover:text-primary-500 dark:group-hover:text-orange-500 transition-colors">
                    إدارة القسم
                    <ArrowLeft className="w-3 h-3 mr-1 transform rotate-180 group-hover:translate-x-[-4px] transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Search & Management Section */}
        <section id="users-list" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
            <h2 className="heading-3 mb-0">إدارة المستخدمين</h2>
          </div>

          {/* Filters Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/70 dark:bg-dark-secondary/70 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-200 dark:border-dark-card-border shadow-medium"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5 relative">
                <label className="form-label flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  البحث عن مستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="الاسم، البريد الإلكتروني، أو المعرف..."
                    className="form-input pr-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-400" />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="form-label flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  تصنيف المستخدمين
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="form-select"
                >
                  <option value="all">جميع المستخدمين</option>
                  <option value="admin">المديرين</option>
                  <option value="creator">المبدعين</option>
                  <option value="user">المستخدمين</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="form-label flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  ترتيب النتائج
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="form-select"
                >
                  <option value="createdAt-desc">الأحدث أولاً</option>
                  <option value="createdAt-asc">الأقدم أولاً</option>
                  <option value="name-asc">الاسم (أ - ي)</option>
                  <option value="name-desc">الاسم (ي - أ)</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                  }}
                  className="w-full h-[50px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-dark-tertiary dark:hover:bg-dark-quaternary rounded-xl transition-colors"
                  title="إعادة ضبط الفلاتر"
                >
                  <Activity className="w-5 h-5 text-accent-500" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Table Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-dark-secondary rounded-2xl border border-gray-200 dark:border-dark-card-border shadow-medium overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200 dark:border-dark-card-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-dark-tertiary/20">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 space-x-reverse">
                  {users.slice(0, 3).map((u, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-secondary bg-primary-500 overflow-hidden">
                      {u.profilePicture ? (
                        <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-white bg-gradient-to-br from-primary-500 to-orange-600">
                          {u.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                  {users.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-secondary bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center text-[10px] text-accent-500">
                      +{users.length - 3}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-accent-500 dark:text-dark-text-primary">
                  {filteredUserCount !== null ? `${filteredUserCount} مستخدم` : 'جاري التحميل...'}
                </h3>
              </div>

              <button
                onClick={exportUsersCSV}
                disabled={users.length === 0 || exportLoading}
                className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {exportLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exportLoading ? 'جاري التحضير...' : 'تصدير البيانات (CSV)'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-dark-tertiary/50">
                    <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">المستخدم</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">البريد الإلكتروني</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider hidden md:table-cell">المنصة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider hidden lg:table-cell">تاريخ الانضمام</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">الصلاحية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-card-border">
                  <AnimatePresence>
                    {usersLoading ? (
                      [...Array(5)].map((_, i) => (
                        <motion.tr
                          key={`skeleton-${i}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="animate-pulse"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-dark-tertiary rounded-xl" />
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-100 dark:bg-dark-tertiary rounded w-24" />
                                <div className="h-3 bg-gray-100 dark:bg-dark-tertiary rounded w-16" />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-100 dark:bg-dark-tertiary rounded w-32" />
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="h-6 bg-gray-100 dark:bg-dark-tertiary rounded-lg w-16" />
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className="h-4 bg-gray-100 dark:bg-dark-tertiary rounded w-24" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 bg-gray-100 dark:bg-dark-tertiary rounded-full w-12" />
                          </td>
                        </motion.tr>
                      ))
                    ) : users.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={isMobile ? { duration: 0 } : { delay: index * 0.05 }}
                        className="hover:bg-gray-50/80 dark:hover:bg-dark-card-hover transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-dark-card-border"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-soft">
                                  {user.name?.charAt(0)?.toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-accent-500 dark:text-dark-text-primary group-hover:text-primary-500 dark:group-hover:text-orange-500 transition-colors">
                                {user.name}
                                {user.username && (
                                  <span className="text-[10px] text-accent-400 dark:text-dark-text-quaternary mr-1">
                                    @{user.username}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-accent-400 dark:text-dark-text-quaternary font-mono">
                                {user._id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-accent-600 dark:text-dark-text-secondary flex items-center gap-2">
                            <Mail className="w-3 h-3 opacity-50" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          {user.googleId ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Google
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              البريد
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-accent-500 dark:text-dark-text-secondary flex items-center gap-2">
                            <Clock className="w-3 h-3 opacity-50" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : user.role === 'creator'
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                              : 'bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-tertiary'
                            }`}>
                            {user.role === 'admin' ? 'مدير' : user.role === 'creator' ? 'مبدع' : 'مستخدم'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {!loading && users.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-accent-200 dark:text-dark-text-quaternary" />
                </div>
                <h3 className="heading-3 mb-2">لا توجد نتائج</h3>
                <p className="body-large">لم نتمكن من العثور على أي مستخدمين يطابقون بحثك.</p>
              </div>
            )}

            <div className="px-6 py-4 bg-gray-50 dark:bg-dark-tertiary/20 text-center">
              <p className="text-xs text-accent-400 dark:text-dark-text-quaternary">
                {filteredUserCount > (isMobile ? 15 : 50)
                  ? `يتم عرض أول ${isMobile ? 15 : 50} مستخدم. استخدم البحث للعثور على مستخدمين محددين.`
                  : `يتم عرض ${users.length} مستخدم.`}
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
