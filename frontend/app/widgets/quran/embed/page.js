'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import QuranWidget from '../../../../components/widgets/QuranWidget';

function QuranEmbedContent() {
    const searchParams = useSearchParams();

    const config = {
        theme: searchParams.get('theme') || 'dark',
        font: searchParams.get('font') || 'tajawal',
        showTranslation: searchParams.get('showTranslation') !== 'false',
        translationLang: searchParams.get('translationLang') || 'en.pickthall',
        reciter: searchParams.get('reciter') || 'ar.alafasy'
    };

    // Match Notion's exact background colors for seamless embedding
    const bg = config.theme === 'dark' ? '#191919' : '#ffffff';

    return (
        <div
            className="w-full h-screen flex items-center justify-center p-2 overflow-hidden"
            style={{ backgroundColor: bg }}
        >
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

