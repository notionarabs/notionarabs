'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import HabitTrackerWidget from '../../../../components/widgets/HabitTrackerWidget';
import { useEmbedSetup } from '../../../../hooks/useEmbedSetup';

function HabitTrackerEmbedContent() {
    const searchParams = useSearchParams();
    const { resolvedTheme: theme } = useEmbedSetup('habit-tracker', searchParams.get('theme'));

    return (
        <div className="w-full h-screen flex items-center justify-center px-4 py-6 overflow-hidden bg-transparent">
            <HabitTrackerWidget
                theme={theme}
                font={searchParams.get('font') || 'tajawal'}
            />
        </div>
    );
}

export default function HabitTrackerEmbedPage() {
    return (
        <Suspense fallback={null}>
            <HabitTrackerEmbedContent />
        </Suspense>
    );
}
