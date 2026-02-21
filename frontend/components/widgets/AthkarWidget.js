'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, ChevronRight, ChevronLeft, RotateCcw, Settings, Check } from 'lucide-react';

const ATHKAR_DATA = {
    morning: [
        {
            text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
            count: 1,
            description: "يقال مرة واحدة في الصباح"
        },
        {
            text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ.",
            count: 1,
            description: "يقال مرة واحدة في الصباح"
        },
        {
            text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
            count: 3,
            description: "تقال ثلاث مرات"
        },
        {
            text: "اللَّهُمَّ عافِني في بَدَني، اللَّهُمَّ عافِني في سَمْعي، اللَّهُمَّ عافِني في بَصَري، لا إلهَ إلَّا أنتَ.",
            count: 3,
            description: "تقال ثلاث مرات"
        },
        {
            text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
            count: 1,
            description: "يقال مرة واحدة"
        },
        {
            text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ.",
            count: 100,
            description: "تقال مائة مرة"
        },
        {
            text: "أستغفر الله وأتوب إليه.",
            count: 100,
            description: "تقال مائة مرة"
        }
    ],
    evening: [
        {
            text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
            count: 1,
            description: "يقال مرة واحدة في المساء"
        },
        {
            text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ.",
            count: 1,
            description: "يقال مرة واحدة في المساء"
        },
        {
            text: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
            count: 3,
            description: "تقال ثلاث مرات"
        },
        {
            text: "اللَّهُمَّ عافِني في بَدَني، اللَّهُمَّ عافِني في سَمْعي، اللَّهُمَّ عافِني في بَصَري، لا إلهَ إلَّا أنتَ.",
            count: 3,
            description: "تقال ثلاث مرات"
        },
        {
            text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
            count: 1,
            description: "يقال مرة واحدة"
        },
        {
            text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ.",
            count: 100,
            description: "تقال مائة مرة"
        },
        {
            text: "أستغفر الله وأتوب إليه.",
            count: 100,
            description: "تقال مائة مرة"
        }
    ]
};

export default function AthkarWidget({
    theme = 'dark',
    font = 'tajawal',
    initialMode = 'auto', // 'auto', 'morning', 'evening'
    id = 'athkar'
}) {
    const [mode, setMode] = useState('morning');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentCount, setCurrentCount] = useState(0);
    const [editUrl, setEditUrl] = useState('#');

    useEffect(() => {
        setEditUrl(`${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}&mode=${initialMode}`);
    }, [id, theme, font, initialMode]);

    useEffect(() => {
        if (initialMode === 'auto') {
            const hour = new Date().getHours();
            // Morning: 4 AM to 4 PM, Evening: 4 PM to 4 AM
            setMode(hour >= 4 && hour < 16 ? 'morning' : 'evening');
        } else {
            setMode(initialMode);
        }
    }, [initialMode]);

    const currentThikr = ATHKAR_DATA[mode][currentIndex];

    const handleNext = () => {
        if (currentIndex < ATHKAR_DATA[mode].length - 1) {
            setCurrentIndex(prev => prev + 1);
            setCurrentCount(0);
        } else {
            // Reset to beginning
            setCurrentIndex(0);
            setCurrentCount(0);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setCurrentCount(0);
        }
    };

    const handleIncrement = () => {
        if (currentCount < currentThikr.count) {
            setCurrentCount(prev => prev + 1);

            // Auto next if count reached
            if (currentCount + 1 === currentThikr.count) {
                setTimeout(handleNext, 1000);
            }
        }
    };

    const handleReset = (e) => {
        e.stopPropagation();
        setCurrentCount(0);
    };

    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa'
    };

    const isDone = currentCount === currentThikr.count;

    return (
        <div className={`w-full max-w-xl p-8 rounded-[2.5rem] transition-all duration-500 relative group overflow-hidden ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-[#2f2f2f]'
            : 'bg-white text-accent-900 border border-gray-100 shadow-xl'
            }`} dir="rtl">

            {/* Edit Button */}
            <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-6 left-6 p-2.5 rounded-full bg-gray-500/10 hover:bg-primary-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-50 text-gray-400"
                title="تعديل الأداة"
            >
                <Settings className="w-4 h-4" />
            </a>

            <div className="flex flex-col items-center text-center space-y-8">
                {/* Header / Mode Indicator */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setMode('morning'); setCurrentIndex(0); setCurrentCount(0); }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${mode === 'morning'
                            ? 'bg-orange-500/10 text-orange-500 shadow-sm'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                    >
                        <Sun className={`w-3.5 h-3.5 ${mode === 'morning' ? 'animate-pulse' : ''}`} />
                        <span>أذكار الصباح</span>
                    </button>
                    <button
                        onClick={() => { setMode('evening'); setCurrentIndex(0); setCurrentCount(0); }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${mode === 'evening'
                            ? 'bg-blue-500/10 text-blue-500 shadow-sm'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                    >
                        <Moon className={`w-3.5 h-3.5 ${mode === 'evening' ? 'animate-pulse' : ''}`} />
                        <span>أذكار المساء</span>
                    </button>
                </div>

                {/* Thikr Content */}
                <div className="min-h-[160px] flex items-center justify-center w-full px-4">
                    <h2 className={`text-xl md:text-2xl font-bold leading-[1.8] md:leading-[2] transition-all duration-300 ${fontClasses[font]} ${isDone ? 'opacity-50 line-through' : ''}`}>
                        {currentThikr.text}
                    </h2>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary font-medium">
                    {currentThikr.description}
                </p>

                {/* Counter & Controls */}
                <div className="flex flex-col items-center gap-6 w-full pt-8 border-t border-gray-100 dark:border-dark-card-border">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className={`p-3 rounded-full transition-all ${currentIndex === 0 ? 'text-gray-200 dark:text-gray-800' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary-500'}`}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <div
                            onClick={handleIncrement}
                            className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 group/counter ${isDone
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                : 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 hover:scale-105'
                                }`}
                        >
                            {isDone ? (
                                <Check className="w-10 h-10 animate-bounce-slow" />
                            ) : (
                                <>
                                    <span className="text-3xl font-black">{currentThikr.count - currentCount}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">باقي</span>
                                </>
                            )}

                            {/* Circular progress overlay could be added here */}
                        </div>

                        <button
                            onClick={handleNext}
                            className="p-3 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary-500 transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
                        {ATHKAR_DATA[mode].map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                                    ? 'w-6 bg-primary-500'
                                    : idx < currentIndex
                                        ? 'w-1.5 bg-green-500/50'
                                        : 'w-1.5 bg-gray-200 dark:bg-gray-800'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleReset}
                        className="text-xs font-bold text-gray-400 hover:text-primary-500 flex items-center gap-1.5 transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" />
                        إعادة العداد
                    </button>
                </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
    );
}

