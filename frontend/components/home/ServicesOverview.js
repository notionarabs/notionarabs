'use client';

import { services } from '../../lib/marketingContent';

export default function ServicesOverview() {
    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="grid gap-12 lg:grid-cols-[1fr_1fr] items-start">
                    <div className="order-1 lg:order-1 lg:sticky lg:top-24 self-start">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground dark:text-white mb-6 text-center lg:text-right leading-tight">
                            مميزات <span className="text-gradient">مجتمع عرب نوشن</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-foreground/70 dark:text-white/70 max-w-xl mx-auto lg:mx-0 text-center lg:text-right leading-relaxed font-medium">
                            نوفر لك البيئة المتكاملة لتطوير مهاراتك في نوشن، والوصول لأفضل القوالب والأدوات التي تساعدك في الإنتاجية.
                        </p>
                    </div>
                    <div className="order-2 lg:order-2">
                        <div className="space-y-6">
                            {services.map((service, idx) => (
                                <div key={idx} className="group card border-none p-6 sm:p-8 flex gap-6 items-start">
                                    <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <service.Icon className="w-7 h-7 text-primary fill-none" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-foreground dark:text-white mb-3">
                                            {service.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-foreground/60 dark:text-white/60 leading-relaxed font-medium">
                                            {service.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
