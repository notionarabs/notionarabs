'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import HabitTrackerWidget from '../../../../components/widgets/HabitTrackerWidget';
import { siteConfig } from '../../../../lib/seo';

function HabitTrackerEmbedContent() {
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

        // Track widget usage
        const trackUsage = async () => {
            try {
                await fetch(`${apiUrl}/api/widgets/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ widgetId: 'habit-tracker' }),
                });
            } catch (err) {
                console.warn('Usage tracking failed:', err);
            }
        };
        trackUsage();

        return () => mq.removeEventListener('change', handler);
    }, []);

    const theme = (themeParam === 'dark' || themeParam === 'light') ? themeParam : systemTheme;

    return (
        <div
            className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent"
        >
            <HabitTrackerWidget
                theme={theme}
                font={searchParams.get('font') || 'tajawal'}
            />
        </div>
    );
}

export default function HabitTrackerEmbedPage() {
    return (
        <Suspense fallback={null}>
            <HabitTrackerEmbedContent />
        </Suspense>
    );
}

