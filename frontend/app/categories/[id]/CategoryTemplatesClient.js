'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Search, Star, LayoutDashboard, Download, Globe, Calendar, Zap, Filter } from 'lucide-react';
import Footer from '../../../components/Footer';

const sortOptions = [
  { name: "الأكثر شعبية", value: "downloads" },
  { name: "الأحدث", value: "createdAt" },
  { name: "الأعلى تقييماً", value: "rating" },
  { name: "الأكثر مشاهدة", value: "views" }
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

export default function CategoryTemplatesClient({ categoryId, categoryName }) {
  const [sortBy, setSortBy] = useState('downloads');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 12 });
  const [currentPage, setCurrentPage] = useState(1);
  const sortButtonRef = useRef(null);
  const sortMenuRef = useRef(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        category: categoryName
      });
      const response = await api.get(`/templates?${params.toString()}`);
      if (response.data.success) {
        setTemplates(response.data.templates || []);
        if (response.data.pagination) setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('فشل في تحميل القوالب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [sortBy, currentPage, categoryName]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isSortOpen && sortButtonRef.current && !sortButtonRef.current.contains(e.target) && !sortMenuRef.current?.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isSortOpen]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden transition-colors duration-300 pb-20" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-purple-500/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Premium Atmospheric Hero */}
        <section className="relative z-50 pt-32 pb-20 sm:pt-40 sm:pb-24">
          {/* mesh background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
          </div>

          <div className="container-custom relative z-10 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 tracking-tight">
                أنظمة <span className="text-primary drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">{categoryName}</span>
              </h1>
              <p className="text-lg sm:text-xl text-foreground/60 dark:text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
                اكتشف نخبة التصاميم المخصصة لتطوير إنتاجيتك في مجال {categoryName}. حلول هندسية مصممة بعناية.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {/* Stats Pill */}
                <div className="px-8 py-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-card-border shadow-xl text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 dark:text-white/30">
                  تم رصد <span className="text-primary">{pagination.total}</span> مسار نجاح
                </div>

                {/* Sort Dropdown */}
                <div className="relative w-full sm:w-64 group p-1 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-card-border shadow-xl transition-all">
                  <button 
                    ref={sortButtonRef}
                    onClick={() => setIsSortOpen(!isSortOpen)} 
                    className="w-full h-full px-8 py-4 flex items-center justify-between text-sm font-black text-foreground dark:text-white transition-all uppercase tracking-widest"
                  >
                    <span>{sortOptions.find(o => o.value === sortBy)?.name}</span>
                    <Filter size={18} className={`text-primary transition-transform duration-700 ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSortOpen && (
                    <div ref={sortMenuRef} className="absolute top-full left-0 right-0 z-50 mt-4 rounded-2xl bg-black/90 dark:bg-[#1a1a1a] backdrop-blur-xl border border-card-border shadow-large overflow-hidden animate-fade-in-up">
                      {sortOptions.map(opt => (
                        <button key={opt.value} onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }} className={`w-full text-right px-8 py-4 text-sm font-black transition-all ${sortBy === opt.value ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}>{opt.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Dynamic Catalog */}
        <div className="container-custom pb-32">
            {error && (
               <div className="p-12 bg-red-500/10 backdrop-blur-xl rounded-[3rem] text-center mb-16">
                 <h3 className="text-2xl font-black text-red-500">{error}</h3>
               </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
                {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] bg-white/50 dark:bg-white/5 rounded-[3.5rem] animate-pulse" />)}
              </div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
                {templates.map((rel, i) => (
                  <Link key={rel._id} href={`/templates/${rel.slug || rel._id}`} className="group">
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[3.5rem] shadow-large group-hover:shadow-glow group-hover:-translate-y-4 transition-all duration-700 h-full flex flex-col border-none overflow-hidden isolate relative">
                       <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                       <div className="relative aspect-[16/10] m-4 overflow-hidden rounded-[2.5rem] shadow-soft">
                         <Image src={rel.previewImage || '/placeholder-template.jpg'} alt={rel.title} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-1000" />
                         <div className="absolute top-6 left-6 z-20">
                            <div className="px-6 py-3 bg-black/40 backdrop-blur-xl rounded-[1.2rem] text-white font-black text-xs uppercase tracking-widest shadow-glow">
                              {rel.isPaid ? `${rel.price} ج.م` : 'مجاني'}
                            </div>
                         </div>
                       </div>
                       <div className="p-10 flex-1 flex flex-col relative z-20">
                          <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center gap-2">
                               <Star size={16} className="text-yellow-500 fill-yellow-500" />
                               <span className="text-sm font-black text-accent-900 dark:text-white">{(rel.rating || 5).toFixed(1)}</span>
                             </div>
                             <div className="flex items-center gap-2 text-accent-900/30 dark:text-white/20 font-black text-xs uppercase tracking-widest">
                               <Download size={14} />
                               {(rel.downloads || 0).toLocaleString()}
                             </div>
                          </div>
                          <h3 className="text-3xl font-black text-accent-900 dark:text-white mb-4 group-hover:text-primary transition-colors tracking-tighter leading-tight">{rel.title}</h3>
                          <p className="text-base text-accent-700/60 dark:text-white/40 mb-10 line-clamp-2 leading-relaxed flex-1 font-medium italic">{rel.description}</p>
                          <div className="flex items-center justify-between pt-8 border-t border-accent-900/5 dark:border-white/5">
                             <div className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 relative shadow-soft">
                                 {rel.creator?.profilePicture && <Image src={rel.creator.profilePicture} alt="" fill className="object-cover" />}
                               </div>
                               <span className="text-xs font-black text-accent-900/50 dark:text-white/30 uppercase tracking-widest transition-colors group-hover:text-primary">{rel.creator?.name || 'مبدع مستقل'}</span>
                             </div>
                             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                               <Zap size={20} />
                             </div>
                          </div>
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-48 bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[4rem] shadow-large border-none">
                <LayoutDashboard className="w-24 h-24 text-primary/20 mx-auto mb-8 animate-float" />
                <h3 className="text-4xl font-black text-accent-900 dark:text-white mb-6">لم يتم رصد أنظمة في هذا المجال</h3>
                <p className="text-xl text-accent-700/40 dark:text-white/30 mb-12 font-medium">نحن بصدد إطلاق المزيد من الابتكارات قريباً.</p>
                <Link href="/templates" className="px-12 py-5 bg-primary text-white rounded-2xl font-black shadow-glow hover:scale-105 transition-all uppercase tracking-widest inline-block">تصفح المتجر بالكامل</Link>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-24 flex justify-center">
                 <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl p-3 rounded-[2rem] shadow-soft flex items-center gap-4">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-12 h-12 rounded-xl text-sm font-black transition-all duration-500 ${currentPage === i + 1 ? 'bg-primary text-white shadow-glow scale-110' : 'text-accent-900/40 dark:text-white/20 hover:text-primary'}`}>{i + 1}</button>
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
