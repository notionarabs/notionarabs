'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import LoadingLink from './LoadingLink';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Settings, ShoppingBag, LogOut,
  ShieldCheck, Loader2, Sparkles,
  AlertCircle, RefreshCw, LayoutDashboard, Eye, ExternalLink, Bell
} from 'lucide-react';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, refreshUserData } = useAuth();

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

  // Animation variants
  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const isCreator = user?.creatorStatus?.toLowerCase() === 'approved';
  const isPending = user?.creatorStatus?.toLowerCase() === 'pending';
  const isRejected = user?.creatorStatus?.toLowerCase() === 'rejected';

  // Helper component for menu items
  const MenuItem = ({ href, onClick, icon: Icon, label, colorClass = "text-gray-700 dark:text-gray-200", badge }) => {
    const content = (
      <div className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl transition-all duration-200 group hover:bg-gray-100 dark:hover:bg-dark-tertiary`}>
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-dark-tertiary group-hover:bg-white dark:group-hover:bg-dark-secondary transition-colors shadow-sm ${colorClass}`}>
            <Icon size={18} />
          </div>
          <span className={`text-sm font-medium ${colorClass} group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform`}>
            {label}
          </span>
        </div>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            {badge}
          </span>
        )}
      </div>
    );

    if (href) {
      return (
        <LoadingLink href={href} onClick={() => { setIsOpen(false); onClick?.(); }}>
          {content}
        </LoadingLink>
      );
    }

    return (
      <button onClick={() => { setIsOpen(false); onClick?.(); }} className="w-full text-right">
        {content}
      </button>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Picture Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group focus:outline-none"
        aria-label="User Menu"
      >
        <div className={`
          relative w-11 h-11 rounded-full p-[2px] transition-all duration-300
          ${isOpen ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-dark-primary' : ''}
          ${isCreator ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500' : 'bg-gray-200 dark:bg-gray-700'}
        `}>
          <div className="w-full h-full rounded-full bg-white dark:bg-dark-secondary overflow-hidden relative">
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={user.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold text-lg">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Status Indicators */}
          {(isCreator || isPending) && (
            <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-dark-secondary p-[1.5px] rounded-full">
              <div className={`
                w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] border border-white dark:border-dark-secondary
                ${isCreator ? 'bg-blue-500 text-white' : 'bg-amber-400 text-white'}
              `}>
                {isCreator ? <Sparkles size={8} fill="currentColor" /> : <Loader2 size={8} className="animate-spin" />}
              </div>
            </div>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="absolute left-0 mt-3 w-72 origin-top-left z-50"
          >
            <div className="bg-white/90 dark:bg-dark-secondary/90 backdrop-blur-xl border border-gray-200/50 dark:border-dark-card-border/50 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5" dir="rtl">

              {/* Header Section */}
              <div className="p-4 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-dark-tertiary/20 dark:to-dark-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user?.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
                      {user?.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                      {user?.email}
                    </p>
                    {isCreator && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <Sparkles size={10} />
                        مبدع موثق
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2 space-y-1">
                {user?.role?.toLowerCase() === 'admin' ? (
                  <>
                    <div className="mb-2 p-1 bg-gray-50 dark:bg-dark-tertiary/30 rounded-xl border border-gray-100 dark:border-dark-card-border/50">
                      <MenuItem
                        href="/admin"
                        icon={ShieldCheck}
                        label="لوحة الإدارة"
                        colorClass="text-green-600 dark:text-green-400"
                      />
                    </div>
                    <MenuItem
                      href="/admin/settings"
                      icon={Settings}
                      label="إعدادات المنصة"
                    />
                  </>
                ) : isCreator ? (
                  <div className="space-y-0.5">
                    <MenuItem
                      href="/profile"
                      icon={LayoutDashboard}
                      label="لوحة المبدع"
                      badge="استوديو"
                      colorClass="text-primary-600 dark:text-orange-400"
                    />
                    <MenuItem
                      href={`/creators/${user?.username || user?.id || ''}`}
                      icon={Eye}
                      label="صفحتي العامة"
                    />
                    <MenuItem
                      href="/profile?tab=settings"
                      icon={Settings}
                      label="الإعدادات"
                    />
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <MenuItem
                      href="/profile"
                      icon={Settings}
                      label="إعدادات الحساب"
                    />
                    <MenuItem
                      href="/profile?tab=notifications"
                      icon={Bell}
                      label="التنبيهات"
                    />
                    <MenuItem
                      href="/profile?tab=purchases"
                      icon={ShoppingBag}
                      label="مشترياتي"
                    />
                  </div>
                )}

                {/* Creator Status Section */}
                {user?.role?.toLowerCase() !== 'admin' && !isCreator && (
                  <div className="my-2">
                    {isPending ? (
                      <div className="mx-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="text-amber-600 dark:text-amber-400 animate-spin" />
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">قيد المراجعة</span>
                        </div>
                        <button onClick={refreshUserData} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-full transition-colors">
                          <RefreshCw size={14} className="text-amber-600 dark:text-amber-400" />
                        </button>
                      </div>
                    ) : isRejected ? (
                      <Link href="/creators/apply" onClick={() => setIsOpen(false)} className="block mx-2">
                        <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                          <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                            <span className="text-xs font-bold text-red-700 dark:text-red-400">طلب مرفوض</span>
                          </div>
                          <span className="text-[10px] underline text-red-600">إعادة التقديم</span>
                        </div>
                      </Link>
                    ) : (
                      <Link
                        href="/creators/apply"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 mx-1 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.02] transition-all duration-200 group"
                      >
                        <div className="p-1 rounded-full bg-white/20">
                          <Sparkles size={14} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">انضم كمبدع</span>
                          <span className="text-[10px] text-white/80 font-medium">ابدأ ببيع منتجاتك الآن</span>
                        </div>
                      </Link>
                    )}
                  </div>
                )}

                <div className="h-px bg-gray-100 dark:bg-dark-card-border my-1 mx-2" />

                {/* System Actions */}
                <div className="flex items-center justify-between px-2 pt-1 pb-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors text-xs font-bold"
                  >
                    <LogOut size={16} />
                    تسجيل خروج
                  </button>
                  <div className="scale-90 origin-right rtl:origin-left">
                    <ThemeToggle />
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
