'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Puzzle, Users, GraduationCap, Zap, Trophy } from 'lucide-react';

const features = [
    {
        title: "حلول نوشن مخصصة",
        description: "نبني أنظمة عمل ولوحات تحكم تناسب الأفراد والفرق، مصممة خصيصاً لاحتياجاتك.",
        Icon: Settings
    },
    {
        title: "متجر قوالب عربي",
        description: "قوالب جاهزة وعملية تساعدك تبدأ بسرعة وتحقق نتائج واضحة دون تعقيد.",
        Icon: Puzzle
    },
    {
        title: "مجتمع المبدعين",
        description: "نُمكّن صُنّاع القوالب من البيع والانتشار والتعاون في بيئة داعمة.",
        Icon: Users
    },
    {
        title: "تعليم وتدريب عملي",
        description: "محتوى تطبيقي يقرّب نوشن لكل مستخدم بطريقة بسيطة ومباشرة.",
        Icon: GraduationCap
    },
    {
        title: "أتمتة وتكاملات",
        description: "نربط نوشن بالأدوات التي تعتمد عليها لتقليل التشتت وزيادة الإنتاجية.",
        Icon: Zap
    },
    {
        title: "جودة احترافية",
        description: "نلتزم بأعلى معايير التصميم والأداء في كل ما نقدمه.",
        Icon: Trophy
    }
];

const FeatureCard = ({ feature, mouseX, mouseY }) => {
    return (
        <div className="group relative border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-card-bg rounded-2xl p-6 h-full overflow-hidden">
            {/* Spotlight Effect Layer */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(249, 115, 22, 0.15),
              transparent 80%
            )
          `
                }}
            />
            {/* Border Highlight Layer */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(249, 115, 22, 0.4),
              transparent 40%
            )
          `,
                    zIndex: -1
                }}
            />

            <div className="relative h-full flex flex-col z-10">
                <div className="w-12 h-12 bg-primary-50 dark:bg-dark-tertiary rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-dark-card-hover transition-colors duration-300">
                    <feature.Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>

                <h3 className="text-xl font-bold text-accent-800 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {feature.title}
                </h3>

                <p className="text-accent-600 dark:text-gray-400 leading-relaxed group-hover:text-accent-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                </p>
            </div>
        </div>
    );
};

// Import needs to be inside or passed down because useMotionTemplate is a named import from framer-motion
// But I need to define local imports. 
// Wait, I used `useMotionTemplate` in the component but didn't import it.
// I must update the imports.

import { useMotionTemplate, useMotionValue } from 'framer-motion';

export default function SpotlightFeaturesSection() {
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-secondary overflow-hidden">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium text-sm mb-4"
                    >
                        <Trophy size={16} />
                        <span>لماذا نحن؟</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent-800 dark:text-white mb-4"
                    >
                        ما الذي يميز عرب نوشن؟
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-accent-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        نجمع بين الجودة العالية، الفهم العميق للمستخدم العربي، والتكنولوجيا المتقدمة.
                    </motion.p>
                </div>

                <div
                    className="group relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                    onMouseMove={handleMouseMove}
                >
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} mouseX={mouseX} mouseY={mouseY} />
                    ))}
                </div>
            </div>
        </section>
    );
}
