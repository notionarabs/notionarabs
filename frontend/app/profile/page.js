'use client';


import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../../components/Navigation';
import api from '../../lib/api';


export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [templateStats, setTemplateStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we've finished loading and user is not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    // Redirect if user is not an approved creator
    if (!loading && isAuthenticated && user && user.creatorStatus !== 'approved') {
      router.push('/');
    }

    // Fetch template stats if user is approved creator
    if (!loading && isAuthenticated && user && user.creatorStatus === 'approved') {
      fetchTemplateStats();
    }
  }, [isAuthenticated, loading, user, router]);

  const fetchTemplateStats = async () => {
    try {
      const response = await api.get('/templates/my-templates');
      const templates = response.data.templates || [];
      const stats = {
        total: templates.length,
        pending: templates.filter(t => t.status === 'pending').length,
        approved: templates.filter(t => t.status === 'approved').length,
        rejected: templates.filter(t => t.status === 'rejected').length
      };
      setTemplateStats(stats);
    } catch (error) {
      console.error('Error fetching template stats:', error);
      // Set empty stats on error
      setTemplateStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      });
    }
  };
  // Show loading only if we're actually loading and don't have user data
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="loading-text">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render anything (will redirect)
  if (!loading && !isAuthenticated) {
    return null;
  }

  // Redirect if user is not an approved creator
  if (!loading && isAuthenticated && user && user.creatorStatus !== 'approved') {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Navigation */}
      <Navigation activePage="profile" />

      {/* Profile Content */}
      <div className="container-custom py-16">
        {/* Profile Header Card */}
        <div className="card p-8 mb-8">
          <div className="text-center">
            {/* Profile Picture */}
            <div className="relative mb-6">
              {user?.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={`صورة ${user.name}`}
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-full mx-auto border-4 border-primary-200 dark:border-orange-500/30 shadow-large dark:shadow-dark-large"
                  quality={100}
                />
              ) : (
                <div className="w-30 h-30 bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-large dark:shadow-dark-large">
                  <span className="text-4xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online Status Indicator */}
              <div className="absolute bottom-2 right-1/2 transform translate-x-1/2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-dark-secondary"></div>
            </div>

            <h1 className="heading-1 mb-2">مرحباً، {user?.name}</h1>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-4">{user?.email}</p>

            {/* Member Since Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              عضو منذ يناير 2024
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-featured p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-primary-500 dark:bg-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-primary-500 dark:text-orange-500 mb-2 stats-counter">0</div>
            <div className="body-medium text-accent-600 dark:text-dark-text-secondary">القوالب المنشورة</div>
          </div>

          <div className="card-featured p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-green-500 mb-2 stats-counter">0</div>
            <div className="body-medium text-accent-600 dark:text-dark-text-secondary">المبيعات</div>
          </div>

          <div className="card-featured p-6 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-yellow-500 mb-2 stats-counter">0 ريال</div>
            <div className="body-medium text-accent-600 dark:text-dark-text-secondary">الأرباح</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-8">
          <div className="mb-8">
            <h2 className="heading-2 mb-4">الإجراءات السريعة</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary">إدارة حسابك واستكشاف المزيد من المميزات</p>
          </div>

          {/* Template Status Overview */}
          {templateStats && (
            <div className="card p-6 mb-8">
              <h2 className="heading-2 mb-6">حالة قوالبك المقدمة</h2>
              {templateStats.total > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-500 dark:text-orange-500 mb-1">
                      {templateStats.total}
                    </div>
                    <div className="text-sm text-accent-600 dark:text-dark-text-secondary">إجمالي القوالب</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500 mb-1">
                      {templateStats.pending}
                    </div>
                    <div className="text-sm text-accent-600 dark:text-dark-text-secondary">قيد المراجعة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 mb-1">
                      {templateStats.approved}
                    </div>
                    <div className="text-sm text-accent-600 dark:text-dark-text-secondary">موافق عليها</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500 mb-1">
                      {templateStats.rejected}
                    </div>
                    <div className="text-sm text-accent-600 dark:text-dark-text-secondary">مرفوضة</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400 dark:text-dark-text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    لم تقم بإرسال أي قوالب بعد
                  </h3>
                  <p className="text-accent-600 dark:text-dark-text-secondary mb-4">
                    ابدأ بإنشاء قالبك الأول وشاركه مع العالم
                  </p>
                  <button
                    onClick={() => router.push('/templates/create')}
                    className="btn-primary"
                  >
                    إنشاء قالب جديد
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/templates" className="group card-interactive p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-500 dark:bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="heading-3 group-hover:text-primary-500 dark:group-hover:text-orange-500 transition-colors mb-2">تصفح القوالب</h3>
                  <p className="body-medium text-accent-600 dark:text-dark-text-secondary">اكتشف قوالب جديدة ومبتكرة</p>
                </div>
                <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-quaternary group-hover:text-primary-500 dark:group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>

            <Link href="/templates/create" className="group card-interactive p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="heading-3 group-hover:text-green-500 transition-colors mb-2">إنشاء قالب جديد</h3>
                  <p className="body-medium text-accent-600 dark:text-dark-text-secondary">ابدأ بيع قوالبك المبتكرة</p>
                </div>
                <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-quaternary group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>

            <Link href="/profile/templates" className="group card-interactive p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="heading-3 group-hover:text-blue-500 transition-colors mb-2">قوالبك المقدمة</h3>
                  <p className="body-medium text-accent-600 dark:text-dark-text-secondary">تتبع حالة قوالبك المقدمة</p>
                </div>
                <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-quaternary group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
