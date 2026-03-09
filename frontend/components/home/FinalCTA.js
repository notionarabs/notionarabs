'use client';

import Link from 'next/link';

export default function FinalCTA() {
    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-dark-card-border bg-gradient-to-br from-primary-500 via-accent-500 to-accent-600 dark:from-orange-500/10 dark:to-orange-500/5 p-6 sm:p-8 md:p-10 lg:p-12">
                    <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 dark:bg-orange-500/10 blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full bg-black/10 blur-3xl"></div>
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                        backgroundSize: '22px 22px'
                    }}></div>
                    <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
                        <div className="text-center lg:text-right">
                            <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/80 dark:text-dark-text-tertiary mb-3">
                                الخطوة التالية
                            </p>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white dark:text-dark-text-primary mb-4">
                                جاهز لبناء نظام نوشن يواكب نموك؟
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl text-white/80 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
                                احجز استشارة أولية ودعنا نصمم لك نظامًا يسهّل العمل ويزيد الإنتاجية.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                                <Link href="/consultation" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
                                    احجز استشارتك
                                </Link>
                                <Link href="/store" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/90 dark:bg-dark-tertiary/90 border-white/30 w-full sm:w-auto text-center">
                                    استكشف المتجر
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {[
                                { label: 'مدة البداية', value: 'أربعة أسابيع' },
                                { label: 'جلسة اكتشاف', value: '15 دقيقة' },
                                { label: 'خطة تنفيذ', value: 'واضحة' },
                                { label: 'دعم مستمر', value: 'مباشر' }
                            ].map((item, idx) => (
                                <div key={idx} className="rounded-2xl border border-white/25 dark:border-dark-card-border/30 bg-white/10 dark:bg-white/5 p-4 text-center">
                                    <div className="text-base sm:text-lg font-semibold text-white dark:text-dark-text-primary">{item.value}</div>
                                    <div className="text-xs sm:text-sm text-white/80 dark:text-dark-text-secondary mt-1">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
