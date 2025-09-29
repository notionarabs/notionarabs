'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';

export default function Navigation({ activePage = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { theme } = useTheme();

  return (
    <header className="w-full bg-accent-500 dark:bg-dark-secondary sticky top-0 z-50 shadow-medium dark:shadow-dark-medium backdrop-blur-sm bg-accent-500/95 dark:bg-dark-secondary/95 transition-colors duration-300">
      <div className="container-custom flex justify-between items-center py-4">
        <Link href="/" className="flex items-center">
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
          <Link href="/templates" className={`nav-link ${activePage === 'templates' ? 'nav-link-active' : ''}`}>القوالب</Link>
          <Link href="/creators" className={`nav-link ${activePage === 'creators' ? 'nav-link-active' : ''}`}>المبدعين</Link>
          <Link href="/blog" className={`nav-link ${activePage === 'blog' ? 'nav-link-active' : ''}`}>المدونة</Link>
          <Link href="/about" className={`nav-link ${activePage === 'about' ? 'nav-link-active' : ''}`}>من نحن</Link>
        </nav>

        {/* Auth Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">
          {/* Auth section */}
          <div className="flex items-center gap-4 justify-end">
            {loading ? (
              <>
                {/* Loading skeleton for user info */}
                <div className="w-20 h-6 bg-white/20 rounded animate-pulse"></div>
                <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse"></div>
              </>
            ) : isAuthenticated ? (
              <>
                {/* User Dropdown */}
                <UserDropdown />
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors py-2 px-3">
                  تسجيل الدخول
                </Link>
                <Link href="/signup" className="btn-primary">
                  إنشاء حساب
                </Link>
              </div>
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-accent-500 dark:bg-dark-secondary border-b border-gray-700 dark:border-dark-card-border shadow-large dark:shadow-dark-large backdrop-blur-sm transition-colors duration-300">
          <div className="container-custom py-6 space-y-6">
            {/* Mobile Navigation Links */}
            <nav className="space-y-4">
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activePage !== 'home' ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
                <Link href="/" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                  الرئيسية
                </Link>
              </div>
              <Link href="/templates" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                القوالب
              </Link>
              <Link href="/creators" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                المبدعين
              </Link>
              <Link href="/blog" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                المدونة
              </Link>
              <Link href="/about" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                من نحن
              </Link>
            </nav>

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
                  {/* Mobile User Options */}
                  <div className="space-y-2">
                    {/* Creator Application Link Mobile - Only show if not already applied */}
                    {(!user?.creatorStatus || user?.creatorStatus === 'none' || user?.creatorStatus === 'rejected') && (
                      <Link href="/creators/apply" className="flex items-center gap-3 py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>{user?.creatorStatus === 'rejected' ? 'إعادة التقديم كمبدع' : 'التسجيل كمبدع'}</span>
                      </Link>
                    )}

                    {/* Pending Status Message Mobile */}
                    {user?.creatorStatus === 'pending' && (
                      <div className="flex items-center gap-3 py-3 px-4 text-yellow-300 dark:text-yellow-400 bg-yellow-900/20 dark:bg-yellow-900/20 rounded-xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>طلبك قيد المراجعة</span>
                      </div>
                    )}

                    {/* Profile Link Mobile - For approved creators and pending applications */}
                    {(user?.creatorStatus === 'approved' || user?.creatorStatus === 'pending') && (
                      <Link href="/profile" className="flex items-center gap-3 py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-0.5 shadow-md">
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
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                  </svg>
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
                        <span>الملف الشخصي</span>
                      </Link>
                    )}

                    {/* Sign Out Mobile */}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 py-3 px-4 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200 rounded-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Theme Toggle Mobile for non-authenticated users */}
                  <div className="flex items-center justify-between px-4 py-3 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                    <span>الوضع {theme === 'dark' ? 'النهاري' : 'الليلي'}</span>
                    <ThemeToggle />
                  </div>

                  <Link href="/login" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                    تسجيل الدخول
                  </Link>
                  <Link href="/signup" className="block py-3 px-4 text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors duration-200">
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
