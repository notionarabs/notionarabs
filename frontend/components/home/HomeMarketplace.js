'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { LayoutDashboard, Star, ArrowRight, Download, Award, Zap } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';

import FeaturedWidgets from '../../components/widgets/FeaturedWidgets';

export default function HomeMarketplace() {
  const sortBy = 'createdAt';
  const [allTemplates, setAllTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topCreators, setTopCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

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
  }, []);

  return (
    <section id="marketplace" className="py-32 bg-transparent relative overflow-hidden" dir="rtl">
      {/* Local Ambient Blurs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container-custom relative z-10">
        {/* Marketplace Section Header */}
        <div className="flex flex-col sm:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl sm:text-7xl font-black text-accent-500 dark:text-white mb-6 tracking-tighter leading-none">
              سوق <span className="text-primary">الأنظمة</span>
            </h2>
            <p className="text-xl text-accent-700/60 dark:text-white/40 font-black uppercase tracking-widest">
              نُخبة الإنتاجية العربية في متناول يدك
            </p>
          </div>
          <Link href="/templates" className="px-10 py-4 bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-2xl font-black text-accent-900 dark:text-white shadow-soft hover:shadow-large hover:scale-105 transition-all duration-500 uppercase tracking-widest border-none">
            استكشف المتجر بالكامل
          </Link>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-32">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white/50 dark:bg-white/5 rounded-[3.5rem] animate-pulse" />
            ))
          ) : (
            allTemplates.slice(0, 6).map((template, index) => (
              <Link key={template._id} href={`/templates/${template.slug || template._id}`} className="group h-full">
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[3.5rem] shadow-large group-hover:shadow-glow group-hover:-translate-y-4 transition-all duration-700 h-full flex flex-col border-none overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  <div className="relative aspect-[16/10] m-4 overflow-hidden rounded-[2.5rem] shadow-soft">
                    <Image
                      src={template.previewImage || '/placeholder-template.jpg'}
                      alt={template.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute top-6 left-6 z-20">
                      <div className="px-5 py-2.5 bg-black/40 backdrop-blur-xl rounded-2xl text-white font-black text-xs uppercase tracking-widest">
                        {template.isPaid ? `${template.price} ج.م` : 'مجاني'}
                      </div>
                    </div>
                  </div>

                  <div className="p-10 flex-1 flex flex-col relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <span className="px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                          {template.categories?.[0] || template.category || 'عام'}
                        </span>
                       <div className="flex items-center gap-2">
                         <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                         <span className="text-sm font-black text-accent-900 dark:text-white">{(template.rating || 5).toFixed(1)}</span>
                       </div>
                    </div>

                    <h4 className="text-2xl font-black text-accent-900 dark:text-white mb-4 group-hover:text-primary transition-colors tracking-tighter leading-tight">
                      {template.title}
                    </h4>
                    
                    <p className="text-base text-accent-700/60 dark:text-white/40 mb-8 line-clamp-2 leading-relaxed flex-1 font-medium italic">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between pt-8 border-t border-accent-900/5 dark:border-white/5">
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
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h3 className="text-4xl sm:text-6xl font-black text-accent-500 dark:text-white mb-6 tracking-tighter leading-none">
                نخبة <span className="text-primary">المبدعين</span>
              </h3>
              <p className="text-lg text-accent-700/60 dark:text-white/40 font-black uppercase tracking-widest">خلف كل نظام عظيم.. عقل مبدع</p>
            </div>
            <Link href="/creators" className="px-10 py-4 bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-2xl font-black text-accent-900 dark:text-white shadow-soft transition-all duration-500 uppercase tracking-widest">تصفح المبدعين</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {loadingCreators ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-64 rounded-[3.5rem] bg-white/50 dark:bg-white/5 animate-pulse shadow-soft" />)
            ) : (
              topCreators.slice(0, 4).map((cr, idx) => (
                <Link key={idx} href={`/creators/${cr.id}`} className="group">
                  <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[3.5rem] p-10 shadow-large group-hover:shadow-glow group-hover:-translate-y-4 transition-all duration-700 flex flex-col items-center text-center">
                    <div className="relative w-24 h-24 mb-8">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      <Image src={cr.profilePicture || '/default-avatar.png'} width={96} height={96} className="relative w-full h-full rounded-full object-cover shadow-soft group-hover:scale-110 transition-transform duration-700 border-none" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-glow rotate-12">
                         <Award size={20} />
                      </div>
                    </div>
                    <h4 className="text-2xl font-black text-accent-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">{cr.name}</h4>
                    <p className="text-[10px] font-black text-accent-900/40 dark:text-white/30 uppercase tracking-[0.2em] mt-3">{cr.templatesCount} مسار إنجاز</p>
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
