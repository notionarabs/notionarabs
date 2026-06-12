'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import SmallDeedsWidget from '../../../../components/widgets/SmallDeedsWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function SmallDeedsEmbedContent() {
    const searchParams = useSearchParams();
    // Default to 'dark' (not 'auto') — small-deeds widget is dark-first
    const { resolvedTheme: theme } = useEmbedSetup('small-deeds', searchParams.get('theme') || 'dark');

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <SmallDeedsWidget
                theme={theme}
                font={searchParams.get('font') || 'tajawal'}
            />
        </div>
    );
}

export default function SmallDeedsEmbed() {
    return (
        <Suspense fallback={null}>
            <SmallDeedsEmbedContent />
        </Suspense>
    );
}
