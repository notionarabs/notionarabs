'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import ZakatCalculatorWidget from '../../../../components/widgets/ZakatCalculatorWidget';

function ZakatCalculatorEmbedContent() {
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

        // Track usage
        const trackUsage = async () => {
            try {
                await fetch(`${apiUrl}/api/widgets/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ widgetId: 'zakat-calculator' })
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
        currency: searchParams.get('currency') || 'USD',
        defaultNisab: parseFloat(searchParams.get('nisab')) || 5000,
        showSadaqah: searchParams.get('showSadaqah') !== 'false'
    };

    const bg = theme === 'dark' ? '#191919' : '#ffffff';

    return (
        <div
            className="w-full min-h-screen flex items-center justify-center px-4 py-6 overflow-hidden"
            style={{ backgroundColor: bg }}
        >
            <ZakatCalculatorWidget {...config} />
        </div>
    );
}

export default function ZakatCalculatorEmbed() {
    return (
        <Suspense fallback={null}>
            <ZakatCalculatorEmbedContent />
        </Suspense>
    );
}
