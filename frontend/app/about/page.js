import { generateMetadata } from '../../lib/seo';
import AboutClient from './AboutClient';

export const metadata = generateMetadata({
  title: 'عن المجتمع',
  description: 'تعرف على عرب نوشن (Notion Arabs) - الوجهة والمجتمع العربي الأول المتخصص في قوالب نوشن الإبداعية، وتمكين المبدعين العرب من تطوير إنتاجيتهم.',
  url: '/about',
});

export default function AboutPage() {
  return <AboutClient />;
}
