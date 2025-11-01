import { generateMetadata as generateBaseMetadata } from '../../lib/seo';

export const metadata = {
  ...generateBaseMetadata({
    title: 'جميع قوالب نوشن العربية - اكتشف وادعم المبدعين العرب',
    description: 'اكتشف مجموعة واسعة من قوالب Notion باللغة العربية. قوالب متنوعة للإنتاجية، الدراسة، الأعمال، والصحة. جميع القوالب من مبدعين عرب موهوبين.',
    keywords: [
      'قوالب نوشن',
      'notion templates',
      'قوالب عربية',
      'قوالب مجانية',
      'إنتاجية',
      'تنظيم',
      'قوالب مبدعين عرب',
      'notion arabic templates'
    ],
    url: '/templates'
  })
};

export default function TemplatesLayout({ children }) {
  return children;
}

