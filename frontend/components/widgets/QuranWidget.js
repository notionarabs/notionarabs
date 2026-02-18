'use client';

import { useState, useEffect } from 'react';
import { Book, RefreshCw, Languages, Type, Settings, Play, Pause, Volume2 } from 'lucide-react';

export default function QuranWidget({
    theme = 'dark',
    font = 'tajawal',
    showTranslation = true,
    translationLang = 'en.pickthall',
    reciter = 'ar.alafasy',
    id = 'quran'
}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState(null);

    const editUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}&showTranslation=${showTranslation}&reciter=${reciter}`
        : '#';

    useEffect(() => {
        const fetchAyah = async () => {
            try {
                setLoading(true);
                const randomAyah = Math.floor(Math.random() * 6236) + 1;
                const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/editions/quran-uthmani,${translationLang},${reciter}`);
                const result = await res.json();
                if (result.code === 200) {
                    setData({
                        arabic: result.data[0].text,
                        translation: result.data[1].text,
                        audio: result.data[2].audio,
                        surah: result.data[0].surah.name,
                        ayahNumber: result.data[0].numberInSurah
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAyah();
    }, [translationLang, reciter]);

    useEffect(() => {
        // Stop and clear audio whenever data changes (reciter or new ayah)
        if (audio) {
            audio.pause();
            setAudio(null);
            setIsPlaying(false);
        }
    }, [data?.audio]);

    const toggleAudio = () => {
        if (!data?.audio) return;

        if (!audio) {
            const newAudio = new Audio(data.audio);
            newAudio.onended = () => setIsPlaying(false);
            newAudio.play().catch(err => console.error("Audio play failed:", err));
            setAudio(newAudio);
            setIsPlaying(true);
        } else {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                audio.play().catch(err => console.error("Audio play failed:", err));
                setIsPlaying(true);
            }
        }
    };

    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa'
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
    );

    return (
        <div className={`w-full p-8 rounded-[2rem] transition-all duration-500 relative group overflow-hidden ${theme === 'dark' ? 'bg-[#191919] text-white border border-[#2f2f2f]' : 'bg-white text-accent-900 border border-gray-100 shadow-xl'
            }`}>
            {/* Edit Button - Option 1 */}
            <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 left-4 p-2 rounded-full bg-gray-500/10 hover:bg-primary-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-50 text-gray-400"
                title="تعديل الودجت"
            >
                <Settings className="w-4 h-4" />
            </a>

            <div className="flex flex-col items-center text-center space-y-6" dir="rtl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 text-primary-600 rounded-full text-xs font-bold mb-2">
                    <Book className="w-3 h-3" />
                    <span>آية اليوم</span>
                </div>

                <h2 className={`text-2xl md:text-3xl font-bold leading-[1.6] md:leading-[1.9] ${fontClasses[font]}`}>
                    {data?.arabic}
                </h2>

                {showTranslation && (
                    <p className="text-sm md:text-base text-gray-500 dark:text-dark-text-secondary italic max-w-lg leading-relaxed border-t border-gray-100 dark:border-dark-card-border pt-6" dir="ltr">
                        "{data?.translation}"
                    </p>
                )}

                <div className="flex items-center justify-center gap-6 w-full pt-4 border-t border-gray-100 dark:border-dark-card-border">
                    <button
                        onClick={toggleAudio}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying
                            ? 'bg-primary-500 text-white shadow-lg glow'
                            : 'bg-primary-50 text-primary-500 hover:bg-primary-500 hover:text-white'
                            }`}
                        title={isPlaying ? 'إيقاف' : 'استماع'}
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>

                    <div className="text-right">
                        <div className="flex items-center gap-2 text-sm font-bold text-primary-500">
                            <span>{data?.surah}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>آية {data?.ayahNumber}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            {reciter.replace('ar.', '')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
