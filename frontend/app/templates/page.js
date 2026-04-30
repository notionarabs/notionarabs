'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import { LayoutDashboard, Star, Filter, Download, Globe, Calendar, ShoppingCart, XCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { getCategorySlug } from '../../lib/categoryMapping';
import Footer from '../../components/Footer';
import { ItemListSchema } from '../../components/StructuredData';
import { BreadcrumbWrapper } from '../../components/Breadcrumb';

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

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-700'} />
      ))}
    </div>
  );
}

function TemplatesPageContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [priceFilter, setPriceFilter] = useState('all'); 
  const [minRating, setMinRating] = useState(0);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [allTemplates, setAllTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  // Sync state with URL search parameters
  useEffect(() => {
    const category = searchParams.get('category');
    const price = searchParams.get('price');
    const search = searchParams.get('search');

    if (category) setSelectedCategory(category);
    if (price) setPriceFilter(price);
    if (search) setSearchTerm(search);
  }, [searchParams]);

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
  }, [searchTerm, sortBy, selectedCategory, priceFilter, minRating, pagination.current]);

  const handleSearch = (e) => { e.preventDefault(); setPagination(p => ({ ...p, current: 1 })); };
  const handleCategorySelect = (c) => { setSelectedCategory(c); setPagination(p => ({ ...p, current: 1 })); };
  const handlePageChange = (n) => { setPagination(p => ({ ...p, current: n })); window.scrollTo({ top: 0, behavior: 'smooth' }); };

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

              <div className="flex items-center justify-center gap-3 overflow-x-auto overflow-y-hidden pb-4 lg:pb-0 w-full no-scrollbar scroll-smooth">
                {['الكل', ...popularCategories].map((cat) => (
                  <button key={cat} onClick={() => handleCategorySelect(cat)} className={`px-8 py-3 rounded-2xl text-sm font-black tracking-widest transition-all duration-300 whitespace-nowrap uppercase border-none ${selectedCategory === cat ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-white/50 dark:bg-white/5 text-foreground/60 dark:text-white/40 hover:bg-white/10'}`}>{cat}</button>
                ))}
              </div>

               <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
                <div className="flex bg-white/50 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
                  {[{ id: 'all', label: 'الكل' }, { id: 'free', label: 'مجاني' }, { id: 'paid', label: 'مدفوع' }].map((p) => (
                    <button key={p.id} onClick={() => setPriceFilter(p.id)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${priceFilter === p.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 dark:text-white/30 hover:text-primary'}`}>{p.label}</button>
                  ))}
                </div>
                
                <div className="flex bg-white/50 dark:bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
                  {[0, 4].map((r) => (
                    <button key={r} onClick={() => setMinRating(r)} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${minRating === r ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 dark:text-white/30 hover:text-primary'}`}>{r === 0 ? 'كل التقييمات' : <><Star size={14} className="fill-current" /> النخبة</>}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container-custom pb-32">
          <div className="relative z-50 flex items-center justify-between py-12 border-none gap-8">
            <div className="px-8 py-4 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-2xl shadow-soft">
               <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-900/40 dark:text-white/20">تم تحليل <span className="text-primary">{pagination.total}</span> مسار نجاح</p>
            </div>

            <div className="relative w-full sm:w-80">
              <button onClick={() => setIsSortOpen(!isSortOpen)} className="w-full flex items-center justify-between px-8 py-4 rounded-[1.5rem] bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-none text-sm font-black text-accent-900 dark:text-white shadow-soft transition-all hover:shadow-large">
                <span className="uppercase tracking-widest">{sortOptions.find(o => o.value === sortBy)?.name}</span>
                <Filter className={`w-5 h-5 transition-transform duration-700 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSortOpen && (
                <div className="absolute z-50 mt-4 w-full rounded-[2rem] bg-black/90 dark:bg-white/10 backdrop-blur-[60px] shadow-large overflow-hidden animate-fade-in-up">
                  {sortOptions.map(opt => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }} className={`w-full text-right px-8 py-5 text-sm font-black transition-all ${sortBy === opt.value ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}>{opt.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
               {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[3.5rem] animate-pulse" />)}
             </div>
          ) : allTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
              {allTemplates.map((rel) => (
                <Link key={rel._id} href={`/templates/${rel.slug || rel._id}`} className="group relative">
                  <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[3.5rem] shadow-large group-hover:shadow-glow group-hover:-translate-y-4 transition-all duration-700 h-full flex flex-col border-none overflow-hidden isolate">
                    <div className="relative aspect-[16/10] m-4 overflow-hidden rounded-[2.5rem] shadow-soft">
                      <Image src={rel.previewImage || '/placeholder-template.jpg'} alt={rel.title} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-1000" />
                      <div className="absolute top-6 left-6 z-20"><div className="px-6 py-3 bg-black/40 backdrop-blur-xl rounded-2xl text-white font-black text-sm uppercase tracking-widest">{rel.isPaid ? `${rel.price} ج.م` : 'مجاني'}</div></div>
                    </div>
                    <div className="p-10 flex-1 flex flex-col relative z-20">
                      <div className="flex items-center justify-between mb-6">
                        <div className="px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em]">{rel.categories?.[0] || rel.category || 'عام'}</div>
                        <div className="flex items-center gap-2"><Star size={14} className="text-yellow-500 fill-yellow-500" /><span className="text-sm font-black text-accent-900 dark:text-white">{(rel.rating || 0).toFixed(1)}</span></div>
                      </div>
                      <h3 className="text-3xl font-black text-accent-900 dark:text-white mb-4 group-hover:text-primary transition-colors tracking-tighter leading-tight">{rel.title}</h3>
                      <p className="text-base text-accent-700/60 dark:text-white/40 mb-10 line-clamp-2 leading-relaxed flex-1 font-medium">{rel.description || 'نظام هندسي متكامل مخصص للارتقاء بإنتاجية المستخدم العربي.'}</p>
                      <div className="flex items-center justify-between pt-8 border-t border-accent-900/5 dark:border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 relative shadow-soft">
                            {rel.creator?.profilePicture && <Image src={rel.creator.profilePicture} alt="Cr" fill className="object-cover" />}
                          </div>
                          <span className="text-sm font-black text-accent-900 dark:text-white/80 group-hover:text-primary transition-colors">{rel.creator?.name || 'نُخبة المبدعين'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-accent-900/20 dark:text-white/10 font-black text-xs uppercase tracking-widest"><Download size={14} />{(rel.downloads || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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