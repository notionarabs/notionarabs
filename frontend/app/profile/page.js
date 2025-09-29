'use client';


import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '../../lib/api';
import Navigation from '../../components/Navigation';


export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout, ensureTokenInHeaders } = useAuth();
  const [templateStats, setTemplateStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we've finished loading and user is not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    // No need to redirect - all users can access their profile

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

  // Show pending status if user has pending creator application
  if (!loading && isAuthenticated && user && user.creatorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        <Navigation activePage="profile" />
        <div className="container-custom py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-8">
              <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="heading-1 text-yellow-600 dark:text-yellow-400 mb-4">
                طلبك قيد المراجعة
              </h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                تم استلام طلبك للانضمام كمبدع وهو قيد المراجعة حالياً. سنعاود التواصل معك خلال 3-5 أيام عمل.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="btn-primary">
                  العودة للرئيسية
                </Link>
                <Link href="/creators" className="btn-secondary">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // All users can access their profile

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
        <div className="card p-8 mb-8 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm relative">
          {/* Settings Icon - Top Left */}
          <Link href="/profile/settings" className="absolute top-4 left-4 p-2 rounded-xl bg-gray-100 dark:bg-dark-tertiary hover:bg-gray-200 dark:hover:bg-dark-primary transition-colors duration-200 group">
            <svg className="w-5 h-5 text-gray-600 dark:text-dark-text-secondary group-hover:text-primary-500 dark:group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="sr-only">إعدادات الملف الشخصي</span>
          </Link>

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
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-2">{user?.email}</p>
              {user?.username && (
                <p className="body-medium text-primary-500 dark:text-orange-400 mb-4">
                  @{user.username}
                </p>
              )}

              {/* Status Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                {user?.creatorStatus === 'approved' && (
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    مبدع معتمد
                  </div>
                )}
                {user?.creatorStatus === 'pending' && (
                  <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    طلب مبدع قيد المراجعة
                  </div>
                )}
                <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  عضو منذ {new Date(user?.createdAt).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Quick Stats Preview */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                {user?.creatorStatus === 'approved' ? (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-500 dark:text-orange-500">{templateStats?.total || 0}</div>
                      <div className="text-xs text-accent-600 dark:text-dark-text-secondary">القوالب</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{templateStats?.approved || 0}</div>
                      <div className="text-xs text-accent-600 dark:text-dark-text-secondary">المعتمدة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{templateStats?.pending || 0}</div>
                      <div className="text-xs text-accent-600 dark:text-dark-text-secondary">قيد المراجعة</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-500 dark:text-orange-500">0</div>
                      <div className="text-xs text-accent-600 dark:text-dark-text-secondary">القوالب المحفوظة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">0</div>
                      <div className="text-xs text-accent-600 dark:text-dark-text-secondary">المفضلة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">0</div>
                      <div className="text-xs text-accent-600 dark:text-dark-text-secondary">المشاريع</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="heading-2 mb-4 text-primary-600 dark:text-orange-400">
              {user?.creatorStatus === 'approved' ? 'إحصائياتك' : 'نشاطك'}
            </h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary">
              {user?.creatorStatus === 'approved'
                ? 'تتبع أداءك ونجاحك على المنصة'
                : 'تتبع نشاطك واستكشافك للقوالب'
              }
            </p>
          </div>

          {user?.creatorStatus === 'approved' ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Saved Templates */}
              <div className="card-featured p-6 text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-orange-500 dark:to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-primary-500 dark:text-orange-500 mb-2 stats-counter">0</div>
                <div className="body-medium text-accent-600 dark:text-dark-text-secondary mb-2">القوالب المحفوظة</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">القوالب التي حفظتها</div>
              </div>

              {/* Favorites */}
              <div className="card-featured p-6 text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-red-500 mb-2 stats-counter">0</div>
                <div className="body-medium text-accent-600 dark:text-dark-text-secondary mb-2">المفضلة</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">القوالب المفضلة لديك</div>
              </div>

              {/* Projects */}
              <div className="card-featured p-6 text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-green-500 mb-2 stats-counter">0</div>
                <div className="body-medium text-accent-600 dark:text-dark-text-secondary mb-2">المشاريع</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">المشاريع التي تعمل عليها</div>
              </div>

              {/* Downloads */}
              <div className="card-featured p-6 text-center group hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-blue-500 mb-2 stats-counter">0</div>
                <div className="body-medium text-accent-600 dark:text-dark-text-secondary mb-2">التحميلات</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">القوالب التي حملتها</div>
              </div>
            </div>
          )}
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
              {user?.creatorStatus === 'approved'
                ? 'إدارة قوالبك، إنشاء محتوى جديد، واستكشاف المزيد من المميزات'
                : 'استكشف القوالب، احفظ المفضلة، وابدأ مشاريعك الجديدة'
              }
            </p>
          </div>

          {/* Template Status Overview */}
          {templateStats && (
            <div className="card p-6 mb-8 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-dark-primary/20 dark:to-dark-secondary/20 border border-primary-200 dark:border-orange-500/20">
              <div className="text-center mb-6">
                <h3 className="heading-3 mb-2 text-primary-600 dark:text-orange-400">حالة قوالبي</h3>
                <p className="text-sm text-accent-600 dark:text-dark-text-secondary">تتبع حالة قوالبي للمراجعة</p>
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
            {user?.creatorStatus === 'approved' ? (
              <>
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
                      <h3 className="heading-3 group-hover:text-blue-500 transition-colors mb-2">قوالبي</h3>
                      <p className="body-medium text-accent-600 dark:text-dark-text-secondary">تتبع حالة قوالبي</p>
                    </div>
                    <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-quaternary group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>

                {/* Blog Action Cards */}
                <Link href="/blog/create" className="group card-interactive p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="heading-3 group-hover:text-indigo-500 transition-colors mb-2">كتابة مقال جديد</h3>
                      <p className="body-medium text-accent-600 dark:text-dark-text-secondary">شارك معرفتك مع المجتمع</p>
                    </div>
                    <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-quaternary group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>

                <Link href="/profile/my-blogs" className="group card-interactive p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="heading-3 group-hover:text-orange-500 transition-colors mb-2">مقالاتي</h3>
                      <p className="body-medium text-accent-600 dark:text-dark-text-secondary">إدارة مقالاتك المنشورة</p>
                    </div>
                    <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-quaternary group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/templates" className="group card-interactive p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-orange-500 dark:to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="heading-3 group-hover:text-primary-500 dark:group-hover:text-orange-500 transition-colors mb-2">استكشاف القوالب</h3>
                      <p className="body-medium text-accent-600 dark:text-dark-text-secondary">اكتشف قوالب جديدة ومفيدة</p>
                    </div>
                    <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-quaternary group-hover:text-primary-500 dark:group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>

                <Link href="/creators" className="group card-interactive p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="heading-3 group-hover:text-purple-500 transition-colors mb-2">المبدعين</h3>
                      <p className="body-medium text-accent-600 dark:text-dark-text-secondary">تعرف على المبدعين المتميزين</p>
                    </div>
                    <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-quaternary group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
