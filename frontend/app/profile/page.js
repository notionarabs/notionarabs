'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../contexts/ToastContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../../components/Navigation';
import api from '../../lib/api';
import ProfileSidebar from '../../components/ProfileSidebar';
import TemplatesContent from '../../components/TemplatesContent';
import BlogsContent from '../../components/BlogsContent';
import SalesContent from '../../components/SalesContent';
import SettingsContent from '../../components/SettingsContent';
import AnalyticsContent from '../../components/AnalyticsContent';
import { Camera, Mail, User as UserIcon, AtSign, Settings, LayoutDashboard, Edit3, Download, TrendingUp } from 'lucide-react';

// Profile Overview Component
function ProfileOverview({ user }) {


  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2">
          الملف الشخصي
        </h1>
        <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
          إدارة معلومات حسابك وإعداداتك الشخصية
        </p>
      </div>

      {/* Cover Image Section */}
      <div className="mb-8">
        <div className="relative h-48 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl overflow-hidden group">
          {user?.backgroundImage ? (
            <Image
              src={user.backgroundImage}
              alt="صورة الغلاف"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400 dark:text-gray-600" />
            </div>
          )}

        </div>
      </div>

      {/* Profile Picture */}
      <div className="mb-8 -mt-20 relative z-10 flex items-end gap-4 px-4 sm:px-0">
        <div className="relative group">
          {user?.profilePicture ? (
            <Image
              src={user.profilePicture}
              alt={`صورة ${user.name}`}
              width={120}
              height={120}
              className="w-28 h-28 rounded-2xl border-4 border-white dark:border-dark-primary shadow-lg object-cover"
              quality={100}
            />
          ) : (
            <div className="w-28 h-28 bg-gradient-to-br from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 rounded-2xl flex items-center justify-center border-4 border-white dark:border-dark-primary shadow-lg">
              <span className="text-4xl font-black text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-primary-600" />
          معلومات الحساب
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">
              الاسم
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 dark:bg-dark-tertiary rounded-xl border border-gray-100 dark:border-dark-card-border font-bold">
              <span className="text-gray-900 dark:text-dark-text-primary">{user?.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">
              البريد الإلكتروني
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 dark:bg-dark-tertiary rounded-xl border border-gray-100 dark:border-dark-card-border font-bold">
              <span className="text-gray-900 dark:text-dark-text-primary">{user?.email}</span>
            </div>
          </div>

          {user?.username && (
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-dark-text-secondary mb-2">
                اسم المستخدم
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 dark:bg-dark-tertiary rounded-xl border border-gray-100 dark:border-dark-card-border font-bold">
                <AtSign className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 dark:text-dark-text-primary text-ltr">@{user.username}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {user?.creatorStatus === 'approved' && (
        <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-6 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary-600" />
            إجراءات سريعة
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/templates/create"
              className="flex items-center justify-between px-5 py-4 bg-gray-50/50 dark:bg-dark-tertiary hover:bg-primary-50 dark:hover:bg-orange-900/10 rounded-xl border border-gray-100 dark:border-dark-card-border transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-orange-900/20 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                  <Edit3 className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-dark-text-primary">إنشاء قالب جديد</span>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transform group-hover:translate-x-[-4px] transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
              </svg>
            </Link>

            <Link
              href="/blog/create"
              className="flex items-center justify-between px-5 py-4 bg-gray-50/50 dark:bg-dark-tertiary hover:bg-primary-50 dark:hover:bg-orange-900/10 rounded-xl border border-gray-100 dark:border-dark-card-border transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-orange-900/20 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                  <Edit3 className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-dark-text-primary">كتابة مقال جديد</span>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transform group-hover:translate-x-[-4px] transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function ProfilePageContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeSection, setActiveSection] = useState(tabParam || 'profile');

  useEffect(() => {
    if (tabParam) {
      setActiveSection(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Handle section navigation
  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Update URL query parameter
    router.push(`/profile?tab=${section}`, { scroll: false });
    // Scroll to top when changing sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        <Navigation activePage="profile" />
        <div className="flex">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block fixed top-[72px] right-0 h-[calc(100vh-72px)] w-64 bg-white dark:bg-dark-secondary border-l border-gray-200 dark:border-dark-card-border p-6 z-40">
            <div className="space-y-8 animate-pulse">
              {/* Section 1 */}
              <div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                </div>
              </div>
              {/* Section 2 */}
              <div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="flex-1 min-h-screen lg:mr-64">
            <div className="max-w-6xl mx-auto p-6 sm:p-8 animate-pulse">

              {/* Header Text */}
              <div className="mb-8">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Cover Image */}
              <div className="mb-8 relative">
                <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>

              {/* Profile Info */}
              <div className="mb-8 -mt-20 relative z-10 flex items-end gap-4 px-4">
                <div className="h-32 w-32 bg-gray-300 dark:bg-gray-600 rounded-full border-4 border-white dark:border-dark-primary"></div>
                <div className="mb-4 space-y-2">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Form/Content Skeleton */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
                <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>

            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!loading && !isAuthenticated) {
    return null;
  }

  if (!loading && isAuthenticated && user && user.creatorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        <Navigation activePage="profile" />
        <div className="container-custom py-12 sm:py-16 px-4 sm:px-0">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-yellow-600 dark:text-yellow-400 mb-4">
                طلبك قيد المراجعة
              </h1>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8">
                تم استلام طلبك للانضمام كمبدع وهو قيد المراجعة حالياً. سنعاود التواصل معك خلال 3-5 أيام عمل.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/" className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto text-center">
                  العودة للرئيسية
                </Link>
                <Link href="/creators" className="btn-secondary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto text-center">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileOverview user={user} />;
      case 'settings':
        return <SettingsContent />;
      case 'templates':
        return <TemplatesContent />;
      case 'blogs':
        return <BlogsContent />;
      case 'sales':
        return <SalesContent />;
      case 'analytics':
        return <AnalyticsContent />;
      default:
        return <ProfileOverview user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      <Navigation activePage="profile" />

      <div className="flex">
        {/* Sidebar with custom navigation handler */}
        <ProfileSidebar
          userStatus={user?.creatorStatus}
          onNavigate={handleSectionChange}
          activeSection={activeSection}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:mr-64">
          <div className="max-w-6xl mx-auto p-6 sm:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
