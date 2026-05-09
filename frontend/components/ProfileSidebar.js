'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { motion } from 'framer-motion';
import {
    User,
    Settings,
    LayoutDashboard,
    FileText,
    TrendingUp,
    Download,
    Edit3,
    Layout,
    Users,
    ChevronRight,
    Home,
    DollarSign,
    Bell,
    LogOut,
    Package
} from 'lucide-react';

const ProfileSidebar = ({ userStatus, onNavigate, activeSection, role }) => {
    const pathname = usePathname();
    const { logout, ensureTokenInHeaders } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const isCreator = userStatus?.toLowerCase() === 'approved';
    const isAdmin = role?.toLowerCase() === 'admin';

    // Fetch live notifications unread count for sidebar badge
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                if (ensureTokenInHeaders()) {
                    const res = await api.get('/notifications');
                    if (res.data.success) {
                        setUnreadCount(res.data.unreadCount || 0);
                    }
                }
            } catch (err) {
                console.error('Error fetching unread count on sidebar:', err);
            }
        };

        fetchUnreadCount();
        
        // Listen to custom event when notifications are marked read in the main feed
        const handleNotificationsRead = () => {
            fetchUnreadCount();
        };
        window.addEventListener('notificationsMarkedRead', handleNotificationsRead);

        // Poll unread count every 60 seconds
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => {
            clearInterval(interval);
            window.removeEventListener('notificationsMarkedRead', handleNotificationsRead);
        };
    }, [ensureTokenInHeaders]);

    const generalLinks = isCreator 
        ? [
            { section: 'profile', href: '/profile', label: 'نظرة عامة', icon: LayoutDashboard },
            { section: 'notifications', href: '/profile?tab=notifications', label: 'التنبيهات', icon: Bell },
            { section: 'settings', href: '/profile?tab=settings', label: 'الإعدادات', icon: Settings },
          ]
        : [
            { section: 'settings', href: '/profile', label: 'إعدادات الحساب', icon: Settings },
            { section: 'notifications', href: '/profile?tab=notifications', label: 'التنبيهات', icon: Bell },
            { section: 'purchases', href: '/profile?tab=purchases', label: 'مشترياتي', icon: Download },
          ];

    const adminLinks = isAdmin ? [
        { section: 'admin-dashboard', href: '/admin', label: 'لوحة التحكم العامة', icon: LayoutDashboard },
        { section: 'admin-templates', href: '/admin/templates', label: 'إدارة القوالب', icon: Layout },
        { section: 'admin-blogs', href: '/admin/blogs', label: 'إدارة المقالات', icon: FileText },
        { section: 'admin-creators', href: '/admin/creator-applications', label: 'طلبات المبدعين', icon: Users },
        { section: 'admin-payouts', href: '/admin/payouts', label: 'إدارة السحوبات', icon: DollarSign, disabled: true },
    ] : [];

    const contentLinks = isCreator ? [
        { section: 'templates', href: '/profile?tab=templates', label: 'قوالبي', icon: Package },
        { section: 'blogs', href: '/profile?tab=blogs', label: 'مقالاتي', icon: Edit3 },
    ] : [];

    const analyticsLinks = isCreator ? [
        { section: 'analytics', href: '/profile?tab=analytics', label: 'تحليلات الأداء', icon: TrendingUp },
        { section: 'sales', href: '/profile?tab=sales', label: 'سجلات التحميل', icon: Download },
        { section: 'earnings', href: '/profile?tab=earnings', label: 'الأرباح والسحوبات', icon: DollarSign, disabled: true },
    ] : [];

    const NavSection = ({ title, links }) => {
        if (links.length === 0) return null;

        return (
            <div className="mb-6">
                <h3 className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider mb-3 px-3">
                    {title}
                </h3>
                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = activeSection === link.section && !link.disabled;

                        return (
                            <Link
                                key={link.href}
                                href={link.disabled ? '#' : link.href}
                                onClick={(e) => {
                                    if (link.disabled) {
                                        e.preventDefault();
                                        return;
                                    }
                                    // If it's a tab change on the same page, prevent default and use onNavigate
                                    if ((link.href.startsWith('/profile?tab=') || link.href === '/profile') && onNavigate) {
                                        e.preventDefault();
                                        onNavigate(link.section);
                                    }
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 relative group overflow-hidden ${
                                    link.disabled
                                        ? 'text-gray-400/70 dark:text-dark-text-tertiary/40 cursor-not-allowed select-none'
                                        : isActive
                                            ? 'text-primary-600 dark:text-orange-400 font-black'
                                            : 'text-gray-700 dark:text-dark-text-secondary hover:text-gray-950 dark:hover:text-white'
                                    }`}
                            >
                                {/* Framer Motion Sliding Indicator */}
                                {isActive && !link.disabled && (
                                    <motion.span
                                        layoutId="activeTabIndicator"
                                        className="absolute inset-0 bg-primary-50/75 dark:bg-orange-500/10 rounded-xl -z-10"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}

                                <div className="flex items-center gap-3 relative z-10">
                                    <Icon size={18} className={`transition-transform duration-300 ${!link.disabled && 'group-hover:scale-110'} ${isActive ? 'text-primary-600 dark:text-orange-400' : 'text-gray-400 dark:text-dark-text-tertiary'}`} />
                                    <span>{link.label}</span>
                                </div>

                                {/* Custom real-time badge for notifications tab */}
                                {link.section === 'notifications' && unreadCount > 0 && (
                                    <span className="relative z-10 flex h-5 min-w-5 items-center justify-center px-1.5 rounded-full bg-primary-500 text-xxs font-black text-white shadow-glow animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}

                                {link.disabled && (
                                    <span className="relative z-10 text-[9px] font-black bg-gray-100 dark:bg-dark-tertiary/50 text-gray-400 dark:text-dark-text-tertiary/80 px-1.5 py-0.5 rounded-md">
                                        قريباً
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        );
    };

    return (
        <>
            {/* Mobile Home Link - Immediate exit for small screens */}
            <Link
                href="/"
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-xl shadow-medium text-primary-600 dark:text-orange-400 hover:scale-105 active:scale-95 transition-all"
                aria-label="العودة للرئيسية"
            >
                <Home size={20} />
            </Link>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-xl shadow-medium text-gray-800 dark:text-white hover:scale-105 active:scale-95 transition-all"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed top-0 right-0 h-screen
                w-64 bg-white dark:bg-dark-secondary border-none shadow-2xl lg:shadow-none
                p-6 overflow-y-auto scrollbar-hide z-40
                transition-transform duration-300 lg:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className="mb-6 px-3">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/brand/NavLogoDark.svg"
                            alt="عرب نوشن"
                            width={140}
                            height={40}
                            className="h-8 w-auto dark:hidden"
                            unoptimized
                        />
                        <Image
                            src="/brand/NavLogoLight.svg"
                            alt="عرب نوشن"
                            width={140}
                            height={40}
                            className="h-8 w-auto hidden dark:block"
                            unoptimized
                        />
                    </Link>
                </div>

                {/* Back to Site Link */}
                <div className="mb-4 px-3">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-primary-600 dark:text-orange-400 bg-primary-50 dark:bg-orange-500/10 font-black hover:bg-primary-100 dark:hover:bg-orange-500/20 transition-all shadow-sm hover:translate-x-[-2px] border-none"
                    >
                        <Home size={18} />
                        <span>العودة للموقع</span>
                    </Link>
                </div>

                <div className="h-px bg-gray-100/50 dark:bg-white/5 mb-4 mx-3" />

                <NavSection title="لوحة التحكم" links={generalLinks} />
                {isCreator && (
                    <>
                        <NavSection title="المحتوى" links={contentLinks} />
                        <NavSection title="الأداء والمالية" links={analyticsLinks} />
                    </>
                )}

                {isAdmin && (
                    <NavSection title="الإدارة" links={adminLinks} />
                )}

                <div className="h-px bg-gray-100 dark:bg-dark-card-border my-4 mx-3" />

                <div className="mb-4">
                    <h3 className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider mb-2 px-3">
                        المجتمع
                    </h3>
                    <nav className="space-y-1">
                        <a
                            href={isCreator ? "https://t.me/+jNEkx52yB4Q0MmU0" : "https://t.me/Notion_Arabs"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-all group hover:translate-x-[-2px]"
                        >
                            <svg className="w-[18px] h-[18px] text-[#24A1DE] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                            <span className="font-bold">{isCreator ? "قناة المبدعين" : "قناة عرب نوشن"}</span>
                        </a>
                    </nav>
                </div>

                {/* Logout Action Button Section */}
                <div className="h-px bg-gray-100 dark:bg-dark-card-border my-4 mx-3" />
                <div className="mb-8 px-3">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/15 transition-all hover:translate-x-[-2px] active:scale-95 border-none cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
};

export default ProfileSidebar;
