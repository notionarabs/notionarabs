'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import Image from 'next/image';
import { TrendingUp, Download, DollarSign, Package, Star, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

export default function AnalyticsContent() {
    const { user, ensureTokenInHeaders } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [stats, setStats] = useState(null);
    const [timeRange, setTimeRange] = useState('all'); // all | 7d | 30d | 90d | 1y
    const [chartMetric, setChartMetric] = useState('downloads'); // downloads | revenue
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            ensureTokenInHeaders();

            // Fetch creator templates and consolidated stats
            const [templatesRes, statsRes] = await Promise.all([
                api.get('/templates/my-templates'),
                api.get('/creators/me/stats')
            ]);
            
            setTemplates(Array.isArray(templatesRes.data.templates) ? templatesRes.data.templates : []);
            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }
        } catch (e) {
            setError('تعذر تحميل بيانات التحليلات');
        } finally {
            setIsLoading(false);
        }
    };

    const metrics = useMemo(() => {
        const approvedTemplates = templates.filter(t => t.status === 'approved');
        const totalTemplates = templates.length;
        const totalViews = templates.reduce((sum, t) => sum + (t.views || 0), 0);
        const totalDownloads = templates.reduce((sum, t) => sum + (t.downloads || 0), 0);
        
        // Find top template
        const topTemplate = [...approvedTemplates].sort((a, b) => (b.downloads || 0) - (a.downloads || 0))[0];

        return { 
            totalTemplates, 
            totalViews, 
            totalDownloads, 
            topTemplate,
            approvedCount: approvedTemplates.length 
        };
    }, [templates]);

    // Simple SVG Line Chart Component
    const PerformanceChart = ({ data, type = 'downloads' }) => {
        if (!data || data.length < 2) return (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                <TrendingUp className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-bold">بيانات غير كافية لرسم المخطط</p>
            </div>
        );

        const values = data.map(d => d[type] || 0);
        const max = Math.max(...values, 5); 
        const min = 0;
        const range = max - min;
        
        const width = 1000;
        const height = 300;
        const padding = 40;
        
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            const y = height - (((d[type] || 0) - min) / range) * (height - padding * 2) - padding;
            return `${x},${y}`;
        }).join(' ');

        const metricColor = type === 'revenue' ? '#fbbf24' : '#f97316';
        const metricGradient = type === 'revenue' ? 'revenueGradient' : 'downloadGradient';

        return (
            <div className="relative w-full h-72 group mt-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="downloadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                        <line
                            key={i}
                            x1={padding}
                            y1={padding + p * (height - padding * 2)}
                            x2={width - padding}
                            y2={padding + p * (height - padding * 2)}
                            stroke="currentColor"
                            className="text-gray-100 dark:text-white/5"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Area under the line */}
                    <path
                        d={`M ${padding},${height - padding} ${points} L ${width - padding},${height - padding} Z`}
                        fill={`url(#${metricGradient})`}
                        className="transition-all duration-700 ease-in-out"
                    />

                    {/* The Line */}
                    <polyline
                        fill="none"
                        stroke={metricColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className="transition-all duration-700 ease-in-out drop-shadow-lg"
                    />

                    {/* Interactive Points */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
                        const y = height - (((d[type] || 0) - min) / range) * (height - padding * 2) - padding;
                        return (
                            <g key={i} className="group/point">
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="6"
                                    fill={metricColor}
                                    className="opacity-0 group-hover/point:opacity-100 transition-opacity"
                                />
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="12"
                                    fill={metricColor}
                                    className="opacity-0 group-hover/point:opacity-20 transition-opacity"
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 dark:bg-dark-secondary rounded-2xl"></div>
                    ))}
                </div>
                <div className="h-64 bg-gray-100 dark:bg-dark-secondary rounded-2xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 dark:border-dark-card-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2">
                        لوحة تحليلات المبدع
                    </h1>
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
                        متابعة أداء قوالبك ونمو أرباحك خلال الـ 30 يوماً الماضية
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-dark-secondary p-1.5 rounded-2xl border border-gray-200 dark:border-dark-card-border shadow-sm">
                    <button className="px-4 py-2 rounded-xl text-sm font-bold bg-primary-50 dark:bg-orange-500/10 text-primary-600">30 يوماً</button>
                    <button className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors">90 يوماً</button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard 
                    title="إجمالي القوالب" 
                    value={metrics.totalTemplates} 
                    icon={<Package className="w-5 h-5" />} 
                    trend="+12%" 
                    color="blue"
                />
                <KpiCard 
                    title="التحميلات" 
                    value={metrics.totalDownloads} 
                    icon={<Download className="w-5 h-5" />} 
                    trend="+18%" 
                    color="emerald"
                />
                <KpiCard 
                    title="المشاهدات" 
                    value={metrics.totalViews} 
                    icon={<TrendingUp className="w-5 h-5" />} 
                    trend="+24%" 
                    color="purple"
                />
                <KpiCard 
                    title="إجمالي الأرباح" 
                    value={`${stats?.totalEarnings || 0} ج.م`} 
                    icon={<DollarSign className="w-5 h-5" />} 
                    trend="+5%" 
                    color="amber"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-3xl p-6 lg:p-8 shadow-sm group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                                <TrendingUp className={`w-5 h-5 ${chartMetric === 'downloads' ? 'text-primary-500' : 'text-amber-500'}`} />
                                {chartMetric === 'downloads' ? 'منحنى التحميلات' : 'منحنى الأرباح'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                                {chartMetric === 'downloads' ? 'تتبع عدد التحميلات اليومية لقوالبك' : 'تتبع نمو مبيعاتك اليومية'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-tertiary p-1 rounded-2xl border border-gray-100 dark:border-white/5">
                            <button 
                                onClick={() => setChartMetric('downloads')}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${chartMetric === 'downloads' ? 'bg-white dark:bg-dark-secondary shadow-md text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                تحميلات
                            </button>
                            <button 
                                onClick={() => setChartMetric('revenue')}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${chartMetric === 'revenue' ? 'bg-white dark:bg-dark-secondary shadow-md text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                أرباح
                            </button>
                        </div>
                    </div>
                    <PerformanceChart data={stats?.dailyStats || []} type={chartMetric} />
                    
                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-50 dark:border-dark-card-border">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">أعلى يوم</p>
                                <p className="text-lg font-black text-gray-900 dark:text-dark-text-primary">
                                    {stats?.dailyStats?.length > 0 ? Math.max(...stats.dailyStats.map(d => d.downloads)) : 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">متوسط يومي</p>
                                <p className="text-lg font-black text-gray-900 dark:text-dark-text-primary">
                                    {stats?.dailyStats?.length > 0 ? (stats.dailyStats.reduce((s, d) => s + d.downloads, 0) / stats.dailyStats.length).toFixed(1) : 0}
                                </p>
                            </div>
                        </div>
                        <button className="text-sm font-bold text-primary-600 hover:underline">عرض التفاصيل الكاملة</button>
                    </div>
                </div>

                {/* Top Item / Recent Highlight */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-black dark:from-dark-tertiary dark:to-dark-secondary rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary-400">
                                <Star className="w-5 h-5 fill-current" />
                                القالب الأكثر نجاحاً
                            </h3>
                            
                            {metrics.topTemplate ? (
                                <>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10">
                                            <Image 
                                                src={metrics.topTemplate.previewImage || metrics.topTemplate.coverImage} 
                                                alt={metrics.topTemplate.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base line-clamp-1">{metrics.topTemplate.title}</h4>
                                            <p className="text-xs text-gray-400">{metrics.topTemplate.category}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">التحميلات</p>
                                            <p className="text-xl font-black">{metrics.topTemplate.downloads}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">التقييم</p>
                                            <p className="text-xl font-black">{(metrics.topTemplate.rating || 0).toFixed(1)}</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-400 text-sm">بانتظار تحقيق أول نجاح لك!</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-3xl p-6 shadow-sm">
                        <h3 className="font-black text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-emerald-500" />
                            نشاطات أخيرة
                        </h3>
                        <div className="space-y-4">
                            {stats?.recentTemplates?.slice(0, 3).map(t => (
                                <div key={t.id} className="flex items-center gap-3 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-tertiary flex items-center justify-center text-gray-400 group-hover:bg-primary-50 dark:group-hover:bg-orange-500/10 group-hover:text-primary-600 transition-colors">
                                        <Download className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-dark-text-primary truncate">{t.title}</p>
                                        <p className="text-[10px] text-gray-500 font-bold">تم تحميله مؤخراً</p>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.recentTemplates || stats.recentTemplates.length === 0) && (
                                <p className="text-center py-4 text-xs text-gray-400 font-bold">لا يوجد نشاط مسجل مؤخراً</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-gray-50 dark:border-dark-card-border">
                    <h3 className="text-xl font-black text-gray-900 dark:text-dark-text-primary">أداء كافة القوالب</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-dark-tertiary/30">
                                <th className="px-8 py-4 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase">القالب</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase text-center">المشاهدات</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase text-center">التحميلات</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase text-center">التقييم</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase text-center">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-dark-card-border">
                            {templates.map(t => (
                                <tr key={t._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-tertiary/20 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 dark:border-dark-card-border flex-shrink-0">
                                                <Image src={t.previewImage || t.coverImage} alt={t.title} fill className="object-cover" />
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-dark-text-primary text-sm truncate max-w-[200px]">{t.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center font-bold text-gray-700 dark:text-dark-text-secondary">{t.views || 0}</td>
                                    <td className="px-8 py-4 text-center font-bold text-gray-700 dark:text-dark-text-secondary">{t.downloads || 0}</td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="font-bold text-gray-900 dark:text-dark-text-primary">{(t.rating || 0).toFixed(1)}</span>
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            t.status === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                                            t.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' : 
                                            'bg-red-50 text-red-600 dark:bg-red-900/20'
                                        }`}>
                                            {t.status === 'approved' ? 'معتمد' : t.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon, trend, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    };

    return (
        <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                        <ArrowUpRight size={12} />
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 dark:text-dark-text-tertiary mb-1 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary">{value}</h3>
            </div>
        </div>
    );
}

