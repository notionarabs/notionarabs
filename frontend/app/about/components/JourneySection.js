'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Rocket, Users, Globe, CheckCircle2 } from 'lucide-react';

const milestones = [
    {
        title: "البداية: مجتمع صغير",
        description: "بدأت عرب نوشن كمبادرة بسيطة ومجتمع صغير يؤمن بأن نوشن يحتاج مساحة عربية واضحة، تشرح أدواته وتسهل استخدامه.",
        Icon: Users
    },
    {
        title: "التطور: منصة متكاملة",
        description: "مع تزايد الحاجة، تحولنا من مجرد مجتمع إلى منصة توفر خدمات استشارية، وقوالب احترافية، تدعم الأفراد والشركات.",
        Icon: Globe
    },
    {
        title: "اليوم: نظام بيئي شامل",
        description: "نبني الآن نظامًا متكاملًا يجمع الخدمات، متجر القوالب، ودعم المبدعين في مكان واحد، لنكون المرجع الأول لنوشن عربيًا.",
        Icon: Rocket
    }
];

const TimelineStep = ({ step, index, isLast }) => {
    return (
        <div className="relative flex gap-6 sm:gap-10">
            {/* Timeline Line & Dot */}
            <div className="flex flex-col items-center shrink-0">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-dark-card-bg border-2 border-primary-500 z-10 flex items-center justify-center shadow-lg">
                    <step.Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                {!isLast && (
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 my-2 relative">
                        <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: '100%' }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute top-0 left-0 w-full bg-primary-500 origin-top"
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
                className="pb-12 pt-2"
            >
                <h3 className="text-2xl font-bold text-accent-800 dark:text-white mb-3">
                    {step.title}
                </h3>
                <p className="text-lg text-accent-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                    {step.description}
                </p>
            </motion.div>
        </div>
    );
};

export default function JourneySection() {
    const containerRef = useRef(null);

    return (
        <section ref={containerRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary overflow-hidden">
            <div className="container-custom max-w-5xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50/50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 font-medium text-sm mb-4"
                    >
                        <Rocket size={16} />
                        <span>رحلتنا</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent-800 dark:text-white mb-6"
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
                        قصة نمو دافعها الشغف بنشر ثقافة التنظيم والإنتاجية في العالم العربي.
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
