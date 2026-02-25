'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl w-full bg-white dark:bg-dark-secondary rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center border border-gray-100 dark:border-dark-card-border relative overflow-hidden"
            >
                {/* Background Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl"></div>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                    className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 dark:text-green-400 shadow-inner"
                >
                    <CheckCircle2 size={56} className="stroke-[2.5]" />
                </motion.div>

                <div className="space-y-4 mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                        شكراً لثقتك بنا!
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        تمت عملية الدفع بنجاح. القالب الخاص بك متاح الآن للتحميل والبدء فوراً في تنظيم عملك.
                    </p>
                    {orderId && (
                        <div className="inline-block px-4 py-2 bg-gray-100 dark:bg-dark-tertiary rounded-full text-sm font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-card-border">
                            رقم الطلب: #{orderId.slice(-8)}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        href="/purchases"
                        className="flex items-center justify-center gap-2 py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-1 group"
                    >
                        <Download size={20} className="group-hover:bounce" />
                        تحميل القالب
                    </Link>
                    <Link
                        href="/store"
                        className="flex items-center justify-center gap-2 py-4 px-6 bg-gray-100 dark:bg-dark-tertiary hover:bg-gray-200 dark:hover:bg-dark-card-border text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-all border border-gray-200 dark:border-dark-card-border hover:-translate-y-1"
                    >
                        <ShoppingBag size={20} />
                        تصفح المزيد
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-dark-card-border">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center justify-center gap-2">
                        تواجه مشكلة؟
                        <Link href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline font-bold">
                            تواصل معنا
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
