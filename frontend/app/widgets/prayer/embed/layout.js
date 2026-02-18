/**
 * Metadata for the Prayer widget embed page.
 * noindex = true: this is an iframe embed, not a standalone page for search engines.
 * The oEmbed link lets Notion auto-detect this as embeddable.
 */
import { siteConfig } from '../../../../lib/seo';

export const metadata = {
    title: 'ودجت مواقيت الصلاة - عرب نوشن',
    description: 'ودجت مواقيت الصلاة القابل للتضمين في نوشن.',
    robots: { index: false, follow: false },
    metadataBase: new URL(siteConfig.url),
    alternates: {
        types: {
            'application/json+oembed': `${siteConfig.url}/api/oembed?url=${siteConfig.url}/widgets/prayer/embed`,
        },
    },
};

export default function PrayerEmbedLayout({ children }) {
    return children;
}
