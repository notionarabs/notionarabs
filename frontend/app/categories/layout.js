import { generateMetadata as generateBaseMetadata } from '../../lib/seo';

export const metadata = {
  ...generateBaseMetadata({
    title: 'تصنيفات قوالب نوشن - اكتشف القوالب حسب الفئة',
    description: 'تصفح جميع تصنيفات قوالب Notion باللغة العربية. ابحث عن القوالب حسب التخصص: الإنتاجية، الدراسة، الأعمال، التقنية، الصحة، وأكثر.',
    keywords: [
      'تصنيفات قوالب نوشن',
      'categories',
      'تصنيفات عربية',
      'قوالب منظمة',
      'إنتاجية',
      'دراسة',
      'أعمال',
      'notion categories arabic'
    ],
    url: '/categories'
  })
};

export default function CategoriesLayout({ children }) {
  return children;
}

