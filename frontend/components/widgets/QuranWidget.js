'use client';

import { useState, useEffect, useRef } from 'react';
import { Book, RefreshCw, Settings, Play, Pause } from 'lucide-react';

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
    const audioRef = useRef(null); // use ref instead of state to avoid re-renders

    const [editUrl, setEditUrl] = useState('#');

    useEffect(() => {
        setEditUrl(`${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}&showTranslation=${showTranslation}&reciter=${reciter}`);
    }, [id, theme, font, showTranslation, reciter]);

    useEffect(() => {
        const fetchAyah = async () => {
            try {
                setLoading(true);

                // Stop any currently playing audio
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
                setIsPlaying(false);

                const randomAyah = Math.floor(Math.random() * 6236) + 1;

                // Fetch all 3 editions: Arabic text, translation, and audio
                const res = await fetch(
                    `/api/quran/ayah?ayah=${randomAyah}&editions=quran-uthmani,${translationLang},${reciter}`
                );
                const result = await res.json();

                if (result.code === 200) {
                    // Use the reliable cdn.islamic.network CDN pattern
                    // The API audio field sometimes points to unavailable hosts, so we always prefer the CDN URL
                    const cdnAudio = `https://cdn.islamic.network/quran/audio/128/${reciter}/${randomAyah}.mp3`;
                    const apiAudio = result.data[2]?.audio;

                    setData({
                        arabic: result.data[0].text,
                        translation: result.data[1].text,
                        audio: cdnAudio,
                        audioFallback: apiAudio || null,
                        surah: result.data[0].surah.name,
                        ayahNumber: result.data[0].numberInSurah,
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAyah();

        // Cleanup on unmount or deps change
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [translationLang, reciter]);

    const toggleAudio = () => {
        if (!data?.audio) return;

        // If already have an audio instance
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(() => { });
                setIsPlaying(true);
            }
            return;
        }

        // Create new audio instance using primary CDN URL
        const newAudio = new Audio(data.audio);
        newAudio.onended = () => setIsPlaying(false);
        newAudio.onpause = () => setIsPlaying(false);
        newAudio.onplay = () => setIsPlaying(true);

        // If primary CDN fails, try the API-provided fallback URL
        newAudio.onerror = () => {
            if (data.audioFallback && newAudio.src !== data.audioFallback) {
                console.warn('Primary audio failed, trying fallback URL');
                newAudio.src = data.audioFallback;
                newAudio.play().catch(() => setIsPlaying(false));
            } else {
                console.warn('All audio sources failed');
                setIsPlaying(false);
            }
        };

        audioRef.current = newAudio;

        newAudio.play().catch(err => {
            console.warn('Audio play failed:', err);
            setIsPlaying(false);
        });
        setIsPlaying(true);
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
        <div className={`w-full p-8 rounded-[2rem] transition-all duration-500 relative group overflow-hidden ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-[#2f2f2f]'
            : 'bg-white text-accent-900 border border-gray-100 shadow-xl'
            }`}>
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
                        &ldquo;{data?.translation}&rdquo;
                    </p>
                )}

                <div className="flex items-center justify-center gap-6 w-full pt-4 border-t border-gray-100 dark:border-dark-card-border">
                    <button
                        onClick={toggleAudio}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying
                            ? 'bg-primary-500 text-white shadow-lg'
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
