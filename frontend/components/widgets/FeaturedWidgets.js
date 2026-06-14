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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading ? (
                        [1, 2, 3].map((item) => (
                            <div key={item} className="h-[450px] rounded-[2.5rem] bg-card border-none animate-pulse" />
                        ))
                    ) : (
                        displayWidgets.map((widget, index) => (
                            <div
                                key={widget.id}
                                onClick={() => router.push(`/widgets/${widget.id}`)}
                                className="group relative overflow-hidden rounded-[2.5rem] bg-card border-none hover:shadow-xl transition-all duration-500 shadow-2xl shadow-primary/5 cursor-pointer flex flex-col"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Visual Foundry Segment */}
                                <div className={`h-52 bg-gradient-to-br ${widget.gradient} flex items-center justify-center relative overflow-hidden shrink-0`}>
                                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                                    
                                    {/* Precision Glow */}
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px]" />

                                    {/* Tech Badges */}
                                    <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                                        {widget.isPopular && (
                                            <div className="px-3 py-1 bg-black/40 backdrop-blur-md border-none text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                                                الأكثر استخداماً
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative z-10 p-8 bg-white/10 backdrop-blur-xl rounded-[2rem] border-none shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                        <div className="w-16 h-16 flex items-center justify-center text-white drop-shadow-glow">
                                            {widget.icon}
                                        </div>
                                    </div>
                                </div>

                                {/* Intelligence Segment */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-4 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {widget.category}
                                        </span>
                                        {stats[widget.id] > 0 && (
                                            <div className="flex items-center gap-2 text-foreground/40 dark:text-white/30 text-[10px] font-black uppercase tracking-widest">
                                                <Users className="w-3.5 h-3.5" />
                                                {widget.users}
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-2xl font-black text-foreground dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-1">
                                        {widget.title}
                                    </h2>
                                    <p className="text-sm text-foreground/60 dark:text-white/40 mb-8 line-clamp-2 leading-relaxed flex-1">
                                        {widget.description}
                                    </p>

                                    <div className="pt-6 border-t border-card-border/50 dark:border-white/5 mt-auto flex gap-4">
                                        {isAuthenticated ? (
                                            <button
                                                onClick={(e) => copyEmbed(e, widget.id)}
                                                className="flex-1 bg-primary text-white py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                                            >
                                                {copiedId === widget.id ? 'تم النسخ!' : <><Copy className="w-4 h-4" /> نسخ الكود</>}
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/widgets/${widget.id}`}
                                                className="flex-1 bg-primary text-white py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Lock className="w-4 h-4" /> سجل للتثبيت
                                            </Link>
                                        )}
                                        <div className="w-14 h-14 bg-card-border/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <ExternalLink className="w-5 h-5 text-foreground/40 dark:text-white/40 group-hover:text-primary transition-colors" />
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
