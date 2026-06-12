'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import WeatherWidget from '../../../../components/widgets/WeatherWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function WeatherEmbedContent() {
    const searchParams = useSearchParams();
    // 'auto' falls through to OS theme inside useEmbedSetup
    const { resolvedTheme: theme } = useEmbedSetup('weather', searchParams.get('theme') || 'auto');

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        city: searchParams.get('city') || '',
        unit: searchParams.get('unit') || 'celsius',
        showForecast: searchParams.get('showForecast') !== 'false',
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <WeatherWidget {...config} />
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
