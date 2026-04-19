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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-8 font-semibold text-sm">
          <Zap size={16} />
          <span>خدماتنا الاحترافية انتقلت</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-accent-800 dark:text-white leading-tight">
          هل تبحث عن بناء نظام <span className="text-primary-500">نوشن</span> متكامل؟
        </h2>
        
        <p className="text-lg md:text-xl text-accent-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          نحن نوفر الآن جميع خدمات بناء مساحات العمل والأتمتة والتدريب المؤسسي عبر منصتنا المتخصصة بالخدمات الاحترافية <span className="font-bold text-accent-800 dark:text-white">Arab-OS</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-right" dir="rtl">
          {[
            { title: "بناء مساحات العمل", icon: <Layout className="w-5 h-5" /> },
            { title: "الأتمتة والربط", icon: <Zap className="w-5 h-5" /> },
            { title: "التدريب المؤسسي", icon: <Users className="w-5 h-5" /> }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-tertiary flex items-center justify-center text-primary-500">
                {item.icon}
              </div>
              <span className="font-bold text-accent-800 dark:text-white text-sm">
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
            className="btn-primary py-4 px-10 rounded-2xl flex items-center gap-3 text-lg font-bold shadow-xl hover:shadow-primary-500/20 transition-all hover:-translate-y-1 w-full sm:w-auto"
          >
            <Calendar size={22} />
            احجز استشارتك في Arab-OS
            <ExternalLink size={18} className="opacity-70" />
          </a>
          
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 text-accent-500 hover:text-accent-800 dark:text-gray-400 dark:hover:text-white transition-colors font-medium border border-transparent hover:border-gray-200 dark:hover:border-dark-card-border rounded-2xl"
          >
            العودة للمجتمع
          </button>
        </div>
      </motion.div>
    </div>
  );
}
