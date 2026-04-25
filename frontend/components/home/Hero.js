'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Crown, Zap, Award } from 'lucide-react';
import api from '../../lib/api';
import Counter from '../Counter';

export default function Hero({ animationsPlayed }) {
    const [stats, setStats] = useState({ templates: 0, creators: 0, specialties: 0, downloads: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const response = await api.get('/stats/homepage');
                if (response.data.success) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);
    return (
        <section className="relative overflow-hidden bg-white dark:bg-dark-primary px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12 lg:py-14 xl:py-16 transition-colors duration-300 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-72px)] flex items-center">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                {/* Floating Notion-style Blocks */}
                <div className="hidden sm:block absolute top-10 left-[5%] w-16 h-16 bg-accent-500/5 dark:bg-white/5 rounded-2xl border-none floating-block notion-block-hover shadow-2xl opacity-40"></div>
                <div className="hidden sm:block absolute top-60 right-[8%] w-12 h-12 bg-accent-500/5 dark:bg-white/5 rounded-xl border-none floating-block-delayed notion-block-hover shadow-xl opacity-30"></div>
                <div className="hidden md:block absolute bottom-20 left-[15%] w-20 h-20 bg-accent-500/5 dark:bg-white/5 rounded-[2rem] border-none floating-block notion-block-hover shadow-2xl opacity-40"></div>
                <div className="hidden lg:block absolute top-1/2 right-[5%] w-14 h-14 bg-accent-500/5 dark:bg-white/5 rounded-2xl border-none floating-block-delayed notion-block-hover shadow-xl opacity-30"></div>
                <div className="hidden md:block absolute bottom-10 right-[20%] w-18 h-18 bg-accent-500/5 dark:bg-white/5 rounded-[2.5rem] border-none floating-block notion-block-hover shadow-2xl opacity-40"></div>

                {/* Gradient Orbs */}
                <div className="hidden sm:block absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-orange-100/30 to-amber-100/30 dark:from-orange-500/5 dark:to-orange-600/5 rounded-full blur-3xl motion-safe:animate-pulse"></div>
                <div className="hidden sm:block absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-gray-50/40 to-white/20 dark:from-dark-tertiary/10 dark:to-dark-primary/20 rounded-full blur-3xl motion-safe:animate-pulse"></div>

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.05]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }}></div>
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
                                className="group inline-flex items-center gap-3 bg-white/95 dark:bg-dark-tertiary/95 backdrop-blur-sm rounded-2xl border-none shadow-xl dark:shadow-dark-large px-4 py-3 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
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
                        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground dark:text-white mb-4 sm:mb-6 ${!animationsPlayed ? 'text-reveal-delayed' : ''} leading-tight tracking-tighter overflow-visible`}>
                            <div className="block pt-[0.2em] pb-[0.2rem]">
                                <div className="block"><span className="inline-block pt-2 pb-2 -mt-2 -mb-2">مجتمع نوشن العربي</span></div>
                                <div className="block mt-2 md:mt-3 lg:mt-4"><span className="inline-block text-gradient pt-2 pb-2 -mt-2 -mb-2">المجتمع الأول للمبدعين والخبراء</span></div>
                            </div>
                        </h1>

                        {/* Enhanced Description with Better Typography */}
                        <p className={`text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto ${!animationsPlayed ? 'text-reveal-delayed-2' : ''} leading-relaxed px-2 sm:px-0 font-medium`}>
                            اكتشف أقوى القوالب، تعلم من الخبراء، وشارك أعمالك مع آلاف المستخدمين العرب في مكان واحد. نحن هنا لتمكينك من استغلال نوشن بأفضل شكل.
                        </p>

                        {/* Enhanced CTA Buttons with Better Animations */}
                        <div className={`flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-8 sm:mb-10 ${!animationsPlayed ? 'text-reveal-delayed-3' : ''}`}>
                            <Link
                                href="/templates"
                                className="btn-primary min-w-[200px] text-lg py-4 shadow-[0_0_20px_rgba(245,99,30,0.15)] hover:shadow-[0_0_30px_rgba(245,99,30,0.3)] flex items-center justify-center gap-3 group"
                            >
                                استكشف القوالب
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link
                                href="/creators"
                                className="btn-secondary min-w-[200px] text-lg py-4"
                            >
                                منصة المبدعين
                            </Link>
                        </div>

                        {/* Integrated Horizontal Statistics */}
                        <div className={`mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-6 sm:gap-12 md:gap-16 lg:gap-20 ${!animationsPlayed ? 'text-reveal-delayed-4' : ''}`}>
                            {[
                                { label: 'قالب إبداعي', val: stats.templates, icon: LayoutDashboard },
                                { label: 'مبدع خبير', val: stats.creators, icon: Crown },
                                { label: 'تحميل ناجح', val: stats.downloads, icon: Zap },
                                { label: 'تخصص إبداعي', val: stats.specialties, icon: Award }
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center sm:items-start group">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="text-primary/60 group-hover:text-primary transition-colors">
                                            <stat.icon size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-black text-foreground dark:text-white flex items-center tabular-nums">
                                            {loadingStats ? (
                                                <div className="h-8 w-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                                            ) : (
                                                <><Counter end={stat.val} duration={1500} />+</>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-black text-foreground/40 dark:text-white/30 uppercase tracking-[0.2em] group-hover:text-foreground/60 dark:group-hover:text-white/50 transition-colors">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
