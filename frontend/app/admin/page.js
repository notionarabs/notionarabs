'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { formatDate } from '../../lib/dateUtils';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
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
  }, [isAuthenticated, user, router]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
          <Link href="/" className="nav-link">
            العودة للصفحة الرئيسية
          </Link>
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
              <p className="text-sm text-accent-600 dark:text-dark-text-secondary">{stats.googleUsersPercentage}% من إجمالي المستخدمين</p>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/creator-applications" className="card-interactive p-6">
            <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">طلبات المبدعين</h3>
            <p className="text-accent-600 dark:text-dark-text-secondary text-sm">مراجعة طلبات الانضمام ك مبدع</p>
          </Link>
          <Link href="/admin/templates" className="card-interactive p-6">
            <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">إدارة القوالب</h3>
            <p className="text-accent-600 dark:text-dark-text-secondary text-sm">مراجعة وموافقة على القوالب</p>
          </Link>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">التقارير</h3>
            <p className="text-accent-600 dark:text-dark-text-secondary text-sm">إحصائيات مفصلة عن المنصة</p>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                        {user.isActive ? 'نشط' : 'غير نشط'}
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
