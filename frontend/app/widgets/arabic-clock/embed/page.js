'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ArabicClockWidget from '../../../../components/widgets/ArabicClockWidget';

function ArabicClockEmbedContent() {
    const searchParams = useSearchParams();

    const config = {
        theme: searchParams.get('theme') || 'auto',
        font: searchParams.get('font') || 'reem-kufi',
        showSeconds: searchParams.get('showSeconds') !== 'false',
        useArabicDigits: searchParams.get('useArabicDigits') !== 'false',
        hour12: searchParams.get('hour12') !== 'false',
        city: searchParams.get('city') || '',
        showHijri: searchParams.get('showHijri') !== 'false',
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
                    body: JSON.stringify({ widgetId: 'arabic-clock' })
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
            <ArabicClockWidget {...config} theme={resolvedTheme} />
        </div>
    );
}

export default function ArabicClockEmbedPage() {
    return (
        <Suspense fallback={null}>
            <ArabicClockEmbedContent />
        </Suspense>
    );
}
