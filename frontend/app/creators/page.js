import { generateMetadata } from '../../lib/seo';
import CreatorsClient from './CreatorsClient';

export const metadata = generateMetadata({
  title: 'المبدعون',
  description: 'تعرف على أفضل المبدعين في مجتمع عرب نوشن واكتشف قوالبهم المبتكرة للغة العربية. انضم إلى مجتمع المبدعين العرب.',
  url: '/creators',
  keywords: ['المبدعين', 'creators', 'قوالب نوشن', 'مبدعين عرب', 'notion creators']
});

export default function CreatorsPage() {
  return <CreatorsClient />;
}
