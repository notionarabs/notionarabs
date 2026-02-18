'use client';

import { useSearchParams } from 'next/navigation';
import QuranWidget from '../../../../components/widgets/QuranWidget';

export default function QuranEmbed() {
    const searchParams = useSearchParams();

    // Convert search params to config object
    const config = {
        theme: searchParams.get('theme') || 'dark',
        font: searchParams.get('font') || 'tajawal',
        showTranslation: searchParams.get('showTranslation') !== 'false',
        translationLang: searchParams.get('translationLang') || 'en.pickthall',
        reciter: searchParams.get('reciter') || 'ar.alafasy'
    };

    return (
        <div className="w-full h-screen flex items-center justify-center p-2 bg-transparent overflow-hidden">
            <QuranWidget {...config} />
        </div>
    );
}
