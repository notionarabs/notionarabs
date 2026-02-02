import { generateMetadata as generateBaseMetadata } from '../../lib/seo';

export const metadata = {
  ...generateBaseMetadata({
    title: 'المدونة',
    description: 'اكتشف أحدث النصائح والحيل لاستخدام نوشن بكفاءة أكبر. مقالات متخصصة للمبدعين العرب حول الإنتاجية، التنظيم، والتخطيط.',
    keywords: [
      'مدونة نوشن',
      'مقالات نوشن',
      'نصائح نوشن',
      'إنتاجية',
      'تنظيم',
      'تخطيط',
      'قوالب نوشن',
      'تطبيق نوشن',
      'notion blog arabic'
    ],
    url: '/blog'
  })
};

export default function BlogLayout({ children }) {
  return children;
}

