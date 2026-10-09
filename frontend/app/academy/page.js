import { generateMetadata as generateBaseMetadata } from '../../lib/seo';
import AcademyClient from './AcademyClient';

export const metadata = generateBaseMetadata({
  title: 'أكاديمية عرب نوشن | دورة احتراف نوشن الشاملة (Notion Masterclass)',
  description: 'تعلم نوشن من الصفر وحتى الاحتراف باللغة العربية. دورة شاملة تضم 29 درساً عملياً تغطي قواعد البيانات المتقدمة، الصيغ والمعادلات، واستخدام Notion AI.',
  url: '/academy',
  keywords: [
    'دورة نوشن',
    'كورس نوشن عربي',
    'تعلم نوشن',
    'Notion Masterclass',
    'أكاديمية عرب نوشن',
    'قواعد بيانات نوشن',
    'Notion AI عربي',
    'دروس نوشن مجانية'
  ]
});

export default function AcademyPage() {
  return <AcademyClient />;
}
