'use client';

import { services } from '../../lib/marketingContent';

export default function ServicesOverview() {
    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-black transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
                    <div className="order-1 lg:order-1 lg:sticky lg:top-24 self-start">
                        <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start"></div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 lg:mb-6 text-center lg:text-right">
                            مميزات مجتمع عرب نوشن
                        </h2>
                        <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl mx-auto lg:mx-0 text-center lg:text-right">
                            نوفر لك البيئة المتكاملة لتطوير مهاراتك في نوشن، والوصول لأفضل القوالب والأدوات التي تساعدك في الإنتاجية.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-3 justify-center lg:justify-start"></div>
                    </div>
                    <div className="order-2 lg:order-2">
                        <div className="space-y-4 sm:space-y-5">
                            {services.map((service, idx) => (
                                <div key={idx} className="group card-interactive cursor-default p-5 sm:p-6 h-full flex gap-4 sm:gap-5 items-start">
                                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-dark-tertiary flex items-center justify-center shadow-sm">
                                        <service.Icon className="w-6 h-6 text-primary-600 dark:text-orange-400 fill-none icon-draw icon-draw-hover" data-draw-icon />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                                            {service.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
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
