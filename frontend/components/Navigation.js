'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navigation({ activePage = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <header className="w-full bg-accent-500 dark:bg-dark-secondary sticky top-0 z-50 shadow-medium dark:shadow-dark-medium backdrop-blur-sm bg-accent-500/95 dark:bg-dark-secondary/95 transition-colors duration-300">
      <div className="container-custom flex justify-between items-center py-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/NavLogoLight.svg"
            alt="عرب نوشن"
            width={240}
            height={80}
            className="h-12 w-auto"
            quality={100}
            priority
            unoptimized
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1 lg:gap-2 xl:gap-3">
          <a href="/templates" className={`nav-link ${activePage === 'templates' ? 'nav-link-active' : ''}`}>القوالب</a>
          <a href="/creators" className={`nav-link ${activePage === 'creators' ? 'nav-link-active' : ''}`}>المبدعين</a>
          <a href="/blog" className={`nav-link ${activePage === 'blog' ? 'nav-link-active' : ''}`}>المدونة</a>
          <a href="/about" className={`nav-link ${activePage === 'about' ? 'nav-link-active' : ''}`}>من نحن</a>
        </nav>

        {/* Auth Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Reserve consistent space to prevent layout shifts */}
          <div className="flex items-center gap-4 min-w-[200px] justify-end">
            {loading ? (
              <>
                {/* Loading skeleton for user info */}
                <div className="w-20 h-6 bg-white/20 rounded animate-pulse"></div>
                <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse"></div>
              </>
            ) : isAuthenticated ? (
              <>
                <span className="text-gray-300 dark:text-dark-text-tertiary">مرحباً، {user?.name}</span>

                {/* Profile Picture Link */}
                <Link href="/profile" className="flex items-center">
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={`صورة ${user.name}`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer hover:scale-105"
                      quality={100}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all duration-200 cursor-pointer hover:scale-105 border-2 border-white/20 hover:border-white/40">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </Link>
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
          <ThemeToggle />
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
              <a href="/templates" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                القوالب
              </a>
              <a href="/creators" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                المبدعين
              </a>
              <a href="/blog" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                المدونة
              </a>
              <a href="/about" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                من نحن
              </a>
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
                  <div className="flex items-center gap-3 px-4 py-3 text-gray-300 dark:text-dark-text-tertiary bg-white/5 dark:bg-dark-tertiary rounded-xl">
                    <span>مرحباً، {user?.name}</span>
                  </div>

                  {/* Mobile Profile Picture Link */}
                  <Link href="/profile" className="flex items-center gap-3 py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                    {user?.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={`صورة ${user.name}`}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border border-white/20"
                        quality={100}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    <span>الملف الشخصي</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <a href="/login" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                    تسجيل الدخول
                  </a>
                  <a href="/signup" className="block py-3 px-4 text-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors duration-200">
                    إنشاء حساب
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
