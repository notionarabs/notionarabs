'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import QuranWidget from '../../../../components/widgets/QuranWidget';

function QuranEmbedContent() {
    const searchParams = useSearchParams();

    // Convert search params to config object
    const config = {
        theme: searchParams.get('theme') || 'dark',
        font: searchParams.get('font') || 'tajawal',
        showTranslation: searchParams.get('showTranslation') !== 'false',
        translationLang: searchParams.get('translationLang') || 'en.pickthall',
        reciter: searchParams.get('reciter') || 'ar.alafasy'
    };

    return <QuranWidget {...config} />;
}

export default function QuranEmbed() {
    return (
        <Suspense fallback={null}>
            <div className="w-full h-screen flex items-center justify-center p-2 bg-transparent overflow-hidden">
                <QuranEmbedContent />
            </div>
        </Suspense>
    );
}
