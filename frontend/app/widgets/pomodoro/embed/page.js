'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import PomodoroWidget from '../../../../components/widgets/PomodoroWidget';

function PomodoroEmbedContent() {
    const searchParams = useSearchParams();
    const themeParam = searchParams.get('theme');

    const [systemTheme, setSystemTheme] = useState('dark');

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mq.matches ? 'dark' : 'light');
        const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);

        const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.notionarabs.com/api';
        const apiUrl = base.endsWith('/api') ? base.slice(0, -4) : base;

        const trackUsage = async () => {
            try {
                await fetch(`${apiUrl}/api/widgets/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ widgetId: 'pomodoro' })
                });
            } catch (err) {
                console.error('Tracking error:', err);
            }
        };
        trackUsage();

        return () => mq.removeEventListener('change', handler);
    }, []);

    const theme = (themeParam === 'dark' || themeParam === 'light') ? themeParam : systemTheme;

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        pomodoroTime: parseInt(searchParams.get('pomodoroTime') || '25'),
        shortBreakTime: parseInt(searchParams.get('shortBreakTime') || '5'),
        longBreakTime: parseInt(searchParams.get('longBreakTime') || '15'),
    };

    return (
        <div
            className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent"
        >
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
