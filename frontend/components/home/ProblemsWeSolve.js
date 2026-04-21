'use client';

export default function ProblemsWeSolve() {
    const problems = [
        {
            title: 'صعوبة العثور على قوالب عربية',
            description: 'أغلب القوالب الاحترافية متوفرة باللغة الإنجليزية فقط، مما يجعلها صعبة الاستخدام للمستخدم العربي.',
            size: 'lg',
            tone: 'from-blue-50/80 to-blue-100/40 dark:from-blue-500/10 dark:to-blue-500/5',
            badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-200'
        },
        {
            title: 'ندرة المحتوى التعليمي المتقدم',
            description: 'يصعب العثور على شروحات متعمقة ومتقدمة لنوشن باللغة العربية بجودة عالية.',
            size: 'sm',
            tone: 'from-amber-50/80 to-orange-100/40 dark:from-orange-500/10 dark:to-orange-500/5',
            badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-200'
        },
        {
            title: 'تشتت المبدعين والصناع',
            description: 'لا توجد منصة موحدة تجمع المبدعين العرب لعرض أعمالهم وتبادل الخبرات.',
            size: 'md',
            tone: 'from-emerald-50/80 to-emerald-100/40 dark:from-emerald-500/10 dark:to-emerald-500/5',
            badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
        },
        {
            title: 'غياب الدعم الفني المتخصص',
            description: 'المستخدم العربي يحتاج لدعم يفهم احتياجاته الثقافية واللغوية في استخدام أدوات الإنتاجية.',
            size: 'lg',
            tone: 'from-purple-50/80 to-purple-100/40 dark:from-purple-500/10 dark:to-purple-500/5',
            badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-200'
        }
    ];

    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start">
                    <div className="text-center lg:text-right">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                            لماذا نحتاج لمجتمع نوشن عربي؟
                        </h2>
                        <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl mx-auto lg:mx-0">
                            جئنا لنحل فجوة المحتوى والأدوات في العالم العربي، ونوفر لك كل ما تحتاجه للتميز في استخدام نوشن.
                        </p>
                    </div>
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
                        {problems.map((item, idx) => {
                            const isLarge = item.size === 'lg';
                            const isSmall = item.size === 'sm';
                            return (
                                <div
                                    key={idx}
                                    className={`group card-interactive cursor-default mb-4 sm:mb-6 break-inside-avoid rounded-2xl border-none bg-gradient-to-br ${item.tone} ${isLarge ? 'p-6 sm:p-7' : isSmall ? 'p-5' : 'p-5 sm:p-6'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${item.badge}`}>
                                            التحدي {String(idx + 1).padStart(2, '0')}
                                        </div>
                                    </div>
                                    <h3 className={`${isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} font-semibold text-accent-900 dark:text-dark-text-primary mb-2`}>
                                        {item.title}
                                    </h3>
                                    <p className={`${isLarge ? 'text-sm sm:text-base' : 'text-sm'} text-accent-600 dark:text-dark-text-secondary leading-relaxed`}>
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
