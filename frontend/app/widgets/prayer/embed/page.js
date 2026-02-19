'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import PrayerWidget from '../../../../components/widgets/PrayerWidget';

function PrayerEmbedContent() {
    const searchParams = useSearchParams();
    const themeParam = searchParams.get('theme'); // 'dark', 'light', or null/auto

    // Auto-detect system/browser dark-light preference (Notion follows the OS)
    const [systemTheme, setSystemTheme] = useState('dark');

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mq.matches ? 'dark' : 'light');
        const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);

        // Track usage
        const trackUsage = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.notionarabs.com';
                await fetch(`${apiUrl}/api/widgets/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ widgetId: 'prayer' })
                });
            } catch (err) {
                // Ignore tracking errors
                console.error('Tracking error:', err);
            }
        };
        trackUsage();

        return () => mq.removeEventListener('change', handler);
    }, []);

    // Manual URL param overrides auto-detect; everything else falls back to system
    const theme = (themeParam === 'dark' || themeParam === 'light') ? themeParam : systemTheme;

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        city: searchParams.get('city') || 'Riyadh',
        method: parseInt(searchParams.get('method') || '4')
    };

    const bg = theme === 'dark' ? '#191919' : '#ffffff';

    return (
        <div
            className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden"
            style={{ backgroundColor: bg }}
        >
            <PrayerWidget {...config} />
        </div>
    );
}

export default function PrayerEmbed() {
    return (
        <Suspense fallback={null}>
            <PrayerEmbedContent />
        </Suspense>
    );
}
