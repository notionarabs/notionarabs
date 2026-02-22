'use client';

import { Suspense } from 'react';
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

    // System theme detection for 'auto'
    const [systemTheme, setSystemTheme] = typeof window !== 'undefined'
        ? [window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light']
        : ['dark'];

    const resolvedTheme = config.theme === 'auto' ? systemTheme : config.theme;

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${resolvedTheme === 'dark' ? 'bg-[#191919]' : 'bg-transparent'}`}>
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
