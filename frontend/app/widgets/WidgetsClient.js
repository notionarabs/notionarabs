'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layout, Copy, ExternalLink, Zap, Sparkles, Users, Clock, Sun, Timer, BookOpen, CheckSquare, Search, Filter, X, Cloud } from 'lucide-react';
import Footer from '../../components/Footer';

const iconMap = {
    sparkles: <Sparkles className="w-6 h-6 text-orange-500" />,
    layout: <Layout className="w-6 h-6 text-blue-500" />,
    clock: <Clock className="w-6 h-6 text-green-500" />,
    sun: <Sun className="w-6 h-6 text-yellow-500" />,
    timer: <Timer className="w-6 h-6 text-red-500" />,
    'book-open': <BookOpen className="w-6 h-6 text-emerald-500" />,
    'check-square': <CheckSquare className="w-6 h-6 text-purple-500" />,
    cloud: <Cloud className="w-6 h-6 text-sky-500" />
};

export default function WidgetsClient() {
    const router = useRouter();
    const [copiedId, setCopiedId] = useState(null);
    const [widgets, setWidgets] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('الكل');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.notionarabs.com/api';
                const apiUrl = base.endsWith('/api') ? base.slice(0, -4) : base;

                // Fetch both widgets and stats
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
        e.stopPropagation(); // Prevent card click
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const embedUrl = `${baseUrl}/widgets/${id}/embed`;
        navigator.clipboard.writeText(embedUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const categories = ['الكل', ...new Set(widgets.map(w => w.category))];

    const filteredWidgets = widgets.filter(w => {
        const matchesCategory = activeCategory === 'الكل' || w.category === activeCategory;
        const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const sortedByUsers = Object.entries(stats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id]) => id);

    const newWidgets = ['weather', 'cultural-timer', 'habit-tracker'];

    const displayWidgets = filteredWidgets.map(w => ({
        ...w,
        icon: iconMap[w.iconIdentifier] || <Zap className="w-6 h-6 text-gray-500" />,
        users: (stats[w.id] || 0).toLocaleString() + '+',
        isPopular: sortedByUsers.includes(w.id),
        isNew: newWidgets.includes(w.id)
    }));

    return (
        <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

            <section className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300 py-12 sm:py-16 md:py-20">
                <div className="container-custom">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-normal text-accent-900 dark:text-white mb-6 leading-relaxed">
                            أدوات عرب نوشن
                        </h1>
                        <p className="text-base sm:text-lg text-accent-700 dark:text-dark-text-secondary max-w-2xl mx-auto px-4 sm:px-0 leading-relaxed font-tajawal">
                            مجموعة من الأدوات المصممة خصيصاً للمستخدم العربي لتعزيز الإنتاجية والجمالية في نوشن.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-12 pb-24 px-4 bg-secondary-50 dark:bg-dark-primary min-h-[600px]">
                <div className="container-custom">
                    {/* Filter & Search Bar */}
                    <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
                        {/* Categories */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto no-scrollbar scroll-smooth">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap border ${activeCategory === cat
                                        ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                                        : 'bg-white dark:bg-dark-secondary text-gray-500 dark:text-gray-400 border-gray-100 dark:border-dark-card-border hover:border-primary-500/50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-80 group">
                            <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${searchQuery ? 'text-primary-500' : 'text-gray-400 group-focus-within:text-primary-500'}`} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن أداة..."
                                className="w-full bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border rounded-2xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:border-primary-500 transition-all duration-300 shadow-soft font-tajawal"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-full transition-colors"
                                >
                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            [1, 2, 3, 4, 5, 6].map((item) => (
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
                        ) : displayWidgets.length > 0 ? (
                            displayWidgets.map((widget) => (
                                <div
                                    key={widget.id}
                                    onClick={() => router.push(`/widgets/${widget.id}`)}
                                    className="group card-interactive bg-white dark:bg-dark-secondary rounded-3xl overflow-hidden border border-gray-200 dark:border-dark-card-border shadow-soft cursor-pointer flex flex-col"
                                >
                                    <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-dark-tertiary dark:to-dark-primary flex items-center justify-center relative overflow-hidden">
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

                                        <div className="p-8 bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-dark-card-border transform group-hover:scale-105 transition-transform duration-500">
                                            <div className="flex items-center gap-3">
                                                {widget.icon}
                                                <div className="h-2 w-24 bg-gray-200 dark:bg-dark-text-quaternary rounded"></div>
                                            </div>
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
                                        <h2 className="text-2xl font-bold tracking-normal text-accent-900 dark:text-white mb-2">
                                            {widget.title}
                                        </h2>
                                        <p className="text-accent-600 dark:text-dark-text-secondary text-sm mb-6 line-clamp-2">
                                            {widget.description}
                                        </p>
                                        <div className="mt-auto flex gap-3">
                                            <button
                                                onClick={(e) => copyEmbed(e, widget.id)}
                                                className="flex-1 btn-primary py-2.5 px-4 text-sm flex items-center justify-center gap-2 relative z-10"
                                            >
                                                {copiedId === widget.id ? 'تم النسخ!' : <><Copy className="w-4 h-4" /> انسخ الرابط</>}
                                            </button>
                                            <div className="flex-1 btn-secondary py-2.5 px-4 text-sm flex items-center justify-center gap-2">
                                                <ExternalLink className="w-4 h-4" /> التفاصيل
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-dark-secondary rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-accent-900 dark:text-white mb-2 leading-relaxed">لم يتم العثور على نتائج</h3>
                                <p className="text-gray-500 dark:text-dark-text-secondary max-w-xs mx-auto font-tajawal">
                                    جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveCategory('الكل') }}
                                    className="mt-6 text-primary-500 font-bold hover:underline flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" /> إيقاف التصفية
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
