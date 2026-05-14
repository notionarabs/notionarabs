'use client';

import { useEffect, Suspense, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, ArrowLeft, Download, ExternalLink, Sparkles, Rocket, ShieldCheck, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-transparent via-gray-50/30 to-gray-100/50 dark:from-transparent dark:via-dark-tertiary/10 dark:to-dark-secondary/20 relative overflow-hidden" dir="rtl">
            {/* Background Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl w-full bg-white dark:bg-[#121212]/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-8 sm:p-12 md:p-14 text-center border border-gray-100 dark:border-white/10 relative overflow-hidden group"
            >
                {/* Premium Gradient Top Border */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-primary-500 to-emerald-500 animate-gradient bg-[length:200%_auto]"></div>

                {/* Floating Micro-Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-black mb-8 border border-emerald-100 dark:border-emerald-800/40 tracking-wider">
                    <Sparkles size={14} className="animate-spin text-emerald-500" />
                    <span>عملية دفع موثقة وآمنة 100%</span>
                </div>

                {/* Animated Trophy / Check Circle */}
                <div className="relative w-28 h-28 mx-auto mb-10 flex items-center justify-center">
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: [0, 1.2, 1] }} 
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-xl"
                    />
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 180, delay: 0.1 }}
                        className="relative w-24 h-24 bg-gradient-to-tr from-emerald-600 to-emerald-400 dark:from-emerald-500 dark:to-emerald-300 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 rotate-3 group-hover:rotate-0 transition-transform duration-500"
                    >
                        <CheckCircle2 size={56} className="stroke-[2.5]" />
                    </motion.div>
                </div>

                {/* Main Heading & Message */}
                <div className="space-y-4 mb-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        شكراً لثقتك في عرب نوشن!
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-lg mx-auto">
                        تم تأكيد عملية الدفع بنجاح. القالب الخاص بك تم إضافته إلى مكتبتك وهو جاهز الآن لتبدأ رحلة تنظيم عملك وحياتك.
                    </p>
                </div>

                {/* Receipt Details Box */}
                <div className="bg-gray-50 dark:bg-dark-tertiary/40 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-white/5 text-right space-y-4 mb-12 shadow-inner">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200/60 dark:border-white/5 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            حالة الطلب
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black px-2.5 py-1 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg">مكتمل ومفعل</span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-gray-200/60 dark:border-white/5 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-2">
                            <Rocket size={18} className="text-primary-500" />
                            طريقة التسليم
                        </span>
                        <span className="text-gray-900 dark:text-white font-black">فوري عبر مكتبة مقتنياتك</span>
                    </div>

                    {orderId && (
                        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-2">
                                <Layers size={18} className="text-purple-500" />
                                رقم المعاملة المرجعي
                            </span>
                            <span className="text-gray-900 dark:text-white font-mono font-black tracking-widest bg-white dark:bg-dark-secondary px-3 py-1 rounded-lg border border-gray-200 dark:border-white/5 shadow-xs">
                                #{orderId.slice(-8)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    <Link
                        href="/purchases"
                        className="flex items-center justify-center gap-3 py-5 px-8 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 hover:bg-[length:200%_auto] text-white text-base font-black rounded-2xl transition-all duration-500 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-95 group/main decoration-none"
                    >
                        <Download size={22} className="group-hover/main:-translate-y-1 transition-transform" />
                        <span>فتح وتحميل القالب</span>
                    </Link>
                    
                    <Link
                        href="/#marketplace"
                        className="flex items-center justify-center gap-3 py-5 px-8 bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-tertiary/80 text-gray-700 dark:text-gray-200 text-base font-black rounded-2xl transition-all duration-300 border border-gray-200/80 dark:border-white/10 hover:scale-[1.02] active:scale-95 group/store decoration-none"
                    >
                        <ShoppingBag size={22} className="group-hover/store:rotate-12 transition-transform text-gray-400 dark:text-gray-500" />
                        <span>تصفح المزيد من القوالب</span>
                    </Link>
                </div>

                {/* Onboarding Roadmap Tip */}
                <div className="bg-primary-50/50 dark:bg-primary-950/20 rounded-3xl p-6 border border-primary-100/60 dark:border-primary-900/30 text-right space-y-3">
                    <h3 className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} />
                        ماذا بعد التحميل؟
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-gray-600 dark:text-gray-300">
                        <div className="bg-white dark:bg-dark-secondary p-3 rounded-xl shadow-xs border border-gray-100 dark:border-white/5">
                            <span className="text-primary font-black block mb-1">١. التوجه لمشترياتك</span>
                            ستجد القالب متاحاً فوراً
                        </div>
                        <div className="bg-white dark:bg-dark-secondary p-3 rounded-xl shadow-xs border border-gray-100 dark:border-white/5">
                            <span className="text-primary font-black block mb-1">٢. النقر على نوشن</span>
                            اضغط على فتح في نوشن
                        </div>
                        <div className="bg-white dark:bg-dark-secondary p-3 rounded-xl shadow-xs border border-gray-100 dark:border-white/5">
                            <span className="text-primary font-black block mb-1">٣. تكرار القالب</span>
                            اضغط Duplicate بالأعلى
                        </div>
                    </div>
                </div>

                {/* Support Footer */}
                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center justify-center gap-2">
                        <HelpCircle size={14} className="text-gray-400" />
                        تواجه أي مشكلة أو تحتاج مساعدة؟
                        <Link href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline font-black">
                            تواصل مع الدعم الفني
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="w-14 h-14 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
