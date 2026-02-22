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
    const [isAudioLoading, setIsAudioLoading] = useState(false);
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
                setIsAudioLoading(false);

                const randomAyah = Math.floor(Math.random() * 6236) + 1;

                // Fetch all 3 editions: Arabic text, translation, and audio
                const res = await fetch(
                    `/api/quran/ayah?ayah=${randomAyah}&editions=quran-uthmani,${translationLang},${reciter}`
                );
                const result = await res.json();

                if (result.code === 200) {
                    const ayahData = result.data[0];
                    const translationData = result.data[1];
                    const audioData = result.data[2];

                    const surahNum = ayahData.surah.number;
                    const ayahNum = ayahData.numberInSurah;

                    // Format for EveryAyah: Surah (3 digits) + Ayah (3 digits)
                    const paddedSurah = surahNum.toString().padStart(3, '0');
                    const paddedAyah = ayahNum.toString().padStart(3, '0');

                    // Map common reciter IDs to EveryAyah folder names
                    const reciterMap = {
                        'ar.alafasy': 'Alafasy_128kbps',
                        'ar.minshawi': 'Minshawy_Mujawwad_192kbps',
                        'ar.abdulsamad': 'AbdulSamad_64kbps_QuranExplorer.Com',
                        'ar.husary': 'Husary_128kbps'
                    };

                    const everyAyahFolder = reciterMap[reciter] || 'Alafasy_128kbps';
                    const everyAyahUrl = `https://everyayah.com/data/${everyAyahFolder}/${paddedSurah}${paddedAyah}.mp3`;

                    // Primary from API
                    let mainAudio = audioData?.audio;
                    if (mainAudio && mainAudio.startsWith('http:')) {
                        mainAudio = mainAudio.replace('http:', 'https:');
                    }

                    // Reliable fallback pattern
                    const cdnAudio = `https://cdn.islamic.network/quran/audio/128/${reciter}/${randomAyah}.mp3`;

                    setData({
                        arabic: ayahData.text,
                        translation: translationData.text,
                        audio: everyAyahUrl, // Put EveryAyah first as it's most reliable
                        fallbacks: [mainAudio, cdnAudio].filter(Boolean),
                        surah: ayahData.surah.name,
                        surahNumber: surahNum,
                        ayahNumber: ayahNum,
                    });
                }
            } catch (err) {
                console.error('Quran fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAyah();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [translationLang, reciter]);

    const toggleAudio = () => {
        if (!data?.audio) return;

        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(e => {
                    console.warn('Playback resume failed:', e);
                    setIsPlaying(false);
                    setIsAudioLoading(false);
                });
                setIsPlaying(true);
            }
            return;
        }

        const newAudio = new Audio();
        newAudio.src = data.audio;

        // State listeners
        newAudio.onloadstart = () => setIsAudioLoading(true);
        newAudio.oncanplay = () => setIsAudioLoading(false);
        newAudio.onwaiting = () => setIsAudioLoading(true);
        newAudio.onplaying = () => {
            setIsAudioLoading(false);
            setIsPlaying(true);
        };
        newAudio.onended = () => {
            setIsPlaying(false);
            setIsAudioLoading(false);
        };
        newAudio.onpause = () => setIsPlaying(false);

        let fallbackIdx = 0;
        newAudio.onerror = () => {
            setIsAudioLoading(true); // show loader while switching
            if (data.fallbacks && fallbackIdx < data.fallbacks.length) {
                const nextUrl = data.fallbacks[fallbackIdx];
                fallbackIdx++;
                console.warn(`Audio failed, trying fallback ${fallbackIdx}: ${nextUrl}`);
                newAudio.src = nextUrl;
                newAudio.load();
                newAudio.play().catch(() => { });
            } else {
                console.error('All audio sources failed');
                setIsPlaying(false);
                setIsAudioLoading(false);
            }
        };

        audioRef.current = newAudio;
        newAudio.play().catch(err => {
            console.warn('Initial play failed:', err);
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
                        disabled={isAudioLoading && !isPlaying}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 relative ${isPlaying
                            ? 'bg-primary-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-110'
                            : 'bg-primary-50 text-primary-500 hover:bg-primary-100 hover:scale-105'
                            } ${isAudioLoading ? 'cursor-wait opacity-80' : ''}`}
                        title={isAudioLoading ? 'جاري التحميل...' : isPlaying ? 'إيقاف' : 'استماع'}
                    >
                        {isAudioLoading && (
                            <div className="absolute inset-0 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
                        )}

                        {isAudioLoading && !isPlaying ? (
                            <div className="w-5 h-5 bg-primary-500/20 rounded-full animate-pulse" />
                        ) : isPlaying ? (
                            <Pause className="w-6 h-6 fill-current" />
                        ) : (
                            <Play className="w-6 h-6 fill-current" />
                        )}
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
