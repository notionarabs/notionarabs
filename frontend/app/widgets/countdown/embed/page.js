'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CountdownWidget from '../../../../components/widgets/CountdownWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function CountdownEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('countdown', searchParams.get('theme'));

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        targetDate: searchParams.get('targetDate') || '2026-03-20T00:00:00',
        title: searchParams.get('title') || 'عيد الفطر المبارك',
        color: searchParams.get('color') || '#f5631e',
        id: 'countdown'
    };

    return (
        <div className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent">
            <CountdownWidget {...config} />
        </div>
    );
}

export default function CountdownEmbed() {
    return (
        <Suspense fallback={null}>
            <CountdownEmbedContent />
        </Suspense>
    );
}
