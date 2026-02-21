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
        description: 'ودجت نوشن مجاني يعرض مواقيت الصلاة الخمس والتاريخ الهجري لمدينتك تلقائياً بتنسيق عصري واحترافي.',
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
    countdown: {
        title: 'ودجت العداد التنازلي الذكي لنوشن',
        description: 'ودجت نوشن مجاني لإنشاء عداد تنازلي لمناسباتك الخاصة. خصّص التاريخ، الخط، والألوان وانسخ رابط التضمين.',
        keywords: [
            'ودجت عداد تنازلي',
            'countdown widget notion',
            'عداد تنازلي نوشن',
            'تضمين عداد تنازلي',
            'notion countdown embed',
            'ودجت إنتاجية نوشن',
        ],
    },
};

import { getApiUrl } from '../../../lib/apiConfig';

// generateMetadata is called by Next.js with the route params
// Next.js 15: params is a Promise and must be awaited before accessing properties
export async function generateMetadata({ params }) {
    const { id } = await params;
    const seo = WIDGET_SEO[id];

    // Fetch widget data to get the dynamic screenshot image
    let imageUrl = undefined;
    try {
        const url = getApiUrl('/widgets');
        // Fetch with a short revalidation time so screenshots update, but we don't spam the API
        const res = await fetch(url, { next: { revalidate: 300 } });
        const data = await res.json();

        if (data.success && data.widgets) {
            const widget = data.widgets.find(w => w.id === id);
            if (widget && widget.image) {
                imageUrl = widget.image;
            }
        }
    } catch (error) {
        console.error('Failed to fetch widget image for SEO:', error);
    }

    if (!seo) {
        return gen({
            title: 'ودجت نوشن',
            description: 'ودجت قابل للتضمين في نوشن.',
            url: `/widgets/${id}`,
            image: imageUrl,
        });
    }
    return gen({
        title: seo.title,
        description: seo.description,
        url: `/widgets/${id}`,
        keywords: seo.keywords,
        image: imageUrl,
    });
}

export default function WidgetDetailPage() {
    return <WidgetDetailClient />;
}
