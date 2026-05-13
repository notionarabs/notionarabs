'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FollowButton from '../../components/FollowButton';
import { Search, Star, User, CheckCircle, Heart, Crown, Award, Zap, ArrowRight, XCircle } from 'lucide-react';
import Footer from '../../components/Footer';
import { BreadcrumbWrapper } from '../../components/Breadcrumb';

const getBadgeIcon = (badgeType) => {
  const iconMap = {
    'verified': CheckCircle,
    'top-creator': Star,
    'best-creator': Crown,
    'active': Zap,
    'community-favorite': Heart,
    'trusted': Award
  };
  return iconMap[badgeType] || Star;
};

const sortOptions = [
  { name: "الأكثر شعبية", value: "popular" },
  { name: "الأحدث", value: "newest" },
  { name: "الأعلى تقييماً", value: "rating" },
  { name: "الأكثر قوالب", value: "templates" }
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

export default function CreatorsClient({ initialCreators, initialPagination }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [allCreators, setAllCreators] = useState(initialCreators || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(initialPagination || { current: 1, pages: 1, total: 0, limit: 12 });
  const sortButtonRef = useRef(null);
  const sortMenuRef = useRef(null);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pagination.current.toString(), limit: '50', sortBy, sortOrder: 'desc' });
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedSpecialty !== 'all') params.append('specialty', selectedSpecialty);

      const response = await api.get(`/creators?${params.toString()}`);
      if (response.data.success) {
        setAllCreators(response.data.creators);
        if (response.data.pagination) setPagination(p => ({ ...p, ...response.data.pagination }));
      }
    } catch (err) {
      setError('فشل في تحميل المبدعين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip first load if we have initial data
    if (initialCreators && initialCreators.length > 0 && pagination.current === initialPagination.current && !searchTerm && selectedSpecialty === 'all' && sortBy === 'popular') {
      return;
    }
    const timer = setTimeout(fetchCreators, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, sortBy, selectedSpecialty, pagination.current]);

  return (
    <main className="min-h-screen bg-transparent relative overflow-x-hidden transition-colors duration-300" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Breadcrumb Section */}
      <BreadcrumbWrapper items={[{ name: 'المبدعون', url: '/creators' }]} />

      {/* Premium Atmospheric Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 z-[20]">
        {/* mesh background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
        </div>

        <div className="container-custom relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-black text-accent-500 dark:text-white mb-6 tracking-tight leading-tight">
              نخبة <span className="text-primary drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">المبدعين</span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground/60 dark:text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              تعرف على نخبة مهندسي الإنتاجية في العالم العربي. عقول تبني مستقبلاً منظماً بأدوات الغد.
            </p>

            {/* Integrated Command Search & Sort */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                {/* Search Bar */}
                <div className="flex-1 relative group p-1 rounded-[2rem] bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-card-border shadow-2xl transition-all hover:border-primary/50 focus-within:border-primary">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن المبدع القادم..."
                    className="w-full bg-transparent border-none focus:ring-0 px-8 py-5 text-lg text-foreground dark:text-white placeholder:text-foreground/40 dark:placeholder:text-white/30"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
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

                {/* Sort Dropdown */}
                <div className="relative w-full sm:w-64 group p-1 rounded-[2rem] bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-card-border shadow-2xl transition-all z-[60]">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="w-full h-full px-8 py-5 flex items-center justify-between text-sm font-black text-foreground dark:text-white transition-all uppercase tracking-widest"
                  >
                    <span>{sortOptions.find(o => o.value === sortBy)?.name}</span>
                    <Zap size={18} className={`text-primary transition-transform duration-700 ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSortOpen && (
                    <div className="absolute top-full left-0 right-0 z-[100] mt-4 rounded-[2rem] bg-black/90 dark:bg-[#1a1a1a] backdrop-blur-xl border border-card-border shadow-large overflow-hidden animate-fade-in-up">
                      {sortOptions.map(opt => (
                        <button key={opt.value} onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }} className={`w-full text-right px-8 py-5 text-sm font-black transition-all ${sortBy === opt.value ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}>{opt.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Specialty Filter Pills */}
              <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto overflow-y-visible px-4 py-4 w-full no-scrollbar scroll-smooth">
                {['all', 'productivity', 'business', 'students', 'lifestyle', 'design'].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => { setSelectedSpecialty(spec); setPagination(p => ({ ...p, current: 1 })); }}
                    className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0 border-none ${selectedSpecialty === spec
                        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                        : 'bg-white/50 dark:bg-white/5 text-foreground/40 hover:bg-white/10'
                      }`}
                  >
                    {spec === 'all' ? 'الكل' : spec === 'productivity' ? 'إنتاجية' : spec === 'business' ? 'أعمال' : spec === 'students' ? 'طلاب' : spec === 'lifestyle' ? 'أسلوب حياة' : 'تصميم'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="py-24 relative z-10">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-[4/5] bg-white/50 dark:bg-white/5 rounded-[2.5rem] animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {allCreators.length > 0 ? (
                allCreators.map((creator, i) => (
                  <Link key={creator.id} href={`/creators/${creator.username || creator.id}`} className="group">
                    <div className="bg-white/30 dark:bg-white/5 backdrop-blur-[40px] rounded-[2.5rem] p-8 shadow-large group-hover:shadow-glow group-hover:-translate-y-2 transition-all duration-700 flex flex-col items-start text-right h-full border border-black/5 dark:border-white/5 relative overflow-hidden">
                      <div className="relative w-20 h-20 mb-6 flex-shrink-0">
                        {creator.profilePicture ? (
                          <Image src={creator.profilePicture} alt="" fill className="rounded-full object-cover shadow-soft border-none group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-3xl font-black text-primary shadow-soft">{(creator.displayName || creator.name || 'U')?.charAt(0)}</div>
                        )}
                        {creator.badges?.some(b => b.type === 'verified') && (
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow border-2 border-white dark:border-[#0a0a0a]">
                             <CheckCircle size={14} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-black text-accent-900 dark:text-white group-hover:text-primary transition-colors tracking-tight mb-3">
                        {creator.displayName || creator.name}
                      </h3>
                      
                      <p className="text-sm text-accent-700/60 dark:text-white/40 font-medium leading-relaxed mb-8 line-clamp-3 flex-1">
                        {creator.bio || creator.experience || 'مبدع مستقل يساهم في إثراء المحتوى العربي على نوشن.'}
                      </p>

                      <div className="pt-6 border-t border-accent-900/5 dark:border-white/5 w-full flex items-center justify-between">
                         <div className="flex gap-4">
                           <div className="flex flex-col">
                             <span className="text-sm font-black text-accent-900 dark:text-white">{creator.templatesCount || 0}</span>
                             <span className="text-[9px] font-black text-accent-900/30 dark:text-white/20 uppercase tracking-widest">نظام</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-sm font-black text-accent-900 dark:text-white">{creator.followersCount || 0}</span>
                             <span className="text-[9px] font-black text-accent-900/30 dark:text-white/20 uppercase tracking-widest">متابع</span>
                           </div>
                         </div>
                         <div className="w-10 h-10 rounded-xl bg-accent-900 dark:bg-white text-white dark:text-accent-900 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <ArrowRight size={18} />
                         </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-48 bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[4rem] text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Search className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-4xl font-black text-accent-500 dark:text-white mb-6 tracking-tighter">لم يتم العثور على مبدعين</h3>
                  <p className="text-xl text-accent-700/40 dark:text-white/30 max-w-xl mx-auto mb-12 font-medium">نحن بصدد استقطاب المزيد من المبدعين. حاول تغيير فلاتر البحث.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedSpecialty('all'); }}
                    className="px-12 py-5 bg-accent-900 dark:bg-white text-white dark:text-accent-900 font-black rounded-2xl shadow-glow uppercase tracking-widest text-xs"
                  >
                    إعادة ضبط البحث
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="mt-28 flex justify-center">
              <div className="flex items-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-2xl p-3 rounded-[2rem] shadow-soft">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPagination(p => ({ ...p, current: i + 1 }));
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className={`w-12 h-12 rounded-xl text-sm font-black transition-all ${pagination.current === i + 1
                        ? 'bg-primary text-white shadow-glow scale-110'
                        : 'text-foreground/40 dark:text-white/20 hover:text-primary'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-32 z-10 relative">
        <div className="container-custom">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[60px] rounded-[5rem] p-20 sm:p-32 shadow-large text-center relative overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 blur-[160px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black text-accent-500 dark:text-white mb-10 tracking-tighter leading-none">كُن أنت <br /><span className="inline-block text-primary text-gradient pt-2 pb-2 -mt-2 -mb-2">المِعمار الحالي</span></h2>
              <p className="text-xl sm:text-2xl text-accent-700/60 dark:text-white/40 mb-16 max-w-3xl mx-auto font-black uppercase tracking-widest">انضم إلى مجتمع صفوة المبدعين العرب وابدأ في بناء إرثك الرقمي.</p>
              <Link href="/signup" className="px-16 py-6 bg-primary text-white rounded-2xl font-black text-xl shadow-glow hover:scale-110 transition-all uppercase tracking-widest inline-block">انضم للمبدعين</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
