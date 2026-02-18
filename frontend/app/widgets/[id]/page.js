import { generateMetadata as gen } from '../../../lib/seo';
import WidgetDetailClient from './WidgetDetailClient';

// Per-widget SEO data (mirrors WIDGET_DATA in the client component)
const WIDGET_SEO = {
    quran: {
        title: 'ودجت آية اليوم الذكية لنوشن',
        description: 'ودجت نوشن مجاني يعرض آية قرآنية جديدة كل يوم مع ترجمة إنجليزية وتشغيل صوتي. خصّص الخط والثيم وانسخ رابط التضمين في ثانية.',
        keywords: [
            'ودجت آية اليوم',
            'quran widget notion',
            'آية قرآنية نوشن',
            'تضمين قرآن نوشن',
            'ودجت قرآن',
            'notion quran embed',
            'آية اليوم الذكية',
            'ودجت إسلامي نوشن',
        ],
    },
    prayer: {
        title: 'ودجت مواقيت الصلاة لنوشن',
        description: 'ودجت نوشن مجاني يعرض مواقيت الصلاة الخمس والتاريخ الهجري لمدينتك تلقائياً. سهل التضمين وقابل للتخصيص.',
        keywords: [
            'مواقيت الصلاة نوشن',
            'prayer times notion widget',
            'ودجت صلاة',
            'تضمين مواقيت الصلاة',
            'التاريخ الهجري نوشن',
            'notion prayer embed',
            'ودجت إسلامي نوشن',
        ],
    },
};

// generateMetadata is called by Next.js with the route params
// Next.js 15: params is a Promise and must be awaited before accessing properties
export async function generateMetadata({ params }) {
    const { id } = await params;
    const seo = WIDGET_SEO[id];
    if (!seo) {
        return gen({
            title: 'ودجت نوشن',
            description: 'ودجت قابل للتضمين في نوشن.',
            url: `/widgets/${id}`,
        });
    }
    return gen({
        title: seo.title,
        description: seo.description,
        url: `/widgets/${id}`,
        keywords: seo.keywords,
    });
}

export default function WidgetDetailPage() {
    return <WidgetDetailClient />;
}
