'use client';

import { motion } from 'framer-motion';
import { Target, Lightbulb, TrendingUp, Users } from 'lucide-react';

const BentoCard = ({ children, className, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className={`bg-white dark:bg-dark-card-bg rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-dark-card-border overflow-hidden relative ${className}`}
    >
        {children}
    </motion.div>
);

export default function VisionMissionSection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-secondary transition-colors duration-300">
            <div className="container-custom">
                <div className="text-center mb-12 sm:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent-800 dark:text-white mb-4"
                    >
                        رؤيتنا ورسالتنا
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-accent-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        بوصلتنا التي توجهنا نحو بناء مستقبل أكثر إنتاجية وتنظيمًا للمحتوى العربي
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

                    {/* Unified Vision & Mission Card - Large */}
                    {/* Spans 2 cols and 2 rows to establish dominance */}
                    <BentoCard className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary-500 to-orange-600 text-white border-none flex flex-col justify-center">
                        <div className="relative z-10 flex flex-col gap-10">

                            {/* Vision Part */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold">الرؤية</h3>
                                </div>
                                <p className="text-lg sm:text-lg text-white/90 leading-relaxed font-medium">
                                    أن نصبح الوجهة العربية الأولى لكل ما يتعلق بنوشن —
                                    خدمات مخصصة، قوالب عالية الجودة، ومجتمع يتبادل الخبرات.
                                    نريد أن نكون الجسر بين الفكرة والتطبيق في بيئة منظمة.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-white/20"></div>

                            {/* Mission Part */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold">الرسالة</h3>
                                </div>
                                <p className="text-lg sm:text-lg text-white/90 leading-relaxed font-medium">
                                    نحوّل احتياجك إلى نظام عمل عملي ومفهوم باللغة العربية.
                                    نساعد الأفراد والفرق على بناء أنظمة نوشن فعّالة.
                                </p>
                            </div>

                        </div>

                        {/* Decoration */}
                        <Target className="absolute -top-10 -right-10 w-64 h-64 text-white/5 rotate-[-15deg]" />
                        <Lightbulb className="absolute -bottom-10 -left-10 w-64 h-64 text-white/5 rotate-12" />
                    </BentoCard>

                    {/* Stat Card 1 */}
                    <BentoCard delay={0.2} className="flex flex-col items-center justify-center text-center bg-white dark:bg-dark-card-bg md:h-auto min-h-[200px]">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h4 className="text-3xl sm:text-4xl font-bold text-accent-800 dark:text-white mb-2">+1000</h4>
                        <p className="text-accent-500 dark:text-gray-400">قالب تم تحميله</p>
                    </BentoCard>

                    {/* Stat Card 2 */}
                    <BentoCard delay={0.3} className="flex flex-col items-center justify-center text-center bg-secondary-50 dark:bg-dark-tertiary md:h-auto min-h-[200px]">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                            <Users className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h4 className="text-3xl sm:text-4xl font-bold text-accent-800 dark:text-white mb-2">مجتمع</h4>
                        <p className="text-accent-500 dark:text-gray-400">ينمو يومياً</p>
                    </BentoCard>

                </div>
            </div>
        </section>
    );
}
