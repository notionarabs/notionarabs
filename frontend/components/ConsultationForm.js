'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Users, Zap, Layout } from 'lucide-react';

export default function ConsultationForm() {
  const arabOsUrl = "https://arab-os.com/consultation";

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 min-h-[70vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-xl text-primary font-black text-xs mb-10 border-none shadow-soft uppercase tracking-widest">
          <Zap size={14} />
          <span>خدماتنا الاحترافية انتقلت</span>
        </div>

        <h2 className="text-4xl md:text-7xl font-black mb-8 text-accent-900 dark:text-white leading-tight tracking-tighter">
          هل تبحث عن بناء <br /> نظام <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">نوشن</span> متكامل؟
        </h2>
        
        <p className="text-xl md:text-2xl text-accent-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
          نحن نوفر الآن جميع خدمات بناء مساحات العمل والأتمتة والتدريب المؤسسي عبر منصتنا المتخصصة بالخدمات الاحترافية <span className="font-black text-accent-900 dark:text-white underline decoration-primary/30">Arab-OS</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-right" dir="rtl">
          {[
            { title: "بناء مساحات العمل", icon: <Layout className="w-5 h-5" /> },
            { title: "الأتمتة والربط", icon: <Zap className="w-5 h-5" /> },
            { title: "التدريب المؤسسي", icon: <Users className="w-5 h-5" /> }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-white/50 dark:bg-white/5 backdrop-blur-xl border-none shadow-soft flex items-center gap-6 transition-all duration-500 hover:shadow-large hover:scale-105">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-soft">
                {item.icon}
              </div>
              <span className="font-black text-accent-900 dark:text-white text-lg">
                {item.title}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={arabOsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-primary text-white font-black text-xl shadow-glow hover:shadow-large hover:scale-105 transition-all duration-500 flex items-center justify-center gap-4 uppercase tracking-widest"
          >
            <Calendar size={24} />
            احجز استشارتك في Arab-OS
            <ExternalLink size={20} className="opacity-70" />
          </a>
          
          <button
            onClick={() => window.history.back()}
            className="px-10 py-5 text-accent-700 dark:text-white font-black text-lg bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-soft hover:shadow-large transition-all duration-500"
          >
            العودة للمجتمع
          </button>
        </div>
      </motion.div>
    </div>
  );
}
