'use client';

import { useState, useEffect } from 'react';
import { Clock as ClockIcon, Calendar, Settings } from 'lucide-react';

export default function ArabicClockWidget({
    theme = 'dark',
    font = 'reem-kufi',
    showSeconds = true,
    useArabicDigits = true,
    id = 'arabic-clock'
}) {
    const [time, setTime] = useState(new Date());
    const [editUrl, setEditUrl] = useState('#');

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setEditUrl(`${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}&showSeconds=${showSeconds}&useArabicDigits=${useArabicDigits}`);
    }, [id, theme, font, showSeconds, useArabicDigits]);

    const fontClasses = {
        'tajawal': 'font-tajawal',
        'cairo': 'font-cairo',
        'amiri': 'font-amiri',
        'reem-kufi': 'font-reem-kufi',
        'aref-ruqaa': 'font-aref-ruqaa',
        'vibes': 'font-vibes',
        'katibeh': 'font-katibeh'
    };

    const toArabicDigits = (str) => {
        if (!useArabicDigits) return str;
        const id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return str.replace(/[0-9]/g, function (w) {
            return id[+w];
        });
    };

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');

    const dayName = time.toLocaleDateString('ar-SA', { weekday: 'long' });
    const day = time.toLocaleDateString('ar-SA', { day: 'numeric' });
    const monthName = time.toLocaleDateString('ar-SA', { month: 'long' });
    const year = time.toLocaleDateString('ar-SA', { year: 'numeric' });

    return (
        <div className={`w-full p-8 md:p-12 rounded-[2.5rem] transition-all duration-700 relative group overflow-hidden ${fontClasses[font] || 'font-reem-kufi'} ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-[#2f2f2f] shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            : 'bg-white text-accent-900 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
            }`}>

            {/* Background Decorative Element */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-all duration-1000"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-all duration-1000"></div>

            {/* Edit Button */}
            <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-6 left-6 p-2.5 rounded-full bg-gray-500/10 hover:bg-primary-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-50 text-gray-400 backdrop-blur-md"
                title="تعديل الأداة"
            >
                <Settings className="w-4 h-4" />
            </a>

            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
                {/* Icon & Date Label */}
                <div className="flex items-center gap-3 mb-2 opacity-80">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary-500/80">
                        {toArabicDigits(dayName)}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                </div>

                {/* Main Time Display */}
                <div className="flex items-baseline justify-center">
                    <span className="text-7xl md:text-8xl font-black tracking-tight drop-shadow-2xl transition-all duration-500">
                        {toArabicDigits(hours)}
                    </span>
                    <span className="text-5xl md:text-6xl font-light mx-2 text-primary-500 animate-[pulse_2s_infinite]">
                        :
                    </span>
                    <span className="text-7xl md:text-8xl font-black tracking-tight drop-shadow-2xl transition-all duration-500">
                        {toArabicDigits(minutes)}
                    </span>
                    {showSeconds && (
                        <div className="ml-4 flex flex-col items-start">
                            <span className="text-2xl md:text-3xl font-bold text-primary-500/60 tabular-nums">
                                {toArabicDigits(seconds)}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">ثانية</span>
                        </div>
                    )}
                </div>

                {/* Full Date */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm md:text-base font-bold opacity-70">
                    <span>{toArabicDigits(day)}</span>
                    <span className="text-primary-500">{toArabicDigits(monthName)}</span>
                    <span>{toArabicDigits(year)}</span>
                </div>

                {/* Islamic Geometric Border (Decoration) */}
                <div className="w-24 h-1 border-b border-primary-500/20 mt-4"></div>
            </div>
        </div>
    );
}
