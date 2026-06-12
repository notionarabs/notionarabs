'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PomodoroWidget from '../../../../components/widgets/PomodoroWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function PomodoroEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('pomodoro', searchParams.get('theme'));

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        pomodoroTime: parseInt(searchParams.get('pomodoroTime') || '25'),
        shortBreakTime: parseInt(searchParams.get('shortBreakTime') || '5'),
        longBreakTime: parseInt(searchParams.get('longBreakTime') || '15'),
    };

    return (
        <div className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent">
            <PomodoroWidget {...config} />
        </div>
    );
}

export default function PomodoroEmbed() {
    return (
        <Suspense fallback={null}>
            <PomodoroEmbedContent />
        </Suspense>
    );
}
