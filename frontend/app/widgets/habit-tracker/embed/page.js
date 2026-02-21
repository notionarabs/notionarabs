'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HabitTrackerWidget from '../../../../components/widgets/HabitTrackerWidget';
import { useEffect } from 'react';
import { siteConfig } from '../../../../lib/seo';

function HabitTrackerEmbedContent() {
    const searchParams = useSearchParams();

    // URL parameters for customization
    const theme = searchParams.get('theme') || 'dark';
    const font = searchParams.get('font') || 'tajawal';
    const habits = searchParams.get('habits');

    // Track widget usage (client-side only)
    useEffect(() => {
        const trackUsage = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.notionarabs.com/api';
                const apiUrl = base.endsWith('/api') ? base.slice(0, -4) : base;

                await fetch(`${apiUrl}/api/widgets/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ widgetId: 'habit-tracker' }),
                });
            } catch (err) {
                console.warn('Usage tracking failed:', err);
            }
        };
        trackUsage();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <HabitTrackerWidget
                theme={theme}
                font={font}
                habitsParam={habits || undefined}
            />
        </div>
    );
}

export default function HabitTrackerEmbedPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary-500">جاري التحميل...</div>}>
            <HabitTrackerEmbedContent />
        </Suspense>
    );
}
