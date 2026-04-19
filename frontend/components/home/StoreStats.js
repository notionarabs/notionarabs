'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Crown, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import Counter from '../Counter';

export default function StoreStats() {
  const [stats, setStats] = useState({ templates: 0, creators: 0, specialties: 0, downloads: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await api.get('/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="relative z-10 w-full overflow-hidden pb-12 sm:pb-16 transition-colors duration-300">
      <div className="container-custom relative z-10 px-4 sm:px-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { label: 'القوالب', val: stats.templates, icon: LayoutDashboard, bgClass: 'bg-[#132859]/5 dark:bg-white/5', textClass: 'text-[#132859] dark:text-white', glowClass: 'bg-[#132859]/10', desc: 'قالب احترافي جاهز' },
            { label: 'المبدعون', val: stats.creators, icon: Crown, bgClass: 'bg-[#f5631e]/10 dark:bg-[#f5631e]/20', textClass: 'text-[#f5631e]', glowClass: 'bg-[#f5631e]/20', desc: 'مبدعين يشاركون الشغف' },
            { label: 'التحميلات', val: stats.downloads, icon: Zap, bgClass: 'bg-[#132859]/5 dark:bg-white/5', textClass: 'text-[#132859] dark:text-white', glowClass: 'bg-[#132859]/10', desc: 'عملية تحميل ناجحة' },
            { label: 'التخصصات', val: stats.specialties, icon: Star, bgClass: 'bg-[#f5631e]/10 dark:bg-[#f5631e]/20', textClass: 'text-[#f5631e]', glowClass: 'bg-[#f5631e]/20', desc: 'مجال وتصنيف متنوع' }
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative overflow-hidden rounded-[2.5rem] bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-2xl border border-black/5 dark:border-white/5 shadow-soft hover:shadow-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[160px] sm:min-h-[200px] group transition-all duration-500"
            >
              <div className={`absolute -right-8 -top-8 w-32 h-32 ${item.glowClass} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-2xl ${item.bgClass} shadow-sm border border-black/5 dark:border-white/5`}>
                    <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.textClass}`} strokeWidth={2.5} />
                  </div>
                  <span className={`text-[11px] sm:text-xs font-black ${item.textClass} uppercase tracking-widest`}>{item.label}</span>
                </div>

                <div className="text-4xl sm:text-5xl font-black text-[#132859] dark:text-white tracking-tighter mb-2">
                  {loadingStats ? (
                    <div className="h-10 sm:h-12 w-20 bg-black/5 dark:bg-white/5 rounded-lg animate-pulse" />
                  ) : (
                    <Counter end={item.val} duration={1500} separator="," />
                  )}
                </div>
              </div>

              <div className="relative z-10 text-[11px] sm:text-xs font-bold text-[#132859]/50 dark:text-gray-400 opacity-80 group-hover:text-[#f5631e] group-hover:opacity-100 transition-colors">
                {item.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
