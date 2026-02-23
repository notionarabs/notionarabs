'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import WeatherWidget from '../../../../components/widgets/WeatherWidget';

function WeatherEmbedContent() {
    const searchParams = useSearchParams();

    const config = {
        theme: searchParams.get('theme') || 'auto',
        font: searchParams.get('font') || 'tajawal',
        city: searchParams.get('city') || '',
        unit: searchParams.get('unit') || 'celsius',
        showForecast: searchParams.get('showForecast') !== 'false',
    };

    // Auto-detect system/browser dark-light preference
    const [systemTheme, setSystemTheme] = useState('dark');

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mq.matches ? 'dark' : 'light');
        const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);

        // Usage Tracking
        const trackUsage = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.notionarabs.com/api';
                const apiUrl = base.endsWith('/api') ? base.slice(0, -4) : base;
                await fetch(`${apiUrl}/api/widgets/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ widgetId: 'weather' })
                });
            } catch (err) {
                console.warn('Tracking failed:', err);
            }
        };
        trackUsage();

        return () => mq.removeEventListener('change', handler);
    }, []);

    const resolvedTheme = config.theme === 'auto' ? systemTheme : config.theme;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <WeatherWidget {...config} theme={resolvedTheme} />
        </div>
    );
}

export default function WeatherEmbedPage() {
    return (
        <Suspense fallback={null}>
            <WeatherEmbedContent />
        </Suspense>
    );
}
