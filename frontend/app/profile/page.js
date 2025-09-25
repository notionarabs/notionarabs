'use client';


import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../../components/Navigation';
import api from '../../lib/api';


export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout, ensureTokenInHeaders } = useAuth();
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
      // Ensure token is set in headers before making API call
      ensureTokenInHeaders();

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
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="heading-1 mb-4 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
            مرحباً بك في لوحة التحكم
          </h1>
          <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-2xl mx-auto">
            إدارة قوالبك، تتبع إحصائياتك، واستكشف المزيد من المميزات
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="card p-8 mb-8 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Picture Section */}
            <div className="relative">
              {user?.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={`صورة ${user.name}`}
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-full border-4 border-primary-200 dark:border-orange-500/30 shadow-large dark:shadow-dark-large"
                  quality={100}
                />
              ) : (
                <div className="w-30 h-30 bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 rounded-full flex items-center justify-center shadow-large dark:shadow-dark-large">
                  <span className="text-4xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online Status Indicator */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-dark-secondary flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* User Info Section */}
            <div className="flex-1 text-center md:text-right">
              <h2 className="heading-2 mb-2 text-primary-600 dark:text-orange-400">{user?.name}</h2>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-4">{user?.email}</p>

              {/* Status Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  مبدع معتمد
                </div>
                <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  عضو منذ يناير 2024
                </div>
              </div>

              {/* Quick Stats Preview */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-500 dark:text-orange-500">0</div>
                  <div className="text-xs text-accent-600 dark:text-dark-text-secondary">القوالب</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">0</div>
                  <div className="text-xs text-accent-600 dark:text-dark-text-secondary">المبيعات</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">0</div>
                  <div className="text-xs text-accent-600 dark:text-dark-text-secondary">الأرباح</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="heading-2 mb-4 text-primary-600 dark:text-orange-400">إحصائياتك</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary">تتبع أداءك ونجاحك على المنصة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Templates Published */}
            <div className="card-featured p-6 text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-orange-500 dark:to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-primary-500 dark:text-orange-500 mb-2 stats-counter">
                {templateStats?.total || 0}
              </div>
              <div className="body-medium text-accent-600 dark:text-dark-text-secondary mb-2">القوالب المنشورة</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي القوالب المقدمة</div>
            </div>

            {/* Approved Templates */}
            <div className="card-featured p-6 text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-green-500 mb-2 stats-counter">
                {templateStats?.approved || 0}
              </div>
              <div className="body-medium text-accent-600 dark:text-dark-text-secondary mb-2">القوالب المعتمدة</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">جاهزة للبيع</div>
            </div>

            {/* Sales */}
            <div className="card-featured p-6 text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-blue-500 mb-2 stats-counter">0</div>
              <div className="body-medium text-accent-600 dark:text-dark-text-secondary mb-2">المبيعات</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي المبيعات</div>
            </div>

            {/* Earnings */}
            <div className="card-featured p-6 text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-yellow-500 mb-2 stats-counter">0 ريال</div>
              <div className="body-medium text-accent-600 dark:text-dark-text-secondary mb-2">الأرباح</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي الأرباح</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-8 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="heading-2 mb-4 text-primary-600 dark:text-orange-400">الإجراءات السريعة</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-2xl mx-auto">
              إدارة قوالبك، إنشاء محتوى جديد، واستكشاف المزيد من المميزات
            </p>
          </div>

          {/* Template Status Overview */}
          {templateStats && (
            <div className="card p-6 mb-8 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-primary/20 dark:to-dark-secondary/20 border border-primary-200 dark:border-orange-500/20">
              <div className="text-center mb-6">
                <h3 className="heading-3 mb-2 text-primary-600 dark:text-orange-400">حالة قوالبك المقدمة</h3>
                <p className="text-sm text-accent-600 dark:text-dark-text-secondary">تتبع حالة قوالبك المقدمة للمراجعة</p>
              </div>

              {templateStats.total > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-dark-card-bg rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-primary-500 dark:text-orange-500 mb-1">
                      {templateStats.total}
                    </div>
                    <div className="text-sm text-accent-600 dark:text-dark-text-secondary">إجمالي القوالب</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-dark-card-bg rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-yellow-500 mb-1">
                      {templateStats.pending}
                    </div>
                    <div className="text-sm text-accent-600 dark:text-dark-text-secondary">قيد المراجعة</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-dark-card-bg rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-green-500 mb-1">
                      {templateStats.approved}
                    </div>
                    <div className="text-sm text-accent-600 dark:text-dark-text-secondary">موافق عليها</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-dark-card-bg rounded-xl shadow-sm">
                    <div className="text-2xl font-bold text-red-500 mb-1">
                      {templateStats.rejected}
                    </div>
                    <div className="text-sm text-accent-600 dark:text-dark-text-secondary">مرفوضة</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-orange-500/20 dark:to-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-primary-600 dark:text-orange-400 mb-3">
                    لم تقم بإرسال أي قوالب بعد
                  </h3>
                  <p className="text-accent-600 dark:text-dark-text-secondary mb-6 max-w-md mx-auto">
                    ابدأ رحلتك كمبدع وأنشئ قالبك الأول لتبدأ في كسب المال
                  </p>
                  <button
                    onClick={() => router.push('/templates/create')}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إنشاء قالب جديد
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href="/templates/create" className="group card-interactive p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
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

            <Link href="/profile/templates" className="group card-interactive p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
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

          {/* Additional Profile Actions */}
          <div className="mt-8">
            <div className="text-center mb-8">
              <h3 className="heading-3 mb-2 text-primary-600 dark:text-orange-400">إجراءات إضافية</h3>
              <p className="text-sm text-accent-600 dark:text-dark-text-secondary">إدارة حسابك واستكشاف المزيد من المميزات</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Write Blog Button - Only for approved creators */}
              {user?.creatorStatus === 'approved' && (
                <Link href="/blog/create" className="group card-interactive p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary group-hover:text-indigo-500 transition-colors">كتابة مقال جديد</h4>
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">شارك معرفتك مع المجتمع</p>
                    </div>
                  </div>
                </Link>
              )}

              {/* My Blogs Button - Only for approved creators */}
              {user?.creatorStatus === 'approved' && (
                <Link href="/profile/my-blogs" className="group card-interactive p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary group-hover:text-orange-500 transition-colors">مقالاتي</h4>
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">إدارة مقالاتك المنشورة</p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Settings Button - For all users */}
              <Link href="/settings" className="group card-interactive p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary group-hover:text-gray-500 transition-colors">الإعدادات</h4>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">إدارة إعدادات حسابك</p>
                  </div>
                </div>
              </Link>

              {/* Orders Button - Only for non-admin users */}
              {user?.role !== 'admin' && (
                <Link href="/orders" className="group card-interactive p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary group-hover:text-purple-500 transition-colors">الطلبات</h4>
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">عرض تاريخ طلباتك</p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Creator Application Button - For non-creators or rejected creators */}
              {(!user?.creatorStatus || user?.creatorStatus === '' || user?.creatorStatus === 'none' || user?.creatorStatus === 'rejected') && (
                <Link href="/creators/apply" className="group card-interactive p-4 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                        {user?.creatorStatus === 'rejected' ? 'إعادة التقديم كمبدع' : 'التسجيل كمبدع'}
                      </h4>
                      <p className="text-sm text-purple-500 dark:text-purple-400">
                        {user?.creatorStatus === 'rejected' ? 'إعادة تقديم طلبك' : 'ابدأ رحلتك كمبدع'}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Pending Status Message */}
              {user?.creatorStatus === 'pending' && (
                <div className="card p-4 border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-700 dark:text-amber-300">طلبك قيد المراجعة</h4>
                      <p className="text-sm text-amber-600 dark:text-amber-400">نحن نراجع طلبك للانضمام كمبدع</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
