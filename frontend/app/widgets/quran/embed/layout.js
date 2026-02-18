/**
 * Metadata for the Quran widget embed page.
 * noindex = true: this is an iframe embed, not a standalone page for search engines.
 * The oEmbed link lets Notion auto-detect this as embeddable.
 */
import { siteConfig } from '../../../../lib/seo';

export const metadata = {
    title: 'ودجت آية اليوم - عرب نوشن',
    description: 'ودجت آية اليوم القرآنية القابل للتضمين في نوشن.',
    robots: { index: false, follow: false },
    metadataBase: new URL(siteConfig.url),
    alternates: {
        types: {
            'application/json+oembed': `${siteConfig.url}/api/oembed?url=${siteConfig.url}/widgets/quran/embed`,
        },
    },
};

export default function QuranEmbedLayout({ children }) {
    return children;
}
