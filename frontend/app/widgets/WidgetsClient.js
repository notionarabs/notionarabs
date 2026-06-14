'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layout, Copy, ExternalLink, Zap, Sparkles, Users, Clock, Sun, Timer, BookOpen, CheckSquare, Search, Filter, X, Cloud, Star, Calculator, Landmark, Lock, ArrowUpDown, ChevronDown, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../../components/Footer';
import { BreadcrumbWrapper } from '../../components/Breadcrumb';

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

function CategorySkeleton() {
    return (
        <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible px-4 py-4 w-full md:w-auto no-scrollbar scroll-smooth">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-11 w-24 bg-white dark:bg-dark-secondary border-none rounded-2xl animate-pulse" />
            ))}
        </div>
    );
}

function SortSkeleton() {
    return (
        <div className="h-12 w-full sm:w-48 bg-white dark:bg-dark-secondary border-none rounded-2xl animate-pulse" />
    );
}

function SearchSkeleton() {
    return (
        <div className="h-12 w-full md:w-80 bg-white dark:bg-dark-secondary border-none rounded-2xl animate-pulse" />
    );
}

export default function WidgetsClient() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [copiedId, setCopiedId] = useState(null);
    const [widgets, setWidgets] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('الكل');
    const [sortBy, setSortBy] = useState('popular');
    const [isSortOpen, setIsSortOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.notionarabs.com/api';
                const cleanedBase = base.trim().replace(/\/+$/, '');
                const widgetsUrl = cleanedBase.endsWith('/api') ? `${cleanedBase}/widgets` : `${cleanedBase}/api/widgets`;
                const statsUrl = cleanedBase.endsWith('/api') ? `${cleanedBase}/widgets/stats` : `${cleanedBase}/api/widgets/stats`;

                // Fetch both widgets and stats
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

    const sortedWidgets = [...filteredWidgets].sort((a, b) => {
        if (sortBy === 'popular') {
            return (stats[b.id] || 0) - (stats[a.id] || 0);
        }
        if (sortBy === 'newest') {
            // Sort by createdAt date (newest first)
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'alphabetical') {
            return a.title.localeCompare(b.title, 'ar');
        }
        return 0;
    });

    const sortedByUsers = Object.entries(stats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id]) => id);

    const categoryGradients = {
        'إسلاميات': 'from-emerald-100 to-emerald-50 dark:from-emerald-950/40 dark:to-dark-primary',
        'إنتاجية': 'from-blue-100 to-blue-50 dark:from-blue-950/40 dark:to-dark-primary',
        'جماليات': 'from-purple-100 to-purple-50 dark:from-purple-950/40 dark:to-dark-primary',
    };

    const displayWidgets = sortedWidgets.map(w => {
        // Automatic "New" logic: added in the last 14 days
        const isNew = w.createdAt && (new Date() - new Date(w.createdAt)) < 14 * 24 * 60 * 60 * 1000;
        const isPopular = sortedByUsers.includes(w.id);

        return {
            ...w,
            icon: iconMap[w.iconIdentifier] || <Zap className="w-6 h-6 text-gray-500" />,
            users: (stats[w.id] || 0).toLocaleString() + '+',
            isPopular,
            isNew,
            gradient: categoryGradients[w.category] || 'from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-dark-primary'
        };
    });

    return (
        <main className="min-h-screen bg-secondary-50 dark:bg-[#0a0a0a] text-foreground dark:text-white transition-colors duration-300" dir="rtl">

            {/* Breadcrumb Section */}
            <BreadcrumbWrapper items={[{ name: 'الأدوات', url: '/widgets' }]} />

            {/* Premium Atmospheric Foundry Hero */}
            <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
                {/* Arab-OS Style Mesh Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
                </div>

                <div className="container-custom relative z-10 text-center">
                    <div className="max-w-4xl mx-auto">

                        <h1 className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 tracking-tight">
                            أدوات <span className="text-primary drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">عرب نوشن</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-foreground/60 dark:text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
                            عزز صفحاتك في نوشن بأدوات ذكية مصممة خصيصاً للمستخدم العربي. جمالية متكاملة بضغطة زر.
                        </p>

                        {/* Integrated Command Search */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative group p-1 rounded-[2rem] bg-white/50 dark:bg-white/5 backdrop-blur-xl border-none shadow-2xl transition-all">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث عن أداة... (آية اليوم، ساعة، منظم مهام)"
                                    className="w-full bg-transparent border-none focus:ring-0 px-8 py-5 text-lg text-foreground dark:text-white placeholder:text-foreground/40 dark:placeholder:text-white/30"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {searchQuery && (
                                        <button 
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="p-2 text-foreground/40 hover:text-primary transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Search className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12 pb-24 px-4 bg-secondary-50 dark:bg-[#0a0a0a] min-h-[600px]">
                <div className="container-custom">
                    {/* Silk Pill Filters & Sort */}
                    <div className="mb-16 flex flex-col lg:flex-row gap-8 items-center justify-between">
                        {loading ? (
                            <CategorySkeleton />
                        ) : (
                            <div className="flex items-center gap-3 overflow-x-auto overflow-y-visible px-4 py-4 w-full lg:w-auto no-scrollbar scroll-smooth">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-8 py-3 rounded-2xl text-sm font-black tracking-widest transition-all duration-300 whitespace-nowrap uppercase border-none ${activeCategory === cat
                                            ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                                            : 'bg-card/50 dark:bg-white/5 text-foreground/60 dark:text-white/40 hover:bg-white/10'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            {loading ? (
                                <SortSkeleton />
                            ) : (
                                <div className="relative w-full lg:w-56">
                                    <button
                                        onClick={() => setIsSortOpen(!isSortOpen)}
                                        className="w-full flex items-center justify-between bg-card/50 dark:bg-white/5 border-none px-6 py-3.5 rounded-2xl text-sm font-black text-foreground dark:text-white transition-all focus:outline-none shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ArrowUpDown className="w-4 h-4 text-primary" />
                                            <span className="opacity-60">الترتيب</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isSortOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-full left-0 right-0 mt-3 bg-card dark:bg-[#1a1a1a] border-none rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                                                >
                                                    <div className="p-2 space-y-1">
                                                        {[
                                                            { id: 'popular', label: 'الأكثر استخداماً' },
                                                            { id: 'newest', label: 'الأحدث أولاً' }
                                                        ].map((option) => (
                                                            <button
                                                                key={option.id}
                                                                onClick={() => {
                                                                    setSortBy(option.id);
                                                                    setIsSortOpen(false);
                                                                }}
                                                                className={`w-full text-right px-6 py-4 text-sm font-black transition-all rounded-xl flex items-center justify-between ${sortBy === option.id
                                                                    ? 'bg-primary/20 text-primary'
                                                                    : 'hover:bg-white/5 text-foreground/60 dark:text-white/40'
                                                                    }`}
                                                            >
                                                                <span>{option.label}</span>
                                                                {sortBy === option.id && <Check className="w-4 h-4" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {loading ? (
                            [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                <div key={item} className="aspect-[4/3] rounded-[3.5rem] bg-white/50 dark:bg-white/5 animate-pulse shadow-soft" />
                            ))
                        ) : displayWidgets.length > 0 ? (
                            displayWidgets.map((widget, index) => (
                                <div
                                    key={widget.id}
                                    onClick={() => router.push(`/widgets/${widget.id}`)}
                                    className="group bg-white/30 dark:bg-white/5 backdrop-blur-[40px] rounded-[2rem] sm:rounded-[3.5rem] shadow-large group-hover:shadow-glow group-hover:-translate-y-4 transition-all duration-700 flex flex-col border-none overflow-hidden isolate cursor-pointer h-full"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Visual Foundry Segment */}
                                    <div className="relative aspect-[4/3] m-2 sm:m-4 overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/5 to-accent-500/10 flex items-center justify-center">
                                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                                        
                                        {/* Precision Glow */}
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px]" />

                                        {/* Tech Badges */}
                                        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex flex-col gap-2">
                                            {widget.isPopular && (
                                                <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    الأكثر استخداماً
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative z-10 p-6 sm:p-8 bg-white/10 backdrop-blur-xl rounded-[2rem] border-none shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-white drop-shadow-glow">
                                                {widget.icon}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Intelligence Segment */}
                                    <div className="p-4 sm:p-6 flex-1 flex flex-col relative z-20">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {widget.category}
                                            </span>
                                            {stats[widget.id] > 0 && (
                                                <div className="flex items-center gap-1.5 sm:gap-2 text-foreground/40 dark:text-white/30 text-[10px] font-black uppercase tracking-widest">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {widget.users}
                                                </div>
                                            )}
                                        </div>

                                        <h2 className="text-lg sm:text-2xl font-black text-foreground dark:text-white mb-auto group-hover:text-primary transition-colors tracking-tighter leading-tight line-clamp-1">
                                            {widget.title}
                                        </h2>

                                        <div className="pt-4 sm:pt-6 border-t border-accent-900/5 dark:border-white/5 mt-4 flex gap-3">
                                            {isAuthenticated ? (
                                                <button
                                                    onClick={(e) => copyEmbed(e, widget.id)}
                                                    className="flex-1 bg-primary text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                                                >
                                                    {copiedId === widget.id ? 'تم النسخ!' : <><Copy className="w-4 h-4" /> نسخ</>}
                                                </button>
                                            ) : (
                                                <Link
                                                    href={`/widgets/${widget.id}`}
                                                    className="flex-1 bg-primary text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Lock className="w-4 h-4" /> سجل
                                                </Link>
                                            )}
                                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-card-border/5 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/40 dark:text-white/40 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
                                <div className="relative inline-block mb-10">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                                    <div className="relative w-28 h-28 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                                        <Zap className="w-12 h-12 text-primary/40 rotate-12" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-foreground dark:text-white mb-4">
                                    المختبر لا يجد طلباً مطابقاً
                                </h3>
                                <p className="text-foreground/60 dark:text-white/40 max-w-md mx-auto mb-10 leading-relaxed font-medium">
                                    جرب استخدام كلمات بحث أبسط، أو تصفح الأدوات المتاحة حسب القسم. نحن نعمل باستمرار على تطوير أدوات جديدة.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button
                                        onClick={() => { setSearchQuery(''); setActiveCategory('الكل') }}
                                        className="px-8 py-3.5 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all text-xs uppercase tracking-widest"
                                    >
                                        إعادة الضبط
                                    </button>
                                    <Link
                                        href="/contact"
                                        className="px-8 py-3.5 bg-white/50 dark:bg-white/5 backdrop-blur-sm text-foreground dark:text-white font-black rounded-2xl shadow-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
                                    >
                                        طلب أداة مخصصة
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
