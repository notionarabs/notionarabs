'use client';

import { useState, useEffect } from 'react';

/**
 * Shared setup hook for all widget embed pages.
 * Handles system theme detection and usage tracking so each embed
 * page doesn't repeat 25 lines of identical boilerplate.
 *
 * @param {string} widgetId - Sent to the tracking endpoint (e.g. 'prayer', 'weather')
 * @param {string|null} themeParam - Raw theme value from URL (?theme=dark|light|auto|null)
 * @returns {{ resolvedTheme: 'dark'|'light' }}
 */
export function useEmbedSetup(widgetId, themeParam) {
    const [systemTheme, setSystemTheme] = useState('dark');

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mq.matches ? 'dark' : 'light');
        const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);

        const base = process.env.NEXT_PUBLIC_API_URL || 'https://api.notionarabs.com/api';
        const apiUrl = base.endsWith('/api') ? base.slice(0, -4) : base;
        fetch(`${apiUrl}/api/widgets/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ widgetId })
        }).catch(() => {});

        return () => mq.removeEventListener('change', handler);
    }, [widgetId]);

    // 'dark' / 'light' params are explicit overrides; everything else (null, 'auto') falls back to OS
    const resolvedTheme = (themeParam === 'dark' || themeParam === 'light') ? themeParam : systemTheme;

    return { resolvedTheme };
}
