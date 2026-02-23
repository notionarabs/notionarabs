'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import ArabicHeaderWidget from '../../../../components/widgets/ArabicHeaderWidget';

function HeaderEmbedContent() {
    const searchParams = useSearchParams();

    // Extract settings from URL
    const text = searchParams.get('text') || 'عرب نوشن';
    const font = searchParams.get('font') || 'tajawal';
    const color = searchParams.get('color') || '#f5631e';
    const fontSize = searchParams.get('fontSize') || '48px';
    const textAlign = searchParams.get('textAlign') || 'center';
    const fontWeight = searchParams.get('fontWeight') || '700';

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
                    body: JSON.stringify({ widgetId: 'arabic-header' })
                });
            } catch (err) {
                console.warn('Tracking failed:', err);
            }
        };
        trackUsage();

        return () => mq.removeEventListener('change', handler);
    }, []);

    const themeParam = searchParams.get('theme');
    const theme = (themeParam === 'dark' || themeParam === 'light') ? themeParam : systemTheme;

    return (
        <div className="w-full h-screen flex items-center justify-center bg-transparent">
            <ArabicHeaderWidget
                text={text}
                font={font}
                color={color}
                fontSize={fontSize}
                textAlign={textAlign}
                fontWeight={fontWeight}
                theme={theme}
            />
        </div>
    );
}

export default function ArabicHeaderEmbedPage() {
    return (
        <Suspense fallback={null}>
            <HeaderEmbedContent />
        </Suspense>
    );
}
