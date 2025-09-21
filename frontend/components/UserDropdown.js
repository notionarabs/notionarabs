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
        className="flex items-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full transition-all duration-200 hover:scale-105"
        aria-label="فتح قائمة المستخدم"
      >
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
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-dark-secondary rounded-xl shadow-large dark:shadow-dark-large border border-gray-200 dark:border-dark-card-border py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-card-border">
            <div className="flex items-center gap-3">
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Dropdown Items */}
          <div className="py-2">
            {/* Theme Toggle */}
            <div className="w-full px-4 py-3 text-right flex items-center justify-between text-gray-700 dark:text-dark-text-secondary">
              <span className="text-sm">الوضع</span>
              <ThemeToggle />
            </div>

            {/* Admin: Accepting Requests OR Regular User: Creator Status */}
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
                {!user?.creatorStatus && (
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

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-dark-card-border my-2"></div>

            {/* Profile Link - Only for approved creators */}
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

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-right flex items-center gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
