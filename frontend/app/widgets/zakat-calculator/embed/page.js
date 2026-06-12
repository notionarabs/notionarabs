'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ZakatCalculatorWidget from '../../../../components/widgets/ZakatCalculatorWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function ZakatCalculatorEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('zakat-calculator', searchParams.get('theme'));

    const config = {
        theme,
        font: searchParams.get('font') || 'tajawal',
        currency: searchParams.get('currency') || 'USD',
        defaultNisab: parseFloat(searchParams.get('nisab')) || 5000,
        showSadaqah: searchParams.get('showSadaqah') !== 'false'
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent">
            <ZakatCalculatorWidget {...config} />
        </div>
    );
}

export default function ZakatCalculatorEmbed() {
    return (
        <Suspense fallback={null}>
            <ZakatCalculatorEmbedContent />
        </Suspense>
    );
}
