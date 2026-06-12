'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import QuranWidget from '../../../../components/widgets/QuranWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function QuranEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('quran', searchParams.get('theme'));

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        showTranslation: searchParams.get('showTranslation') !== 'false',
        translationLang: searchParams.get('translationLang') || 'en.pickthall',
        reciter: searchParams.get('reciter') || 'ar.alafasy',
        showControls: searchParams.get('showControls') !== 'false'
    };

    return (
        <div className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent">
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
