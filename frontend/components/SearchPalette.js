'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Zap, Layout, BookOpen, Clock, Command, ArrowRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import api from '../lib/api';

// Icon mapping to handle strings from cache
const IconMap = {
    widget: Zap,
    template: Layout,
    blog: BookOpen,
    creator: Users,
    search: Search
};

export default function SearchPalette({ isOpen, onClose }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeFilter, setActiveFilter] = useState('all');
    const [allWidgets, setAllWidgets] = useState([]); // Cache widgets once
    const { theme } = useTheme();
    const inputRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Context-driven check for premium aesthetics stability
    const isDark = theme === 'dark';

    const isSlashCommandQuery = query.startsWith('/');
    const slashCommands = [
        { cmd: '/templates', label: 'تصفية حسب القوالب فقط', type: 'template', desc: 'قوالب جاهزة متطورة ومنظمة' },
        { cmd: '/widgets', label: 'تصفية حسب الأدوات الذكية فقط', type: 'widget', desc: 'أدوات تفاعلية لتضمينها داخل صفحاتك' },
        { cmd: '/blogs', label: 'تصفية حسب المقالات فقط', type: 'blog', desc: 'مقالات تقنية وشروحات مميزة لعرب نوشن' },
        { cmd: '/creators', label: 'تصفية حسب المبدعين فقط', type: 'creator', desc: 'الملفات الشخصية لمبدعي المجتمع' },
    ];

    const displayedCommands = slashCommands.filter(c => c.cmd.startsWith(query.toLowerCase()));

    // Filter results locally by category tab
    const displayedResults = activeFilter === 'all'
        ? results
        : results.filter(item => item.type === activeFilter);

    // Keyboard navigation
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            setActiveFilter('all');

            // Fetch widgets once per session (usually static metadata)
            const getWidgets = async () => {
                try {
                    const res = await api.get('/widgets');
                    setAllWidgets(res.data.widgets || []);
                } catch (e) { console.error('Error pre-fetching widgets', e); }
            };
            getWidgets();
        }
    }, [isOpen]);

    const handleSelectCommand = (cmd) => {
        setActiveFilter(cmd.type);
        setQuery('');
        setSelectedIndex(0);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    };

    const handleSelect = (item) => {
        router.push(item.link);
        onClose();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }

            const listToNavigate = isSlashCommandQuery ? displayedCommands : displayedResults;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < listToNavigate.length - 1 ? prev + 1 : prev));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (isSlashCommandQuery && listToNavigate[selectedIndex]) {
                    handleSelectCommand(listToNavigate[selectedIndex]);
                } else if (listToNavigate[selectedIndex]) {
                    handleSelect(listToNavigate[selectedIndex]);
                }
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, displayedResults, displayedCommands, isSlashCommandQuery, selectedIndex]);

    // Optimized Search logic - Cancellation + Pre-fetched data
    useEffect(() => {
        if (!query.trim() || isSlashCommandQuery) {
            if (!isSlashCommandQuery) {
                setResults([]);
            }
            setLoading(false);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const delayDebounceFn = setTimeout(async () => {
            let currentQuery = query.trim().toLowerCase();

            // Auto-trigger filters with commands (e.g., typing "/t " or "/templates ")
            let autoFilter = null;
            if (currentQuery.startsWith('/templates ') || currentQuery.startsWith('/t ')) {
                autoFilter = 'template';
                currentQuery = currentQuery.replace(/^\/templates\s+|^\/t\s+/, '');
            } else if (currentQuery.startsWith('/widgets ') || currentQuery.startsWith('/w ')) {
                autoFilter = 'widget';
                currentQuery = currentQuery.replace(/^\/widgets\s+|^\/w\s+/, '');
            } else if (currentQuery.startsWith('/blogs ') || currentQuery.startsWith('/b ')) {
                autoFilter = 'blog';
                currentQuery = currentQuery.replace(/^\/blogs\s+|^\/b\s+/, '');
            } else if (currentQuery.startsWith('/creators ') || currentQuery.startsWith('/c ')) {
                autoFilter = 'creator';
                currentQuery = currentQuery.replace(/^\/creators\s+|^\/c\s+/, '');
            }

            if (autoFilter) {
                setActiveFilter(autoFilter);
                setQuery(currentQuery);
                setSelectedIndex(0);
                return;
            }

            // Quick shortcut commands typed exactly
            if (currentQuery === '/t' || currentQuery === '/templates') {
                setActiveFilter('template');
                setQuery('');
                setSelectedIndex(0);
                return;
            } else if (currentQuery === '/w' || currentQuery === '/widgets') {
                setActiveFilter('widget');
                setQuery('');
                setSelectedIndex(0);
                return;
            } else if (currentQuery === '/b' || currentQuery === '/blogs') {
                setActiveFilter('blog');
                setQuery('');
                setSelectedIndex(0);
                return;
            } else if (currentQuery === '/c' || currentQuery === '/creators') {
                setActiveFilter('creator');
                setQuery('');
                setSelectedIndex(0);
                return;
            }

            // Check cache first (string search is cheap)
            const cacheKey = `search_${activeFilter}_${currentQuery}`;
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                setResults(JSON.parse(cached));
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // 1. Filter widgets LOCALLY (No network trip)
                const widgetItems = allWidgets
                    .filter(w =>
                        w.title.toLowerCase().includes(currentQuery) ||
                        (w.description && w.description.toLowerCase().includes(currentQuery))
                    )
                    .slice(0, 3)
                    .map(w => ({ ...w, type: 'widget', link: `/widgets/${w.id}` }));

                // 2. Fetch Templates, Blogs & Creators concurrently (Network trip)
                const [templatesRes, blogsRes, creatorsRes] = await Promise.all([
                    api.get(`/templates?search=${currentQuery}&limit=4`, { signal: abortControllerRef.current.signal }),
                    api.get(`/blogs?search=${currentQuery}&limit=4`, { signal: abortControllerRef.current.signal }),
                    api.get(`/creators?search=${currentQuery}&limit=4`, { signal: abortControllerRef.current.signal })
                ]);

                const templateItems = (templatesRes.data.templates || [])
                    .map(t => ({ ...t, type: 'template', link: `/templates/${t.slug || t._id}` }));

                const blogItems = (blogsRes.data.blogs || [])
                    .map(b => ({ ...b, type: 'blog', link: `/blog/${b.slug}` }));

                const creatorItems = (creatorsRes.data.creators || [])
                    .map(c => ({ 
                        ...c, 
                        type: 'creator', 
                        title: c.displayName || c.name, 
                        link: `/creators/${c.username || c.id}` 
                    }));

                const allFiltered = [...widgetItems, ...templateItems, ...blogItems, ...creatorItems];
                setResults(allFiltered);
                sessionStorage.setItem(cacheKey, JSON.stringify(allFiltered));
            } catch (err) {
                if (!axios.isCancel(err)) {
                    console.error('Search fetch error:', err);
                }
            } finally {
                setLoading(false);
            }
        }, 180);

        return () => {
            clearTimeout(delayDebounceFn);
        };
    }, [query, allWidgets, activeFilter]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
            ></motion.div>

            {/* Palette Container with Guaranteed Opaque Background */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ backgroundColor: isDark ? '#111113' : '#ffffff' }}
                className={`relative w-full max-w-2xl border rounded-3xl overflow-hidden transition-all duration-300 ${
                    isDark 
                        ? 'border-white/5 shadow-[0_24px_64px_rgba(0,0,0,0.9)]' 
                        : 'border-gray-100 shadow-[0_24px_64px_rgba(0,0,0,0.15)]'
                }`}
                dir="rtl"
            >
                {/* Glow bar */}
                <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                {/* Search Input Area */}
                <div 
                    style={{ backgroundColor: isDark ? '#141417' : '#f9fafb' }}
                    className={`flex items-center gap-4 p-5 border-b transition-colors duration-300 ${
                        isDark ? 'border-white/5' : 'border-gray-100'
                    }`}
                >
                    <Search className={`w-5 h-5 shrink-0 ${isDark ? 'text-gray-500' : 'text-primary-500'}`} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ابحث عن قوالب، أدوات، مبدعين، أو اكتب / للمساعدة..."
                        className={`flex-1 bg-transparent border-none focus:ring-0 text-lg font-tajawal outline-none ${
                            isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                        }`}
                    />
                    {query && (
                        <button 
                            onClick={() => { setQuery(''); setResults([]); setSelectedIndex(0); }}
                            className={`p-1 rounded-full transition-colors ${
                                isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                            }`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Category Filters Row */}
                <div 
                    style={{ backgroundColor: isDark ? '#0b0b0d' : '#f3f4f6' }}
                    className={`flex items-center gap-2 px-5 py-3 border-b text-xs overflow-x-auto no-scrollbar transition-colors duration-300 ${
                        isDark ? 'border-white/5' : 'border-gray-100'
                    }`}
                >
                    <span className={`text-[10px] font-black uppercase tracking-wider ml-2 shrink-0 ${
                        isDark ? 'text-white/20' : 'text-gray-400'
                    }`}>البحث في:</span>
                    {[
                        { id: 'all', label: 'الكل', color: 'bg-primary-500/10 text-primary-400 border-primary-500/20' },
                        { id: 'template', label: 'القوالب', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                        { id: 'widget', label: 'الأدوات', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                        { id: 'blog', label: 'المدونة', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                        { id: 'creator', label: 'المبدعين', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => {
                                setActiveFilter(filter.id);
                                setSelectedIndex(0);
                            }}
                            style={{ backgroundColor: activeFilter === filter.id ? undefined : (isDark ? '#19191d' : '#ffffff') }}
                            className={`px-3.5 py-1.5 rounded-full border text-[11px] font-black transition-all duration-300 shrink-0 ${
                                activeFilter === filter.id
                                    ? filter.color + ' scale-105 border-transparent shadow-md'
                                    : isDark
                                        ? 'border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10'
                                        : 'border-gray-100 text-gray-400 hover:text-gray-600 hover:border-gray-200'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Results Area */}
                <div className="max-h-[380px] overflow-y-auto no-scrollbar py-2">
                    {/* Slash Command Autocomplete View */}
                    {isSlashCommandQuery ? (
                        <div className="px-3 py-2 space-y-1">
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-3 ${
                                isDark ? 'text-white/20' : 'text-gray-400'
                            }`}>الأوامر السريعة للتصفية</p>
                            {displayedCommands.length > 0 ? (
                                displayedCommands.map((cmd, idx) => (
                                    <button
                                        key={cmd.cmd}
                                        onClick={() => handleSelectCommand(cmd)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-75 text-right ${
                                            selectedIndex === idx
                                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/10'
                                                : isDark 
                                                    ? 'hover:bg-white/5 text-gray-400' 
                                                    : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                                                selectedIndex === idx
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-primary-500/10 text-primary-500'
                                                }`}>
                                                /
                                            </div>
                                            <div>
                                                <p className={`font-black text-sm ${
                                                    selectedIndex === idx ? 'text-white' : isDark ? 'text-gray-200' : 'text-gray-900'
                                                }`}>{cmd.cmd}</p>
                                                <p className={`text-xs mt-0.5 ${selectedIndex === idx ? 'text-white/70' : 'text-gray-400'}`}>{cmd.label}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-mono px-2 py-1 rounded ${
                                            selectedIndex === idx 
                                                ? 'bg-white/20 text-white' 
                                                : isDark 
                                                    ? 'bg-white/5 text-gray-400' 
                                                    : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            تفعيل
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-6 py-12 text-center text-gray-400 font-bold">
                                    لا يوجد أمر بهذا الاسم. اكتب /templates, /widgets, /blogs, /creators
                                </div>
                            )}
                        </div>
                    ) : !query ? (
                        /* Default Quick Access Menu */
                        <div className="px-6 py-6">
                            <div className="mb-6">
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${
                                    isDark ? 'text-white/20' : 'text-gray-400'
                                }`}>الوصول السريع</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { label: 'متجر القوالب', icon: <Layout className="w-5 h-5" />, href: '/templates', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                        { label: 'مختبر الأدوات', icon: <Zap className="w-5 h-5" />, href: '/widgets', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                        { label: 'مدونة المجتمع', icon: <BookOpen className="w-5 h-5" />, href: '/blog', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                        { label: 'صناع المحتوى', icon: <Users className="w-5 h-5" />, href: '/creators', color: 'text-purple-500', bg: 'bg-purple-500/10' }
                                    ].map((item) => (
                                        <button
                                            key={item.href}
                                            onClick={() => { router.push(item.href); onClose(); }}
                                            style={{ backgroundColor: isDark ? '#19191d' : '#f9fafb' }}
                                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent ${
                                                isDark 
                                                    ? 'hover:bg-white/[0.03] hover:border-white/5 text-white/80' 
                                                    : 'hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 text-gray-700'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                                                {item.icon}
                                            </div>
                                            <span className={`font-black text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`text-center pt-6 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3 ${
                                    isDark ? 'bg-white/[0.02]' : 'bg-gray-100'
                                }`}>
                                    <Command className={`w-5 h-5 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
                                </div>
                                <p className={`text-[11px] font-bold ${isDark ? 'text-white/30' : 'text-gray-400'}`}>ابدأ الكتابة للبحث الفوري، أو استخدم الأوامر المباشرة لتصفية محددة</p>
                            </div>
                        </div>
                    ) : displayedResults.length > 0 ? (
                        /* Filtered Results View */
                        <div className="space-y-1 px-3">
                            {displayedResults.map((item, idx) => (
                                <button
                                    key={`${item.type}-${item._id || item.id}`}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-75 text-right ${
                                        selectedIndex === idx
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/10'
                                            : isDark 
                                                ? 'hover:bg-white/5 text-gray-400' 
                                                : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            selectedIndex === idx
                                                ? 'bg-white/20'
                                                : isDark 
                                                    ? 'bg-white/5 text-primary-500' 
                                                    : 'bg-primary-50 text-primary-600'
                                        }`}>
                                            {(() => {
                                                const Icon = IconMap[item.type] || Zap;
                                                return <Icon className="w-4 h-4" />;
                                            })()}
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm ${
                                                selectedIndex === idx
                                                    ? 'text-white'
                                                    : isDark 
                                                        ? 'text-gray-200' 
                                                        : 'text-gray-900'
                                            }`}>{item.title}</p>
                                            <p className={`text-xs mt-0.5 ${
                                                selectedIndex === idx
                                                    ? 'text-white/70'
                                                    : isDark 
                                                        ? 'text-gray-500' 
                                                        : 'text-gray-400'
                                            }`}>
                                                {item.type === 'widget' ? 'أداة ذكية' : item.type === 'template' ? 'قالب جاهز' : item.type === 'blog' ? 'مقال في المدونة' : 'مبدع معتمد'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedIndex === idx && (
                                        <ArrowRight className="w-5 h-5 transition-transform duration-150" />
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : loading ? (
                        /* Spinner View */
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-xs font-bold">جاري البحث في الأرشيف...</p>
                        </div>
                    ) : (
                        /* Empty State View */
                        <div className="px-6 py-16 text-center">
                            <X className="w-12 h-12 text-red-500/20 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">لم نجد أي نتائج لـ "{query}"</p>
                            <p className="text-gray-600 text-xs mt-2">تأكد من كتابة الكلمات بشكل صحيح أو جرب فئة أخرى.</p>
                        </div>
                    )}
                </div>

                {/* Footer Shortcuts */}
                <div 
                    style={{ backgroundColor: isDark ? '#0b0b0d' : '#f3f4f6' }}
                    className={`p-4 border-t flex items-center justify-between text-[11px] transition-colors duration-300 ${
                        isDark ? 'border-white/5 text-gray-500' : 'border-gray-100 text-gray-400'
                    }`}
                >
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
                                isDark 
                                    ? 'bg-white/10 border-white/10 text-gray-300' 
                                    : 'bg-white border-gray-200 text-gray-500'
                            }`}>↵</kbd> اختيار
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${
                                isDark 
                                    ? 'bg-white/10 border-white/10 text-gray-300' 
                                    : 'bg-white border-gray-200 text-gray-500'
                            }`}>↑↓</kbd> تنقل
                        </span>
                    </div>
                    <span className="font-almarai">عرب نوشن - محرك البحث الذكي</span>
                </div>
            </motion.div>
        </div>
    );
}
