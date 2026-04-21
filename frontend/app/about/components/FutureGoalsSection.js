'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { BookOpen, TrendingUp, Zap, Star } from 'lucide-react';

const goals = [
    {
        title: "توسيع مكتبة القوالب العربية",
        description: "لتشمل كل المجالات من إدارة المشاريع الاحترافية إلى الحياة الشخصية والطلابية.",
        Icon: BookOpen,
        color: "from-blue-500 to-cyan-400"
    },
    {
        title: "تمكين المبدعين العرب",
        description: "مساعدة آلاف المصممين على بيع قوالبهم المبتكرة والوصول لآلاف المستخدمين المهتمين.",
        Icon: TrendingUp,
        color: "from-green-500 to-emerald-400"
    },
    {
        title: "تحسين أنظمة الأعمال الرقمية",
        description: "تطوير لوحات تحكم متطورة تربط كل جوانب مشاريعك في مساحة عمل عربية واحدة.",
        Icon: Zap,
        color: "from-purple-500 to-violet-400"
    },
    {
        title: "مرجع نوشن الأول",
        description: "أن نبقى المصدر رقم 1 للمحتوى التعليمي والقوالب النوعية عن نوشن في الشرق الأوسط.",
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
            className="relative w-full h-full cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <div
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className="relative w-full h-full min-h-[400px] bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-soft border-none p-10 lg:p-12 flex flex-col items-center text-center justify-center transition-all duration-500 hover:shadow-large"
            >
                <div
                    style={{ transform: "translateZ(50px)" }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${goal.color} flex items-center justify-center mb-10 shadow-glow group-hover:scale-110 transition-transform duration-500`}
                >
                    <goal.Icon className="w-10 h-10 text-white" />
                </div>
                <h3
                    style={{ transform: "translateZ(25px)" }}
                    className="text-2xl font-black text-accent-900 dark:text-white mb-4 tracking-tight"
                >
                    {goal.title}
                </h3>
                <p
                    style={{ transform: "translateZ(25px)" }}
                    className="text-lg text-accent-600 dark:text-gray-400 leading-relaxed font-medium"
                >
                    {goal.description}
                </p>
            </div>
        </motion.div>
    );
};

export default function FutureGoalsSection() {
    return (
        <section className="py-40 px-4 sm:px-6 lg:px-8 bg-transparent overflow-visible relative z-10 perspective-1000">
            <div className="container-custom">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-xl text-primary font-black text-xs mb-8 border-none shadow-soft uppercase tracking-widest"
                    >
                        <Star size={14} className="fill-current" />
                        <span>طموحاتنا</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 tracking-tighter leading-tight"
                    >
                        إلى أين نتجه؟
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xl text-accent-600 dark:text-gray-400 max-w-3xl mx-auto font-medium"
                    >
                        لا نتوقف عند ما حققناه اليوم. لدينا خطط كبيرة لخدمة المحتوى العربي ومستخدمي المبدعين في عالم نوشن.
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
