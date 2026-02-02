'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import Image from 'next/image';

export default function AnalyticsContent() {
    const { user, ensureTokenInHeaders } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [timeRange, setTimeRange] = useState('all'); // all | 7d | 30d | 90d | 1y
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            ensureTokenInHeaders();

            // Fetch creator templates
            const templatesRes = await api.get('/templates/my-templates');

            setTemplates(Array.isArray(templatesRes.data.templates) ? templatesRes.data.templates : []);
        } catch (e) {
            setError('تعذر تحميل بيانات التحليلات');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTemplates = useMemo(() => {
        if (timeRange === 'all') return templates;
        const now = Date.now();
        const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
        const days = daysMap[timeRange] || 0;
        const cutoff = now - days * 24 * 60 * 60 * 1000;

        return templates.filter((t) => {
            const dateStr = t.approvedAt || t.createdAt || t.updatedAt;
            if (!dateStr) return false;
            const ts = new Date(dateStr).getTime();
            return !Number.isNaN(ts) && ts >= cutoff;
        });
    }, [templates, timeRange]);

    const metrics = useMemo(() => {
        const totalTemplates = filteredTemplates.length;
        const totalViews = filteredTemplates.reduce((sum, t) => sum + (t.views || 0), 0);
        const totalDownloads = filteredTemplates.reduce((sum, t) => sum + (t.downloads || 0), 0);
        const ratings = filteredTemplates.map(t => t.rating || 0).filter(r => r > 0).sort((a, b) => a - b);
        const medianRating = ratings.length === 0
            ? 0
            : (ratings.length % 2 === 0
                ? (ratings[ratings.length / 2 - 1] + ratings[ratings.length / 2]) / 2
                : ratings[Math.floor(ratings.length / 2)]);

        return { totalTemplates, totalViews, totalDownloads, medianRating };
    }, [filteredTemplates, user?.totalEarnings]);

    if (isLoading) {
        return (
            <div>
                {/* Header Skeleton */}
                <div className="mb-8 border-b border-gray-100 dark:border-dark-card-border pb-6 animate-pulse">
                    <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mb-3"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-64"></div>
                </div>

                {/* KPI Cards Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-5 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="space-y-3 flex-1">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                </div>
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-6 lg:p-8 animate-pulse">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
                    </div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 dark:bg-dark-tertiary rounded-xl w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8 border-b border-gray-100 dark:border-dark-card-border pb-6">
                <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">
                    لوحة التحكم
                </h1>
                <p className="text-base text-gray-600 dark:text-dark-text-secondary font-medium">
                    نظرة عامة على أداء حسابك وقوالبك
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-bold">
                    {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
                <KpiCard
                    title="إجمالي القوالب"
                    value={metrics.totalTemplates}
                    icon={(
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    )}
                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                />
                <KpiCard
                    title="إجمالي المشاهدات"
                    value={metrics.totalViews}
                    icon={(
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                    bgColor="bg-purple-50 dark:bg-purple-900/20"
                />
                <KpiCard
                    title="إجمالي التحميلات"
                    value={metrics.totalDownloads}
                    icon={(
                        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    )}
                    bgColor="bg-emerald-50 dark:bg-emerald-900/20"
                />
                <KpiCard
                    title="التقييم الوسيط"
                    value={Number(metrics.medianRating).toFixed(1)}
                    icon={(
                        <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    )}
                    bgColor="bg-orange-50 dark:bg-orange-900/20"
                />
            </div>

            {/* Approved Templates Section */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">أداء القوالب المعتمدة</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary">المدة:</span>
                            <div className="relative group">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="appearance-none bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border hover:border-primary-500 dark:hover:border-primary-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-gray-700 dark:text-dark-text-primary focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none cursor-pointer shadow-sm hover:shadow-md"
                                >
                                    <option value="all">كل الوقت</option>
                                    <option value="7d">آخر 7 أيام</option>
                                    <option value="30d">آخر 30 يوم</option>
                                    <option value="90d">آخر 90 يوم</option>
                                    <option value="1y">آخر سنة</option>
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {filteredTemplates.filter((t) => (t.status || '').toLowerCase() === 'approved').length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 dark:bg-dark-tertiary/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-dark-card-border">
                            <p className="text-gray-500 dark:text-dark-text-secondary font-bold text-lg">لا توجد قوالب معتمدة في هذه الفترة</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-dark-card-border">
                                            <th className="pb-4 text-right text-sm font-black text-gray-900 dark:text-dark-text-primary">القالب</th>
                                            <th className="pb-4 text-center text-sm font-black text-gray-900 dark:text-dark-text-primary">المشاهدات</th>
                                            <th className="pb-4 text-center text-sm font-black text-gray-900 dark:text-dark-text-primary">التحميلات</th>
                                            <th className="pb-4 text-center text-sm font-black text-gray-900 dark:text-dark-text-primary">التقييم</th>
                                            <th className="pb-4 text-center text-sm font-black text-gray-900 dark:text-dark-text-primary">الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-dark-card-border">
                                        {filteredTemplates.filter((t) => (t.status || '').toLowerCase() === 'approved').map((t) => (
                                            <tr key={t._id} className="group hover:bg-gray-50/50 dark:hover:bg-dark-tertiary/30 transition-colors">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 dark:border-dark-card-border flex-shrink-0">
                                                            {(t.coverImage || t.previewImage) ? (
                                                                <Image src={t.coverImage || t.previewImage} alt={t.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center">
                                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m0 0l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-gray-900 dark:text-dark-text-primary truncate transition-colors group-hover:text-primary-600 dark:group-hover:text-orange-400">{t.title}</p>
                                                            <p className="text-xs font-bold text-gray-500 dark:text-dark-text-tertiary">
                                                                {t.categories && t.categories.length > 0 ? t.categories.join('، ') : (t.category || 'غير مصنف')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center font-bold text-gray-900 dark:text-dark-text-primary">{Number(t.views || 0).toLocaleString()}</td>
                                                <td className="py-4 text-center font-bold text-gray-900 dark:text-dark-text-primary">{Number(t.downloads || 0).toLocaleString()}</td>
                                                <td className="py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-bold text-gray-900 dark:text-dark-text-primary">{(t.rating || 0).toFixed(1)}</span>
                                                            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">({t.reviewsCount || t.ratingCount || t.numRatings || t.ratingsCount || 0} تقييم)</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <Link
                                                        href={`/templates/${t._id}`}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-dark-card-border text-gray-500 hover:text-primary-600 dark:hover:text-orange-400 hover:border-primary-200 dark:hover:border-orange-500/50 transition-all shadow-sm"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden space-y-4">
                                {filteredTemplates.filter((t) => (t.status || '').toLowerCase() === 'approved').map((t) => (
                                    <div key={t._id} className="p-4 bg-gray-50/50 dark:bg-dark-tertiary/30 border border-gray-100 dark:border-dark-card-border rounded-2xl hover:border-primary-200 dark:hover:border-orange-500/50 transition-all">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 dark:border-dark-card-border flex-shrink-0">
                                                {(t.coverImage || t.previewImage) ? (
                                                    <Image src={t.coverImage || t.previewImage} alt={t.title} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m0 0l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-900 dark:text-dark-text-primary line-clamp-2 mb-1">{t.title}</h3>
                                                <p className="text-xs font-bold text-gray-500 dark:text-dark-text-tertiary">
                                                    {t.categories && t.categories.length > 0 ? t.categories.join('، ') : (t.category || 'غير مصنف')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <div className="text-center p-2 bg-white dark:bg-dark-secondary rounded-xl border border-gray-100 dark:border-dark-card-border">
                                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight mb-0.5">مشاهدة</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-dark-text-primary">{t.views || 0}</p>
                                            </div>
                                            <div className="text-center p-2 bg-white dark:bg-dark-secondary rounded-xl border border-gray-100 dark:border-dark-card-border">
                                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight mb-0.5">تحميل</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-dark-text-primary">{t.downloads || 0}</p>
                                            </div>
                                            <div className="text-center p-2 bg-white dark:bg-dark-secondary rounded-xl border border-gray-200 dark:border-dark-card-border">
                                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight mb-0.5">تقييم</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-dark-text-primary">{(t.rating || 0).toFixed(1)}</p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/templates/${t._id}`}
                                            className="btn-primary w-full py-2.5 text-sm font-bold block text-center"
                                        >
                                            عرض تفصيلي
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function KpiCard({ title, value, icon, bgColor }) {
    return (
        <div className="p-5 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1 truncate">{title}</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">{value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="p-16 text-center bg-gray-50/50 dark:bg-dark-tertiary/20 border-2 border-dashed border-gray-200 dark:border-dark-card-border rounded-2xl">
            <div className="w-16 h-16 bg-white dark:bg-dark-secondary rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>
            <p className="text-gray-500 dark:text-dark-text-secondary font-bold text-lg">{text}</p>
        </div>
    );
}
