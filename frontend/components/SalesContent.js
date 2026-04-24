'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/dateUtils';
import api from '../lib/api';
import ExportButton from './ExportButton';
import Cookies from 'js-cookie';

export default function SalesContent() {
    const { user } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [viewMode, setViewMode] = useState('downloads'); // downloads | sales
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 20 });
    const [templateFilter, setTemplateFilter] = useState('all');

    const fetchData = async (page = 1, templateId, mode = viewMode) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) });
            if (templateId && templateId !== 'all') params.set('templateId', templateId);
            
            const endpoint = mode === 'sales' ? '/creators/me/sales' : '/creators/me/downloads';
            const res = await api.get(`${endpoint}?${params.toString()}`);
            
            if (res?.data?.success) {
                setRows(mode === 'sales' ? res.data.sales : res.data.downloads || []);
                setPagination(res.data.pagination || { current: page, pages: 1, total: 0, limit: 20 });
            }
        } catch (error) {
            console.error(`Error fetching ${mode}:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, templateFilter, viewMode);
    }, [templateFilter, viewMode]);

    const handlePageChange = (newPage) => {
        fetchData(newPage, templateFilter, viewMode);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calculate dynamic stats
    const stats = useMemo(() => {
        const total = pagination.total || 0;
        const uniqueUsers = new Set(rows.map(r => r.userId || r.buyer?.email)).size;
        return { total, uniqueUsers };
    }, [rows, pagination.total]);

    return (
        <>
            {/* Header section with Stats */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2">
                            سجل المبيعات والتحميلات
                        </h1>
                        <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
                            تتبع جميع عمليات {viewMode === 'sales' ? 'مبيعات' : 'تحميل'} القوالب الخاصة بك
                        </p>
                    </div>

                    <div className="flex p-1.5 bg-gray-100 dark:bg-dark-tertiary rounded-2xl border border-gray-200 dark:border-dark-card-border">
                        <button
                            onClick={() => setViewMode('downloads')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${viewMode === 'downloads' ? 'bg-white dark:bg-dark-secondary text-primary-600 shadow-medium dark:shadow-dark-medium' : 'text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-primary'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            التحميلات المجانية
                        </button>
                        <button
                            onClick={() => setViewMode('sales')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${viewMode === 'sales' ? 'bg-white dark:bg-dark-secondary text-primary-600 shadow-medium dark:shadow-dark-medium' : 'text-gray-500 hover:text-gray-700 dark:hover:text-dark-text-primary'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 8V7m0 1v1m0 0v1m0 0v1m0-5V5m0 5h1m-1 0H11" />
                            </svg>
                            المبيعات المدفوعة
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">إجمالي التحميلات</p>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary">{stats.total}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-accent-50 dark:bg-accent-900/20 rounded-2xl flex items-center justify-center text-accent-600 dark:text-accent-400 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">مستخدمون فريدون</p>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary">{stats.uniqueUsers}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gray-50 dark:bg-dark-tertiary rounded-2xl flex items-center justify-center text-gray-400 dark:text-dark-text-secondary group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-500">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">التقارير</p>
                                <h3 className="text-lg font-black text-gray-900 dark:text-dark-text-primary">تصدير السجل</h3>
                            </div>
                        </div>
                        <ExportButton
                            endpoint={`/creators/me/downloads/export-public?token=${Cookies.get('authToken') || ''}${templateFilter !== 'all' ? `&templateId=${templateFilter}` : ''}`}
                            filename={`sales-report-${templateFilter === 'all' ? 'all' : 'template'}-${new Date().toISOString().split('T')[0]}.csv`}
                            label="تصدير بصيغة CSV"
                            direct={true}
                            className="w-full justify-center !py-2.5 !text-xs font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-3xl shadow-sm overflow-hidden hidden sm:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-dark-tertiary/30 border-b border-gray-100 dark:border-dark-card-border">
                                <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary uppercase tracking-wider">المستخدم</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary uppercase tracking-wider">البريد الإلكتروني</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary uppercase tracking-wider">القالب</th>
                                {viewMode === 'sales' && (
                                    <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary uppercase tracking-wider">المبلغ</th>
                                )}
                                <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary uppercase tracking-wider">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-card-border">
                            {isLoading ? (
                                [...Array(5)].map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div></td>
                                        <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div></td>
                                    </tr>
                                ))
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-dark-text-secondary">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </div>
                                            <p className="font-medium">لا توجد عمليات تحميل حتى الآن</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-black uppercase">
                                                    {(row.buyer?.name || row.userName || row.userUsername || 'U')[0]}
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-dark-text-primary text-sm">
                                                    {row.buyer?.name || row.userName || row.userUsername || 'مستخدم'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary font-medium font-mono">
                                            {row.buyer?.email || row.userEmail}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/templates/${row.templateId}`} className="group flex items-center gap-3">
                                                {row.previewImage && (
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-dark-card-border">
                                                        <Image
                                                            src={row.previewImage}
                                                            alt={row.templateTitle}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                )}
                                                <span className="font-bold text-gray-900 dark:text-dark-text-primary text-sm group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors">
                                                    {row.templateTitle}
                                                </span>
                                            </Link>
                                        </td>
                                        {viewMode === 'sales' && (
                                            <td className="px-6 py-4 text-sm font-black text-emerald-600 dark:text-emerald-400">
                                                {row.price} ج.م
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-text-tertiary font-medium">
                                            {formatDate(row.date)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="sm:hidden space-y-4">
                {isLoading ? (
                    [...Array(3)].map((_, index) => (
                        <div key={index} className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 animate-pulse">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-dark-card-border">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : rows.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                        <p className="text-gray-500 dark:text-dark-text-secondary font-medium">لا توجد عمليات تحميل حتى الآن</p>
                    </div>
                ) : (
                    rows.map((row) => (
                        <div key={row.id} className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start gap-4 mb-4">
                                {row.previewImage && (
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-dark-card-border/50">
                                        <Image
                                            src={row.previewImage}
                                            alt={row.templateTitle}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-dark-text-primary line-clamp-1 mb-1">
                                        {row.templateTitle}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                                        {formatDate(row.date)}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-dark-card-border space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-dark-text-tertiary font-medium">المستخدم</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold uppercase">
                                            {(row.userName || row.userUsername || 'U')[0]}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-dark-text-primary">
                                            {row.userName || row.userUsername || 'مستخدم غير معروف'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-dark-text-tertiary font-medium">البريد الإلكتروني</span>
                                    <span className="font-mono text-gray-600 dark:text-dark-text-secondary truncate ml-4" title={row.userEmail}>
                                        {row.userEmail?.split('@')[0]}@...
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mt-6">
                    <button
                        className="btn-outline w-full sm:w-auto px-4 py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handlePageChange(pagination.current - 1)}
                        disabled={pagination.current === 1}
                    >
                        السابق
                    </button>
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-dark-text-secondary font-medium">
                        صفحة {pagination.current} من {pagination.pages}
                    </span>
                    <button
                        className="btn-outline w-full sm:w-auto px-4 py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handlePageChange(pagination.current + 1)}
                        disabled={pagination.current === pagination.pages}
                    >
                        التالي
                    </button>
                </div>
            )}
        </>
    );
}
