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

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filteredUserCount, setFilteredUserCount] = useState(null);
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
  }, [filterRole, sortBy, sortOrder]);

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
      setFilteredUserCount(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole !== 'all') params.append('role', filterRole);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users);

      // Update filtered user count based on API response for accuracy
      const { count, users: responseUsers } = response.data;
      if (typeof count === 'number') {
        setFilteredUserCount(count);
      } else if (Array.isArray(responseUsers)) {
        setFilteredUserCount(responseUsers.length);
      } else {
        setFilteredUserCount(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Set empty users array if API fails (API endpoint not implemented yet)
      setUsers([]);
      setFilteredUserCount(0);
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
  const exportUsersCSV = () => {
    const csvData = users.map(user => ({
      name: user.name || '',
      email: user.email || '',
      role: user.role === 'admin' ? 'مدير' : user.role === 'creator' ? 'مبدع' : 'مستخدم',
      registrationType: user.googleId ? 'Google' : 'البريد الإلكتروني',
      createdAt: formatDate(user.createdAt),
      status: user.verified ? 'مفعل' : 'غير مفعل'
    }));

    // Create CSV content
    const headers = ['الاسم', 'البريد الإلكتروني', 'نوع المستخدم', 'نوع التسجيل', 'تاريخ الإنشاء', 'الحالة'];
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
    const filename = `users_export${filterSuffix}${searchSuffix}_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (loading || authLoading || persistentLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
          <div className="container-custom py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="flex-1 animate-pulse">
                <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32 sm:w-48"></div>
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 sm:w-64"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8 sm:py-12">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6 mb-6 sm:mb-8 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
              <div className="w-full sm:w-auto">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="w-full sm:w-auto">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
              </div>
              <div className="w-full sm:w-auto">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-16"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          </div>

          {/* Users Table Skeleton */}
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-tertiary">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-card-border">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="mr-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-24"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
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
            <Link href="/" className="nav-link">
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">


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

          <Link href="/admin/email-import" className="card-interactive p-6 group">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary">استيراد البريد الإلكتروني</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary text-sm">رفع وإدارة قوائم البريد الإلكتروني</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">📧</span>
              <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">حتى 2000 بريد</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="flex justify-between items-center">
              <h2 className="heading-3">
                قائمة المستخدمين ({filteredUserCount !== null ? filteredUserCount : '...'})
                {filterRole !== 'all' && (
                  <span className="text-sm font-normal text-accent-600 dark:text-dark-text-secondary mr-2">
                    - {filterRole === 'creator' ? 'مبدعون' : filterRole === 'admin' ? 'مديرون' : 'مستخدمون عاديون'}
                  </span>
                )}
              </h2>
              <button
                onClick={exportUsersCSV}
                disabled={users.length === 0}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                dir="rtl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                تصدير البريد الإلكتروني
              </button>
            </div>
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
                {loading ? (
                  // Skeleton rows
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="mr-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-24"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-card-hover">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.profilePicture && user.profilePicture.trim() !== '' ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                // If image fails to load, hide it and show placeholder instead
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 rounded-full flex items-center justify-center"
                            style={{ display: user.profilePicture && user.profilePicture.trim() !== '' ? 'none' : 'flex' }}
                          >
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
                          : user.role === 'creator'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          }`}>
                          {user.role === 'admin' ? 'مدير' : user.role === 'creator' ? 'مبدع' : 'مستخدم'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
