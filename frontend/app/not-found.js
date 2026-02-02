'use client';

import Link from 'next/link';
import { Home, MoveRight } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center p-4 transition-colors duration-300" dir="rtl">
            <div className="text-center max-w-lg w-full">
                {/* Animated 404 Graphic */}
                <div className="mb-8 relative h-48 sm:h-64 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary-100 dark:bg-orange-900/10 rounded-full blur-[80px] opacity-60"></div>
                    <h1 className="text-[150px] sm:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-primary-200 to-transparent dark:from-orange-500/20 dark:to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
                        404
                    </h1>
                    <div className="relative z-10 w-full">
                        <div className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent mb-4">
                            عذراً!
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            الصفحة غير موجودة
                        </p>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
                    يبدو أنك وصلت إلى صفحة غير موجودة أو تم نقلها. لا تقلق، يمكنك العودة واستكمال تصفح موقعنا.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 group"
                    >
                        <Home className="w-5 h-5" />
                        <span>العودة للرئيسية</span>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-dark-secondary text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-dark-card-border hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <MoveRight className="w-5 h-5 rtl:rotate-180" />
                        <span>الصفحة السابقة</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
