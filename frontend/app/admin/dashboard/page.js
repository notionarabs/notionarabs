'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const { user, isAuthenticated, refreshUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (isAuthenticated && user?.role === 'admin') {
      fetchApplications();
    } else if (isAuthenticated && user?.role !== 'admin') {
      // User is authenticated but not admin
      setError('ليس لديك صلاحية للوصول إلى لوحة تحكم المدير');
      setLoading(false);
    } else if (!isAuthenticated) {
      // Not authenticated - redirect to login
      router.push('/login');
      setLoading(false);
    }
  }, [isAuthenticated, user, router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/creator-applications');
      setApplications(response.data.applications);
      setStats(response.data.stats);
    } catch (err) {
      setError('فشل في تحميل طلبات المبدعين');
      console.error('Fetch applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (userId, newStatus) => {
    try {
      await api.put(`/admin/creator-applications/${userId}/status`, {
        status: newStatus
      });

      setApplications(prev =>
        prev.map(app =>
          app.id === userId
            ? { ...app, creatorStatus: newStatus }
            : app
        )
      );

      setStats(prev => ({
        ...prev,
        [newStatus]: prev[newStatus] + 1,
        pending: prev.pending - (newStatus !== 'pending' ? 1 : 0)
      }));

      // If we're approving a user and they're currently logged in, refresh their data
      if (newStatus === 'approved') {
        // Find the approved user
        const approvedUser = applications.find(app => app.id === userId);
        if (approvedUser && approvedUser.email === user?.email) {
          // This is the current user being approved, refresh their data
          try {
            await refreshUserData();
            console.log('User data refreshed after approval');
          } catch (refreshError) {
            console.error('Failed to refresh user data after approval:', refreshError);
          }
        }
      }

      // Close modal if open
      setSelectedApplication(null);
    } catch (err) {
      setError('فشل في تحديث حالة الطلب');
      console.error('Update status error:', err);
    }
  };

  // Filter applications based on current filter and search term
  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.creatorStatus === filter;
    const matchesSearch = searchTerm === '' ||
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="loading-text">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <div className="max-w-md mx-auto bg-white dark:bg-dark-secondary rounded-xl shadow-large dark:shadow-dark-large p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
            غير مصرح لك
          </h2>
          <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
            ليس لديك صلاحية للوصول إلى لوحة تحكم المدير
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              العودة للرئيسية
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="loading-text">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 dark:from-orange-600 dark:to-orange-700 shadow-large dark:shadow-dark-large">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">لوحة تحكم المدير</h1>
              <p className="text-primary-100 dark:text-orange-100">إدارة طلبات المبدعين والنظام</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-white hover:text-primary-100 transition-colors">
                العودة للرئيسية
              </Link>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-tertiary">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-tertiary">قيد المراجعة</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-tertiary">مقبولة</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-text-tertiary">مرفوضة</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'all'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card-border'
                  }`}
              >
                الكل ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'pending'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card-border'
                  }`}
              >
                قيد المراجعة ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'approved'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card-border'
                  }`}
              >
                مقبولة ({stats.approved})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'rejected'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card-border'
                  }`}
              >
                مرفوضة ({stats.rejected})
              </button>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={fetchApplications}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-dark-card-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">طلبات المبدعين</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                آخر تحديث: {new Date().toLocaleTimeString('en-US')}
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="p-6">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد طلبات مبدعين'}
                </h3>
                <p className="text-gray-600 dark:text-dark-text-secondary">
                  {searchTerm ? 'جرب البحث بكلمات مختلفة' : 'سيظهر هنا طلبات المبدعين عند تقديمها'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredApplications.map((application) => (
                  <div key={application.id} className={`border rounded-xl p-6 transition-all duration-200 hover:shadow-lg dark:hover:shadow-dark-large cursor-pointer ${application.creatorStatus === 'pending'
                    ? 'border-yellow-200 dark:border-yellow-800/30 bg-yellow-50/50 dark:bg-yellow-900/10'
                    : application.creatorStatus === 'approved'
                      ? 'border-green-200 dark:border-green-800/30 bg-green-50/50 dark:bg-green-900/10'
                      : 'border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10'
                    }`}
                    onClick={() => setSelectedApplication(application)}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {application.profilePicture ? (
                          <img
                            src={application.profilePicture}
                            alt={application.name}
                            className="w-16 h-16 rounded-full border-2 border-white dark:border-dark-secondary shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-xl">
                              {application.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                            {application.name}
                          </h3>
                          <p className="text-gray-600 dark:text-dark-text-secondary">
                            {application.email}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                            تقدم في {new Date(application.appliedAt).toLocaleDateString('en-US')} - {new Date(application.appliedAt).toLocaleTimeString('en-US')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${application.creatorStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : application.creatorStatus === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                          {application.creatorStatus === 'pending' && '⏳ قيد المراجعة'}
                          {application.creatorStatus === 'approved' && '✅ مقبول'}
                          {application.creatorStatus === 'rejected' && '❌ مرفوض'}
                        </span>

                        {application.creatorStatus === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateApplicationStatus(application.id, 'approved');
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              قبول
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateApplicationStatus(application.id, 'rejected');
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              رفض
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                          🔗 المعرض
                        </label>
                        <p className="text-sm text-gray-900 dark:text-dark-text-primary truncate">
                          {application.portfolio}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                          📞 الهاتف
                        </label>
                        <p className="text-sm text-gray-900 dark:text-dark-text-primary">
                          {application.phone}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                          🎯 التخصصات
                        </label>
                        <p className="text-sm text-gray-900 dark:text-dark-text-primary">
                          {application.specialties?.length} تخصص
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-card-border">
                      <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                        انقر لعرض التفاصيل الكاملة
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-secondary rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-card-border">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                  تفاصيل طلب المبدع
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-text-secondary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Modal content will be similar to the detailed view */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      🔗 رابط المعرض
                    </label>
                    <a
                      href={selectedApplication.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 dark:text-orange-400 hover:underline text-sm bg-primary-50 dark:bg-orange-500/10 px-3 py-2 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {selectedApplication.portfolio}
                    </a>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      📞 رقم الهاتف
                    </label>
                    <p className="text-sm text-gray-900 dark:text-dark-text-primary bg-gray-50 dark:bg-dark-tertiary px-3 py-2 rounded-lg">
                      {selectedApplication.phone}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      🎯 التخصصات
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.specialties?.map((specialty, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 rounded-full text-xs font-medium">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      💼 وصف الخبرة
                    </label>
                    <p className="text-sm text-gray-900 dark:text-dark-text-primary bg-gray-50 dark:bg-dark-tertiary px-3 py-2 rounded-lg leading-relaxed">
                      {selectedApplication.experience}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      💡 الدافع للانضمام
                    </label>
                    <p className="text-sm text-gray-900 dark:text-dark-text-primary bg-gray-50 dark:bg-dark-tertiary px-3 py-2 rounded-lg leading-relaxed">
                      {selectedApplication.motivation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication.creatorStatus === 'pending' && (
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-dark-card-border mt-6">
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    قبول الطلب
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    رفض الطلب
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
