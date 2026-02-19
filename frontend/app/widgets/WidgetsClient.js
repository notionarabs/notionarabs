'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layout, Copy, ExternalLink, Zap, Sparkles } from 'lucide-react';
import Footer from '../../components/Footer';

const widgets = [
    {
        id: 'quran',
        title: 'آية اليوم الذكية',
        description: 'عرض آيات قرآنية متجددة تلقائياً مع ترجمات متعددة وتصميمات عصرية.',
        icon: <Sparkles className="w-6 h-6 text-orange-500" />,
        category: 'إسلاميات'
    },
    {
        id: 'prayer',
        title: 'مواقيت الصلاة',
        description: 'مواقيت الصلاة والتقويم الهجري لمدينتك بتنسيق مثالي لصفحات نوشن.',
        icon: <Layout className="w-6 h-6 text-blue-500" />,
        category: 'إسلاميات'
    }
];

export default function WidgetsClient() {
    const router = useRouter();
    const [copiedId, setCopiedId] = useState(null);

    const copyEmbed = (e, id) => {
        e.stopPropagation(); // Prevent card click
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const embedUrl = `${baseUrl}/widgets/${id}/embed`;
        navigator.clipboard.writeText(embedUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

            <section className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300 py-12 sm:py-16 md:py-20 lg:py-24">
                <div className="container-custom">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-normal text-accent-900 dark:text-white mb-6 leading-relaxed">
                            أدوات عرب نوشن
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-4 sm:px-0">
                            مجموعة من الأدوات المصممة خصيصاً للمستخدم العربي لتعزيز الإنتاجية والجمالية في نوشن.
                        </p>
                    </div>
                </div>
            </section>

            <section className="pt-16 sm:pt-20 lg:pt-24 pb-24 px-4 bg-secondary-50 dark:bg-dark-primary">
                <div className="container-custom">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {widgets.map((widget) => (
                            <div
                                key={widget.id}
                                onClick={() => router.push(`/widgets/${widget.id}`)}
                                className="group card-interactive bg-white dark:bg-dark-secondary rounded-3xl overflow-hidden border border-gray-200 dark:border-dark-card-border shadow-soft cursor-pointer flex flex-col"
                            >
                                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-dark-tertiary dark:to-dark-primary flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #f5631e 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                                    <div className="p-8 bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 dark:border-dark-card-border transform group-hover:scale-105 transition-transform duration-500">
                                        <div className="flex items-center gap-3">
                                            {widget.icon}
                                            <div className="h-2 w-24 bg-gray-200 dark:bg-dark-text-quaternary rounded"></div>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            <div className="h-1.5 w-full bg-gray-100 dark:bg-dark-text-quaternary rounded"></div>
                                            <div className="h-1.5 w-3/4 bg-gray-100 dark:bg-dark-text-quaternary rounded"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                                            {widget.category}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-normal text-accent-900 dark:text-white mb-2">
                                        {widget.title}
                                    </h2>
                                    <p className="text-accent-600 dark:text-dark-text-secondary text-sm mb-6 line-clamp-2">
                                        {widget.description}
                                    </p>
                                    <div className="mt-auto flex gap-3">
                                        <button
                                            onClick={(e) => copyEmbed(e, widget.id)}
                                            className="flex-1 btn-primary py-2.5 px-4 text-sm flex items-center justify-center gap-2 relative z-10"
                                        >
                                            {copiedId === widget.id ? 'تم النسخ!' : <><Copy className="w-4 h-4" /> انسخ الرابط</>}
                                        </button>
                                        <div className="flex-1 btn-secondary py-2.5 px-4 text-sm flex items-center justify-center gap-2">
                                            <ExternalLink className="w-4 h-4" /> التفاصيل
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
