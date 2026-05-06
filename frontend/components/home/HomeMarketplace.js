'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { LayoutDashboard, Star, ArrowRight, Download, Award, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';

import FeaturedWidgets from '../../components/widgets/FeaturedWidgets';

export default function HomeMarketplace({ initialStats }) {
  const sortBy = 'popular';
  const [allTemplates, setAllTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topCreators, setTopCreators] = useState(initialStats?.topCreators || []);
  const [loadingCreators, setLoadingCreators] = useState(!initialStats?.topCreators);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: '1', limit: '6', sortBy, sortOrder: 'desc' });
      const response = await api.get(`/templates?${params.toString()}`);
      if (response.data.success) {
        setAllTemplates(response.data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    
    // Only fetch creators if they weren't provided in initialStats
    if (!initialStats?.topCreators) {
      const fetchTopCreators = async () => {
        try {
          setLoadingCreators(true);
          const response = await api.get('/stats/homepage');
          if (response.data.success) {
            setTopCreators(response.data.topCreators || []);
          }
        } catch (error) {
          console.error('Error fetching creators:', error);
        } finally {
          setLoadingCreators(false);
        }
      };
      fetchTopCreators();
    }
  }, [initialStats]);

  return (
    <section id="marketplace" className="py-32 bg-transparent relative overflow-hidden" dir="rtl">
      {/* Local Ambient Blurs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container-custom relative z-10">
        {/* Marketplace Section Header */}
        <div className="flex flex-col sm:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl sm:text-7xl font-black text-accent-900 dark:text-white mb-6 tracking-tighter leading-none">
              الأنظمة <span className="text-primary text-gradient">الأكثر رواجاً</span>
            </h2>
            <p className="text-xl text-accent-700/60 dark:text-white/40 font-black uppercase tracking-widest">
              نُخبة الإنتاجية العربية الأكثر استخداماً
            </p>
          </div>
          <Link href="/templates" className="px-10 py-4 bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-2xl font-black text-accent-900 dark:text-white shadow-soft hover:shadow-large hover:scale-105 transition-all duration-500 uppercase tracking-widest border-none">
            استكشف المتجر بالكامل
          </Link>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-32">
          {loading ? (
              [...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] bg-white/50 dark:bg-white/5 rounded-[3.5rem] animate-pulse" />)
          ) : (
            allTemplates.slice(0, 6).map((template, index) => (
              <Link key={template._id} href={`/templates/${template.slug || template._id}`} className="group h-full">
                  <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[2rem] sm:rounded-[3.5rem] shadow-large group-hover:shadow-glow group-hover:-translate-y-4 transition-all duration-700 h-full flex flex-col border-none overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="relative aspect-[4/3] m-2 sm:m-4 overflow-hidden rounded-2xl sm:rounded-[2.5rem] shadow-soft">
                      <Image
                        src={template.previewImage || '/placeholder-template.jpg'}
                        alt={template.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                      />
                      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                        <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-black/40 backdrop-blur-xl rounded-xl sm:rounded-2xl text-white font-black text-[10px] sm:text-xs uppercase tracking-widest">
                          {template.isPaid ? `${template.price} ج.م` : 'مجاني'}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 flex-1 flex flex-col relative z-10">
                      <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-primary/10 rounded-full text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest">
                            {template.categories?.[0] || template.category || 'عام'}
                          </span>
                         <div className="flex items-center gap-1.5 sm:gap-2">
                           <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                           <span className="text-xs sm:text-sm font-black text-accent-900 dark:text-white">{(template.rating || 5).toFixed(1)}</span>
                         </div>
                      </div>

                      <h4 className="text-lg sm:text-2xl font-black text-accent-900 dark:text-white mb-auto group-hover:text-primary transition-colors tracking-tighter leading-tight line-clamp-1">
                        {template.title}
                      </h4>

                      <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-accent-900/5 dark:border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 relative">
                          {template.creator?.profilePicture && <Image src={template.creator.profilePicture} alt="" fill className="object-cover" />}
                        </div>
                        <span className="text-xs font-black text-accent-900/50 dark:text-white/30 uppercase tracking-widest">{template.creator?.name || 'مبدع مستقل'}</span>
                      </div>
                      <ArrowRight size={20} className="text-primary group-hover:translate-x-[-8px] transition-transform duration-500" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Featured Widgets with Glass Container */}
        <div className="mb-40">
           <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[4rem] p-12 sm:p-20 shadow-large relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[100px] -z-10" />
              <FeaturedWidgets />
           </div>
        </div>

        {/* Creators Spotlight */}
        <div className="mb-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h3 className="text-4xl sm:text-5xl font-black text-accent-900 dark:text-white mb-2 tracking-tight">
                المبدعون <span className="text-primary">المتميزون</span>
              </h3>
              <p className="text-base text-accent-700/60 dark:text-white/40 font-medium">تعرف على أفضل صانعي القوالب في مجتمعنا</p>
            </div>
            <Link href="/creators" className="group flex items-center gap-3 text-sm font-black text-accent-900 dark:text-white hover:text-primary transition-all duration-300">
              تصفح {initialStats?.stats?.creators?.toLocaleString() || '19,787'} مبدع 
              <div className="w-8 h-8 rounded-full bg-accent-900 dark:bg-white text-white dark:text-accent-900 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {loadingCreators ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-64 rounded-[3.5rem] bg-white/50 dark:bg-white/5 animate-pulse shadow-soft" />)
            ) : (
              topCreators.slice(0, 4).map((cr, idx) => (
                <Link key={idx} href={`/creators/${cr.username || cr.id}`} className="group h-full">
                  <div className="bg-white/30 dark:bg-white/5 backdrop-blur-[40px] rounded-[2.5rem] p-8 shadow-large group-hover:shadow-glow group-hover:-translate-y-2 transition-all duration-700 flex flex-col items-start text-right h-full border border-black/5 dark:border-white/5 relative overflow-hidden">
                    <div className="relative w-20 h-20 mb-6 flex-shrink-0">
                      <Image 
                        src={cr.profilePicture || '/default-avatar.png'} 
                        width={80} 
                        height={80} 
                        className="w-full h-full rounded-full object-cover shadow-soft group-hover:scale-110 transition-transform duration-700 border-none" 
                        alt={cr.name} 
                      />
                      {cr.badges?.some(b => b.type === 'verified') && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow border-2 border-white dark:border-[#0a0a0a]">
                           <CheckCircle size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    
                    <h4 className="text-xl font-black text-accent-900 dark:text-white group-hover:text-primary transition-colors tracking-tight mb-3">
                      {cr.name}
                    </h4>
                    
                    <p className="text-sm text-accent-700/60 dark:text-white/40 font-medium leading-relaxed mb-8 line-clamp-3 flex-1">
                      {cr.bio || cr.experience || 'مبدع مستقل يساهم في إثراء المحتوى العربي على نوشن.'}
                    </p>

                    <div className="pt-6 border-t border-accent-900/5 dark:border-white/5 w-full flex items-center justify-between">
                       <span className="text-[11px] font-black text-accent-900/40 dark:text-white/20 uppercase tracking-[0.2em]">
                         {cr.templatesCount} مسار إنجاز
                       </span>
                       <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                          <ArrowRight size={16} />
                       </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
