'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShieldCheck, Users, Zap, Globe } from 'lucide-react';

const values = [
    {
        id: 1,
        title: "المجتمع أولاً",
        description: "كل ما نبنيه يبدأ وينتهي بالمجتمع. نؤمن بقوة المشاركة والنمو الجماعي.",
        Icon: Users,
        image: "bg-blue-500", // Fallback color/gradient if no image
        imageGradient: "from-blue-600/90 to-blue-800/90"
    },
    {
        id: 2,
        title: "الجودة قبل الكمية",
        description: "لا ننشر أي محتوى أو قالب إلا إذا كنا فخورين باستخدامه بأنفسنا.",
        Icon: ShieldCheck,
        image: "bg-emerald-500",
        imageGradient: "from-emerald-600/90 to-emerald-800/90"
    },
    {
        id: 3,
        title: "التعلم المستمر",
        description: "نوشن يتطور، ونحن نتطور معه. نبقي عقولنا منفتحة لكل جديد ومبتكر.",
        Icon: Zap,
        image: "bg-purple-500",
        imageGradient: "from-purple-600/90 to-purple-800/90"
    },
    {
        id: 4,
        title: "بساطة معقدة",
        description: "نجعل أعقد الأنظمة تبدو بسيطة وسهلة الاستخدام، وهذا هو سر الإتقان.",
        Icon: Heart,
        image: "bg-orange-500",
        imageGradient: "from-orange-600/90 to-orange-800/90"
    },
    {
        id: 5,
        title: "تأثير عالمي",
        description: "جذورنا عربية، لكن طموحنا ومعاييرنا عالمية تنافس الأفضل.",
        Icon: Globe,
        image: "bg-cyan-500",
        imageGradient: "from-cyan-600/90 to-cyan-800/90"
    }
];

const AccordionItem = ({ value, isOpen, onClick }) => {
    return (
        <motion.div
            layout
            onClick={onClick}
            className={`relative rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 ease-out border-none shadow-soft hover:shadow-large
                ${isOpen ? 'h-[450px] sm:h-[400px] flex-[4]' : 'h-24 sm:h-[400px] flex-[0.8] hover:flex-[1]'}
            `}
        >
            {/* High-Fidelity Glass Background */}
            <div className={`absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-2xl transition-all duration-700 ${isOpen ? 'opacity-100' : 'opacity-80'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${value.imageGradient} opacity-20`}></div>
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            </div>

            <div className={`absolute inset-0 p-6 flex flex-col ${isOpen ? 'justify-end' : 'justify-center sm:justify-end'}`}>
                <motion.div layout className="relative z-10 w-full">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-4 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-xl text-primary shrink-0 shadow-soft transition-all duration-500 ${isOpen ? 'w-16 h-16 mb-4' : 'hidden sm:block w-12 h-12'}`}>
                            <value.Icon className="w-full h-full" />
                        </div>
                        {/* Show title always on mobile if isOpen, or if closed on desktop */}
                        <motion.h3
                            layout="position"
                            className={`text-accent-900 dark:text-white font-black leading-tight tracking-tight underline decoration-primary/30 ${isOpen ? 'text-3xl sm:text-4xl' : 'text-lg sm:text-xl opacity-0 sm:opacity-100 sm:rotate-0 hidden sm:block'}`}
                        >
                            {value.title}
                        </motion.h3>
                    </div>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <p className="text-accent-600 dark:text-gray-400 text-lg sm:text-xl leading-relaxed max-w-xl font-medium">
                                    {value.description}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Icon for mobile closed state */}
            {!isOpen && (
                <div className="absolute inset-0 flex items-center justify-between px-6 sm:hidden">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary w-12 h-12">
                            <value.Icon className="w-full h-full" />
                        </div>
                        <span className="text-accent-900 dark:text-white font-black text-xl">{value.title}</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default function ValuesSection() {
    const [openId, setOpenId] = useState(1);

    return (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-transparent transition-colors duration-300 relative z-10">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-xl text-primary font-black text-xs mb-8 border-none shadow-soft uppercase tracking-widest"
                    >
                        <Heart size={14} />
                        <span>قيمنا</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 tracking-tighter leading-tight"
                    >
                        ما الذي نؤمن به؟
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-accent-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
                    >
                        مبادئ راسخة تقود قراراتنا وتحدد طريقة عملنا معكم.
                    </motion.p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 h-auto min-h-[400px] max-w-6xl mx-auto">
                    {values.map((value) => (
                        <AccordionItem
                            key={value.id}
                            value={value}
                            isOpen={openId === value.id}
                            onClick={() => setOpenId(value.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
