'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, Settings, Sparkles } from 'lucide-react';

export default function CountdownWidget({
    theme = 'dark',
    font = 'tajawal',
    targetDate = '2026-03-20T00:00:00',
    title = 'عيد الفطر المبارك',
    color = '#f5631e',
    id = 'countdown'
}) {
    const [editUrl, setEditUrl] = useState('#');

    useEffect(() => {
        setEditUrl(`${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}&targetDate=${targetDate}&title=${encodeURIComponent(title)}&color=${encodeURIComponent(color)}`);
    }, [id, theme, font, targetDate, title, color]);

    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa'
    };

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeft = {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                total: difference
            };

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                    total: difference
                };
            }

            setTimeLeft(timeLeft);
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();

        return () => clearInterval(timer);
    }, [targetDate]);

    const TimeUnit = ({ label, value, color }) => (
        <div className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 ${theme === 'dark'
            ? 'bg-white/5 border border-white/10'
            : 'bg-gray-50 border border-gray-100'
            } min-w-[70px] sm:min-w-[90px]`}>
            <span className="text-2xl sm:text-4xl font-black mb-1" style={{ color: color }}>
                {value.toString().padStart(2, '0')}
            </span>
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                {label}
            </span>
        </div>
    );

    return (
        <div className={`w-full p-6 md:p-8 rounded-[2.5rem] transition-all duration-500 relative group overflow-hidden ${fontClasses[font]} ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-[#2f2f2f]'
            : 'bg-white text-accent-900 border border-gray-100 shadow-xl'
            }`}>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Clock className="w-32 h-32 rotate-12" />
            </div>

            {/* Edit Button */}
            <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 left-4 p-2 rounded-full bg-gray-500/10 hover:bg-primary-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-50 text-gray-400"
                title="تعديل الأداة"
            >
                <Settings className="w-4 h-4" />
            </a>

            <div className="flex flex-col space-y-6 relative z-10" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, color: color }}>
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl leading-tight">{title}</h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(targetDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Countdown Grid */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    <TimeUnit label="يوم" value={timeLeft.days} color={color} />
                    <TimeUnit label="ساعة" value={timeLeft.hours} color={color} />
                    <TimeUnit label="دقيقة" value={timeLeft.minutes} color={color} />
                    <TimeUnit label="ثانية" value={timeLeft.seconds} color={color} />
                </div>

                {timeLeft.total <= 0 && (
                    <div className="text-center py-2 animate-bounce">
                        <span className="font-bold text-primary-500">🎉 حان الوقت!</span>
                    </div>
                )}
            </div>
        </div>
    );
}
