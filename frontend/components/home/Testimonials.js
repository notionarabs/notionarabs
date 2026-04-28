'use client';

import { Star, Quote } from 'lucide-react';

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
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-secondary-50 dark:bg-dark-secondary overflow-hidden relative" data-reveal-section>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground dark:text-white">
            قصص نجاح <span className="text-gradient">مجتمعنا</span>
          </h2>
          <p className="text-accent-600 dark:text-dark-text-secondary max-w-2xl mx-auto text-lg">
            انضم إلى آلاف المستخدمين الذين طوروا إنتاجيتهم باستخدام حلولنا المبتكرة في نوشن.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-dark-tertiary p-8 rounded-3xl shadow-xl dark:shadow-dark-medium border border-transparent hover:border-primary/20 transition-all duration-300 group relative"
            >
              <Quote size={24} className="absolute top-8 left-8 text-primary/10 group-hover:text-primary/20 transition-all" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-orange-400 text-orange-400" />
                ))}
              </div>
              
              <div className="relative mb-6">
                <p className="text-accent-800 dark:text-dark-text-primary text-lg leading-relaxed">
                  "{t.content}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-dark-primary p-1"
                />
                <div className="text-right">
                  <h4 className="font-bold text-foreground dark:text-white">{t.name}</h4>
                  <p className="text-sm text-accent-500 dark:text-dark-text-secondary">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
