'use client';

export default function CertificationSection() {
    return (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-transparent transition-colors duration-300 relative z-10 overflow-visible">
            <div className="container-custom">
                <div className="relative overflow-hidden rounded-[3rem] border-none bg-white/50 dark:bg-white/5 backdrop-blur-2xl shadow-large p-10 sm:p-20">

                    {/* Background glow blobs */}
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary-100/60 dark:bg-orange-500/10 blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-gray-200/80 dark:bg-dark-tertiary/20 blur-3xl pointer-events-none"></div>

                    <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center">

                        {/* Left: Text Content */}
                        <div className="text-center lg:text-right order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary/10 rounded-full text-xs font-black text-primary mb-8 border-none shadow-soft uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                اعتماد رسمي دولي
                            </div>
                            <h2 className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 leading-normal py-2">
                                كفاءة معتمدة <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">من Notion</span>
                            </h2>
                            <p className="text-xl text-accent-600 dark:text-gray-400 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-medium">
                                نحمل شهادة <span className="font-black text-accent-900 dark:text-white underline decoration-primary/30">Notion Service Specialist</span> الرسمية، كأحد المساهمين المعتمدين في مجتمع خبراء نوشن العالميين، مما يضمن أعلى معايير الجودة والاحترافية في كل قالب رقمي نقدمه.
                            </p>
                            <ul className="space-y-3 text-sm sm:text-base text-right">
                                {[
                                    'خبرة معتمدة في تصميم قوالب مساحات العمل المتقدمة',
                                    'إلمام كامل بأحدث تقنيات الأنظمة الذكية (Formulas 2.0)',
                                    'مرجع موثوق لبناء أنظمة إنتاجية تدعم نمو أعمالك',
                                ].map((point, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shadow-soft">
                                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-accent-600 dark:text-gray-400 font-bold text-lg">{point}</span>
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
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-[60px] scale-150 transition-all duration-700 group-hover:scale-200"></div>
                                    <img
                                        src="/brand/Notion Service Specialist.png"
                                        alt="Notion Service Specialist Certification Badge"
                                        className="relative w-48 h-48 object-contain drop-shadow-glow transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6"
                                    />
                                </div>
                                {/* Badge metadata */}
                                <div className="text-center">
                                    <div className="text-xl font-black text-accent-900 dark:text-white mb-2">Notion Service Specialist</div>
                                    <div className="text-sm text-accent-500 dark:text-gray-400 mb-8 font-medium">Issued by Notion · Verified on Credly</div>
                                    <span className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl text-primary font-black text-sm shadow-soft hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
