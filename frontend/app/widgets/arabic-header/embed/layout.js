/**
 * Metadata for the Arabic Header widget embed page.
 */
import { siteConfig } from '../../../../lib/seo';

export const metadata = {
    title: 'ودجت العناوين الفنية',
    description: 'ودجت العناوين الفنية بالخط العربي القابل للتضمين في نوشن.',
    robots: { index: false, follow: false },
    metadataBase: new URL(siteConfig.url),
    alternates: {
        types: {
            'application/json+oembed': `${siteConfig.url}/api/oembed?url=${siteConfig.url}/widgets/arabic-header/embed`,
        },
    },
};

export default function ArabicHeaderEmbedLayout({ children }) {
    return children;
}
