import { generateMetadata } from '../../lib/seo';
import AboutClient from './AboutClient';

export const metadata = generateMetadata({
  title: 'من نحن | Notion Arabs',
  description: 'تعرف على عرب نوشن (Notion Arabs) - أول منصة في العالم العربي متخصصة في توفير قوالب، أدوات، واستشارات نوشن لزيادة الإنتاجية للشركات والأفراد.',
  url: '/about',
});

export default function AboutPage() {
  return <AboutClient />;
}
