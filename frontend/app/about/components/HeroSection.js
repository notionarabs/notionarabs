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
        className={`absolute ${color} bg-white/50 dark:bg-white/10 backdrop-blur-xl p-4 rounded-3xl shadow-large border-none z-10 hidden lg:flex items-center justify-center`}
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
        <section className="relative min-h-[calc(100vh-80px)] flex items-center py-20 lg:py-0 overflow-hidden bg-transparent transition-colors duration-300">

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
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-xl text-primary font-black text-xs mb-10 border-none shadow-soft uppercase tracking-widest"
                        >
                            <Zap size={14} className="fill-current" />
                            <span>عرب نوشن | المجتمع الإقليمي الأول</span>
                        </motion.div>

                        <motion.h1
                            className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-10 text-accent-500 dark:text-white leading-[1.2] overflow-visible"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            مجتمعك لتصميم <br />
                            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-l from-primary to-orange-600 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)] pt-4 pb-4 px-2 -mt-4 -mb-4">
                                يومك الأمثل
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-lg sm:text-xl text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-10 max-w-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            عرب نوشن (Notion Arabs) هي الوجهة والمجتمع الإقليمي الأول المتخصص في تمكين المبدعين والشركات من المحيط إلى الخليج. نحن نقدم أرقى الحلول الرقمية، القوالب الاحترافية، والخبرات التقنية التي تساعدك على تحويل نوشن إلى محرك متكامل للإنتاجية والنمو في العالم العربي.
                        </motion.p>
                    </motion.div>

                    {/* Right Visuals (Floating Elements) */}
                    <div className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-0 w-80 h-80 lg:w-[500px] lg:h-[500px]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-orange-400 rounded-[3rem] rotate-3 opacity-20 blur-[80px] animate-pulse" />
                            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-[40px] rounded-[4rem] shadow-large flex items-center justify-center overflow-hidden border border-white/5">
                                <Image
                                    src="/images/aboutHeroSection.svg"
                                    alt="About Arab Notion"
                                    width={400}
                                    height={400}
                                    className="w-64 lg:w-96 transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                        </motion.div>

                        <FloatingIcon Icon={Target} delay={0.5} x={-180} y={-150} color="text-orange-500" />
                        <FloatingIcon Icon={Lightbulb} delay={0.7} x={150} y={-100} color="text-yellow-500" />
                        <FloatingIcon Icon={Trophy} delay={0.9} x={-100} y={150} color="text-amber-500" />
                        <FloatingIcon Icon={Zap} delay={1.1} x={180} y={120} color="text-primary" />
                    </div>
                </div>
            </div>
        </section>
    );
}
