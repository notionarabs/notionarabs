'use client';

import { useSearchParams } from 'next/navigation';
import SmallDeedsWidget from '../../../../components/widgets/SmallDeedsWidget';
import { Suspense, useEffect, useState } from 'react';

function SmallDeedsEmbedContent() {
    const searchParams = useSearchParams();

    const config = {
        theme: searchParams.get('theme') || 'dark',
        font: searchParams.get('font') || 'tajawal'
    };

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
                    body: JSON.stringify({ widgetId: 'small-deeds' })
                });
            } catch (err) {
                console.warn('Tracking failed:', err);
            }
        };
        trackUsage();

        return () => mq.removeEventListener('change', handler);
    }, []);

    const activeTheme = config.theme === 'auto' ? systemTheme : config.theme;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <SmallDeedsWidget
                {...config}
                theme={activeTheme}
            />
        </div>
    );
}

export default function SmallDeedsEmbed() {
    return (
        <Suspense fallback={null}>
            <SmallDeedsEmbedContent />
        </Suspense>
    );
}
