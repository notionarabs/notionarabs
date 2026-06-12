'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CulturalTimerWidget from '../../../../components/widgets/CulturalTimerWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function CulturalTimerEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('cultural-timer', searchParams.get('theme') || 'auto');

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        pomodoroTime: parseInt(searchParams.get('pomodoroTime')) || 25,
        shortBreakTime: parseInt(searchParams.get('shortBreakTime')) || 5,
        longBreakTime: parseInt(searchParams.get('longBreakTime')) || 15,
        initialAmbient: searchParams.get('initialAmbient') || 'none',
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <CulturalTimerWidget {...config} />
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
