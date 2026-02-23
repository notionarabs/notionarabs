'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import CountdownWidget from '../../../../components/widgets/CountdownWidget';

function CountdownEmbedContent() {
    const searchParams = useSearchParams();
    const themeParam = searchParams.get('theme'); // 'dark', 'light', or null/auto

    // Auto-detect system/browser dark-light preference
    const [systemTheme, setSystemTheme] = useState('dark');

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mq.matches ? 'dark' : 'light');
        const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);

        const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.notionarabs.com/api';
        const apiUrl = base.endsWith('/api') ? base.slice(0, -4) : base;

        // Track usage
        const trackUsage = async () => {
            try {
                await fetch(`${apiUrl}/api/widgets/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ widgetId: 'countdown' })
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
        targetDate: searchParams.get('targetDate') || '2026-03-20T00:00:00',
        title: searchParams.get('title') || 'عيد الفطر المبارك',
        color: searchParams.get('color') || '#f5631e',
        id: 'countdown'
    };

    return (
        <div
            className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent"
        >
            <CountdownWidget {...config} />
        </div>
    );
}

export default function CountdownEmbed() {
    return (
        <Suspense fallback={null}>
            <CountdownEmbedContent />
        </Suspense>
    );
}
