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

export default function FeaturedWidgets({ embedded = false }) {
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
                const cleanedBase = base.trim().replace(/\/+$/, '');
                const widgetsUrl = cleanedBase.endsWith('/api') ? `${cleanedBase}/widgets` : `${cleanedBase}/api/widgets`;
                const statsUrl = cleanedBase.endsWith('/api') ? `${cleanedBase}/widgets/stats` : `${cleanedBase}/api/widgets/stats`;

                const [widgetsRes, statsRes] = await Promise.all([
                    fetch(widgetsUrl),
                    fetch(statsUrl)
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
        'إسلاميات': 'from-emerald-500/20 to-emerald-950/20',
        'إنتاجية': 'from-blue-500/20 to-blue-950/20',
        'جماليات': 'from-purple-500/20 to-purple-950/20',
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
                gradient: categoryGradients[w.category] || 'from-orange-500/20 to-orange-950/20'
            };
        });

    if (displayWidgets.length === 0 && widgets.length > 0) {
        displayWidgets = widgets.slice(0, 3).map(w => ({
            ...w,
            icon: iconMap[w.iconIdentifier] || <Zap className="w-6 h-6 text-gray-500" />,
            users: '0+',
            isPopular: false,
            isNew: false,
            gradient: categoryGradients[w.category] || 'from-orange-500/20 to-orange-950/20'
        }));
    }

    const content = (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
                 <div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-accent-900 dark:text-white mb-3">
                        الأدوات <span className="text-primary text-gradient">التفاعلية</span>
                    </h2>
                    <p className="text-base sm:text-lg text-accent-700/60 dark:text-white/40 max-w-xl font-medium">
                        عزز صفحات نوشن بأدوات عربية تفاعلية جاهزة للتضمين فوراً.
                    </p>
                </div>
                <Link
                    href="/widgets"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/50 dark:bg-white/5 text-accent-900 dark:text-white font-bold rounded-2xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 text-xs uppercase tracking-wider border border-black/5 dark:border-white/5 shadow-soft"
                >
                    تصفح كل الأدوات
                    <ArrowLeft className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map((item) => (
                        <div key={item} className="h-[420px] rounded-[2.5rem] bg-white/30 dark:bg-white/5 animate-pulse border border-black/5 dark:border-white/5" />
                    ))
                ) : (
                    displayWidgets.map((widget) => (
                        <div
                            key={widget.id}
                            onClick={() => router.push(`/widgets/${widget.id}`)}
                            className="group relative overflow-hidden rounded-[2.5rem] bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-primary/20 backdrop-blur-xl hover:shadow-glow hover:-translate-y-2 transition-all duration-500 shadow-soft cursor-pointer flex flex-col"
                        >
                            {/* Visual Foundry Segment */}
                            <div className={`h-48 bg-gradient-to-br ${widget.gradient} flex items-center justify-center relative overflow-hidden shrink-0`}>
                                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                                
                                <div className="absolute top-4 left-4 z-20">
                                    <div className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-xl">
                                        تفاعلي
                                    </div>
                                </div>

                                <div className="relative z-10 p-6 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-large group-hover:scale-110 transition-transform duration-500">
                                    <div className="w-14 h-14 flex items-center justify-center text-white drop-shadow-glow">
                                        {widget.icon}
                                    </div>
                                </div>
                            </div>

                            {/* Intelligence Segment */}
                            <div className="p-6 sm:p-8 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-3.5 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-full">
                                        {widget.category}
                                    </span>
                                    {stats[widget.id] > 0 && (
                                        <div className="flex items-center gap-1.5 text-accent-900/40 dark:text-white/30 text-[10px] font-black uppercase tracking-wider">
                                            <Users className="w-3.5 h-3.5" />
                                            {widget.users}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-black text-accent-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                    {widget.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-accent-700/60 dark:text-white/40 mb-6 line-clamp-2 leading-relaxed">
                                    {widget.description}
                                </p>

                                <div className="pt-4 border-t border-accent-900/5 dark:border-white/5 mt-auto flex gap-3">
                                    {isAuthenticated ? (
                                        <button
                                            onClick={(e) => copyEmbed(e, widget.id)}
                                            className="flex-1 bg-primary text-white py-3.5 px-5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-primary/20"
                                        >
                                            {copiedId === widget.id ? 'تم النسخ!' : <><Copy className="w-4 h-4" /> نسخ رابط التضمين</>}
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/widgets/${widget.id}`}
                                            className="flex-1 bg-primary text-white py-3.5 px-5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-primary/20"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="w-4 h-4" /> معاينة وتضمين
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    if (embedded) {
        return content;
    }

    return (
        <section className="section-reveal py-16 sm:py-24 transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                {content}
            </div>
        </section>
    );
}
