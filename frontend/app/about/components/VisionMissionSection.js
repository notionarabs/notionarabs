'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, TrendingUp, Users, Zap, Settings } from 'lucide-react';
import api from '../../../lib/api';
import Counter from '../../../components/Counter';

const BentoCard = ({ children, className, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className={`bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-soft hover:shadow-large border-none overflow-hidden relative transition-all duration-500 ${className}`}
    >
        {children}
    </motion.div>
);

export default function VisionMissionSection() {
    const [stats, setStats] = useState({ downloads: 0 });
    const [systemStatus, setSystemStatus] = useState({ 
        status: 'loading', 
        label: 'جاري الفحص...', 
        color: 'text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-white/5',
        iconColor: 'text-gray-400'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch stats
                const statsResponse = await api.get('/stats/homepage');
                if (statsResponse.data.success) {
                    setStats(statsResponse.data.stats);
                }

                // Fetch health status
                try {
                    const healthResponse = await api.get('/health/detailed');
                    if (healthResponse.data.status === 'healthy') {
                        setSystemStatus({
                            status: 'healthy',
                            label: 'مستقر',
                            color: 'text-green-600 dark:text-green-400',
                            bgColor: 'bg-green-100 dark:bg-green-900/30',
                            iconColor: 'text-green-600 dark:text-green-400'
                        });
                    } else {
                        setSystemStatus({
                            status: 'unhealthy',
                            label: 'صيانة',
                            color: 'text-amber-600 dark:text-amber-400',
                            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
                            iconColor: 'text-amber-600 dark:text-amber-400'
                        });
                    }
                } catch (healthError) {
                    setSystemStatus({
                        status: 'error',
                        label: 'غير متصل',
                        color: 'text-rose-600 dark:text-rose-400',
                        bgColor: 'bg-rose-100 dark:bg-rose-900/30',
                        iconColor: 'text-rose-600 dark:text-rose-400'
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-transparent transition-colors duration-300 relative z-10 overflow-visible">
            <div className="container-custom">
                <div className="text-center mb-12 sm:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl sm:text-7xl font-black text-accent-500 dark:text-white mb-6 tracking-tighter leading-tight"
                    >
                        رؤيتنا ورسالتنا
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-accent-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
                    >
                        بوصلتنا التي توجهنا نحو بناء مستقبل أكثر إنتاجية وتنظيمًا للمحتوى العربي
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

                    {/* Unified Vision & Mission Card - Large */}
                    <BentoCard className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary-600 to-purple-700 text-white border-none flex flex-col justify-center shadow-glow">
                        <div className="relative z-10 flex flex-col gap-12">
                            {/* Vision Part */}
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                                        <Target className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight">الرؤية</h3>
                                </div>
                                <p className="text-xl sm:text-2xl text-white/90 leading-relaxed font-bold">
                                    أن نصبح الوجهة العربية الأولى لكل ما يتعلق بنوشن —
                                    قوالب استثنائية، أدوات ذكية، ومجتمع حيوي يتبادل الإبداع.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-white/10"></div>

                            {/* Mission Part */}
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                                        <Lightbulb className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight">الرسالة</h3>
                                </div>
                                <p className="text-xl sm:text-2xl text-white/90 leading-relaxed font-bold">
                                    نسهّل على المستخدم العربي الوصول إلى قوالب نوشن احترافية تساعده على بناء أنظمة إنتاجية مخصصة وفهم أعمق للابتكار الرقمي.
                                </p>
                            </div>
                        </div>

                        {/* Decoration */}
                        <Target className="absolute -top-10 -right-10 w-96 h-96 text-white/5 rotate-[-15deg]" />
                        <Lightbulb className="absolute -bottom-10 -left-10 w-96 h-96 text-white/5 rotate-12" />
                    </BentoCard>

                    {/* Stat Card 1 - Templates */}
                    <BentoCard delay={0.2} className="flex flex-col items-center justify-center text-center bg-white/50 dark:bg-white/5 backdrop-blur-2xl md:h-auto min-h-[200px]">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h4 className="text-3xl sm:text-4xl font-bold text-accent-800 dark:text-white mb-2">
                            <Counter end={stats.templates || 0} />
                        </h4>
                        <p className="text-accent-500 dark:text-gray-400 font-medium">قالب إبداعي</p>
                    </BentoCard>

                    {/* Stat Card 2 - Creators */}
                    <BentoCard delay={0.3} className="flex flex-col items-center justify-center text-center bg-white/50 dark:bg-white/5 backdrop-blur-2xl md:h-auto min-h-[200px]">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                            <Users className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h4 className="text-3xl sm:text-4xl font-bold text-accent-800 dark:text-white mb-2">
                            <Counter end={stats.creators || 0} />
                        </h4>
                        <p className="text-accent-500 dark:text-gray-400 font-medium">مبدع معتمد</p>
                    </BentoCard>

                    {/* Stat Card 3 - Downloads */}
                    <BentoCard delay={0.4} className="flex flex-col items-center justify-center text-center bg-white/50 dark:bg-white/5 backdrop-blur-2xl md:h-auto min-h-[200px]">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
                            <Zap className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h4 className="text-3xl sm:text-4xl font-bold text-accent-800 dark:text-white mb-2 tracking-tighter">
                            <Counter end={stats.downloads || 0} suffix="+" />
                        </h4>
                        <p className="text-accent-500 dark:text-gray-400 font-medium">تحميل ناجح</p>
                    </BentoCard>

                    {/* Stat Card 4 - Status */}
                    <BentoCard delay={0.5} className="flex flex-col items-center justify-center text-center bg-white/50 dark:bg-white/5 backdrop-blur-2xl md:h-auto min-h-[200px]">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 ${systemStatus.bgColor} rounded-full flex items-center justify-center mb-4 ${systemStatus.iconColor}`}>
                            <div className="relative">
                                {systemStatus.status === 'healthy' && (
                                    <div className="absolute inset-0 bg-current rounded-full animate-ping opacity-25" />
                                )}
                                <Settings className="w-7 h-7 sm:w-8 sm:h-8 relative z-10" />
                            </div>
                        </div>
                        <h4 className={`text-3xl sm:text-4xl font-bold mb-2 ${systemStatus.color}`}>
                            {systemStatus.label}
                        </h4>
                        <p className="text-accent-500 dark:text-gray-400 font-medium whitespace-nowrap">حالة النظام: مباشر</p>
                    </BentoCard>

                </div>
            </div>
        </section>
    );
}
