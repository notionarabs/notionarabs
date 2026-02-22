'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Wind, CloudRain, Library, Coffee, Sparkles } from 'lucide-react';

const AMBIENT_SOUNDS = {
    'none': { id: 'none', label: 'بدون صوت', icon: <VolumeX className="w-4 h-4" />, url: null },
    'andalusia-garden': {
        id: 'andalusia-garden',
        label: 'نسمات أندلسية',
        icon: <CloudRain className="w-4 h-4" />,
        url: 'https://assets.mixkit.co/active_storage/sfx/1244/1244-preview.mp3', // Long Nature Loop (~10min)
        color: 'from-emerald-400/20 to-teal-500/20'
    },
    'desert-calm': {
        id: 'desert-calm',
        label: 'هدوء الصحراء',
        icon: <Wind className="w-4 h-4" />,
        url: 'https://assets.mixkit.co/active_storage/sfx/1247/1247-preview.mp3', // Long Desert Wind (~10min)
        color: 'from-amber-400/20 to-orange-500/20'
    },
    'damascus-rain': {
        id: 'damascus-rain',
        label: 'مطر دمشقي',
        icon: <CloudRain className="w-4 h-4" />,
        url: 'https://assets.mixkit.co/active_storage/sfx/2474/2474-preview.mp3', // Long Rain Atmosphere (~2.5min)
        color: 'from-blue-400/20 to-indigo-500/20'
    },
    'baghdad-library': {
        id: 'baghdad-library',
        label: 'مكتبة الحكمة',
        icon: <Library className="w-4 h-4" />,
        url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', // Archive/Library Ambience (~1min)
        color: 'from-indigo-400/10 to-stone-500/20'
    }
};

export default function CulturalTimerWidget({
    theme = 'dark',
    font = 'tajawal',
    pomodoroTime = 25,
    shortBreakTime = 5,
    longBreakTime = 15,
    initialAmbient = 'none',
    id = 'cultural-timer'
}) {
    const [mode, setMode] = useState('pomodoro'); // pomodoro, short, long
    const [timeLeft, setTimeLeft] = useState(pomodoroTime * 60);
    const [isActive, setIsActive] = useState(false);
    const [activeAmbient, setActiveAmbient] = useState(initialAmbient);
    const [ambientVolume, setAmbientVolume] = useState(0.5);
    const [showSettings, setShowSettings] = useState(false);

    const ambientAudioRef = useRef(null);
    const timerRef = useRef(null);
    const alarmAudioRef = useRef(null);

    // Initial load and duration updates
    useEffect(() => {
        const minutes = mode === 'pomodoro' ? pomodoroTime : mode === 'short' ? shortBreakTime : longBreakTime;
        setTimeLeft(minutes * 60);
        setIsActive(false);
    }, [mode, pomodoroTime, shortBreakTime, longBreakTime]);

    // Timer Logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    // Ambient Audio management
    useEffect(() => {
        if (activeAmbient === 'none') {
            if (ambientAudioRef.current) {
                ambientAudioRef.current.pause();
                ambientAudioRef.current = null;
            }
            return;
        }

        const sound = AMBIENT_SOUNDS[activeAmbient];
        if (!sound?.url) return;

        if (!ambientAudioRef.current) {
            ambientAudioRef.current = new Audio(sound.url);
            ambientAudioRef.current.loop = true;
        } else if (ambientAudioRef.current.src !== sound.url) {
            ambientAudioRef.current.pause();
            ambientAudioRef.current.src = sound.url;
            ambientAudioRef.current.load();
        }

        ambientAudioRef.current.volume = ambientVolume;

        if (isActive) {
            ambientAudioRef.current.play().catch(e => {
                console.warn('Ambient play failed in effect:', e);
            });
        } else {
            ambientAudioRef.current.pause();
        }
    }, [activeAmbient, ambientVolume, isActive]);

    const handleTimerComplete = () => {
        setIsActive(false);
        if (ambientAudioRef.current) ambientAudioRef.current.pause();

        // Play alarm
        if (!alarmAudioRef.current) {
            alarmAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        }
        alarmAudioRef.current.play().catch(() => { });
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
        // Browser requires direct user interaction for audio.play()
        if (!isActive && activeAmbient !== 'none' && ambientAudioRef.current) {
            ambientAudioRef.current.play().catch(() => { });
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        const minutes = mode === 'pomodoro' ? pomodoroTime : mode === 'short' ? shortBreakTime : longBreakTime;
        setTimeLeft(minutes * 60);
        if (ambientAudioRef.current) ambientAudioRef.current.pause();
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa',
        'reem-kufi': 'font-reem-kufi',
        'aref-ruqaa': 'font-aref-ruqaa'
    };

    const progress = (timeLeft / ((mode === 'pomodoro' ? pomodoroTime : mode === 'short' ? shortBreakTime : longBreakTime) * 60)) * 100;

    return (
        <div className={`w-full max-w-sm p-8 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 ${fontClasses[font] || 'font-tajawal'} ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-white/5 shadow-2xl'
            : 'bg-white text-accent-900 border border-gray-100 shadow-xl'
            }`} dir="rtl">

            {/* Background Sound Indicator */}
            <div className={`absolute inset-0 bg-gradient-to-br ${AMBIENT_SOUNDS[activeAmbient]?.color || 'from-transparent to-transparent'} opacity-10 transition-all duration-700`}></div>

            <div className="relative z-10 flex flex-col items-center space-y-8">
                {/* Mode Selector */}
                <div className="flex bg-gray-500/5 p-1 rounded-2xl w-full backdrop-blur-sm">
                    {['pomodoro', 'short', 'long'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === m
                                ? 'bg-primary-500 text-white shadow-lg'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                        >
                            {m === 'pomodoro' ? 'تركيز' : m === 'short' ? 'راحة قصيرة' : 'راحة طويلة'}
                        </button>
                    ))}
                </div>

                {/* Timer Display with Ring */}
                <div className="relative w-56 h-56 flex items-center justify-center group">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="112"
                            cy="112"
                            r="100"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-gray-500/10"
                        />
                        <circle
                            cx="112"
                            cy="112"
                            r="100"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={628}
                            strokeDashoffset={628 - (628 * (100 - progress)) / 100}
                            strokeLinecap="round"
                            className="text-primary-500 transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-6xl font-black tracking-tighter tabular-nums drop-shadow-sm">
                            {formatTime(timeLeft)}
                        </span>
                        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                            <Sparkles className={`w-3 h-3 text-primary-500 ${isActive ? 'animate-pulse' : ''}`} />
                            {mode === 'pomodoro' ? 'وقت الإنجاز' : 'وقت الاستكنان'}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={resetTimer}
                        className="p-4 rounded-full bg-gray-500/5 hover:bg-gray-500/10 text-gray-400 border border-white/5 transition-all"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={toggleTimer}
                        className="w-20 h-20 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                    >
                        {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-4 rounded-full border transition-all ${showSettings
                            ? 'bg-primary-500/10 border-primary-500/20 text-primary-500'
                            : 'bg-gray-500/5 border-white/5 text-gray-400'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                {/* Soundscapes Grid */}
                <div className="w-full space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            الخلفية الصوتية
                            <Volume2 className="w-3 h-3 text-primary-500" />
                        </h4>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={ambientVolume}
                                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                                className="w-16 h-1 bg-gray-500/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                        {Object.values(AMBIENT_SOUNDS).map((sound) => (
                            <button
                                key={sound.id}
                                onClick={() => {
                                    setActiveAmbient(sound.id);
                                    // Trigger immediate play on click if active
                                    if (isActive && sound.id !== 'none' && ambientAudioRef.current) {
                                        // Slight delay ensures the effect has set the new src
                                        setTimeout(() => {
                                            ambientAudioRef.current?.play().catch(() => { });
                                        }, 50);
                                    }
                                }}
                                className={`flex flex-col items-center p-2 rounded-xl transition-all border ${activeAmbient === sound.id
                                    ? 'bg-primary-500/10 border-primary-500/30 text-primary-500 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]'
                                    : 'bg-gray-500/5 border-transparent text-gray-400 hover:bg-gray-500/10'
                                    }`}
                            >
                                {sound.icon}
                                <span className="text-[8px] font-bold mt-1 truncate w-full text-center">{sound.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
