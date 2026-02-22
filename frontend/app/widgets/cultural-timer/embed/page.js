'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CulturalTimerWidget from '../../../../components/widgets/CulturalTimerWidget';

function CulturalTimerEmbedContent() {
    const searchParams = useSearchParams();

    const config = {
        theme: searchParams.get('theme') || 'auto',
        font: searchParams.get('font') || 'tajawal',
        pomodoroTime: parseInt(searchParams.get('pomodoroTime')) || 25,
        shortBreakTime: parseInt(searchParams.get('shortBreakTime')) || 5,
        longBreakTime: parseInt(searchParams.get('longBreakTime')) || 15,
        initialAmbient: searchParams.get('initialAmbient') || 'none',
    };

    // System theme detection
    const [systemTheme, setSystemTheme] = typeof window !== 'undefined'
        ? [window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light']
        : ['dark'];

    const resolvedTheme = config.theme === 'auto' ? systemTheme : config.theme;

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${resolvedTheme === 'dark' ? 'bg-[#191919]' : 'bg-transparent'}`}>
            <CulturalTimerWidget {...config} theme={resolvedTheme} />
        </div>
    );
}

export default function CulturalTimerEmbedPage() {
    return (
        <Suspense fallback={null}>
            <CulturalTimerEmbedContent />
        </Suspense>
    );
}
