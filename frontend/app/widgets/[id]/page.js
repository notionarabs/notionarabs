import { generateMetadata as gen } from '../../../lib/seo';
import WidgetDetailClient from './WidgetDetailClient';

// Per-widget SEO data (mirrors WIDGET_DATA in the client component)
const WIDGET_SEO = {
    'arabic-clock': {
        title: 'ودجت ساعة الخط العربي لنوشن',
        description: 'ودجت نوشن مجاني يعرض الوقت والتاريخ بأجمل الخطوط العربية الفنية. خصّص المظهر، نوع الخط، وشكل الأرقام وانسخ رابط التضمين.',
        keywords: [
            'ساعة عربية نوشن',
            'arabic clock widget notion',
            'ساعة الخط العربي',
            'تضمين ساعة نوشن',
            'ودجت جمالي نوشن',
            'notion arabic clock embed',
            'خطوط عربية نوشن',
        ],
    },
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
    athkar: {
        title: 'ودجت أذكار الصباح والمساء لنوشن',
        description: 'ودجت نوشن مجاني يعرض أذكار الصباح والمساء تلقائياً مع عداد تفاعلي لمتابعة التسبيح. خصّص المظهر والخط بسهولة.',
        keywords: [
            'أذكار الصباح والمساء نوشن',
            'athkar widget notion',
            'ودجت أذكار',
            'تضمين أذكار نوشن',
            'عداد تسبيح نوشن',
            'notion athkar embed',
        ],
    },
    pomodoro: {
        title: 'ودجت مؤقت البومودورو لنوشن',
        description: 'ودجت نوشن لزيادة الإنتاجية باستخدام تقنية البومودورو. مؤقت بسيط وأنيق للتركيز والراحة قابل للتخصيص بالكامل.',
        keywords: [
            'مؤقت بومودورو نوشن',
            'pomodoro widget notion',
            'مؤقت تركيز نوشن',
            'تضمين بومودورو',
            'notion focus timer',
            'ودجت إنتاجية نوشن',
        ],
    },
    hadith: {
        title: 'ودجت حديث اليوم الشريف لنوشن',
        description: 'ودجت نوشن يعرض حديثاً نبوياً شريفاً متجدداً كل يوم مع الترجمة والتخريج. أضف لمسة إيمانية لصفحتك في نوشن.',
        keywords: [
            'حديث اليوم نوشن',
            'hadith widget notion',
            'أحاديث نبوية نوشن',
            'تضمين حديث شريف',
            'ودجت إسلامي نوشن',
            'daily hadith notion',
        ],
    },
    'habit-tracker': {
        title: 'ودجت متتبع العادات التفاعلي لنوشن',
        description: 'ودجت نوشن مجاني لتتبع عاداتك اليومية وتحقيق أهدافك. أضف عاداتك، تابع تقدمك، وحافظ على استمراريتك بتصميم أنيق.',
        keywords: [
            'متتبع عادات نوشن',
            'habit tracker notion',
            'ودجت عادات',
            'تضمين متتبع عادات',
            'إنتاجية نوشن',
            'notion habits embed',
        ],
    },
    'cultural-timer': {
        title: 'مؤقت الأجواء الثقافية لنوشن - Pomodoro',
        description: 'ودجت نوشن مجاني يجمع بين مؤقت بومودورو وأصوات محيطية عربية (مطر، رياح، هدوء). زِد إنتاجيتك بجو ثقافي مميز.',
        keywords: [
            'مؤقت بومودورو نوشن',
            'ambient noise notion',
            'أصوات محيطية نوشن',
            'cultural ambient timer',
            'مؤقت تركيز مع صوت',
            'notion productivity widget',
        ],
    },
    weather: {
        title: 'ودجت الطقس البسيط لنوشن - Minimal Weather',
        description: 'ودجت طقس مجاني لنوشن يكتشف موقعك تلقائياً ويعرض درجات الحرارة بدقة مع توقعات الأيام القادمة وتصاميم عصرية.',
        keywords: [
            'ودجت طقس نوشن',
            'weather widget notion',
            'الطقس في نوشن',
            'تضمين الطقس مجاناً',
            'notion weather embed',
            'ودجت جمالي نوشن',
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

import { Suspense } from 'react';

export default function WidgetDetailPage() {
    return (
        <Suspense fallback={null}>
            <WidgetDetailClient />
        </Suspense>
    );
}
