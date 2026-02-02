import { generateMetadata } from '../../lib/seo';
import AboutClient from './AboutClient';

export const metadata = generateMetadata({
  title: 'من نحن - عرب نوشن',
  description: 'تعرف على فريق عرب نوشن، رؤيتنا، ورسالتنا في تمكين المحتوى العربي وتنظيم الحياة والعمل باستخدام نوشن.',
  url: '/about',
});

export default function AboutPage() {
  return <AboutClient />;
}
