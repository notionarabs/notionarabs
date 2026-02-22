'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Settings, Sparkles, Star, Moon, Sun, BookOpen, Droplets, Heart } from 'lucide-react';

const DEEDS_METADATA = {
    fajr_sunnah: { name: 'سنة الفجر', icon: <Sun className="w-4 h-4" /> },
    duha: { name: 'صلاة الضحى', icon: <Sun className="w-4 h-4" /> },
    rawatib: { name: 'السنن الرواتب (12 ركعة)', icon: <Star className="w-4 h-4" /> },
    morning_athkar: { name: 'أذكار الصباح', icon: <Sun className="w-4 h-4" /> },
    evening_athkar: { name: 'أذكار المساء', icon: <Moon className="w-4 h-4" /> },
    quran: { name: 'ورد القرآن الكريم', icon: <BookOpen className="w-4 h-4" /> },
    witr: { name: 'صلاة الوتر', icon: <Moon className="w-4 h-4" /> },
    istighfar: { name: 'الاستغفار (100 مرة)', icon: <Droplets className="w-4 h-4" /> }
};

const DEFAULT_DEEDS_STATE = Object.keys(DEEDS_METADATA).map(id => ({
    id,
    completed: false
}));

export default function SmallDeedsWidget({
    theme = 'dark',
    font = 'tajawal',
    id = 'small-deeds',
    persistenceKey = 'na_deeds_'
}) {
    const [deedsState, setDeedsState] = useState([]);
    const [editUrl, setEditUrl] = useState('#');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(`${persistenceKey}${id}`);
        const today = new Date().toDateString();
        const lastUsed = localStorage.getItem(`${persistenceKey}${id}_date`);

        if (saved && lastUsed === today) {
            try {
                setDeedsState(JSON.parse(saved));
            } catch (e) {
                setDeedsState(DEFAULT_DEEDS_STATE);
            }
        } else {
            setDeedsState(DEFAULT_DEEDS_STATE);
            localStorage.setItem(`${persistenceKey}${id}_date`, today);
        }
    }, [id]);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem(`${persistenceKey}${id}`, JSON.stringify(deedsState));
        }
    }, [deedsState, mounted, id]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setEditUrl(`${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}`);
        }
    }, [id, theme, font]);

    const toggleDeed = (deedId) => {
        setDeedsState(deedsState.map(d => d.id === deedId ? { ...d, completed: !d.completed } : d));
    };

    const deeds = deedsState.map(state => ({
        ...state,
        ...DEEDS_METADATA[state.id]
    }));

    const completedCount = deeds.filter(d => d.completed).length;
    const progress = deeds.length > 0 ? (completedCount / deeds.length) * 100 : 0;

    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa',
        'reem-kufi': 'font-reem-kufi'
    };

    if (!mounted) return <div className={`w-full min-h-[400px] rounded-[2.5rem] animate-pulse ${theme === 'dark' ? 'bg-[#191919]' : 'bg-gray-50'}`}></div>;

    return (
        <div className={`w-full max-w-md p-6 md:p-8 rounded-[2.5rem] transition-all duration-500 relative group overflow-hidden ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-[#2f2f2f] shadow-2xl'
            : 'bg-white text-accent-900 border border-gray-100 shadow-xl'
            } ${fontClasses[font] || 'font-tajawal'}`} dir="rtl">

            {/* Background Decorations */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Edit Button */}
            <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-6 left-6 p-2 rounded-full bg-gray-500/10 hover:bg-primary-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-50 text-gray-400"
                title="تعديل الأداة"
            >
                <Settings className="w-4 h-4" />
            </a>

            <div className="flex flex-col space-y-6 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black">متتبع السنن</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">خطوات صغيرة لرضا كبير</p>
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="text-lg font-black text-emerald-500">{completedCount}/{deeds.length}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">أنجزت</div>
                    </div>
                </div>

                {/* Vertical Progress Bar (Subtle) */}
                <div className="relative h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Deeds List */}
                <div className="grid grid-cols-1 gap-2.5">
                    {deeds.map((deed) => (
                        <div
                            key={deed.id}
                            onClick={() => toggleDeed(deed.id)}
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 transform active:scale-95 group/deed ${deed.completed
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : `${theme === 'dark' ? 'bg-white/5 hover:border-white/10' : 'bg-gray-50 hover:border-gray-200'} border border-transparent`
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${deed.completed ? 'bg-emerald-500 text-white' : (theme === 'dark' ? 'bg-white/10 text-gray-400' : 'bg-gray-200/50 text-gray-400')}`}>
                                    {deed.icon}
                                </div>
                                <span className={`font-bold text-sm transition-all ${deed.completed
                                    ? (theme === 'dark' ? 'text-emerald-400 opacity-70' : 'text-emerald-600 opacity-70')
                                    : (theme === 'dark' ? 'text-white' : 'text-accent-900')
                                    }`}>
                                    {deed.name}
                                </span>
                            </div>
                            {deed.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-scale-in" />
                            ) : (
                                <Circle className={`w-5 h-5 transition-colors ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'} group-hover/deed:text-primary-500`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Daily Motivation */}
                <div className={`pt-4 border-t flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                    <Heart className="w-3 h-3 text-red-500 fill-current" />
                    <span>تقبل الله منا ومنكم صالح الأعمال</span>
                </div>
            </div>
        </div>
    );
}
