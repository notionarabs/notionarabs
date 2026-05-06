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
    <section className="py-20 bg-white dark:bg-dark-primary overflow-hidden" data-reveal-section>
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 text-right">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground dark:text-white leading-relaxed">
              <span className="inline-block py-2 px-1">أنظمة متكاملة مع</span> <span className="text-gradient inline-block py-2 px-2 mx-1">أدواتك المفضلة</span>
            </h2>
            <p className="text-accent-700 dark:text-dark-text-secondary text-lg mb-8 leading-relaxed">
              لا يعمل نوشن بمعزل عن الآخرين. قوالبنا وأنظمتنا مصممة لتتصل بسلاسة مع الأدوات التي تستخدمها يومياً، مما يوفر عليك الوقت والجهد في نقل البيانات.
            </p>
            <ul className="space-y-4">
              {[
                'مزامنة تلقائية مع تقويم جوجل',
                'تنبيهات فورية على سلاك وديسكورد',
                'أتمتة المهام باستخدام Zapier و Make',
                'ربط قواعد البيانات بأدواتك الخارجية'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 justify-start text-accent-900 dark:text-white font-black text-lg transition-all hover:translate-x-[-8px] duration-500">
                  <div className="w-8 h-8 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="grid grid-cols-3 gap-6">
              {integrations.map((item, i) => (
                <a 
                  key={i} 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary-50 dark:bg-dark-tertiary aspect-square rounded-3xl flex items-center justify-center p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-primary/10 group"
                >
                  <img 
                    src={item.logo} 
                    alt={item.name} 
                    className="w-16 h-16 object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                  />
                </a>
              ))}
            </div>
            
            {/* Background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
