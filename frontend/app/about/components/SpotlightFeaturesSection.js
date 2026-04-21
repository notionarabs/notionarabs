'use client';

import { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Settings, Puzzle, Users, GraduationCap, Zap, Trophy } from 'lucide-react';

const features = [
    {
        title: "أنظمة نوشن متكاملة",
        description: "قوالب مصممة كأنظمة حياة وأعمال متكاملة، تمنحك لوحات تحكم ذكية للسيطرة على مشاريعك وإنجازاتك.",
        Icon: Settings
    },
    {
        title: "أكبر متجر قوالب عربي",
        description: "مجموعة ضخمة من القوالب الجاهزة والعملية التي تساعدك على البدء فوراً بضغطة زر واحدة.",
        Icon: Puzzle
    },
    {
        title: "مجتمع صُنّاع القوالب",
        description: "نُمكّن المبدعين من مشاركة وبيع قوالبهم المبتكرة والوصول إلى قاعدة جمهور عربية واسعة.",
        Icon: Users
    },
    {
        title: "مصادر تعليمية متخصصة",
        description: "دروس ومحتوى تطبيقي يجعل احتراف نوشن أمراً بسيطاً، مع شروحات عربية واضحة لكل ميزة.",
        Icon: GraduationCap
    },
    {
        title: "هيكلة فائقة الذكاء",
        description: "قوالبنا مبنية بأحدث تقنيات نوشن البرمجية (Databases, Formulas 2.0) لضمان أقصى كفاءة ممكنة.",
        Icon: Zap
    },
    {
        title: "معايير جودة عالمية",
        description: "نلتزم بأعلى معايير التصميم والأداء لضمان تجربة مستخدم سلسة واحترافية في كل قالب.",
        Icon: Trophy
    }
];

const FeatureCard = ({ feature, mouseX, mouseY }) => {
    return (
        <div className="group relative bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[1.5rem] p-10 h-full overflow-hidden border-none shadow-soft hover:shadow-large transition-all duration-500">
            {/* Spotlight Effect Layer - Soft Glass Glow */}
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
            {/* Subtler Border Glow */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-[1.5rem] opacity-0 transition duration-300 group-hover:opacity-50"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(249, 115, 22, 0.2),
              transparent 40%
            )
          `
                }}
            />

            <div className="relative h-full flex flex-col z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 shadow-soft">
                    <feature.Icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-2xl font-black text-accent-900 dark:text-white mb-4 group-hover:text-primary transition-colors duration-300 tracking-tight">
                    {feature.title}
                </h3>

                <p className="text-lg text-accent-600 dark:text-gray-400 leading-relaxed group-hover:text-accent-800 dark:group-hover:text-gray-300 transition-colors duration-300 font-medium">
                    {feature.description}
                </p>
            </div>
        </div>
    );
};

export default function SpotlightFeaturesSection() {
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-transparent overflow-visible relative z-10">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-xl text-primary font-black text-xs mb-8 border-none shadow-soft uppercase tracking-widest"
                    >
                        <Trophy size={14} />
                        <span>من نحن؟</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 tracking-tighter leading-tight"
                    >
                        ما الذي يميز عرب نوشن؟
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-accent-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
                    >
                        نحن لا نبيع مجرد صفحات، بل نقدم أنظمة إنتاجية متكاملة مصممة بعناية لتناسب الروح والاحتياجات العربية.
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
