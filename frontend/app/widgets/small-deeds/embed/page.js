'use client';

import { useSearchParams } from 'next/navigation';
import SmallDeedsWidget from '../../../../components/widgets/SmallDeedsWidget';
import { Suspense, useEffect, useState } from 'react';

function SmallDeedsEmbedContent() {
    const searchParams = useSearchParams();

    const config = {
        theme: searchParams.get('theme') || 'dark',
        font: searchParams.get('font') || 'tajawal'
    };

    const [systemTheme, setSystemTheme] = useState('dark');

    useEffect(() => {
        if (config.theme === 'auto') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setSystemTheme(isDark ? 'dark' : 'light');
        }
    }, [config.theme]);

    const activeTheme = config.theme === 'auto' ? systemTheme : config.theme;

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${activeTheme === 'dark' ? 'bg-[#121212]' : 'bg-transparent'
            }`}>
            <SmallDeedsWidget
                {...config}
                theme={activeTheme}
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
