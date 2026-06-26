'use client';

import { useEffect, Suspense, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ShoppingBag, ArrowLeft, Download, Sparkles, Rocket, ShieldCheck, HelpCircle, Layers, Copy, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    const type = searchParams.get('type');
    const isBoost = type === 'boost';
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleCopyId = () => {
        if (orderId) {
            navigator.clipboard.writeText(`#${orderId.slice(-8)}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-black/30 relative overflow-hidden" dir="rtl">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-lg w-full bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 sm:p-10 text-center border border-gray-100 dark:border-dark-card-border relative overflow-hidden"
            >
                {/* Minimalist Top Indicator */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500"></div>

                {/* Secure Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold mb-6 border border-emerald-100/50 dark:border-emerald-900/30">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>عملية دفع آمنة 100%</span>
                </div>

                {/* Elegant Success Check Animation */}
                <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 150 }}
                        className="w-16 h-16 bg-emerald-500 dark:bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10"
                    >
                        <Check size={32} className="stroke-[3]" />
                    </motion.div>
                </div>

                {/* Headings */}
                <div className="space-y-2 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                        {isBoost ? 'تم تفعيل الترويج بنجاح!' : 'شكراً لثقتك بنا!'}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-sm mx-auto">
                        {isBoost 
                            ? 'تم تأكيد الدفع بنجاح. قالبك الآن مثبت ومميز في المعرض ليحصل على أكبر قدر من المشاهدات والتحميلات.'
                            : 'تم تأكيد الدفع بنجاح. تمت إضافة القالب إلى مكتبتك لتتمكن من استخدامه فوراً وبدء رحلة إنتاجية جديدة.'}
                    </p>
                </div>

                {/* Transaction Receipt Details */}
                <div className="bg-gray-50/50 dark:bg-dark-tertiary/20 rounded-2xl p-5 text-right space-y-3.5 mb-8 border border-gray-100/50 dark:border-dark-card-border/30">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                        <span>حالة الطلب</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-md">مكتمل ومفعل</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                        <span>طريقة التسليم</span>
                        <span className="text-gray-800 dark:text-gray-200 font-extrabold">
                            {isBoost ? 'تفعيل وتثبيت فوري بالمعرض' : 'فوري عبر مكتبة مقتنياتك'}
                        </span>
                    </div>

                    {orderId && (
                        <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                            <span>رقم المعاملة</span>
                            <button 
                                onClick={handleCopyId}
                                className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary font-mono font-extrabold bg-white dark:bg-dark-secondary px-2.5 py-1 rounded-md border border-gray-200/50 dark:border-white/5 transition-all active:scale-95 group"
                            >
                                {copied ? (
                                    <>
                                        <span className="text-[10px] text-emerald-500 font-sans">تم النسخ!</span>
                                        <CheckCircle size={12} className="text-emerald-500" />
                                    </>
                                ) : (
                                    <>
                                        <span>#{orderId.slice(-8)}</span>
                                        <Copy size={12} className="text-gray-400 group-hover:text-primary transition-colors" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    {isBoost ? (
                        <Link
                            href="/profile?tab=templates"
                            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-primary hover:bg-primary-600 text-white text-sm font-extrabold rounded-xl transition-all duration-300 shadow-md shadow-primary/10 hover:scale-[1.01] active:scale-95 decoration-none"
                        >
                            <ArrowLeft size={18} />
                            <span>إدارة قوالبي</span>
                        </Link>
                    ) : (
                        <Link
                            href="/profile?tab=purchases"
                            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-primary hover:bg-primary-600 text-white text-sm font-extrabold rounded-xl transition-all duration-300 shadow-md shadow-primary/10 hover:scale-[1.01] active:scale-95 decoration-none"
                        >
                            <Download size={18} />
                            <span>تحميل القالب الآن</span>
                        </Link>
                    )}
                    
                    <Link
                        href="/#marketplace"
                        className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gray-100 dark:bg-white/[0.04] hover:bg-gray-200/70 dark:hover:bg-white/[0.08] text-gray-700 dark:text-gray-300 text-sm font-extrabold rounded-xl transition-all duration-300 hover:scale-[1.01] active:scale-95 decoration-none"
                    >
                        <ShoppingBag size={18} className="text-gray-400 dark:text-gray-500" />
                        <span>تصفح المزيد</span>
                    </Link>
                </div>

                {/* What's next / Roadmap */}
                <div className="bg-primary-50/20 dark:bg-white/[0.01] rounded-2xl p-5 text-right border border-primary-100/30 dark:border-white/5 space-y-3">
                    <h3 className="text-[11px] font-black text-primary-600 dark:text-primary-400 tracking-wider uppercase flex items-center gap-1.5">
                        <Sparkles size={12} className="text-primary-500 animate-pulse" />
                        {isBoost ? 'مزايا باقة الترويج' : 'خطوات بسيطة للبدء:'}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        {isBoost ? (
                            <>
                                <div className="bg-white dark:bg-dark-tertiary/20 p-3 rounded-xl border border-gray-100/50 dark:border-white/5">
                                    <span className="text-primary font-black block mb-0.5">1. ظهور مميز</span>
                                    تثبيت في أعلى الصفحة الرئيسية
                                </div>
                                <div className="bg-white dark:bg-dark-tertiary/20 p-3 rounded-xl border border-gray-100/50 dark:border-white/5">
                                    <span className="text-primary font-black block mb-0.5">2. نمو المشاهدات</span>
                                    زيادة نسب التحميل والمبيعات لقالبك
                                </div>
                                <div className="bg-white dark:bg-dark-tertiary/20 p-3 rounded-xl border border-gray-100/50 dark:border-white/5">
                                    <span className="text-primary font-black block mb-0.5">3. متابعة مستمرة</span>
                                    تتبع أداء الترويج من لوحة التحكم
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-white dark:bg-dark-tertiary/20 p-3 rounded-xl border border-gray-100/50 dark:border-white/5">
                                    <span className="text-primary font-black block mb-0.5">1. افتح مشترياتك</span>
                                    توجه لقسم المشتريات بمكتبتك
                                </div>
                                <div className="bg-white dark:bg-dark-tertiary/20 p-3 rounded-xl border border-gray-100/50 dark:border-white/5">
                                    <span className="text-primary font-black block mb-0.5">2. انسخ القالب</span>
                                    اضغط على زر الفتح في Notion
                                </div>
                                <div className="bg-white dark:bg-dark-tertiary/20 p-3 rounded-xl border border-gray-100/50 dark:border-white/5">
                                    <span className="text-primary font-black block mb-0.5">3. تكرار (Duplicate)</span>
                                    انسخ القالب لمساحة العمل الخاصة بك
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Help */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-card-border/30">
                    <p className="text-gray-400 dark:text-gray-500 text-xs font-bold flex items-center justify-center gap-1.5">
                        <HelpCircle size={14} className="text-gray-400" />
                        <span>تحتاج لمساعدة؟</span>
                        <Link href="/contact" className="text-primary hover:underline font-extrabold">
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
                <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}

