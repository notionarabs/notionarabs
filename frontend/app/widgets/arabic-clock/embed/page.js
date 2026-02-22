'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ArabicClockWidget from '../../../../components/widgets/ArabicClockWidget';

function ArabicClockEmbedContent() {
    const searchParams = useSearchParams();

    const config = {
        theme: searchParams.get('theme') || 'auto',
        font: searchParams.get('font') || 'reem-kufi',
        showSeconds: searchParams.get('showSeconds') !== 'false',
        useArabicDigits: searchParams.get('useArabicDigits') !== 'false',
    };

    // System theme detection for 'auto'
    const [systemTheme, setSystemTheme] = typeof window !== 'undefined'
        ? [window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light']
        : ['dark'];

    const resolvedTheme = config.theme === 'auto' ? systemTheme : config.theme;

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${resolvedTheme === 'dark' ? 'bg-[#191919]' : 'bg-transparent'}`}>
            <ArabicClockWidget {...config} theme={resolvedTheme} />
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
