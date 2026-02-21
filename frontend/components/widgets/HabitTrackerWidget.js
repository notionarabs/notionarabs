'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Settings, Trophy, Flame, Calendar as CalendarIcon } from 'lucide-react';

export default function HabitTrackerWidget({
    theme = 'dark',
    font = 'tajawal',
    habitsParam = 'قراءة القرآن,الرياضة,شرب الماء,مراجعة الدروس',
    id = 'habit-tracker',
    persistenceKey = 'na_habits_'
}) {
    const [habits, setHabits] = useState([]);
    const [editUrl, setEditUrl] = useState('#');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initialize habits from URL params if none in localStorage
        const initialHabits = habitsParam.split(',').map(h => ({
            id: Math.random().toString(36).substr(2, 9),
            name: h.trim(),
            completed: false
        }));

        const saved = localStorage.getItem(`${persistenceKey}${id}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Check if it's the same day. If not, reset completion.
                const lastUsed = localStorage.getItem(`${persistenceKey}${id}_date`);
                const today = new Date().toDateString();

                if (lastUsed !== today) {
                    setHabits(parsed.map(h => ({ ...h, completed: false })));
                    localStorage.setItem(`${persistenceKey}${id}_date`, today);
                } else {
                    setHabits(parsed);
                }
            } catch (e) {
                setHabits(initialHabits);
            }
        } else {
            setHabits(initialHabits);
            localStorage.setItem(`${persistenceKey}${id}_date`, new Date().toDateString());
        }
    }, [habitsParam, id]);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem(`${persistenceKey}${id}`, JSON.stringify(habits));
        }
    }, [habits, mounted, id]);

    useEffect(() => {
        setEditUrl(`${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}&habits=${encodeURIComponent(habits.map(h => h.name).join(','))}`);
    }, [id, theme, font, habits]);

    const [isAdding, setIsAdding] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');

    const toggleHabit = (habitId) => {
        setHabits(habits.map(h => h.id === habitId ? { ...h, completed: !h.completed } : h));
    };

    const handleAddHabit = (e) => {
        if (e) e.preventDefault();
        if (newHabitName && newHabitName.trim()) {
            setHabits([...habits, { id: Math.random().toString(36).substr(2, 9), name: newHabitName.trim(), completed: false }]);
            setNewHabitName('');
            setIsAdding(false);
        }
    };

    const deleteHabit = (e, habitId) => {
        e.stopPropagation();
        setHabits(habits.filter(h => h.id !== habitId));
    };

    const completedCount = habits.filter(h => h.completed).length;
    const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa'
    };

    if (!mounted) return null;

    return (
        <div className={`w-full max-w-md p-8 rounded-[2.5rem] transition-all duration-500 relative group overflow-hidden ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-[#2f2f2f]'
            : 'bg-white text-accent-900 border border-gray-100 shadow-soft'
            }`} dir="rtl">

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

            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${fontClasses[font]}`}>متتبع العادات</h2>
                            <p className="text-xs text-gray-400 font-medium">خطتك لليوم، ابدأ الآن</p>
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-black text-primary-500">{completedCount}/{habits.length}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">مكتمل</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">الإنجاز اليومي</span>
                        <span className="text-sm font-black text-primary-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Habits List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {habits.map((habit) => (
                        <div
                            key={habit.id}
                            onClick={() => toggleHabit(habit.id)}
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 transform active:scale-95 group/habit ${habit.completed
                                ? 'bg-primary-500/10 border border-primary-500/20'
                                : 'bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {habit.completed ? (
                                    <CheckCircle2 className="w-6 h-6 text-primary-500 animate-scale-in" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                )}
                                <span className={`font-bold transition-all ${habit.completed ? 'text-primary-600 dark:text-primary-400 line-through opacity-70' : 'text-accent-900 dark:text-white'}`}>
                                    {habit.name}
                                </span>
                            </div>
                            <button
                                onClick={(e) => deleteHabit(e, habit.id)}
                                className="p-2 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover/habit:opacity-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {isAdding && (
                        <form onSubmit={handleAddHabit} className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={newHabitName}
                                onChange={(e) => setNewHabitName(e.target.value)}
                                placeholder="اسم العادة الجديدة..."
                                className={`flex-1 p-4 rounded-2xl border-2 transition-all outline-none ${theme === 'dark'
                                        ? 'bg-white/5 border-white/10 focus:border-primary-500/50 text-white'
                                        : 'bg-gray-50 border-gray-100 focus:border-primary-500/50 text-accent-900'
                                    }`}
                                onBlur={() => !newHabitName && setIsAdding(false)}
                            />
                            <button
                                type="submit"
                                className="bg-primary-500 text-white p-4 rounded-2xl hover:bg-primary-600 transition-all shadow-lg active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>
                    )}

                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5 text-gray-400 hover:text-primary-500 hover:border-primary-500/30 transition-all flex items-center justify-center gap-2 group/add"
                        >
                            <Plus className="w-5 h-5 group-hover/add:rotate-90 transition-transform" />
                            <span className="text-sm font-bold">إضافة عادة جديدة</span>
                        </button>
                    )}
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-dark-card-border">
                    <div className="flex items-center gap-2 text-gray-400">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date().toLocaleDateString('ar-SA', { weekday: 'long' })}</span>
                    </div>
                    {progress === 100 && (
                        <div className="flex items-center gap-1.5 text-orange-500 animate-pulse">
                            <Flame className="w-4 h-4 fill-current" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">يوم مثالي!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Decorations */}
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
    );
}
