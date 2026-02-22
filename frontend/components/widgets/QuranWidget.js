'use client';

import { useState, useEffect, useRef } from 'react';
import { Book, RefreshCw, Settings, Play, Pause, ChevronRight, ChevronLeft, Repeat, Repeat1, Infinity, Music2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AyahMarker = ({ number }) => (
    <span className="inline-flex items-center justify-center relative mx-2 align-middle select-none translate-y-[-1px]">
        <svg width="36" height="36" viewBox="0 0 100 100" className="opacity-40 dark:opacity-30 fill-primary-500 absolute">
            <path d="M50 0 C 55 15, 65 15, 85 15 C 85 35, 85 45, 100 50 C 85 55, 85 65, 85 85 C 65 85, 55 85, 50 100 C 45 85, 35 85, 15 85 C 15 65, 15 55, 0 50 C 15 45, 15 35, 15 15 C 35 15, 45 15, 50 0" />
            <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        </svg>
        <span className="relative z-10 text-[10px] md:text-[11px] font-bold text-primary-700 dark:text-primary-300 font-sans mt-[1px]">
            {number}
        </span>
    </span>
);

const AudioVisualizer = ({ isPlaying, theme }) => (
    <div className="flex items-end gap-[2px] h-3 ml-2">
        {[1, 2, 3, 4].map((i) => (
            <motion.div
                key={i}
                animate={{
                    height: isPlaying ? [4, 12, 6, 12, 4] : 4
                }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                }}
                className={`w-[2.5px] rounded-full ${theme === 'dark' ? 'bg-primary-400' : 'bg-primary-500'}`}
            />
        ))}
    </div>
);

export default function QuranWidget({
    theme = 'dark',
    font = 'tajawal',
    showTranslation = true,
    translationLang = 'en.pickthall',
    reciter = 'ar.alafasy',
    showControls = true,
    id = 'quran'
}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [currentAyahId, setCurrentAyahId] = useState(null);
    const [playbackMode, setPlaybackMode] = useState('off'); // 'off', 'repeat', 'continuous'
    const [autoStartNext, setAutoStartNext] = useState(false);
    const audioRef = useRef(null);
    const playbackModeRef = useRef(playbackMode);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        playbackModeRef.current = playbackMode;
    }, [playbackMode]);

    const [editUrl, setEditUrl] = useState('#');

    useEffect(() => {
        setMounted(true);
        const randomAyah = Math.floor(Math.random() * 6236) + 1;
        setCurrentAyahId(randomAyah);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setEditUrl(`${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}&showTranslation=${showTranslation}&reciter=${reciter}&showControls=${showControls}`);
        }
    }, [id, theme, font, showTranslation, reciter, showControls]);

    const fetchAyah = async (ayahId) => {
        try {
            setLoading(true);

            // Stop any currently playing audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setIsPlaying(false);
            setIsAudioLoading(false);

            // Fetch all 3 editions: Arabic text, translation, and audio
            const res = await fetch(
                `/api/quran/ayah?ayah=${ayahId}&editions=quran-simple,${translationLang},${reciter}`
            );
            const result = await res.json();

            if (result.code === 200) {
                const ayahData = result.data[0];
                const translationData = result.data[1];
                const audioData = result.data[2];

                const surahNum = ayahData.surah.number;
                const ayahNum = ayahData.numberInSurah;

                const paddedSurah = surahNum.toString().padStart(3, '0');
                const paddedAyah = ayahNum.toString().padStart(3, '0');

                const reciterMap = {
                    'ar.alafasy': 'Alafasy_128kbps',
                    'ar.minshawi': 'Minshawy_Mujawwad_192kbps',
                    'ar.abdulsamad': 'AbdulSamad_64kbps_QuranExplorer.Com',
                    'ar.husary': 'Husary_128kbps'
                };

                const everyAyahFolder = reciterMap[reciter] || 'Alafasy_128kbps';
                const everyAyahUrl = `https://everyayah.com/data/${everyAyahFolder}/${paddedSurah}${paddedAyah}.mp3`;

                let mainAudio = audioData?.audio;
                if (mainAudio && mainAudio.startsWith('http:')) {
                    mainAudio = mainAudio.replace('http:', 'https:');
                }

                const cdnAudio = `https://cdn.islamic.network/quran/audio/128/${reciter}/${ayahId}.mp3`;

                const cleanArabic = (text) => {
                    if (!text) return '';
                    return text
                        .replace(/[\u06D6-\u06ED]/g, '') // Remove Uthmani markers
                        .replace(/\u06E1/g, '') // Remove small high dotless head of khah (sukoon in Uthmani)
                        .replace(/\u06E8/g, '') // Remove small high noon
                        .replace(/\u06DF/g, '') // Remove small high rounded zero
                        .replace(/\u06E0/g, '') // Remove small high upright rectangular zero
                        .replace(/\u06E2/g, '') // Remove small high meem isolation
                        .replace(/\u06E3/g, '') // Remove small low seen
                        .replace(/\u06E4/g, '') // Remove small high maddah
                        .replace(/\u06E7/g, '') // Remove small high yeh
                        .replace(/\u06E9/g, '') // Remove Arabic place of sajdah
                        .replace(/\u06EA/g, '') // Remove Arabic empty centre low stop
                        .replace(/\u06EB/g, '') // Remove Arabic empty centre high stop
                        .replace(/ {2,}/g, ' ') // Remove extra spaces
                        .trim();
                };

                setData({
                    id: ayahId,
                    arabic: cleanArabic(ayahData.text),
                    translation: translationData.text,
                    audio: everyAyahUrl,
                    fallbacks: [mainAudio, cdnAudio].filter(Boolean),
                    surah: cleanArabic(ayahData.surah.name),
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

    useEffect(() => {
        if (currentAyahId) {
            fetchAyah(currentAyahId);
        }
    }, [currentAyahId, translationLang, reciter]);

    useEffect(() => {
        if (!loading && autoStartNext && data && data.id === currentAyahId) {
            toggleAudio(true);
            setAutoStartNext(false);
        }
    }, [loading, data, autoStartNext, currentAyahId]);

    const nextAyah = () => {
        setCurrentAyahId(prev => (prev >= 6236 ? 1 : prev + 1));
    };

    const prevAyah = () => {
        setCurrentAyahId(prev => (prev <= 1 ? 6236 : prev - 1));
    };

    const toggleAudio = (autoStart = true) => {
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
            if (playbackModeRef.current === 'repeat') {
                toggleAudio(true);
            } else if (playbackModeRef.current === 'continuous') {
                setAutoStartNext(true);
                nextAyah();
            }
        };
        newAudio.onpause = () => setIsPlaying(false);

        let fallbackIdx = 0;
        newAudio.onerror = () => {
            setIsAudioLoading(true);
            if (data.fallbacks && fallbackIdx < data.fallbacks.length) {
                const nextUrl = data.fallbacks[fallbackIdx];
                fallbackIdx++;
                newAudio.src = nextUrl;
                newAudio.load();
                newAudio.play().catch(() => { });
            } else {
                setIsPlaying(false);
                setIsAudioLoading(false);
            }
        };

        audioRef.current = newAudio;
        if (autoStart) {
            newAudio.play().catch(err => {
                console.warn('Initial play failed:', err);
            });
            setIsPlaying(true);
        }
    };

    const handleShare = async () => {
        if (!data) return;
        const text = `${data.arabic}\n\n${data.translation}\n\n— ${data.surah} (${data.ayahNumber})`;
        const url = `https://notionarabs.com/widgets/quran?ayah=${data.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'آية من القرآن الكريم',
                    text: text,
                    url: url,
                });
            } catch (e) {
                console.log('Share error', e);
            }
        } else {
            navigator.clipboard.writeText(`${text}\n\n${url}`);
            alert('تم نسخ رابط وتفاصيل الآية');
        }
    };



    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa'
    };

    if (!mounted) return <div className={`w-full min-h-[400px] rounded-[2rem] animate-pulse ${theme === 'dark' ? 'bg-[#191919]' : 'bg-gray-50'}`}></div>;

    return (
        <div className={`w-full p-8 rounded-[2rem] transition-all duration-500 relative group overflow-hidden ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-[#2f2f2f]'
            : 'bg-white text-accent-900 border border-gray-100 shadow-xl'
            }`}>
            {/* Background Decorations */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary-500/10 transition-colors duration-1000"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary-500/10 transition-colors duration-1000"></div>

            {/* Loading Bar */}
            {loading && (
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent z-[60]"
                />
            )}

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

            <div className="flex flex-col items-center text-center space-y-6 relative z-10" dir="rtl">
                <div className="flex items-center justify-between w-full mb-2 px-10">
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/10 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Book className="w-3 h-3" />
                        <span>آية اليوم</span>
                    </div>
                    {showControls && (
                        <button
                            onClick={() => setCurrentAyahId(Math.floor(Math.random() * 6236) + 1)}
                            className="p-1.5 rounded-lg hover:bg-primary-500/10 text-gray-400 hover:text-primary-500 transition-all active:scale-95"
                            title="آية عشوائية"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-500' : ''}`} />
                        </button>
                    )}
                </div>

                <div className="min-h-[160px] flex items-center justify-center w-full relative">
                    <AnimatePresence mode="wait">
                        {!data && loading ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4 w-full"
                            >
                                <div className="h-8 bg-gray-200 dark:bg-white/5 rounded-full w-3/4 mx-auto animate-pulse"></div>
                                <div className="h-8 bg-gray-200 dark:bg-white/5 rounded-full w-1/2 mx-auto animate-pulse delay-75"></div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={data?.id || 'empty'}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{
                                    opacity: loading ? 0.5 : 1,
                                    scale: 1,
                                    y: 0,
                                    filter: loading ? 'blur(4px)' : 'blur(0px)'
                                }}
                                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full transition-all duration-300"
                            >
                                <h2 className={`text-2xl md:text-4xl font-bold leading-[1.8] md:leading-[2.2] ${fontClasses[font]}`}>
                                    {data?.arabic}
                                    {data && <AyahMarker number={data.ayahNumber} />}
                                </h2>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {showTranslation && (
                    <div className="min-h-[60px] w-full">
                        <AnimatePresence mode="wait">
                            {data && (
                                <motion.p
                                    key={data.id + '_translation'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: loading ? 0.4 : 1 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                    className="text-sm md:text-base text-gray-500 dark:text-dark-text-secondary italic max-w-lg leading-relaxed border-t border-gray-100 dark:border-dark-card-border pt-6 mx-auto"
                                    dir="ltr"
                                >
                                    &ldquo;{data.translation}&rdquo;
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div className={`w-full pt-4 border-t border-gray-100 dark:border-dark-card-border ${showControls ? 'flex flex-col items-center gap-6' : 'flex items-center justify-center gap-6'}`}>
                    {showControls ? (
                        <>
                            {/* New Fancy Controls */}
                            <div className="flex items-center justify-center gap-4 sm:gap-8">
                                {/* Playback Mode Toggle */}
                                <button
                                    onClick={() => {
                                        const modes = ['off', 'repeat', 'continuous'];
                                        const nextIdx = (modes.indexOf(playbackMode) + 1) % modes.length;
                                        setPlaybackMode(modes[nextIdx]);
                                    }}
                                    className={`p-3 rounded-full transition-all duration-300 ${playbackMode !== 'off'
                                        ? 'bg-emerald-500/10 text-emerald-500 shadow-sm'
                                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                    title={
                                        playbackMode === 'off' ? 'تشغيل التكرار أو التشغيل المستمر' :
                                            playbackMode === 'repeat' ? 'تكرار نفس الآية' : 'تشغيل السورة كاملة'
                                    }
                                >
                                    {playbackMode === 'repeat' ? (
                                        <Repeat1 className="w-5 h-5 animate-pulse" />
                                    ) : playbackMode === 'continuous' ? (
                                        <Infinity className="w-5 h-5 animate-pulse" />
                                    ) : (
                                        <Repeat className="w-5 h-5" />
                                    )}
                                </button>

                                <div className="flex items-center gap-4">
                                    {/* Previous Ayah */}
                                    <button
                                        onClick={prevAyah}
                                        className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-primary-500 hover:bg-primary-500/10 transition-all active:scale-90"
                                        title="الآية السابقة"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>

                                    {/* Play/Pause */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleAudio()}
                                        disabled={isAudioLoading && !isPlaying}
                                        className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 relative shadow-xl ${isPlaying
                                            ? 'bg-primary-500 text-white shadow-primary-500/40'
                                            : 'bg-white dark:bg-white/10 text-primary-500 border border-gray-100 dark:border-white/5 hover:border-primary-500/30'
                                            } ${isAudioLoading ? 'cursor-wait opacity-80' : ''}`}
                                    >
                                        {isAudioLoading && (
                                            <div className="absolute inset-0 rounded-3xl border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
                                        )}

                                        {isPlaying ? (
                                            <Pause className="w-8 h-8 fill-current" />
                                        ) : (
                                            <Play className="w-8 h-8 fill-current" />
                                        )}
                                    </motion.button>

                                    {/* Next Ayah */}
                                    <button
                                        onClick={nextAyah}
                                        className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-primary-500 hover:bg-primary-500/10 transition-all active:scale-90"
                                        title="الآية التالية"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Share Button */}
                                <div className="hidden sm:block">
                                    <button
                                        onClick={handleShare}
                                        className="p-3 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                                        title="مشاركة الآية"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Metadata below for new style */}
                            {!loading && data && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center backdrop-blur-sm bg-gray-50/50 dark:bg-white/5 px-6 py-4 rounded-2xl border border-gray-100/50 dark:border-white/5 hover:border-primary-500/20 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3 text-sm font-black text-primary-600 dark:text-primary-400">
                                        <Book className="w-3.5 h-3.5 opacity-60" />
                                        <span>{data.surah}</span>
                                        <div className="w-1.5 h-1.5 bg-primary-500/20 rounded-full"></div>
                                        <span className="font-sans">آية {data.ayahNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <AudioVisualizer isPlaying={isPlaying} theme={theme} />
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <Music2 className="w-2.5 h-2.5" />
                                            {reciter.replace('ar.', '')}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Original Layout Style */}
                            <button
                                onClick={() => toggleAudio()}
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

                                {isPlaying ? (
                                    <Pause className="w-6 h-6 fill-current" />
                                ) : (
                                    <Play className="w-6 h-6 fill-current" />
                                )}
                            </button>

                            <div className="text-right">
                                <div className="flex items-center gap-2 text-sm font-bold text-primary-500">
                                    <span>{data?.surah}</span>
                                    <div className="w-1 h-1 bg-gray-300 dark:bg-white/10 rounded-full"></div>
                                    <span>آية {data?.ayahNumber}</span>
                                </div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                    {reciter.replace('ar.', '')}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
