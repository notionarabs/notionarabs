'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PrayerWidget from '../../../../components/widgets/PrayerWidget';

function PrayerEmbedContent() {
    const searchParams = useSearchParams();

    // Convert search params to config object
    const config = {
        theme: searchParams.get('theme') || 'dark',
        font: searchParams.get('font') || 'tajawal',
        city: searchParams.get('city') || 'Riyadh',
        method: parseInt(searchParams.get('method') || '4')
    };

    return <PrayerWidget {...config} />;
}

export default function PrayerEmbed() {
    return (
        <Suspense fallback={null}>
            <div className="w-full h-screen flex items-center justify-center p-2 bg-transparent overflow-hidden">
                <PrayerEmbedContent />
            </div>
        </Suspense>
    );
}
