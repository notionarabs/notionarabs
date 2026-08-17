'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import { LayoutDashboard, Star, Filter, Download, Globe, Calendar, ShoppingCart, XCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { getCategorySlug } from '../../lib/categoryMapping';
import Footer from '../../components/Footer';
import { ItemListSchema } from '../../components/StructuredData';
import { BreadcrumbWrapper } from '../../components/Breadcrumb';
import TemplateCard from '../../components/TemplateCard';

const sortOptions = [
  { name: "الأحدث", value: "createdAt" },
  { name: "الأكثر شعبية", value: "downloads" },
  { name: "الأعلى تقييماً", value: "rating" }
];

const popularCategories = [
  "الإنتاجية",
  "الدراسة",
  "الأعمال",
  "التخطيط",
  "الطعام",
  "ديني",
  "التقنية",
  "الحياة الشخصية"
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200
    }
  }
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-700'} />
      ))}
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-[11px] font-black text-primary transition-all hover:bg-primary/20"
    >
      <span>{label}</span>
      <button onClick={onRemove} className="hover:text-primary-600 transition-colors">
        <XCircle size={14} />
      </button>
    </motion.div>
  );
}

function TemplatesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [priceFilter, setPriceFilter] = useState('all'); 
  const [languageFilter, setLanguageFilter] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [allTemplates, setAllTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  // Sync state with URL search parameters on initial load
  useEffect(() => {
    const category = searchParams.get('category');
    const price = searchParams.get('price');
    const language = searchParams.get('language');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const payment = searchParams.get('payment');

    if (category) setSelectedCategory(category);
    if (price) setPriceFilter(price);
    if (language) setLanguageFilter(language);
    if (search) setSearchTerm(search);
    if (sort) setSortBy(sort);
    if (payment === 'failed') setShowPaymentError(true);
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'الكل') params.set('category', selectedCategory);
    if (priceFilter !== 'all') params.set('price', priceFilter);
    if (languageFilter !== 'all') params.set('language', languageFilter);
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy !== 'createdAt') params.set('sort', sortBy);
    
    const queryString = params.toString();
    // Use window.history to avoid unnecessary re-mounts or use router.push with shallow if supported
    // Since we are in app router, router.push is usually fine but can be noisy.
    const url = queryString ? `/templates?${queryString}` : '/templates';
    window.history.replaceState({ ...window.history.state, as: url, url }, '', url);
  }, [selectedCategory, priceFilter, languageFilter, searchTerm, sortBy]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder: 'desc'
      });
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedCategory !== 'الكل') params.append('category', selectedCategory);
      if (priceFilter === 'free') params.append('isPaid', 'false');
      if (priceFilter === 'paid') params.append('isPaid', 'true');
      if (languageFilter !== 'all') params.append('language', languageFilter);
      if (minRating > 0) params.append('minRating', minRating.toString());

      const response = await api.get(`/templates?${params.toString()}`);
      if (response.data.success) {
        setAllTemplates(response.data.templates || []);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            current: response.data.pagination.current,
            pages: response.data.pagination.pages,
            total: response.data.pagination.total
          }));
        }
      }
    } catch (err) {
      setError('فشل في تحميل القوالب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchTemplates, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, sortBy, selectedCategory, priceFilter, languageFilter, minRating, pagination.current]);

  const clearAllFilters = () => {
    setSelectedCategory('الكل');
    setPriceFilter('all');
    setLanguageFilter('all');
    setMinRating(0);
    setSearchTerm('');
    setSortBy('createdAt');
    setPagination(p => ({ ...p, current: 1 }));
  };

  const templatesRef = useRef(null);

  const handleSearch = (e) => { e.preventDefault(); setPagination(p => ({ ...p, current: 1 })); };
  const handleCategorySelect = (c) => { setSelectedCategory(c); setPagination(p => ({ ...p, current: 1 })); };
  const handlePageChange = (n) => { 
    setPagination(p => ({ ...p, current: n })); 
    if (templatesRef.current) {
      // Offset for sticky headers or better positioning
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = templatesRef.current.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden transition-colors duration-300" dir="rtl">
      {/* SEO Structured Data */}
      {allTemplates.length > 0 && (
        <ItemListSchema 
          items={allTemplates} 
          listName={selectedCategory !== 'الكل' ? `قوالب نوشن - ${selectedCategory}` : 'متجر قوالب نوشن العربية'} 
        />
      )}

      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <main className="relative z-10">
        <BreadcrumbWrapper items={[{ name: 'المتجر', url: '/templates' }]} />
        
        <AnimatePresence>
          {showPaymentError && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="container-custom mt-8 relative z-50"
            >
              <div className="bg-red-500/10 backdrop-blur-2xl border border-red-500/30 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-xl shadow-red-500/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-red-600 dark:text-red-400 mb-1">تعذر إتمام عملية الدفع</h3>
                    <p className="text-sm font-medium text-red-700/80 dark:text-red-300/80 leading-relaxed">
                      يرجى التحقق من صحة بيانات البطاقة أو المحفظة الإلكترونية والرصيد المتاح، ثم المحاولة مجدداً.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentError(false)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0 border-none"
                >
                  حسناً، فهمت
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Atmospheric Hero */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
          </div>

          <div className="container-custom relative z-10 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 tracking-tight">
                قوالب <span className="text-primary drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">عرب نوشن</span>
              </h1>
              <p className="text-lg sm:text-xl text-foreground/60 dark:text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
                اكتشف النخبة من أنظمة نوتشين العربية المصممة لتغيير قواعد اللعب. حلول متكاملة لرفع إنتاجيتك بلمسة احترافية.
              </p>

              <div className="max-w-2xl mx-auto mb-16">
                <form onSubmit={handleSearch} className="relative group p-1 rounded-[2rem] bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-card-border shadow-2xl transition-all hover:border-primary/50 focus-within:border-primary">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن هندسة النجاح... (إدارة مشاريع، تنظيم علمي)"
                    className="w-full bg-transparent border-none focus:ring-0 px-8 py-5 text-lg text-foreground dark:text-white placeholder:text-foreground/40 dark:placeholder:text-white/30"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchTerm && (
                      <button type="button" onClick={() => setSearchTerm('')} className="p-2 text-foreground/40 hover:text-primary transition-colors"><XCircle className="w-5 h-5" /></button>
                    )}
                    <button type="submit" className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform"><Search className="w-5 h-5" /></button>
                  </div>
                </form>
              </div>

              <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto overflow-y-visible px-4 py-4 w-full no-scrollbar scroll-smooth">
                {['الكل', ...popularCategories].map((cat) => (
                  <button key={cat} onClick={() => handleCategorySelect(cat)} className={`px-8 py-3 rounded-2xl text-sm font-black tracking-widest transition-all duration-300 whitespace-nowrap uppercase border-none shrink-0 ${selectedCategory === cat ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-white/50 dark:bg-white/5 text-foreground/60 dark:text-white/40 hover:bg-white/10'}`}>{cat}</button>
                ))}
              </div>

               <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
                <div className="flex bg-white/50 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
                  {[{ id: 'all', label: 'الكل' }, { id: 'free', label: 'مجاني' }, { id: 'paid', label: 'مدفوع' }].map((p) => (
                    <button key={p.id} onClick={() => { setPriceFilter(p.id); setPagination(prev => ({ ...prev, current: 1 })); }} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${priceFilter === p.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 dark:text-white/30 hover:text-primary'}`}>{p.label}</button>
                  ))}
                </div>

                <div className="flex bg-white/50 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
                  {[{ id: 'all', label: 'كل اللغات' }, { id: 'ar', label: 'العربية' }, { id: 'en', label: 'English' }, { id: 'ar-en', label: 'ثنائي اللغة' }].map((l) => (
                    <button key={l.id} onClick={() => { setLanguageFilter(l.id); setPagination(prev => ({ ...prev, current: 1 })); }} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${languageFilter === l.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 dark:text-white/30 hover:text-primary'}`}>{l.label}</button>
                  ))}
                </div>
                
                <div className="flex bg-white/50 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
                  {[0, 3, 4].map((r) => (
                    <button key={r} onClick={() => { setMinRating(r); setPagination(prev => ({ ...prev, current: 1 })); }} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${minRating === r ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 dark:text-white/30 hover:text-primary'}`}>
                      {r === 0 ? 'كل التقييمات' : r === 4 ? <><Star size={14} className="fill-current" /> النخبة</> : <><Star size={14} className="fill-current" /> +3</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Chips - Command Center */}
              <AnimatePresence>
                {(selectedCategory !== 'الكل' || priceFilter !== 'all' || languageFilter !== 'all' || minRating > 0 || searchTerm) && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-wrap items-center justify-center gap-3 mt-8"
                  >
                    <span className="text-xs font-black text-foreground/30 dark:text-white/20 uppercase tracking-widest ml-2">الفلاتر النشطة:</span>
                    
                    {searchTerm && (
                      <Chip label={`بحث: ${searchTerm}`} onRemove={() => setSearchTerm('')} />
                    )}
                    {selectedCategory !== 'الكل' && (
                      <Chip label={selectedCategory} onRemove={() => setSelectedCategory('الكل')} />
                    )}
                    {priceFilter !== 'all' && (
                      <Chip label={priceFilter === 'free' ? 'مجاني' : 'مدفوع'} onRemove={() => setPriceFilter('all')} />
                    )}
                    {languageFilter !== 'all' && (
                      <Chip label={languageFilter === 'ar' ? 'العربية' : languageFilter === 'en' ? 'English' : 'ثنائي اللغة'} onRemove={() => setLanguageFilter('all')} />
                    )}
                    {minRating > 0 && (
                      <Chip label={`تقييم +${minRating}`} onRemove={() => setMinRating(0)} />
                    )}

                    <button 
                      onClick={clearAllFilters}
                      className="text-xs font-black text-primary hover:text-primary-600 transition-colors uppercase tracking-widest mr-4 border-b border-primary/20 hover:border-primary pb-0.5"
                    >
                      إعادة ضبط الكل
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <div ref={templatesRef} className="container-custom pb-32">
          <div className="relative z-50 flex items-center justify-between py-12 border-none gap-8">
            <div className="px-8 py-4 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-2xl shadow-soft">
               <p className="text-xs font-black uppercase tracking-wider text-accent-900/50 dark:text-white/40">إجمالي <span className="text-primary">{pagination.total}</span> قالب</p>
            </div>

            <div className="relative w-full sm:w-80">
              <button onClick={() => setIsSortOpen(!isSortOpen)} className="w-full flex items-center justify-between px-8 py-4 rounded-[1.5rem] bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-none text-sm font-black text-accent-900 dark:text-white shadow-soft transition-all hover:shadow-large">
                <span className="uppercase tracking-widest">{sortOptions.find(o => o.value === sortBy)?.name}</span>
                <Filter className={`w-5 h-5 transition-transform duration-700 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSortOpen && (
                <div className="absolute z-50 mt-4 w-full rounded-[2rem] bg-black/90 dark:bg-white/10 backdrop-blur-[60px] shadow-large overflow-hidden animate-fade-in-up">
                  {sortOptions.map(opt => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setIsSortOpen(false); setPagination(prev => ({ ...prev, current: 1 })); }} className={`w-full text-right px-8 py-5 text-sm font-black transition-all ${sortBy === opt.value ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}>{opt.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {[...Array(8)].map((_, i) => (
                 <div key={i} className="bg-white/30 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3.5rem] p-4 h-full animate-pulse border border-black/5 dark:border-white/5">
                   <div className="aspect-[4/3] bg-gray-200 dark:bg-white/10 rounded-2xl sm:rounded-[2.5rem] mb-8" />
                   <div className="px-6 space-y-6">
                     <div className="flex justify-between items-center">
                        <div className="w-20 h-6 bg-gray-200 dark:bg-white/10 rounded-full" />
                        <div className="w-12 h-6 bg-gray-200 dark:bg-white/10 rounded-full" />
                     </div>
                     <div className="w-3/4 h-10 bg-gray-200 dark:bg-white/10 rounded-2xl" />
                     <div className="space-y-3">
                        <div className="w-full h-4 bg-gray-200 dark:bg-white/10 rounded-full" />
                        <div className="w-5/6 h-4 bg-gray-200 dark:bg-white/10 rounded-full" />
                     </div>
                     <div className="pt-8 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10" />
                          <div className="w-24 h-4 bg-gray-200 dark:bg-white/10 rounded-full" />
                        </div>
                        <div className="w-12 h-4 bg-gray-200 dark:bg-white/10 rounded-full" />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          ) : allTemplates.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {allTemplates.map((rel) => (
                <motion.div key={rel._id || rel.id} variants={cardVariants} className="h-full">
                  <TemplateCard template={rel} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-48 bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[4rem] shadow-large border-none">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-4xl font-black text-accent-900 dark:text-white mb-6 tracking-tighter">لم يتم رصد الهدف</h3>
              <p className="text-xl text-accent-700/40 dark:text-white/30 max-w-xl mx-auto mb-12 font-medium">نحن بصدد إطلاق المزيد من الأنظمة. حاول توسيع نطاق البحث.</p>
              <button onClick={() => { setSearchTerm(''); setSelectedCategory('الكل'); setPriceFilter('all'); setMinRating(0); }} className="px-12 py-5 bg-primary text-white font-black rounded-2xl shadow-glow uppercase tracking-widest text-xs">إعادة ضبط النطاق</button>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="mt-24 flex justify-center">
               <div className="flex items-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-2xl p-3 rounded-[2rem] shadow-soft">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-12 h-12 rounded-xl text-sm font-black transition-all ${pagination.current === i + 1 ? 'bg-primary text-white shadow-glow scale-110' : 'text-accent-900/40 dark:text-white/20 hover:text-primary'}`}>{i + 1}</button>
                  ))}
               </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent flex items-center justify-center"><LoadingIndicator /></div>}>
      <TemplatesPageContent />
    </Suspense>
  );
}