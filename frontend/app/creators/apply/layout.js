import { generateMetadata as generateBaseMetadata } from '../../../lib/seo';

export const metadata = generateBaseMetadata({
    title: 'انضم كمبدع',
    description: 'ابدأ رحلتك في بيع قوالب نوشن. انضم إلى مجتمع المبدعين في عرب نوشن وشارك خبراتك مع الآلاف.',
    url: '/creators/apply',
    keywords: [
        'بيع قوالب نوشن',
        'الربح من نوشن',
        'مبدع نوشن',
        'creator economy',
        'notion creator'
    ]
});

export default function CreatorApplyLayout({ children }) {
    return children;
}
