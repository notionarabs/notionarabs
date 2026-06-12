'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ArabicHeaderWidget from '../../../../components/widgets/ArabicHeaderWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function HeaderEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('arabic-header', searchParams.get('theme'));

    return (
        <div className="w-full h-screen flex items-center justify-center bg-transparent">
            <ArabicHeaderWidget
                text={searchParams.get('text') || 'عرب نوشن'}
                font={searchParams.get('font') || 'tajawal'}
                color={searchParams.get('color') || '#f5631e'}
                fontSize={searchParams.get('fontSize') || '48px'}
                textAlign={searchParams.get('textAlign') || 'center'}
                fontWeight={searchParams.get('fontWeight') || '700'}
                theme={theme}
            />
        </div>
    );
}

export default function ArabicHeaderEmbedPage() {
    return (
        <Suspense fallback={null}>
            <HeaderEmbedContent />
        </Suspense>
    );
}
