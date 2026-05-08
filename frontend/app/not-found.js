'use client';

import Link from 'next/link';
import { Home, MoveRight } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
            {/* Ambient Mesh Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
            <div className="text-center max-w-2xl w-full relative z-10">
                {/* Animated 404 Graphic */}
                <div className="mb-12 relative h-64 sm:h-96 flex items-center justify-center">
                    <h1 className="text-[180px] sm:text-[300px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-primary/20 to-transparent dark:from-white/5 dark:to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none tracking-tighter">
                        404
                    </h1>
                    <div className="relative z-10 w-full animate-float">
                        <div className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 mb-6 py-2 leading-normal">
                            عذراً!
                        </div>
                        <p className="text-2xl sm:text-4xl font-black text-accent-900 dark:text-white mb-2">
                            الصفحة تاهت في الفضاء
                        </p>
                    </div>
                </div>

                <p className="text-accent-600 dark:text-gray-400 text-xl sm:text-2xl mb-12 leading-relaxed font-medium px-4">
                    يبدو أنك وصلت إلى صفحة غير موجودة أو تم نقلها. لا تقلق، يمكنك العودة واستكمال تصفح عالم نوشن العربي.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center px-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-glow hover:shadow-large hover:scale-105 transition-all duration-500 flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                        <Home className="w-6 h-6" />
                        <span>العودة للرئيسية</span>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-12 py-5 bg-white/50 dark:bg-white/5 backdrop-blur-xl text-accent-900 dark:text-white rounded-2xl font-black text-lg shadow-soft hover:shadow-large transition-all duration-500 flex items-center justify-center gap-3 border-none"
                    >
                        <MoveRight className="w-6 h-6 rtl:rotate-180" />
                        <span>الصفحة السابقة</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
