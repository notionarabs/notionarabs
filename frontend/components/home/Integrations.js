'use client';

const integrations = [
  { name: 'Slack', logo: 'https://api.iconify.design/logos:slack-icon.svg', url: 'https://slack.com' },
  { name: 'Google Calendar', logo: 'https://api.iconify.design/logos:google-calendar.svg', url: 'https://calendar.google.com' },
  { name: 'Zapier', logo: 'https://api.iconify.design/logos:zapier-icon.svg', url: 'https://zapier.com' },
  { name: 'Notion', logo: 'https://svgl.app/library/notion.svg', url: 'https://notion.so' },
  { name: 'Make', logo: '/make-color.svg', url: 'https://make.com' },
  { name: 'n8n', logo: 'https://svgl.app/library/n8n.svg', url: 'https://n8n.io' },
  { name: 'Claude', logo: 'https://api.iconify.design/logos:claude-icon.svg', url: 'https://claude.ai' },
  { name: 'Trello', logo: 'https://api.iconify.design/logos:trello.svg', url: 'https://trello.com' },
  { name: 'Discord', logo: 'https://api.iconify.design/logos:discord-icon.svg', url: 'https://discord.com' }
];

export default function Integrations() {
  return (
    <section className="py-24 sm:py-32 bg-transparent overflow-hidden relative" data-reveal-section>
      {/* Background ambient blur */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-4">
              التكامل السلس
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 text-accent-900 dark:text-white leading-[1.3] sm:leading-[1.35]">
              <span className="block mb-1 sm:mb-2">أنظمة متكاملة مع</span>
              <span className="text-primary text-gradient inline-block py-1">أدواتك المفضلة</span>
            </h2>
            <p className="text-accent-700/60 dark:text-white/40 text-base sm:text-lg mb-8 leading-relaxed font-medium">
              لا يعمل نوشن بمعزل عن الآخرين. قوالبنا وأنظمتنا مصممة لتتصل بسلاسة مع الأدوات التي تستخدمها يومياً، مما يوفر عليك الوقت والجهد في نقل البيانات.
            </p>
            <ul className="space-y-4">
              {[
                'مزامنة تلقائية مع تقويم جوجل',
                'تنبيهات فورية على سلاك وديسكورد',
                'أتمتة المهام باستخدام Zapier و Make',
                'ربط قواعد البيانات بأدواتك الخارجية'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 justify-start text-accent-900 dark:text-white font-black text-base sm:text-lg transition-all hover:-translate-x-2 duration-300">
                  <div className="w-8 h-8 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2 relative w-full">
            <div className="grid grid-cols-3 gap-5">
              {integrations.map((item, i) => (
                <a 
                  key={i} 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/40 dark:bg-white/5 backdrop-blur-xl aspect-square rounded-[2rem] flex flex-col items-center justify-center p-6 shadow-soft hover:shadow-glow transition-all duration-500 hover:-translate-y-2 border border-black/5 dark:border-white/5 hover:border-primary/20 group cursor-pointer"
                >
                  <img 
                    src={item.logo} 
                    alt={item.name} 
                    className="w-12 h-12 object-contain opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                  />
                  <span className="text-[11px] font-black text-accent-900/40 dark:text-white/30 group-hover:text-primary transition-colors mt-3 tracking-wider">
                    {item.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
