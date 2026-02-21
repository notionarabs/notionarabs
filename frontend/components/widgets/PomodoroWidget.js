'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Settings, Bell, BellOff } from 'lucide-react';

export default function PomodoroWidget({
    theme = 'dark',
    font = 'tajawal',
    pomodoroTime = 25,
    shortBreakTime = 5,
    longBreakTime = 15,
    autoStart = false,
    id = 'pomodoro'
}) {
    const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'short', 'long'
    const [timeLeft, setTimeLeft] = useState(pomodoroTime * 60);
    const [isActive, setIsActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [editUrl, setEditUrl] = useState('#');

    const timerRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        setEditUrl(`${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}&pomodoroTime=${pomodoroTime}&shortBreakTime=${shortBreakTime}&longBreakTime=${longBreakTime}`);
    }, [id, theme, font, pomodoroTime, shortBreakTime, longBreakTime]);

    useEffect(() => {
        resetTimer();
    }, [pomodoroTime, shortBreakTime, longBreakTime, mode]);

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

    const handleTimerComplete = () => {
        setIsActive(false);
        if (!isMuted) {
            playAlarm();
        }
        // Could auto-switch modes here if desired
    };

    const playAlarm = () => {
        const alarm = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        alarm.play().catch(() => { });
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        if (mode === 'pomodoro') setTimeLeft(pomodoroTime * 60);
        else if (mode === 'short') setTimeLeft(shortBreakTime * 60);
        else setTimeLeft(longBreakTime * 60);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateProgress = () => {
        const total = mode === 'pomodoro' ? pomodoroTime * 60 : mode === 'short' ? shortBreakTime * 60 : longBreakTime * 60;
        return ((total - timeLeft) / total) * 100;
    };

    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa'
    };

    const modeColors = {
        pomodoro: 'text-red-500 bg-red-500/10 border-red-500/20',
        short: 'text-green-500 bg-green-500/10 border-green-500/20',
        long: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    };

    const progressColor = mode === 'pomodoro' ? '#ef4444' : mode === 'short' ? '#10b981' : '#3b82f6';

    return (
        <div className={`w-full max-w-sm p-8 rounded-[2.5rem] transition-all duration-500 relative group overflow-hidden ${theme === 'dark'
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

            {/* Mute Toggle */}
            <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-400"
            >
                {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </button>

            <div className="flex flex-col items-center space-y-8">
                {/* Mode Switcher */}
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-full">
                    <button
                        onClick={() => switchMode('pomodoro')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${mode === 'pomodoro' ? 'bg-white dark:bg-[#2f2f2f] text-red-500 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        تركيز
                    </button>
                    <button
                        onClick={() => switchMode('short')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${mode === 'short' ? 'bg-white dark:bg-[#2f2f2f] text-green-500 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        راحة قصيرة
                    </button>
                    <button
                        onClick={() => switchMode('long')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${mode === 'long' ? 'bg-white dark:bg-[#2f2f2f] text-blue-500 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        راحة طويلة
                    </button>
                </div>

                {/* Timer Display with Progress Ring */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-100 dark:text-white/5"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke={progressColor}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={553}
                            strokeDashoffset={553 - (553 * calculateProgress()) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl md:text-5xl font-black tabular-nums tracking-tight ${mode === 'pomodoro' ? 'text-red-500' : mode === 'short' ? 'text-green-500' : 'text-blue-500'}`}>
                            {formatTime(timeLeft)}
                        </span>
                        <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${modeColors[mode]}`}>
                            {mode === 'pomodoro' ? <Zap className="w-3 h-3 inline ml-1" /> : <Coffee className="w-3 h-3 inline ml-1" />}
                            {mode === 'pomodoro' ? 'وقت العمل' : 'وقت الراحة'}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 w-full pt-4">
                    <button
                        onClick={resetTimer}
                        className="p-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all active:scale-90"
                        title="إعادة التعيين"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${isActive
                            ? 'bg-gray-100 dark:bg-white/5 text-gray-500'
                            : mode === 'pomodoro'
                                ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600'
                                : mode === 'short'
                                    ? 'bg-green-500 text-white shadow-green-500/20 hover:bg-green-600'
                                    : 'bg-blue-500 text-white shadow-blue-500/20 hover:bg-blue-600'
                            }`}
                    >
                        {isActive ? (
                            <><Pause className="w-5 h-5 fill-current" /> إيقاف مؤقت</>
                        ) : (
                            <><Play className="w-5 h-5 fill-current" /> ابدأ الآن</>
                        )}
                    </button>
                </div>
            </div>

            {/* Background Decorative Blur */}
            <div className={`absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none transition-colors duration-1000 ${mode === 'pomodoro' ? 'bg-red-500' : mode === 'short' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
        </div>
    );
}
