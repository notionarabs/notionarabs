import ClassroomClient from './ClassroomClient';
import { generateMetadata as generateBaseMetadata } from '../../../../lib/seo';

export const metadata = generateBaseMetadata({
  title: 'قاعة التعلم | دورة احتراف نوشن الشاملة',
  description: 'مشاهدة دروس دورة احتراف نوشن الشاملة عبر منصة أكاديمية عرب نوشن.',
  url: '/academy/notion-masterclass/learn'
});

export default async function LearnPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'notion-masterclass';
  return <ClassroomClient slug={slug} />;
}

