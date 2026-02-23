'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ArabicHeaderWidget from '../../../../components/widgets/ArabicHeaderWidget';

function HeaderEmbedContent() {
    const searchParams = useSearchParams();

    // Extract settings from URL
    const text = searchParams.get('text') || 'عرب نوشن';
    const font = searchParams.get('font') || 'tajawal';
    const color = searchParams.get('color') || '#f5631e';
    const fontSize = searchParams.get('fontSize') || '48px';
    const textAlign = searchParams.get('textAlign') || 'center';
    const fontWeight = searchParams.get('fontWeight') || '700';

    return (
        <div className="w-full h-screen flex items-center justify-center bg-transparent">
            <ArabicHeaderWidget
                text={text}
                font={font}
                color={color}
                fontSize={fontSize}
                textAlign={textAlign}
                fontWeight={fontWeight}
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
