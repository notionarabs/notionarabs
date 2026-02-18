'use client';

import { useSearchParams } from 'next/navigation';
import PrayerWidget from '../../../../components/widgets/PrayerWidget';

export default function PrayerEmbed() {
    const searchParams = useSearchParams();

    // Convert search params to config object
    const config = {
        theme: searchParams.get('theme') || 'dark',
        font: searchParams.get('font') || 'tajawal',
        city: searchParams.get('city') || 'Riyadh',
        method: parseInt(searchParams.get('method') || '4')
    };

    return (
        <div className="w-full h-screen flex items-center justify-center p-2 bg-transparent overflow-hidden">
            <PrayerWidget {...config} />
        </div>
    );
}
