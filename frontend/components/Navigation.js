'use client';

import { useState, useEffect, useRef, memo, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLoading } from '../contexts/LoadingContext';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import { Layout, Zap, BookOpen, Users, Compass, Home, Calendar, Search, User as UserIcon, Command, Briefcase, ShoppingBag } from 'lucide-react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import SearchPalette from './SearchPalette';

const UserNotifications = dynamic(() => import('./UserNotifications'), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-dark-tertiary/50 animate-pulse" />
});

const Navigation = memo(function Navigation({ activePage = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { setLoading } = useLoading();
  const { theme } = useTheme();
  const pathname = usePathname();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Handle navigation click - Triggers loading state if route changes
  const handleNavigation = (href) => {
    setIsMenuOpen(false);

    // Check if we are navigating to a different page
    // We need to handle relative paths and full URLs if necessary
    // Simple check: if pathname is not the target href
    const targetPath = href.split('?')[0];
    const currentPath = pathname.split('?')[0];

    if (targetPath !== currentPath) {
      setLoading(true, 'navigation');
    }
  };

  // Close menu when logout is clicked
  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  // Memoize navigation items to prevent unnecessary re-renders
  const navItems = useMemo(() => [
    { href: '/templates', label: 'القوالب', key: 'templates', icon: <Layout className="w-4 h-4" />, color: 'hover:text-emerald-400' },
    { href: '/blog', label: 'المدونة', key: 'blog', icon: <BookOpen className="w-4 h-4" />, color: 'hover:text-blue-400' },
    { href: '/widgets', label: 'الأدوات', key: 'widgets', icon: <Zap className="w-4 h-4" />, color: 'hover:text-orange-400' },
    { href: '/store', label: 'المتجر', key: 'store', icon: <ShoppingBag className="w-4 h-4" />, color: 'hover:text-amber-400' }
  ], []);

  return (
    <>
      <header ref={menuRef} className="w-full bg-accent-500/90 dark:bg-dark-secondary/90 sticky top-0 z-50 shadow-sm border-b border-white/10 dark:border-dark-card-border/30 backdrop-blur-2xl transition-all duration-300">
        <div className="container-custom flex justify-between items-center py-4">
          <Link
            href="/"
            className="flex items-center"
            aria-label="الرئيسية - عرب نوشن"
            onClick={() => handleNavigation('/')}
          >
            <Image
              src="/brand/NavLogoLight.svg"
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
              <Link
                href="/"
                className="nav-link whitespace-nowrap"
                onClick={() => handleNavigation('/')}
              >
                <div className="flex items-center gap-2 group/nav hover:text-primary-300">
                  <Home className="w-4 h-4 transition-transform duration-300 group-hover/nav:scale-110 group-hover/nav:rotate-3" />
                  <span>الرئيسية</span>
                </div>
              </Link>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`nav-link flex items-center gap-2 group/nav ${activePage === item.key ? 'nav-link-active' : ''}`}
                onClick={() => handleNavigation(item.href)}
              >
                <span className="transition-all duration-300 group-hover:scale-110 group-hover:text-primary">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-300 hover:text-white dark:text-dark-text-tertiary dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary rounded-xl transition-all ml-2 group/search relative"
              aria-label="بحث"
            >
              <Search className="w-5 h-5 group-hover/search:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full scale-0 group-hover/search:scale-100 transition-transform"></div>
            </button>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">

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
                    className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white/5 dark:bg-dark-tertiary/50 backdrop-blur-md border border-white/20 dark:border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 group transition-all duration-500 shadow-inner"
                    aria-label="تسجيل الدخول"
                    title="تسجيل الدخول"
                    onClick={() => handleNavigation('/login')}
                  >
                    <div className="absolute inset-0 rounded-full bg-orange-500/5 opacity-0 group-hover:opacity-100 blur-md transition-opacity"></div>
                    <UserIcon className="w-6 h-6 text-gray-300 dark:text-dark-text-secondary group-hover:text-orange-500 transition-colors" />
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

        {/* Mobile Menu - Enhanced with Glassmorphism */}
        <div className={`md:hidden absolute top-full left-0 right-0 z-40 bg-accent-600/95 dark:bg-dark-secondary/95 backdrop-blur-xl border-b border-white/10 dark:border-dark-card-border shadow-2xl transition-all duration-300 ease-in-out origin-top ${isMenuOpen ? 'opacity-100 visible scale-y-100' : 'opacity-0 invisible scale-y-95 pointer-events-none'}`}>
          <div className="container-custom py-6 flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
            {/* Mobile Navigation Links */}
            <nav className="space-y-2 mb-6" aria-label="Mobile navigation">
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activePage !== 'home' ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
                <Link
                  href="/"
                  onClick={() => handleNavigation('/')}
                  className="flex items-center justify-between py-3 px-4 text-gray-100 dark:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary rounded-xl transition-all active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activePage === 'home' ? 'bg-primary-500 text-white' : 'bg-white/10 dark:bg-dark-tertiary text-gray-400'}`}>
                      <Home className="w-4 h-4" />
                    </div>
                    <span className="font-bold">الرئيسية</span>
                  </div>
                  <svg className="w-5 h-5 opacity-50 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center justify-between py-4 px-4 rounded-2xl transition-all active:scale-[0.98] mb-1 ${activePage === item.key
                    ? 'bg-primary-500/10 text-primary-400 font-bold border border-primary-500/20'
                    : 'text-gray-100 dark:text-dark-text-primary hover:bg-white/5 dark:hover:bg-dark-tertiary/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activePage === item.key ? 'bg-primary-500 text-white' : 'bg-white/10 dark:bg-dark-tertiary text-gray-400'}`}>
                      {item.icon}
                    </div>
                    <span className="font-bold">{item.label}</span>
                  </div>
                  {activePage === item.key ? (
                    <div className="w-1.5 h-6 rounded-full bg-primary-500 shadow-[0_0_12px_rgba(251,146,60,0.4)]"></div>
                  ) : (
                    <svg className="w-5 h-5 opacity-30 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  )}
                </Link>
              ))}
            </nav>



            {/* User Section or Auth Buttons */}
            <div className="mt-auto bg-black/10 dark:bg-black/20 rounded-2xl p-4 border border-white/5">
              {loading ? (
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-white/20"></div>
                  <div className="h-4 w-24 bg-white/20 rounded"></div>
                </div>
              ) : isAuthenticated ? (
                <div className="space-y-4">
                  {/* User Info Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="relative">
                      {user?.profilePicture ? (
                        <Image
                          src={user.profilePicture}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      {user?.creatorStatus === 'approved' && (
                        <span className="absolute -bottom-1 -right-1 bg-blue-500 text-[10px] text-white p-0.5 rounded-full border-2 border-accent-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <ThemeToggle />
                  </div>

                  {/* Mobile User Menu Links */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={user?.role?.toLowerCase() === 'admin' ? "/admin" : (user?.creatorStatus === 'approved' ? "/profile" : "/purchases")}
                      onClick={() => handleNavigation(user?.role?.toLowerCase() === 'admin' ? "/admin" : (user?.creatorStatus === 'approved' ? "/profile" : "/purchases"))}
                      className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="text-xs font-medium text-gray-200">
                        {user?.role?.toLowerCase() === 'admin' ? 'لوحة الإدارة' : (user?.creatorStatus === 'approved' ? 'الملف الشخصي' : 'مشترياتي')}
                      </span>
                    </Link>

                    <Link
                      href={user?.creatorStatus === 'approved' ? "/profile?tab=settings" : "/user-settings"}
                      onClick={() => handleNavigation(user?.creatorStatus === 'approved' ? "/profile?tab=settings" : "/user-settings")}
                      className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-xs font-medium text-gray-200">الإعدادات</span>
                    </Link>
                  </div>

                  {/* Creator Status Section for Mobile */}
                  {user?.role?.toLowerCase() !== 'admin' && user?.creatorStatus !== 'approved' && (
                    <div className="pt-2">
                      {user?.creatorStatus === 'pending' ? (
                        <div className="w-full px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-sm font-medium text-amber-200">طلبك قيد المراجعة</span>
                        </div>
                      ) : user?.creatorStatus === 'rejected' ? (
                        <Link
                          href="/creators/apply"
                          onClick={() => handleNavigation('/creators/apply')}
                          className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between group hover:bg-red-500/20 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-sm font-medium text-red-200">طلب مرفوض</span>
                          </div>
                          <span className="text-xs text-red-300 underline">إعادة التقديم</span>
                        </Link>
                      ) : (
                        <Link
                          href="/creators/apply"
                          onClick={() => handleNavigation('/creators/apply')}
                          className="w-full p-0.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 block shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all"
                        >
                          <div className="flex items-center gap-3 px-4 py-3 bg-black/40 rounded-[10px] hover:bg-transparent transition-colors h-full">
                            <div className="p-1.5 rounded-full bg-white/20">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white leading-none mb-1">انضم كمبدع</span>
                              <span className="text-[10px] text-gray-200 font-medium leading-none">ابدأ ببيع قوالبك الآن</span>
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-gray-300">مظهر التطبيق</span>
                    <ThemeToggle />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" onClick={() => handleNavigation('/login')} className="btn-secondary text-center py-2.5 text-sm">
                      تسجيل الدخول
                    </Link>
                    <Link href="/signup" onClick={() => handleNavigation('/signup')} className="btn-primary text-center py-2.5 text-sm">
                      حساب جديد
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links for Mobile */}
            <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-white/10">
              <a href="https://twitter.com/notionarabs" target="_blank" rel="noopener" className="text-gray-400 hover:text-[#1DA1F2] transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg></a>
              <a href="https://youtube.com/@notionarabs" target="_blank" rel="noopener" className="text-gray-400 hover:text-[#FF0000] transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.58 5.4a2.83 2.83 0 00-2-2C17.84 3 12 3 12 3s-5.84 0-7.58.4a2.83 2.83 0 00-2 2C2 7.15 2 12 2 12s0 4.85.42 6.6a2.83 2.83 0 002 2c1.74.4 7.58.4 7.58.4s5.84 0 7.58-.4a2.83 2.83 0 002-2C22 16.85 22 12 22 12s0-4.85-.42-6.6zM9.75 15.02V8.83l6.5 3.09-6.5 3.1z" /></svg></a>
              <a href="https://t.me/Notion_Arabs" target="_blank" rel="noopener" className="text-gray-400 hover:text-[#0088cc] transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" /></svg></a>
            </div>
          </div>
        </div>

      </header>

      {/* Search Palette Component - Independent Stacking */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchPalette
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

export default Navigation;
