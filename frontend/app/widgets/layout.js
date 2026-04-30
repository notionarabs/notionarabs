/**
 * Shared layout + base SEO metadata for all /widgets/* pages.
 * Individual pages override `title` and `description` via their own metadata exports.
 * The oEmbed discovery <link> lets Notion and other platforms identify embeddable pages.
 */
import { generateMetadata } from '../../lib/seo';

export const metadata = generateMetadata({
    title: 'الأدوات',
    description: 'مجموعة من الأدوات والودجتس المصممة خصيصاً للمستخدم العربي، تشمل ودجت آية اليوم القرآنية ومواقيت الصلاة، قابلة للتضمين في نوشن مباشرةً.',
    url: '/widgets',
    keywords: [
        'ودجت نوشن',
        'widget notion',
        'notion widget arabic',
        'أدوات نوشن',
        'آية اليوم',
        'مواقيت الصلاة',
        'ودجت إسلامي',
        'notion embed',
        'تضمين نوشن',
    ],
});

// oEmbed discovery — platforms like Notion read this to auto-detect embeddable pages
export default function WidgetLayout({ children }) {
    return children;
}
