'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import QuranWidget from '../../../../components/widgets/QuranWidget';

function QuranEmbedContent() {
    const searchParams = useSearchParams();
    const themeParam = searchParams.get('theme'); // 'dark', 'light', or null/auto

    // Auto-detect system/browser dark-light preference (Notion follows the OS)
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
                    body: JSON.stringify({ widgetId: 'quran' })
                });
            } catch (err) {
                // Ignore tracking errors to not affect user experience
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
        showTranslation: searchParams.get('showTranslation') !== 'false',
        translationLang: searchParams.get('translationLang') || 'en.pickthall',
        reciter: searchParams.get('reciter') || 'ar.alafasy',
        showControls: searchParams.get('showControls') !== 'false'
    };

    const bg = theme === 'dark' ? '#191919' : '#ffffff';

    return (
        <div
            className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden"
            style={{ backgroundColor: bg }}
        >
            <QuranWidget {...config} />
        </div>
    );
}

export default function QuranEmbed() {
    return (
        <Suspense fallback={null}>
            <QuranEmbedContent />
        </Suspense>
    );
}
