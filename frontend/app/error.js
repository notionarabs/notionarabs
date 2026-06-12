'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, MoveRight } from 'lucide-react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error('Page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="text-center max-w-2xl w-full relative z-10">
                <div className="mb-10 relative h-48 sm:h-64 flex items-center justify-center">
                    <h1 className="text-[140px] sm:text-[220px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-red-500/15 to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none tracking-tighter">
                        500
                    </h1>
                    <div className="relative z-10 w-full">
                        <div className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-primary mb-4 py-2 leading-normal">
                            عذراً!
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-accent-900 dark:text-white">
                            حدث خطأ غير متوقع
                        </p>
                    </div>
                </div>

                <p className="text-accent-600 dark:text-gray-400 text-lg sm:text-xl mb-10 leading-relaxed font-medium px-4">
                    واجهنا مشكلة أثناء تحميل هذه الصفحة. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center px-4">
                    <button
                        onClick={reset}
                        className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-glow hover:shadow-large hover:scale-105 transition-all duration-500 flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>إعادة المحاولة</span>
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto px-10 py-5 bg-white/50 dark:bg-white/5 backdrop-blur-xl text-accent-900 dark:text-white rounded-2xl font-black text-lg shadow-soft hover:shadow-large transition-all duration-500 flex items-center justify-center gap-3 border border-gray-200/50 dark:border-white/10"
                    >
                        <Home className="w-5 h-5" />
                        <span>الرئيسية</span>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-10 py-5 bg-white/50 dark:bg-white/5 backdrop-blur-xl text-accent-900 dark:text-white rounded-2xl font-black text-lg shadow-soft hover:shadow-large transition-all duration-500 flex items-center justify-center gap-3 border border-gray-200/50 dark:border-white/10"
                    >
                        <MoveRight className="w-5 h-5 rtl:rotate-180" />
                        <span>الصفحة السابقة</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
