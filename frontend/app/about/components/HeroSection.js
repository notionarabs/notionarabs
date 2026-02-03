'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Target,
    Lightbulb,
    Trophy,
    Zap,
    MousePointer2
} from 'lucide-react';

const FloatingIcon = ({ Icon, delay, x, y, size = 48, color }) => (
    <motion.div
        className={`absolute ${color} bg-white dark:bg-dark-card-bg p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-card-border z-10 hidden lg:flex items-center justify-center`}
        initial={{ opacity: 0, x, y }}
        animate={{
            opacity: 1,
            y: [y - 10, y + 10, y - 10],
            rotate: [0, 5, -5, 0]
        }}
        transition={{
            opacity: { duration: 0.8, delay },
            y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay
            },
            rotate: {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay
            }
        }}
        style={{ width: size, height: size }}
    >
        <Icon size={size / 2} />
    </motion.div>
);

export default function HeroSection() {
    return (
        <section className="relative min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-80px)] flex items-center py-16 sm:py-20 lg:py-0 overflow-hidden bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-tertiary transition-colors duration-300">

            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent-200/20 rounded-full blur-3xl opacity-60" />
            </div>

            <div className="container-custom relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-right rtl:text-right"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 font-medium text-sm mb-6 border border-primary-100 dark:border-primary-900/20"
                        >
                            <Zap size={16} className="fill-current" />
                            <span>من نحن | عرب نوشن</span>
                        </motion.div>

                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-7xl font-semibold leading-tight mb-6 text-accent-700 dark:text-dark-text-primary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            أكثر من مجرد <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary-500 to-orange-600">
                                أداة لتنظيم المهام
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-lg sm:text-xl text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-8 max-w-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            نحن نبني نظام عمل متكامل يساعدك تبني عمليات واضحة، وتتعلم أسرع، وتكبر شغلك بثقة.
                            منصة تجمع الخدمات المخصصة، القوالب العملية، والمحتوى التطبيقي.
                        </motion.p>
                    </motion.div>

                    {/* Right Visuals (Floating Elements) */}
                    <div className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center">
                        {/* Main Centerpiece */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-orange-400 rounded-3xl rotate-3 opacity-20 blur-xl animate-pulse" />
                            <div className="absolute inset-0 bg-accent-500 dark:bg-dark-card-bg rounded-3xl shadow-2xl border border-white/10 dark:border-dark-card-border flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                                <div className="relative w-full h-full p-8 flex items-center justify-center">
                                    <Image
                                        src="/aboutHeroSection.svg"
                                        alt="Notion Arabs System"
                                        width={300}
                                        height={300}
                                        className="object-contain w-full h-full drop-shadow-xl"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Icons Orbiting */}
                        <FloatingIcon Icon={Target} delay={0.5} x={-180} y={-100} color="text-blue-500" size={80} />
                        <FloatingIcon Icon={Lightbulb} delay={0.7} x={180} y={-80} color="text-yellow-500" size={70} />
                        <FloatingIcon Icon={Trophy} delay={0.9} x={-160} y={120} color="text-purple-500" size={60} />
                        <FloatingIcon Icon={MousePointer2} delay={1.1} x={150} y={100} color="text-green-500" size={50} />

                    </div>
                </div>
            </div>
        </section>
    );
}
