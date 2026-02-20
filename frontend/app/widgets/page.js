import { generateMetadata } from '../../lib/seo';
import WidgetsClient from './WidgetsClient';

export const metadata = generateMetadata({
    title: 'الأدوات',
    description: 'اكتشف مجموعة ودجتس نوشن العربية المجانية: ودجت آية اليوم القرآنية ومواقيت الصلاة. قابلة للتضمين في أي صفحة نوشن بسطر واحد.',
    url: '/widgets',
    keywords: [
        'ودجت نوشن عربي',
        'notion widget',
        'آية اليوم',
        'مواقيت الصلاة',
        'ودجت إسلامي',
        'notion embed arabic',
        'أدوات نوشن',
        'تضمين نوشن',
        'إضافات نوشن',
    ],
});

export default function WidgetsPage() {
    return <WidgetsClient />;
}
