'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import AthkarWidget from '../../../../components/widgets/AthkarWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function AthkarEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('athkar', searchParams.get('theme'));

    // Athkar embed requires a transparent body background
    useEffect(() => {
        document.body.style.backgroundColor = 'transparent';
    }, []);

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        initialMode: searchParams.get('mode') || 'auto'
    };

    return (
        <div className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent">
            <AthkarWidget {...config} />
        </div>
    );
}

export default function AthkarEmbed() {
    return (
        <Suspense fallback={null}>
            <AthkarEmbedContent />
        </Suspense>
    );
}
