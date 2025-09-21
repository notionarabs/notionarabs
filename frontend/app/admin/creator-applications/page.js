'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function CreatorApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();
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

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === userId
            ? { ...app, creatorStatus: newStatus }
            : app
        )
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        [newStatus]: prev[newStatus] + 1,
        pending: prev.pending - (newStatus !== 'pending' ? 1 : 0)
      }));
    } catch (err) {
      setError('فشل في تحديث حالة الطلب');
      console.error('Update status error:', err);
    }
  };

  // Show loading state while checking authentication
  if (!isAuthenticated) {
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
      <div className="container-custom py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-1 mb-4">إدارة طلبات المبدعين</h1>
          <p className="body-large text-accent-600 dark:text-dark-text-secondary">
            مراجعة وإدارة طلبات الانضمام كمبدعين
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-tertiary">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-orange-400">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-tertiary">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-tertiary">مقبولة</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-tertiary">مرفوضة</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="card p-6">
          <h2 className="heading-3 mb-6">طلبات المبدعين</h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-accent-400 dark:text-dark-text-tertiary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-accent-600 dark:text-dark-text-secondary">لا توجد طلبات مبدعين</p>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <div key={application.id} className="border border-gray-200 dark:border-dark-card-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {application.profilePicture ? (
                        <img
                          src={application.profilePicture}
                          alt={application.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center">
                          <span className="text-white font-bold">
                            {application.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                          {application.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                          {application.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                          {new Date(application.appliedAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${application.creatorStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : application.creatorStatus === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                        {application.creatorStatus === 'pending' && 'قيد المراجعة'}
                        {application.creatorStatus === 'approved' && 'مقبول'}
                        {application.creatorStatus === 'rejected' && 'مرفوض'}
                      </span>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                        المعرض
                      </label>
                      <a
                        href={application.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-orange-400 hover:underline text-sm"
                      >
                        {application.portfolio}
                      </a>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                        الهاتف
                      </label>
                      <p className="text-sm text-gray-900 dark:text-dark-text-primary">
                        {application.phone}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      الخبرة
                    </label>
                    <p className="text-sm text-gray-900 dark:text-dark-text-primary">
                      {application.experience}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      التخصصات
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {application.specialties?.map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      الدافع
                    </label>
                    <p className="text-sm text-gray-900 dark:text-dark-text-primary">
                      {application.motivation}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {application.creatorStatus === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-dark-card-border">
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'approved')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        قبول الطلب
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        رفض الطلب
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
