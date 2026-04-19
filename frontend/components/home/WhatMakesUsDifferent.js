'use client';

export default function WhatMakesUsDifferent() {
    const items = [
        {
            title: 'إثراء المحتوى العربي',
            description: 'نلتزم بتوفير شروحات ومقالات متعمقة بلغة عربية بسيطة وسهلة الفهم.'
        },
        {
            title: 'قوالب احترافية معربة',
            description: 'جميع قوالبنا مصممة لتناسب اتجاه الكتابة وتنسيق البيانات في العالم العربي.'
        },
        {
            title: 'دعم مجتمعي حقيقي',
            description: 'مساحة تفاعلية للإجابة على تساؤلاتك ومساعدتك في تطوير أنظمتك الخاصة.'
        },
        {
            title: 'منصة للمبدعين العرب',
            description: 'ندعم صناع المحتوى في عرض قوالبهم والوصول لآلاف المهتمين في المنطقة.'
        },
        {
            title: 'تركيز على تجربة المستخدم',
            description: 'نحرص على أن تكون القوالب سهلة الاستخدام، منظمة، وجميلة بصرياً.'
        },
        {
            title: 'أكبر مرجع لنوشن بالعربية',
            description: 'نهدف لأن نكون الوجهة الأولى لكل من يسعى للإنتاجية باستخدام نوشن في عالمنا العربي.'
        }
    ];

    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                        ما الذي يميز عرب نوشن؟
                    </h2>
                    <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
                        نركز على الجودة، ونبني مجتمعاً قوياً يدعم كل مستخدم في رحلته مع نوشن.
                    </p>
                </div>
                <div className="space-y-6 sm:space-y-8">
                    {items.map((item, idx) => (
                        <div key={idx} className="group">
                            <div className={`flex flex-row items-stretch gap-3 sm:gap-6 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                                <div className="flex-1 lg:w-auto w-full">
                                    <div className="card-interactive h-full cursor-default p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-secondary">
                                        <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-fit">
                                    <div className="inline-flex w-fit h-full rounded-3xl border border-dashed border-primary-200/70 dark:border-orange-500/30 bg-gradient-to-br from-primary-50/70 via-white to-secondary-50/80 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary p-3 sm:p-8 flex items-center justify-center">
                                        <div className="w-fit text-3xl sm:text-5xl font-bold text-accent-500/60 dark:text-dark-text-tertiary">
                                            {String(idx + 1).padStart(2, '0')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
