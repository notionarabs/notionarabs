'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Zap, Layout, BookOpen, Clock, Command, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import api from '../lib/api';

// Icon mapping to handle strings from cache
const IconMap = {
    widget: Zap,
    template: Layout,
    blog: BookOpen,
    search: Search
};

export default function SearchPalette({ isOpen, onClose }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [allWidgets, setAllWidgets] = useState([]); // Cache widgets once
    const { theme } = useTheme();
    const inputRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Keyboard navigation
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setResults([]);
            setSelectedIndex(0);

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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
            }
            if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault();
                handleSelect(results[selectedIndex]);
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex]);

    // Optimized Search logic - Cancellation + Pre-fetched data
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const delayDebounceFn = setTimeout(async () => {
            const currentQuery = query.trim().toLowerCase();

            // Check cache first (string search is cheap)
            const cached = sessionStorage.getItem(`search_${currentQuery}`);
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

                // 2. Fetch Templates & Blogs (Network trip - only 2 concurrent calls now)
                const [templatesRes, blogsRes] = await Promise.all([
                    api.get(`/templates?search=${currentQuery}&limit=3`, { signal: abortControllerRef.current.signal }),
                    api.get(`/blogs?search=${currentQuery}&limit=3`, { signal: abortControllerRef.current.signal })
                ]);

                const templateItems = (templatesRes.data.templates || [])
                    .map(t => ({ ...t, type: 'template', link: `/templates/${t.slug || t._id}` }));

                const blogItems = (blogsRes.data.blogs || [])
                    .map(b => ({ ...b, type: 'blog', link: `/blog/${b.slug}` }));

                const allFiltered = [...widgetItems, ...templateItems, ...blogItems];
                setResults(allFiltered);
                sessionStorage.setItem(`search_${currentQuery}`, JSON.stringify(allFiltered));
            } catch (err) {
                if (!axios.isCancel(err)) {
                    console.error('Search fetch error:', err);
                }
            } finally {
                setLoading(false);
            }
        }, 180); // Slight increase for better batching, but feels faster due to local widgets

        return () => {
            clearTimeout(delayDebounceFn);
        };
    }, [query, allWidgets]);

    const handleSelect = (item) => {
        router.push(item.link);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop - Solid for maximum performance */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/50 transition-opacity duration-200"
            ></motion.div>

            {/* Palette Container - High Performance Architecture */}
            <motion.div
                initial={{ opacity: 0, scale: 1, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1, y: 0 }}
                className={`relative w-full max-w-2xl border transition-colors duration-200 rounded-2xl overflow-hidden ${theme === 'dark'
                    ? 'bg-[#121212] border-white/5 shadow-2xl'
                    : 'bg-white border-gray-100 shadow-xl'
                    }`}
                dir="rtl"
            >
                {/* Visionary Glow Effect - Only in Dark Mode */}
                {theme === 'dark' && (
                    <div className="absolute top-0 right-0 w-[400px] h-1 bg-gradient-to-l from-primary-500/30 to-transparent"></div>
                )}

                {/* Search Input Area */}
                <div className={`flex items-center gap-4 p-5 border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100'
                    }`}>
                    <Search className={`w-5 h-5 shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-primary-500'}`} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ابحث عن أي شيء..."
                        className={`flex-1 bg-transparent border-none focus:ring-0 text-xl font-tajawal outline-none ${theme === 'dark' ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                            }`}
                    />
                </div>

                {/* Results Area */}
                <div className="max-h-[450px] overflow-y-auto no-scrollbar py-2">
                    {!query ? (
                        <div className="px-6 py-20 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-100'
                                }`}>
                                <Search className={`w-8 h-8 ${theme === 'dark' ? 'text-white/10' : 'text-gray-300'}`} />
                            </div>
                            <p className={`font-bold text-xl mb-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-700'}`}>استكشف عرب نوشن</p>
                            <p className={`text-sm font-tajawal max-w-[280px] mx-auto leading-relaxed ${theme === 'dark' ? 'text-white/20' : 'text-gray-400'
                                }`}>ابدأ الكتابة للبحث عن القوالب، الأدوات الذكية، أو المقالات التعليمية.</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1 px-3">
                            {results.map((item, idx) => (
                                <button
                                    key={`${item.type}-${item._id || item.id}`}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-75 text-right ${selectedIndex === idx
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/10'
                                        : theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedIndex === idx
                                            ? 'bg-white/20'
                                            : theme === 'dark' ? 'bg-white/5 text-primary-500' : 'bg-primary-50 text-primary-600'
                                            }`}>
                                            {(() => {
                                                const Icon = IconMap[item.type] || Zap;
                                                return <Icon className="w-4 h-4" />;
                                            })()}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${selectedIndex === idx
                                                ? 'text-white'
                                                : theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                                                }`}>{item.title}</p>
                                            <p className={`text-xs mt-1 ${selectedIndex === idx
                                                ? 'text-white/70'
                                                : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                {item.type === 'widget' ? 'أداة ذكية' : item.type === 'template' ? 'قالب جاهز' : 'مقال في المدونة'}
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
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-sm">جاري البحث في الأرشيف...</p>
                        </div>
                    ) : (
                        <div className="px-6 py-20 text-center">
                            <X className="w-12 h-12 text-red-500/20 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">لم نجد أي نتائج لـ "{query}"</p>
                            <p className="text-gray-600 text-sm mt-2">تأكد من كتابة الكلمات بشكل صحيح.</p>
                        </div>
                    )}
                </div>

                {/* Footer Shortcuts */}
                <div className={`p-4 border-t flex items-center justify-between text-[11px] transition-colors duration-300 ${theme === 'dark' ? 'bg-white/[0.02] border-white/5 text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-400'
                    }`}>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${theme === 'dark' ? 'bg-white/10 border-white/10 text-gray-300' : 'bg-white border-gray-200 text-gray-500'
                                }`}>↵</kbd> اختيار
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className={`px-1.5 py-0.5 rounded border text-[10px] transition-colors ${theme === 'dark' ? 'bg-white/10 border-white/10 text-gray-300' : 'bg-white border-gray-200 text-gray-500'
                                }`}>↑↓</kbd> تنقل
                        </span>
                    </div>
                    <span className="font-tajawal">عرب نوشن - محرك البحث الذكي</span>
                </div>
            </motion.div>
        </div>
    );
}
