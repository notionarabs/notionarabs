'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PrayerWidget from '../../../../components/widgets/PrayerWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function PrayerEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('prayer', searchParams.get('theme'));

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        city: searchParams.get('city') || 'Riyadh',
        method: parseInt(searchParams.get('method') || '4')
    };

    return (
        <div className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent">
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
