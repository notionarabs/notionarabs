'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import HadithWidget from '../../../../components/widgets/HadithWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function HadithEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('hadith', searchParams.get('theme'));

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        showTranslation: searchParams.get('showTranslation') === 'true',
    };

    return (
        <div className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent">
            <HadithWidget {...config} />
        </div>
    );
}

export default function HadithEmbed() {
    return (
        <Suspense fallback={null}>
            <HadithEmbedContent />
        </Suspense>
    );
}
