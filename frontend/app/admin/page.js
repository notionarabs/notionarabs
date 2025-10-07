'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { formatDate } from '../../lib/dateUtils';
import { useTheme } from '../../contexts/ThemeContext';
import ExportButton from '../../components/ExportButton';
import AdminNotifications from '../../components/AdminNotifications';
import { useAuthPersistence } from '../../hooks/useAuthPersistence';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { user: persistentUser, loading: persistentLoading } = useAuthPersistence();
  const router = useRouter();
  const { theme } = useTheme();

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
  }, [filterRole, filterStatus, sortBy, sortOrder]);

  // Debounced search effect
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      const timeoutId = setTimeout(() => {
        fetchUsers();
      }, 500); // 500ms delay for search

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole !== 'all') params.append('role', filterRole);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Set empty users array if API fails (API endpoint not implemented yet)
      setUsers([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if API fails (API endpoint not implemented yet)
      setStats({
        totalUsers: 0,
        googleUsers: 0,
        regularUsers: 0,
        activeUsers: 0,
        pendingApplications: 0,
        pendingTemplates: 0,
        pendingBlogs: 0,
        totalTemplates: 0,
        totalBlogs: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading || persistentLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300" dir="rtl">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="loading-text">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300" dir="rtl">
        <div className="text-center">
          <h1 className="heading-2 mb-4">غير مصرح لك بالوصول</h1>
          <p className="body-large">هذه الصفحة مخصصة للمديرين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border sticky top-0 z-50 shadow-medium dark:shadow-dark-medium backdrop-blur-sm bg-white/95 dark:bg-dark-secondary/95 transition-colors duration-300">
        <div className="container-custom flex justify-between items-center py-4">
          <h1 className="heading-2">لوحة الإدارة</h1>
          <div className="flex gap-3 items-center">
            <AdminNotifications />
            <ExportButton
              endpoint="/admin/export/users"
              filename={`users-data-${new Date().toISOString().split('T')[0]}.csv`}
              label="تصدير المستخدمين"
            />
            <Link href="/" className="nav-link">
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">إجمالي المستخدمين</h3>
              <p className="text-3xl font-bold text-primary-500 dark:text-orange-500">{stats.totalUsers}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">مستخدمي Google</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.googleUsers}</p>
              <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                {stats.totalUsers > 0 ? Math.round((stats.googleUsers / stats.totalUsers) * 100) : 0}% من إجمالي المستخدمين
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">مستخدمي البريد الإلكتروني</h3>
              <p className="text-3xl font-bold text-green-600">{stats.regularUsers}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">المستخدمين النشطين</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.activeUsers}</p>
            </div>
          </div>
        )}

        {/* Enhanced Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-secondary">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-accent-700 dark:text-dark-text-primary">{stats?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">+{stats?.recentUsers || 0}</span>
              <span className="text-accent-500 dark:text-dark-text-tertiary mr-2">هذا الأسبوع</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-secondary">القوالب المعلقة</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.pendingTemplates || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-accent-500 dark:text-dark-text-tertiary">من أصل {stats?.totalTemplates || 0}</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-secondary">المقالات المعلقة</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.pendingBlogs || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-accent-500 dark:text-dark-text-tertiary">من أصل {stats?.totalBlogs || 0}</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-secondary">طلبات المبدعين</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.pendingApplications || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-accent-500 dark:text-dark-text-tertiary">من أصل {stats?.approvedCreators || 0} مبدع</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/creator-applications" className="card-interactive p-6 group">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary">طلبات المبدعين</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary text-sm">مراجعة طلبات الانضمام كمبدع</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.pendingApplications || 0}</span>
              <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">طلب قيد المراجعة</p>
            </div>
          </Link>

          <Link href="/admin/templates" className="card-interactive p-6 group">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary">إدارة القوالب</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary text-sm">مراجعة وموافقة على القوالب</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.pendingTemplates || 0}</span>
              <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">قالب قيد المراجعة</p>
            </div>
          </Link>

          <Link href="/admin/blogs" className="card-interactive p-6 group">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary">إدارة المقالات</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary text-sm">مراجعة وموافقة على المقالات</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.pendingBlogs || 0}</span>
              <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">مقال قيد المراجعة</p>
            </div>
          </Link>

          <Link href="/admin/settings" className="card-interactive p-6 group">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary">إعدادات النظام</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary text-sm">إدارة إعدادات المنصة</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">⚙️</span>
              <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">الإعدادات</p>
            </div>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                البحث
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                نوع المستخدم
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="form-select"
              >
                <option value="all">جميع المستخدمين</option>
                <option value="admin">مدير</option>
                <option value="creator">مبدع</option>
                <option value="user">مستخدم عادي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                الحالة
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
              >
                <option value="all">جميع الحالات</option>
                <option value="admin">مدير</option>
                <option value="user">مستخدم</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                ترتيب حسب
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
                <option value="createdAt-desc">تاريخ الإنشاء (الأحدث)</option>
                <option value="createdAt-asc">تاريخ الإنشاء (الأقدم)</option>
                <option value="name-asc">الاسم (أ-ي)</option>
                <option value="name-desc">الاسم (ي-أ)</option>
                <option value="email-asc">البريد الإلكتروني (أ-ي)</option>
                <option value="email-desc">البريد الإلكتروني (ي-أ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-card-border">
            <h2 className="heading-3">قائمة المستخدمين</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-tertiary">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">الاسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">البريد الإلكتروني</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">نوع التسجيل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">تاريخ الإنشاء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-card-border">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-card-hover">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="mr-3">
                          <div className="text-sm font-medium text-accent-500 dark:text-dark-text-primary">{user.name}</div>
                          <div className="text-sm text-accent-600 dark:text-dark-text-secondary">ID: {user._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-600 dark:text-dark-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.googleId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          البريد الإلكتروني
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-600 dark:text-dark-text-secondary">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        }`}>
                        {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
