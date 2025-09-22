'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Picture Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full transition-all duration-200 hover:scale-105 relative ${user?.creatorStatus === 'approved' ? 'p-0.5' : ''
          }`}
        aria-label="فتح قائمة المستخدم"
      >
        {user?.creatorStatus === 'approved' ? (
          // Premium styling for approved creators
          <div className="relative">
            {/* Golden gradient border for approved creators */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-white dark:bg-dark-secondary">
                {user?.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={`صورة ${user.name}`}
                    width={40}
                    height={40}
                    className="w-full h-full rounded-full object-cover"
                    quality={100}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Creator badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
        ) : (
          // Regular styling for non-creators
          <>
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={`صورة ${user.name}`}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer"
                quality={100}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all duration-200 cursor-pointer border-2 border-white/20 hover:border-white/40">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-dark-secondary rounded-xl shadow-large dark:shadow-dark-large border border-gray-200 dark:border-dark-card-border py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-card-border">
            <div className="flex items-center gap-3">
              {user?.creatorStatus === 'approved' ? (
                // Premium styling for approved creators in dropdown
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-0.5 shadow-md">
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
                  {/* Creator badge in dropdown */}
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
              ) : (
                // Regular styling for non-creators in dropdown
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
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">
                    {user?.name}
                  </p>
                  {user?.creatorStatus === 'approved' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-300">
                      مبدع
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Dropdown Items */}
          <div className="py-2">
            {/* Profile Link - Only for approved creators (First Priority) */}
            {user?.creatorStatus === 'approved' && (
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm">الملف الشخصي</span>
              </Link>
            )}

            {/* Admin: Accepting Requests OR Regular User: Creator Status (Second Priority) */}
            {user?.role === 'admin' ? (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm">قبول الطلبات</span>
              </Link>
            ) : (
              <>
                {/* Pending Status */}
                {user?.creatorStatus === 'pending' && (
                  <div className="w-full px-4 py-3 text-right flex items-center gap-3 text-amber-600 dark:text-amber-400">
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
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200"
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
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm">التسجيل كمبدع</span>
                  </Link>
                )}
              </>
            )}

            {/* Settings Link */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">الإعدادات</span>
            </Link>

            {/* Orders Link */}
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-3 text-right flex items-center gap-3 text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm">الطلبات</span>
            </Link>

            {/* Sign Out with Theme Toggle */}
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 rounded-lg px-3 py-2 flex-1 text-right"
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
      )}
    </div>
  );
}
