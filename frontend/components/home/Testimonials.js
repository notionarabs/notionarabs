'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import { Star, Quote, ChevronLeft } from 'lucide-react';

const testimonials = [
  {
    name: 'أحمد محمود',
    role: 'رائد أعمال',
    content: 'عرب نوشن غير طريقتي في إدارة مشاريعي تماماً. القوالب احترافية جداً ومناسبة للغة العربية بشكل مثالي.',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Felix',
    rating: 5
  },
  {
    name: 'سارة خالد',
    role: 'مديرة محتوى',
    content: 'أفضل مجتمع عربي لنوشن. الدعم الفني والخبرة التي يشاركونها لا تقدر بثمن. فخورة بكوني جزءاً من هذا المجتمع.',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Sara',
    rating: 5
  },
  {
    name: 'ياسين علي',
    role: 'مصمم مستقل',
    content: 'قوالب عرب نوشن ساعدتني في تنظيم مهامي اليومية وزيادة إنتاجيتي بنسبة 200%. أنصح بها لكل مستقل.',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Jack',
    rating: 5
  },
  {
    name: 'نور أحمد',
    role: 'طالبة جامعية',
    content: 'ساعدتني القوالب الدراسية في تنظيم محاضراتي ومواعيد الامتحانات بشكل لم أكن أتخيله.',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Nour',
    rating: 5
  },
  {
    name: 'عمر ياسر',
    role: 'مدير مشاريع',
    content: 'نظام إدارة المشاريع هنا يفوق الوصف. التفاصيل والترجمة العربية المتقنة تجعل العمل متعة.',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Omar',
    rating: 5
  }
];

export default function Testimonials() {
  const [liveReviews, setLiveReviews] = useState([]);

  useEffect(() => {
    async function fetchLiveReviews() {
      try {
        const res = await api.get('/ratings/platform/platform');
        if (res.data?.success) {
          // Filter only high quality reviews (4-5 stars) to display on the landing page
          const filtered = (res.data.ratings || []).filter(r => r.rating >= 4);
          setLiveReviews(filtered);
        }
      } catch (err) {
        console.error('Error fetching live home testimonials:', err);
      }
    }
    fetchLiveReviews();
  }, []);

  const combinedTestimonials = [
    ...liveReviews.map(r => ({
      name: r.user?.displayName || r.user?.name || 'مستخدم عرب نوشن',
      role: r.user?.role === 'admin' 
        ? 'مشرف المنصة' 
        : r.user?.role === 'creator' 
          ? 'مبدع مستقل' 
          : 'عضو المجتمع',
      content: r.review,
      avatar: r.user?.profilePicture || `https://api.dicebear.com/9.x/lorelei/svg?seed=${r.id || r._id || 'user'}`,
      rating: r.rating
    })),
    ...testimonials
  ];

  return (
    <section className="py-24 sm:py-32 bg-transparent overflow-hidden relative" data-reveal-section>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-4">
            آراء المجتمع
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 text-accent-900 dark:text-white tracking-tight">
            قصص نجاح <span className="text-primary text-gradient">مجتمعنا</span>
          </h2>
          <p className="text-accent-700/60 dark:text-white/40 max-w-2xl mx-auto text-base sm:text-lg font-medium">
            انضم إلى مجتمعنا من المستخدمين الذين طوروا إنتاجيتهم باستخدام حلولنا المبتكرة في نوشن.
          </p>
        </div>

        {/* Infinite Marquee Wrapper */}
        <div className="relative flex overflow-hidden py-6 mask-fade-edges mt-4" dir="ltr">
          <div className="flex gap-8 whitespace-nowrap animate-marquee hover:pause">
            {/* Triple the items to create a seamless loop */}
            {[...combinedTestimonials, ...combinedTestimonials, ...combinedTestimonials].map((t, i) => (
              <div 
                key={i} 
                className="inline-block w-[340px] sm:w-[420px] bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 hover:border-primary/20 hover:shadow-glow transition-all duration-500 group relative whitespace-normal flex-shrink-0"
                dir="rtl"
              >
                <Quote size={28} className="absolute top-8 left-8 text-primary/10 group-hover:text-primary/20 transition-all" />
                
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <div className="relative mb-6">
                  <p className="text-accent-900/80 dark:text-white/80 text-base sm:text-lg leading-relaxed font-medium line-clamp-3">
                    "{t.content}"
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-accent-900/5 dark:border-white/5">
                  <img 
                    src={t.avatar} 
                    alt={t.name} 
                    className="w-11 h-11 rounded-full bg-white/20 dark:bg-white/10 object-cover shadow-soft border border-white/10" 
                  />
                  <div className="text-right">
                    <h4 className="font-black text-sm text-accent-900 dark:text-white">{t.name}</h4>
                    <p className="text-xs text-accent-700/60 dark:text-white/40 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Testimonials CTA */}
        <div className="text-center mt-12 relative z-20">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/50 dark:bg-white/5 backdrop-blur-2xl text-accent-900 dark:text-white font-black rounded-2xl shadow-soft hover:shadow-large hover:scale-105 transition-all text-xs uppercase tracking-wider border border-black/5 dark:border-white/5 group cursor-pointer"
          >
            <span>اقرأ جميع قصص النجاح والآراء</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .animate-marquee {
          display: flex;
          animation: marquee 120s linear infinite;
          width: fit-content;
        }
        .pause:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}
