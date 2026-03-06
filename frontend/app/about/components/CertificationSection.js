'use client';

export default function CertificationSection() {
    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="relative overflow-hidden rounded-3xl border border-gray-100 dark:border-dark-card-border bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary p-6 sm:p-8 md:p-10 lg:p-12">

                    {/* Background glow blobs */}
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary-100/60 dark:bg-orange-500/10 blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-gray-200/80 dark:bg-dark-tertiary/20 blur-3xl pointer-events-none"></div>

                    <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center">

                        {/* Left: Text Content */}
                        <div className="text-center lg:text-right order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-orange-500/10 rounded-full text-xs font-semibold text-primary-600 dark:text-orange-400 mb-4 border border-primary-200/60 dark:border-orange-400/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-orange-400 animate-pulse"></span>
                                شهادة معتمدة رسمياً
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 leading-tight">
                                فريق معتمد من Notion
                            </h2>
                            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0">
                                نحمل شهادة <span className="font-semibold text-accent-900 dark:text-white">Notion Service Specialist</span> الرسمية، وهي أعلى اعتماد يمنحه Notion للمتخصصين في بناء الأنظمة وتقديم الخدمات الاحترافية للمؤسسات.
                            </p>
                            <ul className="space-y-3 text-sm sm:text-base text-right">
                                {[
                                    'خبرة عملية موثّقة في تصميم أنظمة Notion المخصصة',
                                    'إلمام كامل بأفضل الممارسات والأتمتة المتقدمة',
                                    'شريك موثوق لبناء بيئات عمل احترافية للفرق والشركات',
                                ].map((point, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-orange-500/20 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-accent-600 dark:text-dark-text-secondary leading-relaxed">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right: Credly Verified Badge */}
                        <div className="flex flex-col items-center justify-center gap-4 order-1 lg:order-2">
                            <a
                                href="https://www.credly.com/badges/fcec3ae4-7ad5-41fb-9bea-336a1175108d"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center gap-3 cursor-pointer"
                                title="Verify Notion Service Specialist Certification on Credly"
                            >
                                {/* Badge image with glow */}
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-3xl bg-primary-200/40 dark:bg-orange-400/20 blur-2xl scale-125 transition-all duration-500 group-hover:scale-150 group-hover:bg-primary-300/50"></div>
                                    <img
                                        src="/Notion Service Specialist.png"
                                        alt="Notion Service Specialist Certification Badge"
                                        className="relative w-36 h-36 object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                {/* Badge metadata */}
                                <div className="text-center">
                                    <div className="text-sm font-bold text-accent-900 dark:text-white mb-0.5">Notion Service Specialist</div>
                                    <div className="text-xs text-accent-500 dark:text-dark-text-tertiary mb-3">Issued by Notion · Verified on Credly</div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-200 dark:border-orange-400/30 bg-primary-50 dark:bg-orange-500/10 text-xs font-semibold text-primary-600 dark:text-orange-400 group-hover:bg-primary-100 dark:group-hover:bg-orange-500/20 transition-colors duration-200">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Verify Credential ↗
                                    </span>
                                </div>
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
