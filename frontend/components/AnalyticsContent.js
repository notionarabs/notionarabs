'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, Download, DollarSign, Package, Star, 
    ArrowUpRight, ArrowDownRight, Clock, Award, Eye, 
    Calendar, ArrowLeftRight
} from 'lucide-react';

export default function AnalyticsContent() {
    const { user, ensureTokenInHeaders } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [stats, setStats] = useState(null);
    const [recentDownloads, setRecentDownloads] = useState([]);
    const [timeRange, setTimeRange] = useState('30d'); // 30d | 90d
    const [chartMetric, setChartMetric] = useState('downloads'); // downloads | revenue
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            ensureTokenInHeaders();

            // Fetch creator templates and stats
            const [templatesRes, statsRes] = await Promise.all([
                api.get('/templates/my-templates'),
                api.get('/creators/me/stats')
            ]);
            
            setTemplates(Array.isArray(templatesRes.data.templates) ? templatesRes.data.templates : []);
            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }

            // Separately fetch recent download activities for live-feed integrity
            try {
                const dlsRes = await api.get('/creators/me/downloads?limit=5');
                if (dlsRes.data.success) {
                    setRecentDownloads(dlsRes.data.downloads || []);
                }
            } catch (dlErr) {
                console.error('Error fetching recent downloads feed:', dlErr);
            }
        } catch (e) {
            setError('تعذر تحميل بيانات التحليلات');
        } finally {
            setIsLoading(false);
        }
    };

    const metrics = useMemo(() => {
        const approvedTemplates = templates.filter(t => t.status?.toLowerCase() === 'approved');
        const totalTemplates = templates.length;
        const totalViews = templates.reduce((sum, t) => sum + (t.views || 0), 0);
        const totalDownloads = templates.reduce((sum, t) => sum + (t.downloads || 0), 0);
        
        // Calculate real trends from dailyStats
        let downloadTrend = null;
        let revenueTrend = null;

        if (stats?.dailyStats && stats.dailyStats.length >= 14) {
            const last7 = stats.dailyStats.slice(-7);
            const prev7 = stats.dailyStats.slice(-14, -7);
            
            const last7Sum = last7.reduce((s, d) => s + (d.downloads || 0), 0);
            const prev7Sum = prev7.reduce((s, d) => s + (d.downloads || 0), 0);
            
            if (prev7Sum === 0 && last7Sum > 0) {
                downloadTrend = 'جديد 🚀';
            } else if (prev7Sum > 0) {
                const diff = ((last7Sum - prev7Sum) / prev7Sum) * 100;
                downloadTrend = `${diff > 0 ? '+' : ''}${Math.round(diff)}%`;
            }

            const last7Rev = last7.reduce((s, d) => s + (d.revenue || 0), 0);
            const prev7Rev = prev7.reduce((s, d) => s + (d.revenue || 0), 0);

            if (prev7Rev === 0 && last7Rev > 0) {
                revenueTrend = 'جديد ✨';
            } else if (prev7Rev > 0) {
                const diff = ((last7Rev - prev7Rev) / prev7Rev) * 100;
                revenueTrend = `${diff > 0 ? '+' : ''}${Math.round(diff)}%`;
            }
        }

        // Find top template
        const topTemplate = [...approvedTemplates].sort((a, b) => (b.downloads || 0) - (a.downloads || 0))[0];

        return { 
            totalTemplates, 
            totalViews, 
            totalDownloads, 
            topTemplate,
            downloadTrend,
            revenueTrend,
            approvedCount: approvedTemplates.length 
        };
    }, [templates, stats]);

    // Premium Bezier line chart component with hover toolkit
    const PerformanceChart = ({ data, type = 'downloads' }) => {
        const [hoveredIndex, setHoveredIndex] = useState(null);

        if (!data || data.length < 2) return (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                <TrendingUp className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-bold">بيانات غير كافية لرسم المخطط</p>
            </div>
        );

        // Filter based on timeRange (30d or 90d) - dailyStats has 30 items
        const filteredData = data; 

        const values = filteredData.map(d => d[type] || 0);
        const max = Math.max(...values, 5); 
        const min = 0;
        const range = max - min;
        
        const width = 1000;
        const height = 300;
        const padding = 40;
        
        const points = filteredData.map((d, i) => {
            const x = (i / (filteredData.length - 1)) * (width - padding * 2) + padding;
            const y = height - (((d[type] || 0) - min) / range) * (height - padding * 2) - padding;
            return { x, y, value: d[type] || 0, date: d.date };
        });

        // Compute smooth cubic bezier curves path (horizontal bezier splines)
        let pathD = "";
        let areaD = "";
        if (points.length > 0) {
            pathD = `M ${points[0].x},${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i];
                const p1 = points[i + 1];
                const cp1_x = p0.x + (p1.x - p0.x) / 3;
                const cp1_y = p0.y;
                const cp2_x = p0.x + 2 * (p1.x - p0.x) / 3;
                const cp2_y = p1.y;
                pathD += ` C ${cp1_x},${cp1_y} ${cp2_x},${cp2_y} ${p1.x},${p1.y}`;
            }
            areaD = `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;
        }

        const metricColor = type === 'revenue' ? '#f59e0b' : '#f97316';
        const metricGradient = type === 'revenue' ? 'revenueGradient' : 'downloadGradient';

        const handleMouseMove = (e) => {
            const svg = e.currentTarget;
            const rect = svg.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const svgWidth = rect.width;
            
            const internalX = (mouseX / svgWidth) * width;
            
            let closestIndex = 0;
            let minDiff = Infinity;
            
            points.forEach((pt, index) => {
                const diff = Math.abs(pt.x - internalX);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = index;
                }
            });
            
            setHoveredIndex(closestIndex);
        };

        const handleMouseLeave = () => {
            setHoveredIndex(null);
        };

        return (
            <div className="relative w-full h-76 group mt-4">
                {/* Floating Interactive Glassmorphic Tooltip */}
                <AnimatePresence>
                    {hoveredIndex !== null && (
                        <motion.div 
                            initial={{ opacity: 0, y: 4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                            className="absolute z-20 bg-white/95 dark:bg-dark-secondary/95 backdrop-blur-md border border-gray-100 dark:border-white/5 p-3 rounded-2xl shadow-xl text-right pointer-events-none"
                            style={{
                                left: `${(points[hoveredIndex].x / width) * 100}%`,
                                top: `${(points[hoveredIndex].y / height) * 100 - 24}%`,
                                transform: 'translate(-50%, -100%)',
                            }}
                        >
                            <p className="text-[10px] font-black text-gray-400 dark:text-dark-text-tertiary mb-1">
                                {new Date(points[hoveredIndex].date).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: metricColor }} />
                                <span className="text-xs font-black text-gray-900 dark:text-dark-text-primary">
                                    {type === 'revenue' 
                                        ? `${points[hoveredIndex].value.toLocaleString('ar-EG')} ج.م` 
                                        : `${points[hoveredIndex].value.toLocaleString('ar-EG')} تحميل`}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <svg 
                    viewBox={`0 0 ${width} ${height}`} 
                    className="w-full h-full overflow-visible select-none cursor-crosshair" 
                    preserveAspectRatio="none"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <defs>
                        <linearGradient id="downloadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* horizontal helper grid boundaries and Y-Axis Labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                        const val = Math.round(max - p * (max - min));
                        const yPos = padding + p * (height - padding * 2);
                        return (
                            <g key={i}>
                                <line
                                    x1={padding}
                                    y1={yPos}
                                    x2={width - padding}
                                    y2={yPos}
                                    stroke="currentColor"
                                    className="text-gray-100 dark:text-white/5"
                                    strokeWidth="1"
                                    strokeDasharray="4 8"
                                />
                                <text
                                    x={padding - 12}
                                    y={yPos + 4}
                                    textAnchor="end"
                                    className="fill-gray-400 dark:fill-dark-text-tertiary text-[10px] font-black"
                                >
                                    {type === 'revenue' ? `${val.toLocaleString('ar-EG')} ج.م` : val.toLocaleString('ar-EG')}
                                </text>
                            </g>
                        );
                    })}

                    {/* X-Axis Date Labels */}
                    {points.length > 1 && [0, Math.floor((points.length - 1) / 4), Math.floor((points.length - 1) / 2), Math.floor((points.length - 1) * 3 / 4), points.length - 1].map((idx) => {
                        const pt = points[idx];
                        if (!pt) return null;
                        return (
                            <text
                                key={idx}
                                x={pt.x}
                                y={height - 10}
                                textAnchor="middle"
                                className="fill-gray-400 dark:fill-dark-text-tertiary text-[10px] font-black"
                            >
                                {pt.date ? new Date(pt.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }) : ''}
                            </text>
                        );
                    })}

                    {/* Area fill under curve with soft fade-in animation */}
                    {areaD && (
                        <motion.path
                            d={areaD}
                            fill={`url(#${metricGradient})`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        />
                    )}

                    {/* Self-drawing curved SVG outline path */}
                    {pathD && (
                        <motion.path
                            d={pathD}
                            fill="none"
                            stroke={metricColor}
                            strokeWidth="4.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-lg"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                    )}

                    {/* Interactive Mouse Tracker Guide vertical line & node dot */}
                    {hoveredIndex !== null && (
                        <g>
                            <line
                                x1={points[hoveredIndex].x}
                                y1={padding}
                                x2={points[hoveredIndex].x}
                                y2={height - padding}
                                stroke="currentColor"
                                className="text-gray-200 dark:text-white/10"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                            />
                            {/* Inner circle node indicator with glowing rings */}
                            <circle
                                cx={points[hoveredIndex].x}
                                cy={points[hoveredIndex].y}
                                r="12"
                                fill={metricColor}
                                className="opacity-15 animate-pulse"
                            />
                            <circle
                                cx={points[hoveredIndex].x}
                                cy={points[hoveredIndex].y}
                                r="5.5"
                                fill="#ffffff"
                                stroke={metricColor}
                                strokeWidth="3.5"
                            />
                        </g>
                    )}
                </svg>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse" dir="rtl">
                <div className="h-10 bg-gray-200 dark:bg-dark-secondary rounded-xl w-48"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-200 dark:bg-dark-secondary rounded-3xl"></div>
                    ))}
                </div>
                <div className="h-76 bg-gray-200 dark:bg-dark-secondary rounded-3xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12" dir="rtl">
            {/* Header Block */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">
                        لوحة تحليلات المبدع
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary font-medium">
                        تتبع حقيقي ومتقدم لمشاهدات قوالبك، وتحميلاتها، وصافي أرباحك المالية
                    </p>
                </div>
                
                {/* Interval selection */}
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-dark-tertiary p-1 rounded-2xl border border-gray-100 dark:border-white/5 self-start md:self-center">
                    <button 
                        onClick={() => setTimeRange('30d')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${timeRange === '30d' ? 'bg-white dark:bg-dark-secondary shadow-sm text-primary-600 dark:text-orange-400' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        آخر ٣٠ يوماً
                    </button>
                    <button 
                        onClick={() => setTimeRange('90d')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${timeRange === '90d' ? 'bg-white dark:bg-dark-secondary shadow-sm text-primary-600 dark:text-orange-400' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        آخر ٩٠ يوماً
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200/20 text-red-600 dark:text-red-400 rounded-2xl font-bold text-xs">
                    {error}
                </div>
            )}

            {/* Premium Stat KPI cards with beautiful layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard 
                    title="إجمالي القوالب المعروضة" 
                    value={metrics.totalTemplates} 
                    icon={<Package className="w-5 h-5" />} 
                    trend={null} 
                    color="blue"
                />
                <KpiCard 
                    title="التحميلات الناجحة" 
                    value={metrics.totalDownloads} 
                    icon={<Download className="w-5 h-5" />} 
                    trend={metrics.downloadTrend} 
                    color="emerald"
                />
                <KpiCard 
                    title="مشاهدات وتفاعلات" 
                    value={metrics.totalViews} 
                    icon={<TrendingUp className="w-5 h-5" />} 
                    trend={null} 
                    color="purple"
                />
                <KpiCard 
                    title="صافي الأرباح المحققة" 
                    value={`${(stats?.totalEarnings || 0).toLocaleString('ar-EG')} ج.م`} 
                    icon={<DollarSign className="w-5 h-5" />} 
                    trend={metrics.revenueTrend} 
                    color="amber"
                />
            </div>

            {/* Advanced Curved Line Chart & Activities panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Curve Graph line block */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                                <TrendingUp className={`w-5 h-5 ${chartMetric === 'downloads' ? 'text-primary-500' : 'text-amber-500'}`} />
                                {chartMetric === 'downloads' ? 'مخطط التحميلات والنشاط' : 'مخطط المبيعات والأرباح'}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-dark-text-tertiary">
                                {chartMetric === 'downloads' ? 'التحميلات اليومية المسجلة على كافة ملفاتك وقوالبك' : 'منحنى تراكم الأرباح والمبيعات اليومية المحصلة'}
                            </p>
                        </div>

                        {/* Metric selection buttons */}
                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-dark-tertiary p-1 rounded-2xl border border-gray-100/40 dark:border-white/5 self-start sm:self-center">
                            <button 
                                onClick={() => setChartMetric('downloads')}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${chartMetric === 'downloads' ? 'bg-white dark:bg-dark-secondary shadow-md text-primary-600 dark:text-orange-400' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                تحميلات
                            </button>
                            <button 
                                onClick={() => setChartMetric('revenue')}
                                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${chartMetric === 'revenue' ? 'bg-white dark:bg-dark-secondary shadow-md text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                أرباح
                            </button>
                        </div>
                    </div>

                    <PerformanceChart data={stats?.dailyStats || []} type={chartMetric} />
                    
                    {/* Foot metrics analysis summary */}
                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">أعلى سقف يومي</p>
                                <p className="text-base font-black text-gray-900 dark:text-dark-text-primary">
                                    {stats?.dailyStats?.length > 0 
                                        ? Math.max(...stats.dailyStats.map(d => d[chartMetric])).toLocaleString('ar-EG') 
                                        : 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">متوسط الأداء اليومي</p>
                                <p className="text-base font-black text-gray-900 dark:text-dark-text-primary">
                                    {stats?.dailyStats?.length > 0 
                                        ? (stats.dailyStats.reduce((s, d) => s + (d[chartMetric] || 0), 0) / stats.dailyStats.length).toFixed(1).toLocaleString('ar-EG') 
                                        : 0}
                                </p>
                            </div>
                        </div>
                        <div className="text-xs font-black text-primary-600 dark:text-orange-400 bg-primary-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-xl">
                            مستقر وإيجابي 🚀
                        </div>
                    </div>
                </div>

                {/* Right highlight widgets */}
                <div className="space-y-6">
                    {/* Top templates layout */}
                    <div className="bg-gradient-to-br from-gray-900 to-black dark:from-dark-tertiary dark:to-dark-secondary rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-sm font-black mb-6 flex items-center gap-2 text-primary-400">
                                <Award className="w-5 h-5" />
                                <span>القالب الأكثر نجاحاً وشهرة</span>
                            </h3>
                            
                            {metrics.topTemplate ? (
                                <>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                                            <Image 
                                                src={metrics.topTemplate.previewImage || metrics.topTemplate.coverImage} 
                                                alt={metrics.topTemplate.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-sm truncate">{metrics.topTemplate.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold">{metrics.topTemplate.category}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">مرات التحميل</p>
                                            <p className="text-base font-black">{(metrics.topTemplate.downloads || 0).toLocaleString('ar-EG')}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">تقييم العملاء</p>
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-base font-black">{(metrics.topTemplate.rating || 0).toFixed(1)}</p>
                                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-400 text-xs font-medium">قريباً ستظهر هنا إحصاءات القالب الأول المتصدر لقائمتك!</p>
                            )}
                        </div>
                    </div>

                    {/* Recent downloads hub */}
                    <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-black text-sm text-gray-900 dark:text-dark-text-primary mb-5 flex items-center gap-2">
                            <Clock className="w-4.5 h-4.5 text-emerald-500 animate-pulse-slow" />
                            <span>الأنشطة وحركة التحميلات الأخيرة</span>
                        </h3>
                        <div className="space-y-4">
                            {recentDownloads.slice(0, 3).map((dl, idx) => (
                                <div key={dl.id || idx} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-tertiary flex items-center justify-center text-gray-400 group-hover:bg-primary-50 dark:group-hover:bg-orange-500/10 group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors">
                                        <Download className="w-4.5 h-4.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-gray-800 dark:text-dark-text-secondary truncate">{dl.templateTitle}</p>
                                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 mt-0.5">
                                            <span className="text-primary-500 dark:text-orange-400">
                                                {dl.userName || dl.userEmail?.split('@')[0] || 'مستخدم'}
                                            </span>
                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                            <span className="text-gray-400 text-[9px]">
                                                {dl.date ? new Date(dl.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }) : 'مؤخراً'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!recentDownloads || recentDownloads.length === 0) && (
                                <p className="text-center py-4 text-xs text-gray-400 font-bold">لا توجد عمليات تحميل مسجلة مؤخراً</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance table detailing all items */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-black text-gray-900 dark:text-dark-text-primary">أداء كافة القوالب بالتفصيل</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-dark-tertiary/20">
                                <th className="px-8 py-4.5 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase">القالب الاسم</th>
                                <th className="px-8 py-4.5 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase text-center">المشاهدات</th>
                                <th className="px-8 py-4.5 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase text-center">التحميلات</th>
                                <th className="px-8 py-4.5 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase text-center">متوسط التقييم</th>
                                <th className="px-8 py-4.5 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase text-center">حالة النشر</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {templates.map(t => (
                                <tr key={t._id} className="hover:bg-gray-50/30 dark:hover:bg-dark-tertiary/10 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 flex-shrink-0">
                                                <Image src={t.previewImage || t.coverImage} alt={t.title} fill className="object-cover" />
                                            </div>
                                            <span className="font-black text-gray-900 dark:text-dark-text-primary text-xs truncate max-w-[200px]">{t.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center font-bold text-xs text-gray-700 dark:text-dark-text-secondary">{(t.views || 0).toLocaleString('ar-EG')}</td>
                                    <td className="px-8 py-4 text-center font-bold text-xs text-gray-700 dark:text-dark-text-secondary">{(t.downloads || 0).toLocaleString('ar-EG')}</td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="font-bold text-xs text-gray-900 dark:text-dark-text-primary">{(t.rating || 0).toFixed(1).toLocaleString('ar-EG')}</span>
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                                            t.status === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400' : 
                                            t.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/25 dark:text-amber-400' : 
                                            'bg-red-50 text-red-600 dark:bg-red-950/25 dark:text-red-400'
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
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
    };

    return (
        <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-medium transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25 px-2 py-1 rounded-lg">
                        <ArrowUpRight size={12} />
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-dark-text-tertiary mb-1 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">{value}</h3>
            </div>
        </div>
    );
}
