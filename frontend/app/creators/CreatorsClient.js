'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FollowButton from '../../components/FollowButton';
import { Search, Star, User, CheckCircle, Heart, Crown, Award, Zap } from 'lucide-react';
import Footer from '../../components/Footer';

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

export default function CreatorsClient() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [allCreators, setAllCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 12 });
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

      {/* Premium Atmospheric Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
        {/* mesh background */}
        <div className="absolute inset-0 pointer-events-none">
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
                <div className="relative w-full sm:w-64 group p-1 rounded-[2rem] bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-card-border shadow-2xl transition-all">
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)} 
                    className="w-full h-full px-8 py-5 flex items-center justify-between text-sm font-black text-foreground dark:text-white transition-all uppercase tracking-widest"
                  >
                    <span>{sortOptions.find(o => o.value === sortBy)?.name}</span>
                    <Zap size={18} className={`text-primary transition-transform duration-700 ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSortOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-4 rounded-[2rem] bg-black/90 dark:bg-[#1a1a1a] backdrop-blur-xl border border-card-border shadow-large overflow-hidden animate-fade-in-up">
                      {sortOptions.map(opt => (
                        <button key={opt.value} onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }} className={`w-full text-right px-8 py-5 text-sm font-black transition-all ${sortBy === opt.value ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}>{opt.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Specialty Filter Pills */}
              <div className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar pb-4">
                {['all', 'productivity', 'business', 'students', 'lifestyle', 'design'].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => { setSelectedSpecialty(spec); setPagination(p => ({ ...p, current: 1 })); }}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                      selectedSpecialty === spec 
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-white/50 dark:bg-white/5 rounded-[4rem] animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {allCreators.length > 0 ? (
                allCreators.map((creator, i) => (
                  <Link key={creator.id} href={`/creators/${creator.username || creator.id}`} className="group">
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[4rem] p-12 shadow-large group-hover:shadow-glow group-hover:-translate-y-4 transition-all duration-700 h-full flex flex-col border-none relative overflow-hidden text-center items-center">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl" />
                      <div className="relative w-32 h-32 mb-8">
                         <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                         {creator.profilePicture ? (
                           <Image src={creator.profilePicture} alt="" fill className="rounded-full object-cover shadow-large border-none group-hover:scale-110 transition-transform duration-700" />
                         ) : (
                           <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-4xl font-black text-primary shadow-soft">{(creator.displayName || creator.name)?.charAt(0)}</div>
                         )}
                         {creator.badges?.length > 0 && (
                           <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-glow rotate-12">
                             <Award size={24} />
                           </div>
                         )}
                      </div>

                      <h3 className="text-3xl font-black text-accent-500 dark:text-white mb-4 group-hover:text-primary transition-colors tracking-tighter">{creator.displayName || creator.name}</h3>
                      <div className="flex items-center gap-2 mb-6"><StarRating rating={creator.rating || 5} /></div>
                      <p className="text-base text-accent-700/60 dark:text-white/40 mb-10 line-clamp-2 leading-relaxed font-medium italic">{creator.bio || 'مبدع مستقل يساهم في إثراء المحتوى العربي على نوشن.'}</p>
                      
                      <div className="grid grid-cols-2 gap-8 w-full mb-12 border-y border-accent-900/5 dark:border-white/5 py-8">
                         <div>
                           <div className="text-2xl font-black text-accent-900 dark:text-white">{creator.templatesCount || creator.templates || 0}</div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-accent-900/30 dark:text-white/20">نظام</div>
                         </div>
                         <div>
                           <div className="text-2xl font-black text-accent-900 dark:text-white">{creator.followersCount || creator.followers || 0}</div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-accent-900/30 dark:text-white/20">متابع</div>
                         </div>
                      </div>

                      <div className="w-full flex flex-col gap-4">
                         <button className="w-full py-5 rounded-2xl bg-accent-900 dark:bg-white text-white dark:text-accent-900 font-black text-xs uppercase tracking-[0.2em] shadow-soft group-hover:shadow-large transition-all">الملف الشخصي</button>
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
