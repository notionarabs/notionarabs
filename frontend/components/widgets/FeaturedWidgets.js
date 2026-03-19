'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layout, Copy, ExternalLink, Zap, Sparkles, Users, Clock, Sun, Timer, BookOpen, CheckSquare, Search, Filter, X, Cloud, Star, Calculator, Landmark, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const iconMap = {
    sparkles: <Sparkles className="w-6 h-6 text-orange-500" />,
    layout: <Layout className="w-6 h-6 text-blue-500" />,
    clock: <Clock className="w-6 h-6 text-green-500" />,
    sun: <Sun className="w-6 h-6 text-yellow-500" />,
    timer: <Timer className="w-6 h-6 text-red-500" />,
    'book-open': <BookOpen className="w-6 h-6 text-emerald-500" />,
    'check-square': <CheckSquare className="w-6 h-6 text-purple-500" />,
    cloud: <Cloud className="w-6 h-6 text-sky-500" />,
    star: <Star className="w-6 h-6 text-emerald-500" />,
    calculator: <Calculator className="w-6 h-6 text-indigo-500" />,
    landmark: <Landmark className="w-6 h-6 text-emerald-600" />
};

export default function FeaturedWidgets() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [copiedId, setCopiedId] = useState(null);
    const [widgets, setWidgets] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.notionarabs.com/api';
                const apiUrl = base.endsWith('/api') ? base.slice(0, -4) : base;

                const [widgetsRes, statsRes] = await Promise.all([
                    fetch(`${apiUrl}/api/widgets`),
                    fetch(`${apiUrl}/api/widgets/stats`)
                ]);

                const widgetsData = await widgetsRes.json();
                const statsData = await statsRes.json();

                if (widgetsData.success) {
                    setWidgets(widgetsData.widgets);
                }

                if (statsData.success) {
                    setStats(statsData.stats);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const copyEmbed = (e, id) => {
        e.stopPropagation();
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const embedUrl = `${baseUrl}/widgets/${id}/embed`;
        navigator.clipboard.writeText(embedUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const categoryGradients = {
        'إسلاميات': 'from-emerald-100 to-emerald-50 dark:from-emerald-950/40 dark:to-dark-primary',
        'إنتاجية': 'from-blue-100 to-blue-50 dark:from-blue-950/40 dark:to-dark-primary',
        'جماليات': 'from-purple-100 to-purple-50 dark:from-purple-950/40 dark:to-dark-primary',
    };

    // Top 3 widgets by stats
    const topWidgetIds = Object.entries(stats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id]) => id);

    let displayWidgets = widgets
        .filter(w => topWidgetIds.includes(w.id))
        .map(w => {
            const isNew = w.createdAt && (new Date() - new Date(w.createdAt)) < 14 * 24 * 60 * 60 * 1000;
            return {
                ...w,
                icon: iconMap[w.iconIdentifier] || <Zap className="w-6 h-6 text-gray-500" />,
                users: (stats[w.id] || 0).toLocaleString() + '+',
                isPopular: true,
                isNew,
                gradient: categoryGradients[w.category] || 'from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-dark-primary'
            };
        });

    if (displayWidgets.length === 0 && widgets.length > 0) {
        displayWidgets = widgets.slice(0, 3).map(w => ({
            ...w,
            icon: iconMap[w.iconIdentifier] || <Zap className="w-6 h-6 text-gray-500" />,
            users: '0+',
            isPopular: false,
            isNew: false,
            gradient: categoryGradients[w.category] || 'from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-dark-primary'
        }));
    }

    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
                     <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                            الأدوات الأكثر استخداماً
                        </h2>
                        <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl">
                            اكتشف الأدوات الأكثر شيوعاً بين مستخدمينا والتي ستساعدك في تخصيص مساحة عملك.
                        </p>
                    </div>
                    <Link
                        href="/widgets"
                        className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary-50 dark:bg-orange-900/20 text-primary-600 dark:text-orange-400 font-semibold rounded-xl hover:bg-primary-100 dark:hover:bg-orange-900/40 transition-colors"
                    >
                        تصفح كل الأدوات
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [1, 2, 3].map((item) => (
                            <div key={item} className="bg-white dark:bg-dark-secondary rounded-3xl overflow-hidden border border-gray-200 dark:border-dark-card-border shadow-soft flex flex-col h-[420px] animate-pulse">
                                <div className="h-48 bg-gray-200 dark:bg-dark-tertiary"></div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="h-6 bg-gray-200 dark:bg-dark-text-quaternary rounded-full w-20"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-dark-text-quaternary rounded w-12"></div>
                                    </div>
                                    <div className="h-7 bg-gray-200 dark:bg-dark-text-quaternary rounded-lg w-3/4 mb-4"></div>
                                    <div className="space-y-2 mb-6 text-right">
                                        <div className="h-4 bg-gray-200 dark:bg-dark-text-quaternary rounded w-full ml-auto"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-dark-text-quaternary rounded w-5/6 ml-auto"></div>
                                    </div>
                                    <div className="mt-auto flex gap-3">
                                        <div className="flex-1 h-11 bg-gray-200 dark:bg-dark-text-quaternary rounded-xl"></div>
                                        <div className="flex-1 h-11 bg-gray-200 dark:bg-dark-text-quaternary rounded-xl"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        displayWidgets.map((widget) => (
                            <div
                                key={widget.id}
                                onClick={() => router.push(`/widgets/${widget.id}`)}
                                className="group card-interactive bg-white dark:bg-dark-secondary rounded-3xl overflow-hidden border border-gray-200 dark:border-dark-card-border shadow-soft cursor-pointer flex flex-col h-[420px]"
                            >
                                <div className={`h-48 bg-gradient-to-br ${widget.gradient} flex items-center justify-center relative overflow-hidden shrink-0`}>
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #f5631e 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

                                    {/* Status Badges */}
                                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                        {widget.isPopular && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-tighter rounded-lg shadow-lg">
                                                <Zap className="w-3 h-3 fill-current" />
                                                الأكثر استخداماً
                                            </div>
                                        )}
                                        {widget.isNew && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-white text-[10px] font-black uppercase tracking-tighter rounded-lg shadow-lg">
                                                <Sparkles className="w-3 h-3 fill-current" />
                                                جديد
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative z-10 p-8 bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-dark-card-border transform group-hover:scale-105 transition-transform duration-500">
                                        <div className="flex items-center gap-3">
                                            {widget.icon}
                                            <div className="h-2 w-24 bg-gray-200 dark:bg-dark-text-quaternary rounded"></div>
                                        </div>

                                        {/* Micro-Interaction Skeletons */}
                                        <div className="mt-4 space-y-2">
                                            <div className="h-1.5 w-full bg-gray-100 dark:bg-dark-text-quaternary rounded"></div>
                                            <div className="h-1.5 w-3/4 bg-gray-100 dark:bg-dark-text-quaternary rounded"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                                            {widget.category}
                                        </span>
                                        {stats[widget.id] > 0 && (
                                            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold">{widget.users}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-normal text-accent-900 dark:text-white mb-2 line-clamp-1">
                                        {widget.title}
                                    </h2>
                                    <p className="text-accent-600 dark:text-dark-text-secondary text-sm mb-6 line-clamp-2">
                                        {widget.description}
                                    </p>
                                    <div className="mt-auto flex gap-3">
                                        {isAuthenticated ? (
                                            <button
                                                onClick={(e) => copyEmbed(e, widget.id)}
                                                className="flex-1 btn-primary py-2.5 px-4 text-sm flex items-center justify-center gap-2 relative z-10"
                                            >
                                                {copiedId === widget.id ? 'تم النسخ!' : <><Copy className="w-4 h-4" /> انسخ الرابط</>}
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/widgets/${widget.id}`}
                                                className="flex-1 btn-primary py-2.5 px-4 text-sm flex items-center justify-center gap-2 relative z-10"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Lock className="w-4 h-4" /> سجّل للتضمين
                                            </Link>
                                        )}
                                        <div className="flex-1 btn-secondary py-2.5 px-4 text-sm flex items-center justify-center gap-2">
                                            <ExternalLink className="w-4 h-4" /> التفاصيل
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
