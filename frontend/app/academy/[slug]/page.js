import { generateMetadata as generateBaseMetadata } from '../../../lib/seo';
import CourseDetailClient from './CourseDetailClient';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'notion-masterclass';

  return generateBaseMetadata({
    title: 'دورة احتراف نوشن الشاملة (Notion Masterclass) | أكاديمية عرب نوشن',
    description: 'دورة تطبيقية متكاملة باللغة العربية تضم 29 درساً ومشاريع عملية في بناء أنظمة العمل، قواعد البيانات المتقدمة، وصيغ نوشن Formulas 2.0 والذكاء الاصطناعي.',
    url: `/academy/${slug}`,
    keywords: [
      'دورة احتراف نوشن',
      'كورس نوشن عربي',
      'منهج دورة نوشن',
      'Notion Masterclass',
      'أكاديمية عرب نوشن',
      'تعلم نوشن مجاناً'
    ]
  });
}

export default async function CourseDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'notion-masterclass';
  return <CourseDetailClient slug={slug} />;
}
