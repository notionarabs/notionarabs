'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Rocket, Users, Globe, CheckCircle2 } from 'lucide-react';

const milestones = [
    {
        title: "البداية: مجتمع صغير",
        description: "بدأت عرب نوشن كمبادرة بسيطة ومجتمع صغير يؤمن بأن نوشن يحتاج مساحة عربية واضحة، تشرح أدواته وتسهل استخدامه للأفراد.",
        Icon: Users
    },
    {
        title: "التطور: منصة ابتكار",
        description: "مع تزايد الحاجة، تحولنا إلى منصة رقمية توفر أرقى القوالب الاحترافية، وتدعم صناع المحتوى العربي لتمكين الأفراد والشركات من التنظيم الذكي.",
        Icon: Globe
    },
    {
        title: "اليوم: نظام بيئي شامل",
        description: "نبني الآن نظامًا متكاملًا يجمع بين متجر القوالب العالمي، ودعم المبدعين العرب، ومصادر التعلم في مكان واحد، لنكون المرجع الأول لنوشن في المنطقة.",
        Icon: Rocket
    }
];

const TimelineStep = ({ step, index, isLast }) => {
    return (
        <div className="relative flex gap-6 sm:gap-10">
            {/* Timeline Line & Dot */}
            <div className="flex flex-col items-center shrink-0">
                <div className="w-14 h-14 rounded-[1.25rem] bg-white/50 dark:bg-white/10 backdrop-blur-xl border-none z-10 flex items-center justify-center shadow-large">
                    <step.Icon className="w-7 h-7 text-primary" />
                </div>
                {!isLast && (
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 my-2 relative">
                        <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: '100%' }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary to-transparent origin-top opacity-50"
                        />
                    </div>
                )}
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="pb-16 pt-2"
            >
                <h3 className="text-3xl font-black text-accent-900 dark:text-white mb-4 tracking-tight">
                    {step.title}
                </h3>
                <p className="text-xl text-accent-600 dark:text-gray-400 leading-relaxed max-w-2xl font-medium">
                    {step.description}
                </p>
            </motion.div>
        </div>
    );
};

export default function JourneySection() {
    const containerRef = useRef(null);

    return (
        <section ref={containerRef} className="py-32 px-4 sm:px-6 lg:px-8 bg-transparent overflow-visible relative z-10">
            <div className="container-custom max-w-5xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-xl text-primary font-black text-xs mb-8 border-none shadow-soft uppercase tracking-widest"
                    >
                        <Rocket size={14} />
                        <span>رحلتنا</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 tracking-tighter leading-tight"
                    >
                        من فكرة إلى كيان
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-accent-600 dark:text-gray-400 max-w-3xl mx-auto"
                    >
                        قصة نمو دافعها الشغف بنشر ثقافة التنظيم والإنتاجية الرقمية في العالم العربي عبر نوشن.
                    </motion.p>
                </div>

                {/* Timeline */}
                <div className="relative px-4 sm:px-0">
                    {milestones.map((step, index) => (
                        <TimelineStep
                            key={index}
                            step={step}
                            index={index}
                            isLast={index === milestones.length - 1}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}
