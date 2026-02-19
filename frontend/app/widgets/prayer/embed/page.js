'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PrayerWidget from '../../../../components/widgets/PrayerWidget';

function PrayerEmbedContent() {
    const searchParams = useSearchParams();

    const config = {
        theme: searchParams.get('theme') || 'dark',
        font: searchParams.get('font') || 'tajawal',
        city: searchParams.get('city') || 'Riyadh',
        method: parseInt(searchParams.get('method') || '4')
    };

    // Match Notion's exact background colors for seamless embedding
    const bg = config.theme === 'dark' ? '#191919' : '#ffffff';

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

