import { generateMetadata as generateBaseMetadata } from '../../lib/seo';

export const metadata = generateBaseMetadata({
    title: 'المتجر',
    description: 'تصفح أفضل قوالب نوشن العربية. مكتبة ضخمة من الأدوات والنظم لزيادة إنتاجيتك وتنظيم حياتك.',
    url: '/store',
    keywords: [
        'متجر قوالب',
        'قوالب نوشن للبيع',
        'قوالب مجانية',
        'notion store',
        'منتجات رقمية'
    ]
});

export default function StoreLayout({ children }) {
    return children;
}
