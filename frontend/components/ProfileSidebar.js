'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    User,
    Settings,
    LayoutDashboard,
    FileText,
    TrendingUp,
    Download,
    Edit3,
    ChevronRight,
    Home
} from 'lucide-react';

const ProfileSidebar = ({ userStatus, onNavigate, activeSection }) => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isCreator = userStatus === 'approved';

    const generalLinks = [
        { section: 'profile', href: '/profile', label: 'الملف الشخصي', icon: User },
        { section: 'settings', href: isCreator ? '/profile?tab=settings' : '/user-settings', label: 'الإعدادات', icon: Settings },
    ];

    const contentLinks = isCreator ? [
        { section: 'templates', href: '/profile?tab=templates', label: 'قوالبي', icon: LayoutDashboard },
        { section: 'blogs', href: '/profile?tab=blogs', label: 'مقالاتي', icon: Edit3 },
    ] : [];

    const analyticsLinks = isCreator ? [
        { section: 'sales', href: '/profile?tab=sales', label: 'سجلات التحميل', icon: Download },
        { section: 'analytics', href: '/profile?tab=analytics', label: 'التحليلات', icon: TrendingUp },
    ] : [];

    const NavSection = ({ title, links }) => {
        if (links.length === 0) return null;

        return (
            <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider mb-3 px-3">
                    {title}
                </h3>
                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = activeSection === link.section;

                        return (
                            <button
                                key={link.href}
                                onClick={() => {
                                    if (onNavigate) {
                                        onNavigate(link.section);
                                    }
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                                    ? 'bg-primary-50 dark:bg-orange-500/10 text-primary-600 dark:text-orange-400 font-medium'
                                    : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-tertiary'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{link.label}</span>
                            </button>
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
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-lg shadow-sm text-primary-600 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors"
                aria-label="العودة للرئيسية"
            >
                <Home size={20} />
            </Link>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-lg shadow-sm"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
            </button>

            {/* Sidebar */}
            <aside className={`
        fixed top-0 right-0 h-screen
        w-64 bg-white dark:bg-dark-secondary border-l lg:border-l-0 lg:border-r border-gray-200 dark:border-dark-card-border
        p-6 overflow-y-auto z-40
        transition-transform duration-300 lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo Section */}
                <div className="mb-8 px-3">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/NavLogo.svg"
                            alt="عرب نوشن"
                            width={140}
                            height={40}
                            className="h-8 w-auto dark:hidden"
                            unoptimized
                        />
                        <Image
                            src="/NavLogoLight.svg"
                            alt="عرب نوشن"
                            width={140}
                            height={40}
                            className="h-8 w-auto hidden dark:block"
                            unoptimized
                        />
                    </Link>
                </div>

                {/* Back to Site Link */}
                <div className="mb-6 px-3">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary-600 dark:text-orange-400 bg-primary-50 dark:bg-orange-500/10 font-bold hover:bg-primary-100 dark:hover:bg-orange-500/20 transition-colors border border-primary-100 dark:border-orange-500/20 shadow-sm"
                    >
                        <Home size={18} />
                        <span>العودة للموقع</span>
                    </Link>
                </div>

                <div className="h-px bg-gray-100 dark:bg-dark-card-border mb-6 mx-3" />

                <NavSection title="عام" links={generalLinks} />
                {isCreator && (
                    <>
                        <NavSection title="المحتوى" links={contentLinks} />
                        <NavSection title="التحليلات" links={analyticsLinks} />
                    </>
                )}
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
};

export default ProfileSidebar;
