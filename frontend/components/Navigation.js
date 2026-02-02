'use client';

import { useState, useEffect, useRef, memo, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import dynamic from 'next/dynamic';
const UserNotifications = dynamic(() => import('./UserNotifications'), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-dark-tertiary/50 animate-pulse" />
});

const Navigation = memo(function Navigation({ activePage = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { theme } = useTheme();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu when clicking on any link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Close menu when logout is clicked
  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  // Memoize navigation items to prevent unnecessary re-renders
  const navItems = useMemo(() => [
    { href: '/store', label: 'المتجر', key: 'store' },
    { href: '/blog', label: 'المدونة', key: 'blog' },
    { href: '/about', label: 'من نحن', key: 'about' }
  ], []);

  // Memoize user badge styles
  const userBadgeClasses = useMemo(() => {
    if (user?.creatorStatus === 'approved') {
      return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500';
    } else if (user?.creatorStatus === 'pending') {
      return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    }
    return '';
  }, [user?.creatorStatus]);

  return (
    <header ref={menuRef} className="w-full bg-accent-500 dark:bg-dark-secondary sticky top-0 z-50 shadow-medium dark:shadow-dark-medium backdrop-blur-sm bg-accent-500/95 dark:bg-dark-secondary/95 transition-colors duration-300">
      <div className="container-custom flex justify-between items-center py-4">
        <Link href="/" className="flex items-center" aria-label="الرئيسية - عرب نوشن">
          <Image
            src="/NavLogoLight.svg"
            alt="عرب نوشن"
            width={180}
            height={60}
            className="h-8 sm:h-10 md:h-12 w-auto"
            quality={100}
            priority
            unoptimized
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1 lg:gap-2 xl:gap-3 items-center">
          <div className={`transition-all duration-300 ease-in-out overflow-hidden flex items-center ${activePage !== 'home' ? 'max-w-24 opacity-100' : 'max-w-0 opacity-0'}`}>
            <Link href="/" className="nav-link whitespace-nowrap">الرئيسية</Link>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`nav-link ${activePage === item.key ? 'nav-link-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            <Link href="/consultation" className="btn-primary">
              احجز استشارة
            </Link>
          </div>
          {/* Auth section */}
          <div className="flex items-center gap-3 justify-end">
            {loading ? (
              <>
                {/* Loading skeleton for user info */}
                <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-dark-tertiary/50 animate-pulse"></div>
                <div className="w-11 h-11 rounded-full bg-white/20 dark:bg-dark-tertiary/50 animate-pulse"></div>
              </>
            ) : isAuthenticated ? (
              <>
                {/* Notifications and User Dropdown */}
                <div className="flex items-center gap-2">
                  <UserNotifications />
                  <UserDropdown />
                </div>
              </>
            ) : (
              <>
                {/* Login button for non-authenticated users - Avatar style */}
                <Link
                  href="/login"
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-gray-600/80 to-gray-700/80 dark:from-gray-700/80 dark:to-gray-800/80 hover:from-orange-500 hover:to-orange-600 dark:hover:from-orange-500 dark:hover:to-orange-600 transition-all duration-300 border-2 border-gray-600/30 dark:border-dark-card-border hover:border-orange-500/50 dark:hover:border-orange-500/50 shadow-md hover:shadow-lg group"
                  aria-label="تسجيل الدخول"
                  title="تسجيل الدخول"
                >
                  <svg className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 transition-all duration-300 border border-gray-600 dark:border-dark-card-border rounded-xl hover:bg-white/10 dark:hover:bg-dark-tertiary hover:border-gray-500 dark:hover:border-dark-text-tertiary flex-shrink-0"
            aria-label="فتح القائمة"
          >
            <svg className="w-5 h-5 text-gray-300 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Always rendered for SEO, hidden with CSS */}
      <div className={`md:hidden absolute top-full left-0 right-0 z-40 bg-gradient-to-b from-accent-500 via-accent-500 to-accent-600 dark:from-dark-secondary dark:via-dark-secondary dark:to-dark-tertiary border-b border-gray-700/60 dark:border-dark-card-border shadow-large dark:shadow-dark-large backdrop-blur-sm transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="container-custom py-6 space-y-7">
          {/* Mobile Navigation Links - Always in DOM for crawlability */}
          <nav className="space-y-4" aria-label="Mobile navigation">
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activePage !== 'home' ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
              <Link href="/" onClick={handleLinkClick} className="block py-3.5 px-4 text-gray-100/90 dark:text-dark-text-primary hover:text-white hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-2xl border border-white/5">
                الرئيسية
              </Link>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={handleLinkClick}
                className="block py-3.5 px-4 text-gray-100/90 dark:text-dark-text-primary hover:text-white hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-2xl border border-white/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/consultation"
              onClick={handleLinkClick}
              className="btn-primary text-center"
            >
              احجز استشارة
            </Link>
          </div>

          {/* Mobile Auth Section */}
          <div className="border-t border-gray-600 dark:border-dark-card-border pt-6 min-h-[120px]">
            {loading ? (
              <div className="space-y-3">
                <div className="px-4 py-3 bg-white/5 dark:bg-dark-tertiary rounded-xl">
                  <div className="w-24 h-4 bg-white/20 rounded animate-pulse"></div>
                </div>
                <div className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
                    <div className="w-16 h-4 bg-white/20 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-3">
                {/* User Info Header */}
                <div className="px-4 py-3 bg-white/5 dark:bg-dark-tertiary rounded-xl">
                  <div className="flex items-center gap-3">
                    {(user?.creatorStatus === 'approved' || user?.creatorStatus === 'pending') ? (
                      // Premium styling for approved creators and pending applications
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-full p-0.5 shadow-md ${user?.creatorStatus === 'approved'
                          ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          }`}>
                          <div className="w-full h-full rounded-full bg-white dark:bg-dark-secondary">
                            {user?.profilePicture ? (
                              <Image
                                src={user.profilePicture}
                                alt={`صورة ${user.name}`}
                                width={32}
                                height={32}
                                className="w-full h-full rounded-full object-cover"
                                quality={100}
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {user?.name?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Creator badge */}
                        <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center shadow-sm ${user?.creatorStatus === 'approved'
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          }`}>
                          {user?.creatorStatus === 'approved' ? (
                            <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ) : (
                            <svg className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Regular styling for non-creators
                      <>
                        {user?.profilePicture ? (
                          <Image
                            src={user.profilePicture}
                            alt={`صورة ${user.name}`}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                            quality={100}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {user?.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-300 dark:text-dark-text-primary truncate">
                          {user?.name}
                        </p>
                        {user?.creatorStatus === 'approved' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-300">
                            مبدع
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-dark-text-tertiary truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile User Options */}
                <div className="space-y-2">
                  {/* Admin Section */}
                  {user?.role === 'admin' ? (
                    <>
                      <Link
                        href="/admin"
                        onClick={handleLinkClick}
                        className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl"
                      >
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                        <span className="text-sm">لوحة الإدارة الرئيسية</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Profile Link - For approved creators and pending applications (non-admin) */}
                      {(user?.creatorStatus === 'approved' || user?.creatorStatus === 'pending') && (
                        <Link
                          href="/profile"
                          onClick={handleLinkClick}
                          className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl"
                        >
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm">الملف الشخصي</span>
                        </Link>
                      )}

                      {/* Settings Link */}
                      <Link
                        href={user?.creatorStatus === 'approved' ? "/profile?tab=settings" : "/user-settings"}
                        onClick={handleLinkClick}
                        className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">الإعدادات</span>
                      </Link>

                      {/* Orders Section - Only for normal users */}
                      <Link
                        href="/purchases"
                        onClick={handleLinkClick}
                        className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl"
                      >
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm">مشترياتي</span>
                      </Link>

                      {/* Creator Application Section */}
                      {/* Pending Status */}
                      {user?.creatorStatus === 'pending' && (
                        <div className="w-full px-4 py-3 text-right flex items-center gap-3 text-amber-400 dark:text-amber-300 bg-amber-900/20 dark:bg-amber-900/20 rounded-xl">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">طلبك قيد المراجعة</span>
                        </div>
                      )}

                      {/* Rejected Status - Allow re-application */}
                      {user?.creatorStatus === 'rejected' && (
                        <Link
                          href="/creators/apply"
                          onClick={handleLinkClick}
                          className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl"
                        >
                          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="text-sm">إعادة التقديم كمبدع</span>
                        </Link>
                      )}

                      {/* No Status - First time application */}
                      {(!user?.creatorStatus || user?.creatorStatus === '' || user?.creatorStatus === 'none') && (
                        <Link
                          href="/creators/apply"
                          onClick={handleLinkClick}
                          className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl"
                        >
                          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="text-sm">التسجيل كمبدع</span>
                        </Link>
                      )}
                    </>
                  )}

                  {/* Sign Out with Theme Toggle */}
                  <div className="flex items-center justify-between gap-3 py-3 px-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200 rounded-xl px-3 py-2 flex-1 text-right"
                    >
                      <span className="text-sm">تسجيل الخروج</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Theme Toggle Mobile for non-authenticated users */}
                <div className="flex items-center justify-between px-4 py-3 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                  <span>الوضع {theme === 'dark' ? 'النهاري' : 'الليلي'}</span>
                  <ThemeToggle />
                </div>

                <Link href="/login" onClick={handleLinkClick} className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                  تسجيل الدخول
                </Link>
                <Link href="/signup" onClick={handleLinkClick} className="block py-3 px-4 text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors duration-200">
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

export default Navigation;
