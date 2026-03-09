'use client';

import Link from 'next/link';

export default function Hero({ animationsPlayed }) {
    return (
        <section className="relative overflow-hidden bg-white dark:bg-dark-primary px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12 lg:py-14 xl:py-16 transition-colors duration-300 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-72px)] flex items-center">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                {/* Floating Notion-style Blocks */}
                <div className="hidden sm:block absolute top-20 left-10 w-16 h-16 bg-white/60 dark:bg-dark-tertiary/60 rounded-lg shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>
                <div className="hidden sm:block absolute top-40 right-20 w-12 h-12 bg-gray-100/70 dark:bg-dark-quaternary/70 rounded-md shadow-md dark:shadow-dark-soft floating-block-delayed notion-block-hover"></div>
                <div className="hidden md:block absolute bottom-32 left-1/4 w-20 h-20 bg-white/50 dark:bg-dark-tertiary/50 rounded-xl shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>
                <div className="hidden lg:block absolute top-1/3 right-1/3 w-14 h-14 bg-gray-50/80 dark:bg-dark-quaternary/80 rounded-lg shadow-md dark:shadow-dark-soft floating-block-delayed notion-block-hover"></div>
                <div className="hidden md:block absolute bottom-20 right-10 w-18 h-18 bg-white/40 dark:bg-dark-tertiary/40 rounded-2xl shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>

                {/* Gradient Orbs */}
                <div className="hidden sm:block absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-orange-100/30 to-amber-100/30 dark:from-orange-500/5 dark:to-orange-600/5 rounded-full blur-3xl motion-safe:animate-pulse"></div>
                <div className="hidden sm:block absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-gray-50/40 to-white/20 dark:from-dark-tertiary/10 dark:to-dark-primary/20 rounded-full blur-3xl motion-safe:animate-pulse"></div>

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.05]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            {/* Well-Separated Animated Template Squares */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                {/* Large Blue Template - Top Left */}
                <div className="hidden lg:block absolute top-16 left-16 w-32 h-32 bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-dark-large floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
                    <div className="p-6">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl mb-3 shadow-lg"></div>
                        <div className="w-16 h-2 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-2"></div>
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
                    </div>
                </div>

                {/* Medium Green Template - Top Right */}
                <div className="hidden lg:block absolute top-24 right-24 w-20 h-20 bg-white/70 dark:bg-dark-tertiary/70 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-dark-medium floating-block-delayed notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
                    <div className="p-4">
                        <div className="w-8 h-8 bg-green-500 rounded-lg mb-2 shadow-md"></div>
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
                    </div>
                </div>

                {/* Small Purple Template - Middle Left */}
                <div className="hidden md:block absolute top-1/2 left-8 w-16 h-16 bg-white/60 dark:bg-dark-tertiary/60 backdrop-blur-sm rounded-lg shadow-md dark:shadow-dark-soft floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
                    <div className="p-3">
                        <div className="w-6 h-6 bg-purple-500 rounded-md mb-1"></div>
                        <div className="w-8 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
                    </div>
                </div>

                {/* Extra Large Orange Template - Bottom Right */}
                <div className="hidden xl:block absolute bottom-16 right-16 w-36 h-36 bg-white/50 dark:bg-dark-tertiary/50 backdrop-blur-sm rounded-3xl shadow-2xl dark:shadow-dark-large floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
                    <div className="p-6">
                        <div className="w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-xl"></div>
                        <div className="w-20 h-2 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-2"></div>
                        <div className="w-16 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-1"></div>
                        <div className="w-12 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
                    </div>
                </div>

                {/* Medium Red Template - Bottom Left */}
                <div className="hidden lg:block absolute bottom-24 left-12 w-24 h-24 bg-white/65 dark:bg-dark-tertiary/65 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-dark-medium floating-block-delayed notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
                    <div className="p-4">
                        <div className="w-10 h-10 bg-red-500 rounded-lg mb-2 shadow-md"></div>
                        <div className="w-14 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-1"></div>
                        <div className="w-10 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
                    </div>
                </div>
            </div>

            <div className="container-custom relative z-10">
                {/* Hero Content */}
                <div className="text-center">
                    <div className="max-w-4xl mx-auto">
                        {/* Notion Service Specialist — Mini Floating Card */}
                        <div className={`flex justify-center mb-6 ${!animationsPlayed ? 'text-reveal' : ''}`}>
                            <a
                                href="https://www.credly.com/badges/fcec3ae4-7ad5-41fb-9bea-336a1175108d"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Verify Notion Service Specialist Certification on Credly"
                                className="group inline-flex items-center gap-3 bg-white/95 dark:bg-dark-tertiary/95 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-dark-card-border/60 shadow-xl dark:shadow-dark-large px-4 py-3 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
                            >
                                <img
                                    src="/brand/NotionLogo.png"
                                    alt="Notion"
                                    className="w-10 h-10 object-contain flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="w-px h-8 bg-gray-200 dark:bg-dark-card-border flex-shrink-0"></div>
                                <div className="text-right">
                                    <div className="text-xs font-semibold text-accent-900 dark:text-white leading-tight">
                                        شريك معتمد من نوشن
                                    </div>
                                    <div className="text-[11px] font-medium text-primary-500 dark:text-orange-400 mt-0.5 flex items-center gap-1 justify-end">
                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Verified by Notion
                                    </div>
                                </div>
                            </a>
                        </div>

                        {/* Main Heading */}
                        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-accent-900 dark:text-white mb-4 sm:mb-6 ${!animationsPlayed ? 'text-reveal-delayed' : ''} leading-tight tracking-tighter`}>
                            <div className="block">
                                <div className="block">خدمات نوشن</div>
                                <div className="block mt-2 md:mt-3 lg:mt-4"><span>وأنظمة مخصصة لأعمالك</span></div>
                            </div>
                        </h1>

                        {/* Enhanced Description with Better Typography */}
                        <p className={`text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto ${!animationsPlayed ? 'text-reveal-delayed-2' : ''} leading-relaxed px-2 sm:px-0 font-medium`}>
                            نبني لك أنظمة نوشن ذكية لإدارة العمل والمشاريع والمعرفة — من التخطيط إلى التنفيذ والأتمتة، بتصميم عربي واضح وتجربة سهلة.
                        </p>

                        {/* Enhanced CTA Buttons with Better Animations */}
                        <div className={`flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 ${!animationsPlayed ? 'text-reveal-delayed-3' : ''}`}>
                            <Link
                                href="/consultation"
                                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 dark:bg-orange-500 text-white rounded-xl hover:bg-primary-600 dark:hover:bg-orange-600 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                            >
                                اطلب خدمتك الآن
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link
                                href="/projects"
                                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/95 dark:bg-dark-tertiary/95 backdrop-blur-sm text-accent-700 dark:text-dark-text-primary rounded-xl border-2 border-primary-300 dark:border-orange-400/50 hover:bg-primary-50 dark:hover:bg-orange-900/20 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                            >
                                تصفح أعمالنا
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
