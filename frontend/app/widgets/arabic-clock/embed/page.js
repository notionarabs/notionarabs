'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ArabicClockWidget from '../../../../components/widgets/ArabicClockWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function ArabicClockEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('arabic-clock', searchParams.get('theme') || 'auto');

    const config = {
        theme,
        font: searchParams.get('font') || 'reem-kufi',
        showSeconds: searchParams.get('showSeconds') !== 'false',
        useArabicDigits: searchParams.get('useArabicDigits') !== 'false',
        hour12: searchParams.get('hour12') !== 'false',
        city: searchParams.get('city') || '',
        showHijri: searchParams.get('showHijri') !== 'false',
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <ArabicClockWidget {...config} />
        </div>
    );
}

export default function ArabicClockEmbedPage() {
    return (
        <Suspense fallback={null}>
            <ArabicClockEmbedContent />
        </Suspense>
    );
}
