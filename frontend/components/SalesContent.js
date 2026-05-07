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
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, DollarSign, Users, FileDown,
    ChevronRight, ChevronLeft, Inbox, ArrowUpRight, HelpCircle
} from 'lucide-react';

export default function SalesContent() {
    const { user, ensureTokenInHeaders } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [viewMode, setViewMode] = useState('activity');
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 20 });
    const [templateFilter, setTemplateFilter] = useState('all');
 
    const fetchData = async (page = 1, templateId) => {
        setIsLoading(true);
        try {
            ensureTokenInHeaders();
            const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) });
            if (templateId && templateId !== 'all') params.set('templateId', templateId);
 
            const res = await api.get(`/creators/me/activity?${params.toString()}`);
 
            if (res?.data?.success) {
                setRows(res.data.activity || []);
                setPagination(res.data.pagination || { current: page, pages: 1, total: 0, limit: 20 });
            }
        } catch (error) {
            console.error(`Error fetching activity:`, error);
        } finally {
            setIsLoading(false);
        }
    };
 
    const fetchTemplates = async () => {
        try {
            ensureTokenInHeaders();
            const res = await api.get('/templates/my-templates');
            if (res.data.success) {
                setTemplates(res.data.templates || []);
            }
        } catch (error) {
            console.error('Error fetching my templates:', error);
        }
    };
 
    useEffect(() => {
        fetchTemplates();
    }, []);
 
    useEffect(() => {
        fetchData(1, templateFilter);
    }, [templateFilter]);
 
    const handlePageChange = (newPage) => {
        fetchData(newPage, templateFilter);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
 
    // Calculate dynamic stats
    const stats = useMemo(() => {
        const total = pagination.total || 0;
        const uniqueUsers = new Set(rows.map(r => r.userId || r.userEmail)).size;
        return { total, uniqueUsers };
    }, [rows, pagination.total]);

    return (
        <div className="space-y-8 pb-12" dir="rtl">
            {/* Header section with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">
                        السجلات والمبيعات
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary font-medium">
                        تتبع ومراجعة عمليات التحميل المجانية وصفقات مبيعات قوالبك بالتفصيل
                    </p>
                </div>

                {/* Mode & Filter Segment Selector */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Template Filter Dropdown */}
                    <div className="relative min-w-[160px]">
                        <select
                            value={templateFilter}
                            onChange={(e) => setTemplateFilter(e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-dark-secondary text-gray-700 dark:text-dark-text-primary text-xs font-black rounded-xl border border-gray-100 dark:border-white/5 shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer outline-none"
                        >
                            <option value="all">جميع القوالب</option>
                            {templates.map(t => (
                                <option key={t._id} value={t._id}>{t.title}</option>
                            ))}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronLeft size={14} className="transform -rotate-90" />
                        </div>
                    </div>

                </div>
            </div>

            {/* Premium Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider">
                            {viewMode === 'sales' ? 'عدد المبيعات الكلي' : 'إجمالي التحميلات'}
                        </span>
                        <div className="p-2 bg-blue-50 text-blue-500 dark:bg-blue-950/20 rounded-xl group-hover:scale-110 transition-transform">
                            <Download size={18} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">{stats.total.toLocaleString('ar-EG')}</h3>
                </div>

                <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider">العملاء الفريدون</span>
                        <div className="p-2 bg-purple-50 text-purple-500 dark:bg-purple-950/20 rounded-xl group-hover:scale-110 transition-transform">
                            <Users size={18} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">{stats.uniqueUsers.toLocaleString('ar-EG')}</h3>
                </div>

                {/* Report Generation Center Card */}
                <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-[10px] font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider">تنزيل التقارير</span>
                            <h4 className="text-xs font-bold text-gray-700 dark:text-dark-text-primary mt-0.5">تصدير كامل للسجل الحركي</h4>
                        </div>
                        <div className="p-2 bg-gray-50 text-gray-400 dark:bg-dark-tertiary rounded-xl group-hover:bg-primary-50 dark:group-hover:bg-orange-500/10 group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors">
                            <FileDown size={18} />
                        </div>
                    </div>
                    <ExportButton
                        endpoint={`/creators/me/activity/export-public?token=${Cookies.get('authToken') || ''}${templateFilter !== 'all' ? `&templateId=${templateFilter}` : ''}`}
                        filename={`activity-report-${templateFilter === 'all' ? 'all' : 'template'}-${new Date().toISOString().split('T')[0]}.csv`}
                        label="تصدير السجل الكامل بصيغة CSV"
                        direct={true}
                        className="w-full justify-center !py-2.5 !text-[10px] font-black border-none"
                    />
                </div>
            </div>

            {/* Desktop View Table - Advanced Ledger layout */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden hidden sm:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-white/5">
                                <th className="px-5 py-4 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase">المشتري / المستخدم</th>
                                <th className="px-5 py-4 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase">البريد الإلكتروني</th>
                                <th className="px-5 py-4 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase">اسم القالب</th>
                                <th className="px-5 py-4 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase">المبلغ / القيمة</th>
                                <th className="px-5 py-4 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase">التاريخ والوقت</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {isLoading ? (
                                [...Array(5)].map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="px-5 py-4"><div className="h-5 bg-gray-100 dark:bg-dark-tertiary rounded-lg w-1/2"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-dark-tertiary rounded-lg w-3/4"></div></td>
                                        <td className="px-5 py-4"><div className="h-5 bg-gray-100 dark:bg-dark-tertiary rounded-lg w-2/3"></div></td>
                                        {viewMode === 'sales' && <td className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-dark-tertiary rounded-lg w-12"></div></td>}
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-dark-tertiary rounded-lg w-24"></div></td>
                                    </tr>
                                ))
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={viewMode === 'sales' ? 5 : 4} className="px-5 py-16 text-center text-gray-400 dark:text-dark-text-tertiary">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 dark:bg-dark-tertiary rounded-full flex items-center justify-center">
                                                <Inbox size={20} className="opacity-40" />
                                            </div>
                                            <p className="text-xs font-bold">لا توجد سجلات مسجلة في حسابك بعد</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr key={row.id || row._id} className="hover:bg-gray-50/30 dark:hover:bg-dark-tertiary/10 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Circular Name Avatar */}
                                                <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-orange-500/10 text-primary-600 dark:text-orange-400 flex items-center justify-center text-xs font-black border border-primary-500/10">
                                                    {(row.buyer?.name || row.userName || row.userUsername || 'U')[0].toUpperCase()}
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-dark-text-primary text-xs">
                                                    {row.buyer?.name || row.userName || row.userUsername || 'مستخدم'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-gray-500 dark:text-dark-text-secondary font-medium font-mono select-all">
                                            {row.buyer?.email || row.userEmail || 'غير متوفر'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Link href={`/templates/${row.templateId}`} className="group flex items-center gap-3">
                                                {row.previewImage && (
                                                    <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/5">
                                                        <Image
                                                            src={row.previewImage}
                                                            alt={row.templateTitle || 'template'}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            unoptimized
                                                        />
                                                    </div>
                                                )}
                                                <span className="font-bold text-gray-900 dark:text-dark-text-primary text-xs group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1 max-w-[180px]">
                                                    {row.templateTitle}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className={`px-5 py-4 text-xs font-black ${row.type === 'sale' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-dark-text-tertiary'}`}>
                                            {row.type === 'sale' ? `${(row.price || 0).toLocaleString('ar-EG')} ج.م` : 'مجاني'}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-gray-400 dark:text-dark-text-tertiary font-bold">
                                            {formatDate(row.date)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View - Cards with Premium Layout */}
            <div className="sm:hidden space-y-4">
                {isLoading ? (
                    [1, 2].map((_, index) => (
                        <div key={index} className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 animate-pulse space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-dark-tertiary rounded-xl"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 dark:bg-dark-tertiary rounded w-2/3"></div>
                                    <div className="h-3 bg-gray-100 dark:bg-dark-tertiary rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : rows.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white dark:bg-dark-secondary border border-gray-100/50 dark:border-white/5 shadow-sm rounded-3xl">
                        <Inbox size={32} className="opacity-30 mx-auto mb-4" />
                        <p className="text-xs text-gray-400 dark:text-dark-text-tertiary font-bold">لا توجد عمليات تحميل أو مبيعات مسجلة حالياً</p>
                    </div>
                ) : (
                    rows.map((row) => (
                        <div key={row.id || row._id} className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 shadow-sm group">
                            <div className="flex items-start gap-4 mb-4">
                                {row.previewImage && (
                                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/5">
                                        <Image
                                            src={row.previewImage}
                                            alt={row.templateTitle || 'template'}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-dark-text-primary text-xs line-clamp-1 mb-1">
                                        {row.templateTitle}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 dark:text-dark-text-tertiary font-bold">
                                        {formatDate(row.date)}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50 dark:border-white/5 space-y-2.5 text-xxs font-black text-gray-400 dark:text-dark-text-tertiary">
                                <div className="flex items-center justify-between">
                                    <span>المشتري / المستخدم</span>
                                    <div className="flex items-center gap-1.5 text-gray-800 dark:text-dark-text-secondary">
                                        <div className="w-5 h-5 rounded-full bg-primary-50 dark:bg-orange-500/10 text-primary-600 dark:text-orange-400 flex items-center justify-center text-[10px] font-black border border-primary-500/10">
                                            {(row.buyer?.name || row.userName || row.userUsername || 'U')[0].toUpperCase()}
                                        </div>
                                        <span>{row.buyer?.name || row.userName || row.userUsername || 'مستخدم'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>البريد الإلكتروني</span>
                                    <span className="font-mono text-gray-700 dark:text-dark-text-secondary select-all">{row.buyer?.email || row.userEmail || 'غير متوفر'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>المبلغ / القيمة</span>
                                    <span className={`font-black ${row.type === 'sale' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                                        {row.type === 'sale' ? `${(row.price || 0).toLocaleString('ar-EG')} ج.م` : 'مجاني'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        className="px-3.5 py-2 bg-white dark:bg-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary border border-gray-100 dark:border-white/5 rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => handlePageChange(pagination.current - 1)}
                        disabled={pagination.current === 1}
                    >
                        <ChevronRight size={14} className="inline ml-1" />
                        السابق
                    </button>
                    <span className="text-xs font-bold text-gray-500 dark:text-dark-text-secondary bg-gray-50 dark:bg-dark-tertiary border border-gray-100 dark:border-white/5 px-3 py-2 rounded-xl">
                        صفحة {pagination.current} من {pagination.pages}
                    </span>
                    <button
                        className="px-3.5 py-2 bg-white dark:bg-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary border border-gray-100 dark:border-white/5 rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => handlePageChange(pagination.current + 1)}
                        disabled={pagination.current === pagination.pages}
                    >
                        التالي
                        <ChevronLeft size={14} className="inline mr-1" />
                    </button>
                </div>
            )}
        </div>
    );
}
