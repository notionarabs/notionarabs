'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { BookOpen, TrendingUp, Zap, Star } from 'lucide-react';

const goals = [
    {
        title: "توسيع مكتبة القوالب العربية",
        description: "لتشمل كل المجالات من إدارة المشاريع إلى الحياة الشخصية والطلاب.",
        Icon: BookOpen,
        color: "from-blue-500 to-cyan-400"
    },
    {
        title: "تمكين المبدعين العرب",
        description: "مساعدة آلاف المصممين على بيع قوالبهم والوصول لجمهور عالمي.",
        Icon: TrendingUp,
        color: "from-green-500 to-emerald-400"
    },
    {
        title: "أتمتة الشركات والفرق",
        description: "تطوير حلول متقدمة تربط نوشن بكل أدوات العمل اليومية.",
        Icon: Zap,
        color: "from-purple-500 to-violet-400"
    },
    {
        title: "مرجع نوشن الأول",
        description: "أن نبقى المصدر رقم 1 للمحتوى التعليمي عن نوشن في الشرق الأوسط.",
        Icon: Star,
        color: "from-orange-500 to-amber-400"
    }
];

const TiltCard = ({ goal }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;
        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-full min-h-[300px] cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <div
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className="absolute inset-0 bg-white dark:bg-dark-card-bg rounded-3xl shadow-xl border border-gray-100 dark:border-dark-card-border p-8 flex flex-col items-center text-center justify-center transition-shadow duration-300 hover:shadow-2xl"
            >
                <div
                    style={{ transform: "translateZ(50px)" }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${goal.color} flex items-center justify-center mb-6 shadow-lg`}
                >
                    <goal.Icon className="w-8 h-8 text-white" />
                </div>
                <h3
                    style={{ transform: "translateZ(25px)" }}
                    className="text-xl font-bold text-accent-800 dark:text-white mb-3"
                >
                    {goal.title}
                </h3>
                <p
                    style={{ transform: "translateZ(25px)" }}
                    className="text-accent-600 dark:text-gray-400 leading-relaxed"
                >
                    {goal.description}
                </p>
            </div>
        </motion.div>
    );
};

export default function FutureGoalsSection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-tertiary overflow-hidden perspective-1000">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 font-medium text-sm mb-4"
                    >
                        <Star size={16} className="fill-current" />
                        <span>طموحاتنا</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent-800 dark:text-white mb-6"
                    >
                        إلى أين نتجه؟
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-lg text-accent-600 dark:text-gray-400 max-w-3xl mx-auto"
                    >
                        لا نتوقف عند ما حققناه اليوم. لدينا خطط كبيرة لخدمة المحتوى العربي ومستخدمي نوشن.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
                    {goals.map((goal, index) => (
                        <TiltCard key={index} goal={goal} />
                    ))}
                </div>
            </div>
        </section>
    );
}
